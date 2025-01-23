import { User, UserProfile, KYCDocument, DocumentType, DocumentStatus, VerificationLevel } from '../../common/types/models';
import { IPFSService } from '../../common/utils/ipfs';
import { EncryptionService } from '../../common/utils/encryption';
import { BlockchainService } from '../../common/utils/blockchain';
import { AppError } from '../../common/middleware/error';

import { adapterFactory } from '../../common/adapters';
import { DatabaseAdapter } from '../../common/adapters/supabase.adapter';
import { StorageAdapter } from '../../common/adapters/storage.adapter';

export class IdentityService {
  private database: DatabaseAdapter;
  private storage: StorageAdapter;

  constructor(
    private ipfs: IPFSService,
    private encryption: EncryptionService,
    private blockchain: BlockchainService
  ) {
    this.database = adapterFactory.getDatabaseAdapter();
    this.storage = adapterFactory.getStorageAdapter();
  }

  async registerUser(
    email: string,
    password: string,
    profile: Omit<UserProfile, 'documents'>
  ): Promise<User> {
    const hashedPassword = await this.encryption.hashPassword(password);
    
    const user = await this.database.createUser({
      email,
      passwordHash: hashedPassword,
      profile,
      role: UserRole.USER,
      verificationLevel: VerificationLevel.NONE,
      status: UserStatus.PENDING
    });

    return user;
  }

  async verifyEmail(userId: string, token: string): Promise<void> {
    // Verify email token
    // Update user verification status
    throw new Error('Not implemented');
  }

  async uploadKYCDocument(
    userId: string,
    documentType: DocumentType,
    file: Buffer
  ): Promise<KYCDocument> {
    // Upload encrypted document to Supabase Storage
    const filePath = await this.storage.uploadKYCDocument(userId, documentType, file);
    
    // Create document record
    const document = await this.database.uploadDocument({
      userId,
      type: documentType,
      ipfsCid: filePath,
      encryptionTag: '', // Set by storage adapter
      status: DocumentStatus.PENDING
    });

    return document;
  }

  async verifyDocument(
    documentId: string,
    verifierId: string,
    approved: boolean
  ): Promise<void> {
    const document = await this.database.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const status = approved ? DocumentStatus.VERIFIED : DocumentStatus.REJECTED;
    await this.database.updateDocument(documentId, {
      status,
      verifiedAt: new Date(),
      verifiedBy: verifierId
    });

    if (approved) {
      // Update user verification level if all required documents are verified
      await this.updateVerificationLevel(document.userId, VerificationLevel.VERIFIED);
    }
  }

  async updateVerificationLevel(
    userId: string,
    newLevel: VerificationLevel
  ): Promise<void> {
    const meetsRequirements = await this.validateVerificationRequirements(userId, newLevel);
    if (!meetsRequirements) {
      throw new Error(`User does not meet requirements for ${newLevel} verification level`);
    }

    await this.database.updateUser(userId, {
      verificationLevel: newLevel,
      status: UserStatus.ACTIVE
    });

    // Notify relevant services about verification level change
    const realtimeAdapter = adapterFactory.getRealtimeAdapter();
    await realtimeAdapter.publish(
      `user_updates_${userId}`,
      'verification_level_changed',
      { userId, newLevel }
    );
  }

  async createWallet(userId: string): Promise<string> {
    // Generate new XRPL wallet
    // Associate with user
    // Setup initial trust lines
    throw new Error('Not implemented');
  }

  private async validateVerificationRequirements(
    userId: string,
    level: VerificationLevel
  ): Promise<boolean> {
    const user = await this.database.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    switch (level) {
      case VerificationLevel.BASIC:
        // Requires email verification
        return user.status === UserStatus.ACTIVE;

      case VerificationLevel.VERIFIED:
        // Requires verified ID and synagogue documents
        const documents = await this.database.getDocumentsByUserId(userId);
        const hasVerifiedId = documents.some(
          doc => doc.type === DocumentType.ID && doc.status === DocumentStatus.VERIFIED
        );
        const hasVerifiedSynagogue = documents.some(
          doc => doc.type === DocumentType.SYNAGOGUE_LETTER && doc.status === DocumentStatus.VERIFIED
        );
        return hasVerifiedId && hasVerifiedSynagogue;

      case VerificationLevel.COMPLETE:
        // Additional requirements for complete verification
        return user.verificationLevel === VerificationLevel.VERIFIED;

      default:
        return true;
    }
  }
}

export default new IdentityService(
  new IPFSService(),
  new EncryptionService(),
  new BlockchainService()
);
