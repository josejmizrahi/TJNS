import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { BlockchainService } from '../../common/utils/blockchain';

interface VerificationRequest {
  requestId: string;
  userId: string;
  type: 'governance' | 'financial';
  status: 'pending' | 'approved' | 'rejected';
  requiredVerifiers: number;
  verifications: Array<{
    verifierId: string;
    timestamp: Date;
    approved: boolean;
    notes?: string;
  }>;
  expiresAt: Date;
}

export class MultiPartyVerificationService {
  private static instance: MultiPartyVerificationService;
  private verificationRequests: Map<string, VerificationRequest>;
  private blockchain: BlockchainService;
  private readonly REQUEST_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor(blockchainService: BlockchainService) {
    this.verificationRequests = new Map();
    this.blockchain = blockchainService;
  }

  static getInstance(blockchainService: BlockchainService): MultiPartyVerificationService {
    if (!MultiPartyVerificationService.instance) {
      MultiPartyVerificationService.instance = new MultiPartyVerificationService(
        blockchainService
      );
    }
    return MultiPartyVerificationService.instance;
  }

  async createVerificationRequest(
    userId: string,
    type: 'governance' | 'financial',
    requiredVerifiers: number
  ): Promise<string> {
    const requestId = `mpv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const request: VerificationRequest = {
      requestId,
      userId,
      type,
      status: 'pending',
      requiredVerifiers,
      verifications: [],
      expiresAt: new Date(Date.now() + this.REQUEST_EXPIRY)
    };

    this.verificationRequests.set(requestId, request);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'create_multi_party_verification',
      status: 'success',
      metadata: {
        requestId,
        type,
        requiredVerifiers
      }
    });

    return requestId;
  }

  async submitVerification(
    requestId: string,
    verifierId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    const request = this.verificationRequests.get(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Verification request is no longer pending');
    }

    if (new Date() > request.expiresAt) {
      throw new Error('Verification request has expired');
    }

    if (request.verifications.some(v => v.verifierId === verifierId)) {
      throw new Error('Verifier has already submitted a verification');
    }

    request.verifications.push({
      verifierId,
      timestamp: new Date(),
      approved,
      notes
    });

    // Check if we have enough verifications
    if (request.verifications.length >= request.requiredVerifiers) {
      const approvalCount = request.verifications.filter(v => v.approved).length;
      request.status = approvalCount >= request.requiredVerifiers / 2 ? 'approved' : 'rejected';

      // Store final decision on blockchain
      await this.blockchain.submitTransaction({
        type: 'MultiPartyVerification',
        data: {
          requestId,
          userId: request.userId,
          status: request.status,
          verifierCount: request.verifications.length
        }
      });
    }

    this.verificationRequests.set(requestId, request);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: request.userId,
      action: 'submit_verification',
      status: 'success',
      metadata: {
        requestId,
        verifierId,
        approved,
        currentStatus: request.status
      }
    });
  }

  async getVerificationStatus(requestId: string): Promise<VerificationRequest> {
    const request = this.verificationRequests.get(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }
    return request;
  }
}

export const multiPartyVerificationService = MultiPartyVerificationService.getInstance(
  new BlockchainService()
);
