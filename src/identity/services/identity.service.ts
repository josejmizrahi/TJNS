import { 
  User, 
  UserProfile, 
  KYCDocument, 
  DocumentType, 
  DocumentStatus, 
  VerificationLevel,
  UserRole,
  UserStatus
} from '../../common/types/models';
import { BlockchainService } from '../../common/utils/blockchain';
import { MFAService } from '../../common/utils/mfa';
import { AppError } from '../../common/middleware/error';
import { supabase } from '../../common/config/supabase';
import { HybridStorageService } from '../../common/utils/storage';
import { IPFSService } from '../../common/utils/ipfs';
import { EncryptionService } from '../../common/utils/encryption';

import { adapterFactory } from '../../common/adapters';
import { DatabaseAdapter } from '../../common/adapters/supabase.adapter';
import { RealtimeAdapter } from '../../common/adapters/realtime.adapter';
// StorageAdapter import removed as it's not used

export class IdentityService {
  private database: DatabaseAdapter;
  private storage: HybridStorageService;
  private realtime: RealtimeAdapter;

  constructor(
    storageService: HybridStorageService,
    private blockchain: BlockchainService
  ) {
    this.storage = storageService;
    this.database = adapterFactory.getDatabaseAdapter();
    this.realtime = adapterFactory.getRealtimeAdapter();
  }

  async registerUser(
    email: string,
    password: string,
    profile: Omit<UserProfile, 'documents'>
  ): Promise<User> {
    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName
        }
      }
    });

    if (authError) throw new AppError(400, authError.message);
    if (!authData.user) throw new AppError(400, 'Failed to create user');

    // Create user profile
    const user = await this.database.createUser({
      id: authData.user.id,
      email,
      profile: {
        ...profile,
        documents: []
      },
      role: UserRole.USER,
      verificationLevel: VerificationLevel.NONE,
      status: UserStatus.PENDING
    });

    // Notify about user registration
    await this.realtime.publish(
      'user_registrations',
      'user_registered',
      { userId: user.id }
    );

    return user;
  }

  async verifyEmail(userId: string, token: string): Promise<{ totpUri: string; backupCodes: string[] }> {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw new AppError(400, error.message);

    // Update user verification level and enable MFA setup
    await this.updateVerificationLevel(userId, VerificationLevel.NONE);
    
    // Generate MFA secret and backup codes
    const mfaSecret = MFAService.generateSecret();
    const backupCodes = MFAService.generateBackupCodes();
    const hashedBackupCodes = MFAService.hashBackupCodes(backupCodes);

    // Store MFA configuration
    const existingUser = await this.database.getUserById(userId);
    if (!existingUser) throw new AppError(404, 'User not found');

    await this.database.updateUser(userId, {
      profile: {
        ...existingUser.profile,
        mfaSecret,
        mfaBackupCodes: hashedBackupCodes,
        mfaEnabled: false,
        mfaVerified: false
      }
    });

    // Notify about email verification
    await this.realtime.publish(
      `user_updates_${userId}`,
      'email_verified',
      { userId }
    );

    const currentUser = await this.database.getUserById(userId);
    if (!currentUser) throw new AppError(404, 'User not found');

    return {
      totpUri: MFAService.generateTOTPUri(mfaSecret, currentUser.email),
      backupCodes
    };
  }

  async verifyMFA(userId: string, token: string): Promise<void> {
    const user = await this.database.getUserById(userId);
    if (!user?.profile.mfaSecret) {
      throw new AppError(400, 'MFA not configured');
    }

    const isValid = MFAService.verifyTOTP(token, user.profile.mfaSecret);
    if (!isValid) {
      throw new AppError(401, 'Invalid MFA token');
    }

    // Enable MFA after successful verification
    await this.database.updateUser(userId, {
      profile: {
        ...user.profile,
        mfaEnabled: true,
        mfaVerified: true
      }
    });
  }

  async uploadKYCDocument(
    userId: string,
    documentType: DocumentType,
    file: Buffer
  ): Promise<KYCDocument> {
    const user = await this.database.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Upload document using hybrid storage
    const { path, type: storageType } = await this.storage.uploadKYCDocument(
      userId,
      documentType,
      file
    );
    
    // Create document record
    const document = await this.database.uploadDocument({
      userId,
      type: documentType,
      ipfsCid: path,
      storageType,
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
      await this.updateVerificationLevel(document.userId, VerificationLevel.PHONE);
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
    await this.realtime.publish(
      `user_updates_${userId}`,
      'verification_level_changed',
      { userId, newLevel }
    );
  }

  async createWallet(_userId: string): Promise<string> {
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
      case VerificationLevel.NONE:
        // No verification required
        return true;

      case VerificationLevel.EMAIL: {
        // Requires verified ID and synagogue documents
        const documents = await this.database.getDocumentsByUserId(userId);
        const hasVerifiedId = documents.some(
          doc => doc.type === DocumentType.ID && doc.status === DocumentStatus.VERIFIED
        );
        const hasVerifiedSynagogue = documents.some(
          doc => doc.type === DocumentType.SYNAGOGUE_LETTER && doc.status === DocumentStatus.VERIFIED
        );
        return hasVerifiedId && hasVerifiedSynagogue;
      }

      case VerificationLevel.ADVANCED:
        // Additional requirements for complete verification
        return user.verificationLevel === VerificationLevel.PHONE;

      default:
        return true;
    }
  }
}

export default new IdentityService(
  new HybridStorageService(
    adapterFactory.getStorageAdapter(),
    new IPFSService(),
    new EncryptionService()
  ),
  new BlockchainService()
);
