import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';
import { BaseVerification, VerificationStatus } from '@/verification/types/models';

export abstract class BaseVerificationService<T extends BaseVerification> {
  protected verifications: Map<string, T>;
  
  constructor(
    protected readonly storage: HybridStorageService,
    protected readonly blockchain: BlockchainService
  ) {
    this.verifications = new Map();
  }

  protected generateVerificationId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async logVerificationEvent(
    userId: string,
    action: string,
    status: 'success' | 'failure',
    metadata: Record<string, unknown>
  ): Promise<void> {
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action,
      status,
      metadata
    });
  }

  protected async storeDocumentHash(hash: string): Promise<void> {
    await this.blockchain.submitTransaction({
      type: 'StoreHash',
      hash
    });
  }

  protected async updateVerificationStatus(
    verificationId: string,
    status: VerificationStatus,
    verifierId?: string
  ): Promise<void> {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    verification.status = status;
    verification.completedAt = new Date();
    if (verifierId) {
      verification.verifierId = verifierId;
    }

    this.verifications.set(verificationId, verification);
  }

  async getVerificationStatus(verificationId: string): Promise<T | undefined> {
    return this.verifications.get(verificationId);
  }

  async getLatestVerification(userId: string): Promise<T | undefined> {
    return Array.from(this.verifications.values())
      .filter(v => v.userId === userId)
      .sort((a, b) => {
        const aTime = a.completedAt || new Date(0);
        const bTime = b.completedAt || new Date(0);
        return bTime.getTime() - aTime.getTime();
      })[0];
  }
}
