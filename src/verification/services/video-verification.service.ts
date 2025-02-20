import { StorageType } from '../../common/utils/storage';
import { BaseVerificationService } from './base-verification.service';
import { VideoVerification } from '../types/models';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';

export class VideoVerificationService extends BaseVerificationService<VideoVerification> {
  private static instance: VideoVerificationService;
  // Use base class verifications map

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
  ): VideoVerificationService {
    if (!VideoVerificationService.instance) {
      VideoVerificationService.instance = new VideoVerificationService(
        storageService,
        blockchainService
      );
    }
    return VideoVerificationService.instance;
  }

  async scheduleVerification(
    userId: string,
    verifierId: string,
    scheduledTime: Date
  ): Promise<string> {
    const sessionId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.verifications.set(sessionId, {
      userId,
      verificationId: sessionId,
      verifierId,
      scheduledTime,
      status: 'pending',
      createdAt: new Date()
    });

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'schedule_video_verification',
      status: 'success',
      metadata: {
        sessionId,
        verifierId,
        scheduledTime
      }
    });

    return sessionId;
  }

  async startSession(sessionId: string): Promise<void> {
    const session = this.verifications.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // TODO: Initialize video call service (e.g., Twilio Video)
    // For now, just log the event
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: session.userId,
      action: 'start_video_verification',
      status: 'success',
      metadata: {
        sessionId,
        verifierId: session.verifierId
      }
    });
  }

  async completeVerification(
    sessionId: string,
    recording: Buffer,
    notes: string,
    verifierId: string
  ): Promise<void> {
    const session = this.verifications.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.verifierId !== verifierId) {
      throw new Error('Unauthorized verifier');
    }

    // Store encrypted recording in IPFS
    const { path } = await this.storage.uploadFile(
      `verification/video/${sessionId}`,
      recording,
      { type: StorageType.IPFS, encrypted: true }
    );

    // Store hash on blockchain for immutability
    await this.blockchain.submitTransaction({
      type: 'StoreHash',
      hash: path
    });

    // Update session
    session.status = 'completed';
    session.recordingHash = path;
    session.notes = notes;
    this.verifications.set(sessionId, session);

    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: session.userId,
      action: 'complete_video_verification',
      status: 'success',
      metadata: {
        sessionId,
        verifierId,
        recordingHash: path
      }
    });
  }

  async getVerificationStatus(sessionId: string): Promise<VideoVerification> {
    const session = this.verifications.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }
}

// Import default instances
import storage from '../../common/utils/storage';
import blockchain from '../../common/utils/blockchain';

export const videoVerificationService = VideoVerificationService.getInstance(
  storage,
  blockchain
);
