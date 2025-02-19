import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { IdentityService } from '../../src/identity/services/identity.service';
import { HybridStorageService } from '../../src/common/utils/storage';
import { BlockchainService } from '../../src/common/utils/blockchain';
import { MFAService } from '../../src/common/utils/mfa';
import { authenticator } from 'otplib';
import { DocumentType, DocumentStatus, VerificationLevel, UserRole, UserStatus } from '../../src/common/types/models';
import { StorageType } from '../../src/common/utils/storage';
import type { AuthUser as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import { SupabaseAdapter } from '../../src/common/adapters/supabase.adapter';
import { SupabaseRealtimeAdapter } from '../../src/common/adapters/realtime.adapter';
import { adapterFactory } from '../../src/common/adapters';
import { supabase } from '../../src/common/config/supabase';

// External module mocks are handled in test/setup.ts

// Mock dependencies
jest.mock('../../src/common/adapters', () => ({
  adapterFactory: {
    getDatabaseAdapter: jest.fn(),
    getRealtimeAdapter: jest.fn(),
    getStorageAdapter: jest.fn(),
    initialize: jest.fn(),
  },
}));

jest.mock('../../src/common/config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}));

describe('IdentityService', () => {
  let identityService: IdentityService;
  let mockStorage: jest.Mocked<HybridStorageService>;
  let mockBlockchain: jest.Mocked<BlockchainService>;
  let mockDatabase: jest.Mocked<SupabaseAdapter>;
  let mockRealtime: jest.Mocked<SupabaseRealtimeAdapter>;

  beforeEach(() => {
    // Reset mocks
    mockStorage = {
      uploadKYCDocument: jest.fn(),
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      getPublicUrl: jest.fn(),
      uploadFamilyDocument: jest.fn(),
      supabaseStorage: jest.fn(),
      ipfs: jest.fn(),
      encryption: jest.fn()
    } as unknown as jest.Mocked<HybridStorageService>;

    const mockBlockchainService = {
      client: jest.fn(),
      database: jest.fn(),
      createTrustLine: jest.fn(),
      transferTokens: jest.fn(),
      getWallet: jest.fn(),
      getBalance: jest.fn(),
      createEscrow: jest.fn(),
      executeHook: jest.fn()
    };
    mockBlockchain = mockBlockchainService as unknown as jest.Mocked<BlockchainService>;

    mockDatabase = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      uploadDocument: jest.fn(),
      getDocumentById: jest.fn(),
      updateDocument: jest.fn(),
      updateUser: jest.fn(),
      getDocumentsByUserId: jest.fn(),
      deleteUser: jest.fn(),
      findUsers: jest.fn(),
      findDocuments: jest.fn(),
      getTokenBalance: jest.fn(),
      updateTokenBalance: jest.fn(),
      createTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      getMitzvahPointsRule: jest.fn(),
      client: jest.fn()
    } as unknown as jest.Mocked<SupabaseAdapter>;

    mockRealtime = {
      subscribeToChanges: jest.fn(),
      subscribeToPresence: jest.fn(),
      subscribeToBroadcast: jest.fn(),
      unsubscribe: jest.fn(),
      publish: jest.fn(),
      track: jest.fn(),
      subscribeToUserUpdates: jest.fn(),
      subscribeToTransactions: jest.fn(),
      subscribeToDocumentVerification: jest.fn(),
      subscribeToOnlineUsers: jest.fn(),
      client: jest.fn(),
      channels: new Map()
    } as unknown as jest.Mocked<SupabaseRealtimeAdapter>;

    // Setup mock implementations
    jest.spyOn(adapterFactory, 'getDatabaseAdapter').mockReturnValue(mockDatabase);
    jest.spyOn(adapterFactory, 'getRealtimeAdapter').mockReturnValue(mockRealtime);

    identityService = new IdentityService(mockStorage, mockBlockchain);
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      const mockSupabaseUser: SupabaseAuthUser = {
        id: mockUser.id,
        email: mockUser.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        role: '',
        updated_at: new Date().toISOString(),
        phone: '',
        confirmation_sent_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        recovery_sent_at: undefined,
        identities: [],
        factors: []
      };

      const mockSession: Session = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh',
        user: mockSupabaseUser,
        provider_token: null,
        provider_refresh_token: null
      };

      jest.spyOn(supabase.auth, 'signUp').mockResolvedValue({
        data: { 
          user: mockSupabaseUser,
          session: mockSession
        },
        error: null,
      });

      mockDatabase.createUser.mockResolvedValue({
        ...mockUser,
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaEnabled: false,
          mfaVerified: false
        }
      });

      const result = await identityService.registerUser(
        'test@example.com',
        'password123',
        {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          mfaEnabled: false,
          mfaVerified: false
        }
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe(UserRole.USER);
      expect(mockRealtime.publish).toHaveBeenCalled();
    });
  });

  describe('uploadKYCDocument', () => {
    it('should successfully upload a KYC document', async () => {
      const userId = 'test-user-id';
      const documentType = DocumentType.ID;
      const mockFile = Buffer.from('test-file');

      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'mock-hash',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaEnabled: false,
          mfaVerified: false
        }
      });
      mockStorage.uploadKYCDocument.mockResolvedValue({
        path: 'test-path',
        type: StorageType.SUPABASE
      });

      mockDatabase.uploadDocument.mockResolvedValue({
        id: 'test-doc-id',
        userId,
        type: documentType,
        ipfsHash: 'test-hash',
        ipfsCid: 'test-path',
        storageType: StorageType.SUPABASE,
        status: DocumentStatus.PENDING,
      });

      const result = await identityService.uploadKYCDocument(
        userId,
        documentType,
        mockFile
      );

      expect(result).toBeDefined();
      expect(result.type).toBe(documentType);
      expect(result.status).toBe(DocumentStatus.PENDING);
    });
  });

  describe('verifyDocument', () => {
    it('should successfully verify a document', async () => {
      const documentId = 'test-doc-id';
      const verifierId = 'test-verifier-id';
      const userId = 'test-user-id';

      // Mock document retrieval
      mockDatabase.getDocumentById.mockResolvedValue({
        id: documentId,
        userId,
        type: DocumentType.ID,
        ipfsHash: 'test-hash',
        ipfsCid: 'test-path',
        storageType: StorageType.SUPABASE,
        status: DocumentStatus.PENDING,
      });

      // Mock user retrieval for validation
      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaEnabled: false,
          mfaVerified: false
        }
      });

      // Mock document list for verification requirements
      mockDatabase.getDocumentsByUserId.mockResolvedValue([
        {
          id: 'doc-1',
          type: DocumentType.ID,
          status: DocumentStatus.VERIFIED,
          ipfsHash: 'test-hash',
          ipfsCid: 'test-cid-1',
          storageType: StorageType.SUPABASE,
          verifiedAt: new Date(),
          verifiedBy: 'test-verifier',
          userId
        },
        {
          id: 'doc-2',
          type: DocumentType.SYNAGOGUE_LETTER,
          status: DocumentStatus.VERIFIED,
          ipfsHash: 'test-hash-2',
          ipfsCid: 'test-cid-2',
          storageType: StorageType.SUPABASE,
          verifiedAt: new Date(),
          verifiedBy: 'test-verifier',
          userId
        }
      ]);

      await identityService.verifyDocument(documentId, verifierId, true);

      expect(mockDatabase.updateDocument).toHaveBeenCalledWith(
        documentId,
        expect.objectContaining({
          status: DocumentStatus.VERIFIED,
          verifiedBy: verifierId,
        })
      );

      expect(mockDatabase.updateUser).toHaveBeenCalledWith(userId, {
        verificationLevel: VerificationLevel.VERIFIED,
        status: UserStatus.ACTIVE
      });

      expect(mockRealtime.publish).toHaveBeenCalledWith(
        `user_updates_${userId}`,
        'verification_level_changed',
        { userId, newLevel: VerificationLevel.VERIFIED }
      );
    });
  });

  describe('MFA Verification', () => {
    it('should verify valid TOTP token', async () => {
      const userId = 'test-user-id';
      const secret = MFAService.generateSecret();
      const token = authenticator.generate(secret);

      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaSecret: secret,
          mfaEnabled: true,
          mfaVerified: true
        }
      });

      await expect(identityService.verifyMFA(userId, token)).resolves.not.toThrow();
    });

    it('should verify valid backup code', async () => {
      const userId = 'test-user-id';
      const backupCodes = MFAService.generateBackupCodes();
      const hashedCodes = MFAService.hashBackupCodes(backupCodes);

      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaBackupCodes: hashedCodes,
          mfaEnabled: true,
          mfaVerified: true
        }
      });

      const isValid = await MFAService.validateBackupCode(backupCodes[0], userId, mockDatabase);
      expect(isValid).toBe(true);
    });

    it('should fail with invalid TOTP token', async () => {
      const userId = 'test-user-id';
      const secret = MFAService.generateSecret();
      const invalidToken = '123456';

      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaSecret: secret,
          mfaEnabled: true,
          mfaVerified: true
        }
      });

      await expect(identityService.verifyMFA(userId, invalidToken)).rejects.toThrow('Invalid MFA token');
    });

    it('should fail with invalid backup code', async () => {
      const userId = 'test-user-id';
      const backupCodes = MFAService.generateBackupCodes();
      const hashedCodes = MFAService.hashBackupCodes(backupCodes);
      const invalidCode = '123456';

      mockDatabase.getUserById.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        role: UserRole.USER,
        verificationLevel: VerificationLevel.NONE,
        status: UserStatus.PENDING,
        passwordHash: 'mock-hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: new Date('1990-01-01'),
          documents: [],
          mfaBackupCodes: hashedCodes,
          mfaEnabled: true,
          mfaVerified: true
        }
      });

      const isValid = await MFAService.validateBackupCode(invalidCode, userId, mockDatabase);
      expect(isValid).toBe(false);
    });
  });
});
