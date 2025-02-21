import { StorageType } from '../../common/utils/storage';
import { BaseVerificationService } from './base-verification.service';
import { DocumentVerification } from '../types/models';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';
import type { Buffer } from 'node:buffer';

export class KYCService extends BaseVerificationService<DocumentVerification> {
  private static instance: KYCService;


  private constructor(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ) {
    super(storageService, blockchainService);
    // Initialize base class
  }

  static getInstance(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService(storageService, blockchainService);
    }
    return KYCService.instance;
  }

  async initiateKYC(
    userId: string,
    documents: Array<{ type: string; file: Buffer }>,
    level: 'basic' | 'enhanced' = 'basic'
  ): Promise<string> {
    const verificationId = `kyc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store documents in IPFS
    const documentHashes = await Promise.all(
      documents.map(async doc => {
        const { path } = await this.storage.uploadFile(
          `kyc/${verificationId}/${doc.type}`,
          doc.file,
          { type: StorageType.IPFS, encrypted: true }
        );
        return path;
      })
    );

    // Store document hashes on blockchain
    await Promise.all(
      documentHashes.map(hash =>
        this.blockchain.submitTransaction({
          type: 'StoreHash',
          hash
        })
      )
    );

    this.verifications.set(verificationId, {
      userId,
      verificationId,
      status: 'pending',
      documentHashes,
      documentType: 'kyc',
      storageType: StorageType.IPFS,
      createdAt: new Date()
    });

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'initiate_kyc',
      status: 'success',
      metadata: {
        verificationId,
        level,
        documentCount: documents.length
      }
    });

    // TODO: Integrate with KYC provider (e.g., Onfido, IDology)
    // For now, return the verification ID
    return verificationId;
  }

  async updateKYCStatus(
    verificationId: string,
    status: 'approved' | 'rejected',
    verifierId: string
  ): Promise<void> {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    verification.status = status;
    verification.completedAt = new Date();
    this.verifications.set(verificationId, verification);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: verification.userId,
      action: 'update_kyc_status',
      status: 'success',
      metadata: {
        verificationId,
        verifierId,
        kycStatus: status
      }
    });
  }

  async getKYCStatus(userId: string): Promise<DocumentVerification | undefined> {
    // Find the latest verification for the user
    return Array.from(this.verifications.values())
      .filter(v => v.userId === userId)
      .sort((a, b) => {
        const aTime = a.completedAt || new Date(0);
        const bTime = b.completedAt || new Date(0);
        return bTime.getTime() - aTime.getTime();
      })[0];
  }
}

// Import default instances
import storage from '../../common/utils/storage';
import blockchain from '../../common/utils/blockchain';

export const kycService = KYCService.getInstance(
  storage,
  blockchain
);
