import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { BlockchainService } from '../../common/utils/blockchain';

interface ParticipationRecord {
  userId: string;
  eventType: 'community' | 'governance' | 'financial';
  timestamp: Date;
  details: Record<string, unknown>;
  verifiedBy: string[];
}

export class HistoricalValidationService {
  private static instance: HistoricalValidationService;
  private participationRecords: Map<string, ParticipationRecord[]>;
  private blockchain: BlockchainService;

  private constructor(blockchainService: BlockchainService) {
    this.participationRecords = new Map();
    this.blockchain = blockchainService;
  }

  static getInstance(blockchainService: BlockchainService): HistoricalValidationService {
    if (!HistoricalValidationService.instance) {
      HistoricalValidationService.instance = new HistoricalValidationService(blockchainService);
    }
    return HistoricalValidationService.instance;
  }

  async recordParticipation(
    userId: string,
    eventType: 'community' | 'governance' | 'financial',
    details: Record<string, unknown>,
    verifierId: string
  ): Promise<void> {
    const userRecords = this.participationRecords.get(userId) || [];
    
    const record: ParticipationRecord = {
      userId,
      eventType,
      timestamp: new Date(),
      details,
      verifiedBy: [verifierId]
    };

    userRecords.push(record);
    this.participationRecords.set(userId, userRecords);

    // Store record hash on blockchain
    const recordHash = await this.blockchain.submitTransaction({
      type: 'StoreParticipation',
      data: {
        userId,
        eventType,
        timestamp: record.timestamp,
        detailsHash: this.hashDetails(details)
      }
    });

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'record_participation',
      status: 'success',
      metadata: {
        eventType,
        verifierId,
        recordHash
      }
    });
  }

  async validateHistory(
    userId: string,
    requiredEvents: Array<{
      type: 'community' | 'governance' | 'financial';
      minCount: number;
    }>
  ): Promise<boolean> {
    const records = this.participationRecords.get(userId) || [];
    
    return requiredEvents.every(requirement => {
      const count = records.filter(r => r.eventType === requirement.type).length;
      return count >= requirement.minCount;
    });
  }

  private hashDetails(details: Record<string, unknown>): string {
    return require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(details))
      .digest('hex');
  }
}

export const historicalValidationService = HistoricalValidationService.getInstance(
  new BlockchainService()
);
