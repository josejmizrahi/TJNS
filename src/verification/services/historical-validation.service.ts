import { createHash } from 'crypto';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService, StorageType } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';
import storage from '../../common/utils/storage';
import blockchain from '../../common/utils/blockchain';

interface HistoricalRecord {
  userId: string;
  recordType: string;
  recordHash: string;
  timestamp: Date;
  verified: boolean;
}

export class HistoricalValidationService {
  private static instance: HistoricalValidationService;
  private records: Map<string, HistoricalRecord>;
  private storage: HybridStorageService;
  private blockchain: BlockchainService;

  private constructor(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ) {
    this.records = new Map();
    this.storage = storageService;
    this.blockchain = blockchainService;
  }

  static getInstance(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ): HistoricalValidationService {
    if (!HistoricalValidationService.instance) {
      HistoricalValidationService.instance = new HistoricalValidationService(
        storageService,
        blockchainService
      );
    }
    return HistoricalValidationService.instance;
  }

  async addRecord(
    userId: string,
    recordType: string,
    recordData: Buffer
  ): Promise<string> {
    const recordHash = createHash('sha256')
      .update(recordData)
      .digest('hex');

    const record: HistoricalRecord = {
      userId,
      recordType,
      recordHash,
      timestamp: new Date(),
      verified: false
    };

    // Store encrypted record in IPFS
    const { path } = await this.storage.uploadFile(
      `historical/${recordType}/${recordHash}`,
      recordData,
      { type: StorageType.IPFS, encrypted: true }
    );

    // Store hash on blockchain
    await this.blockchain.submitTransaction({
      type: 'StoreHash',
      hash: path
    });

    this.records.set(recordHash, record);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'add_historical_record',
      status: 'success',
      metadata: {
        recordType,
        recordHash
      }
    });

    return recordHash;
  }

  async verifyRecord(recordHash: string, verifierId: string): Promise<void> {
    const record = this.records.get(recordHash);
    if (!record) {
      throw new Error('Record not found');
    }

    record.verified = true;
    this.records.set(recordHash, record);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: record.userId,
      action: 'verify_historical_record',
      status: 'success',
      metadata: {
        recordHash,
        verifierId
      }
    });
  }

  async getRecordStatus(recordHash: string): Promise<HistoricalRecord> {
    const record = this.records.get(recordHash);
    if (!record) {
      throw new Error('Record not found');
    }
    return record;
  }
}

export const historicalValidationService = HistoricalValidationService.getInstance(
  storage,
  blockchain
);
