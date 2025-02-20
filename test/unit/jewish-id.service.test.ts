import { JewishIdentityService } from '../../src/identity/services/jewish-id.service';
import { HybridStorageService, StorageType } from '../../src/common/utils/storage';
import { BlockchainService } from '../../src/common/utils/blockchain';
import { DatabaseAdapter } from '../../src/common/adapters/database.adapter';
import { SupabaseAdapter } from '../../src/common/adapters/supabase.adapter';
import { adapterFactory } from '../../src/common/adapters';
import { IPFSService } from '../../src/common/utils/ipfs';
import { JewishIdentityEntity, JewishAffiliation } from '../../src/identity/models/jewish-id.model';
import { VerificationLevel, UserRole, UserStatus } from '../../src/common/enums/user';
import { User } from '../../src/common/types/models';
import { SupabaseClient } from '@supabase/supabase-js';
import { jest } from '@jest/globals';

// Test data
// Base test data is now handled by createBaseMockIdentity helper

const testUser: User = {
  id: 'test-user',
  email: 'test@example.com',
  role: UserRole.USER,
  verificationLevel: VerificationLevel.NONE,
  status: UserStatus.ACTIVE,
  passwordHash: 'hash',
  profile: {
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: new Date(),
    documents: [],
    mfaEnabled: false,
    mfaVerified: false,
    synagogue: 'Test Synagogue',
    community: 'Test Community'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock the Supabase config module
jest.mock('../../src/common/config/supabase', () => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis()
  };

  const client = {
    from: jest.fn().mockReturnValue(queryBuilder),
    rpc: jest.fn().mockReturnValue({
      execute: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
    })
  } as unknown as SupabaseClient;

  return { supabase: client };
});

jest.mock('../../src/common/adapters');

// Mock the database adapter
jest.mock('../../src/common/adapters/supabase.adapter');

// Helper function to create mock identities
const createBaseMockIdentity = (id: string, overrides: Partial<JewishIdentityEntity> = {}): JewishIdentityEntity => ({
  id,
  userId: `user-${id}`,
  hebrewName: 'Test Name',
  affiliation: JewishAffiliation.ORTHODOX,
  verificationLevel: VerificationLevel.NONE,
  verifiedBy: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
  familyTreeData: { nodes: [], edges: [] },
  maternalAncestry: { lineage: [], documents: [] },
  paternalAncestry: { lineage: [], documents: [] },
  verificationDocuments: [],
  ...overrides
});

// Create mock database adapter instance
const mockDatabaseAdapter = {
  getJewishIdentityById: jest.fn(),
  updateJewishIdentity: jest.fn(),
  getUserById: jest.fn(),
  getJewishIdentityByUserId: jest.fn(),
  query: jest.fn(),
  createJewishIdentity: jest.fn(),
  createToken: jest.fn(),
  getTokenByUserAndType: jest.fn(),
  updateToken: jest.fn(),
  createListing: jest.fn(),
  getListing: jest.fn(),
  updateListing: jest.fn(),
  searchListings: jest.fn(),
  deleteListing: jest.fn(),
  uploadDocument: jest.fn(),
  getDocumentById: jest.fn(),
  getDocumentsByUserId: jest.fn(),
  updateDocument: jest.fn(),
  getTokenBalance: jest.fn(),
  updateTokenBalance: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  createEscrow: jest.fn(),
  updateEscrow: jest.fn(),
  getMitzvahPointsRule: jest.fn()
} as unknown as jest.Mocked<DatabaseAdapter>;

// Mock the database adapter factory
jest.spyOn(adapterFactory, 'getDatabaseAdapter').mockReturnValue(mockDatabaseAdapter as unknown as SupabaseAdapter);

// Mock IPFS service
const mockIPFSService = {
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  uploadEncrypted: jest.fn(),
  downloadEncrypted: jest.fn(),
  getGatewayUrl: jest.fn()
} as unknown as jest.Mocked<IPFSService>;

// Mock adapter factory
jest.spyOn(adapterFactory, 'getDatabaseAdapter').mockReturnValue(mockDatabaseAdapter as unknown as SupabaseAdapter);
jest.spyOn(adapterFactory, 'getIPFSService').mockReturnValue(mockIPFSService);

// Create base mock data
const baseMockData = createBaseMockIdentity('test-id', { userId: 'test-user-id' });
const TEST_MOTHER_ID = 'test-mother';
const motherMockData = createBaseMockIdentity(TEST_MOTHER_ID, { hebrewName: 'Mother Name' });

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();

  // Set up mock implementations for identity lookups
  mockDatabaseAdapter.getJewishIdentityById.mockImplementation((id) => {
    if (id === 'test-id') {
      return Promise.resolve(baseMockData);
    }
    if (id === TEST_MOTHER_ID) {
      return Promise.resolve(motherMockData);
    }
    return Promise.resolve(null);
  });
  mockDatabaseAdapter.getJewishIdentityByUserId.mockImplementation((id) => {
    if (id === 'test-user-id') {
      return Promise.resolve(baseMockData);
    }
    if (id === `user-${TEST_MOTHER_ID}`) {
      return Promise.resolve(motherMockData);
    }
    return Promise.resolve(null);
  });

  // Set up other mock implementations
  mockDatabaseAdapter.updateJewishIdentity.mockResolvedValue(baseMockData);
  mockDatabaseAdapter.getUserById.mockResolvedValue(testUser);
  mockDatabaseAdapter.query.mockResolvedValue([]);
  mockDatabaseAdapter.createJewishIdentity.mockResolvedValue(baseMockData);

  // Reset mock implementations for database adapter

  // Reset mock implementations for IPFS service
  mockIPFSService.uploadFile.mockResolvedValue('test-path');
  mockIPFSService.downloadFile.mockResolvedValue(Buffer.from('test-data'));
  mockIPFSService.uploadEncrypted.mockResolvedValue({ cid: 'test-cid', tag: 'test-tag' });
  mockIPFSService.downloadEncrypted.mockResolvedValue('test-data');
  mockIPFSService.getGatewayUrl.mockReturnValue('test-url');
});

jest.mock('../../src/common/utils/storage');
jest.mock('../../src/common/utils/blockchain');
jest.mock('../../src/common/adapters/database.adapter');

describe('JewishIdentityService', () => {
  let service: JewishIdentityService;
  let mockStorage: jest.Mocked<HybridStorageService>;
  let mockBlockchain: jest.Mocked<BlockchainService>;
  // Database adapter is mocked in beforeEach

  beforeEach(() => {
    mockStorage = {
      uploadFile: jest.fn(),
      uploadFamilyDocument: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      getPublicUrl: jest.fn()
    } as unknown as jest.Mocked<HybridStorageService>;
    
    mockBlockchain = {
      submitTransaction: jest.fn(),
      getWallet: jest.fn(),
      getBalance: jest.fn()
    } as unknown as jest.Mocked<BlockchainService>;
    
    // Create service with all mock dependencies
    service = new JewishIdentityService(mockStorage, mockBlockchain, mockDatabaseAdapter);
  });

  describe('Document Verification', () => {
    // Document verification test setup
    const documentType = 'passport';
    const documentBuffer = Buffer.from('test-document');

    it('should upload and store verification documents', async () => {
      const mockPath = 'test-path';
      const mockTag = 'test-tag';
      const mockTxHash = 'test-tx-hash';

      mockStorage.uploadFile.mockResolvedValue({
        path: mockPath,
        type: StorageType.IPFS,
        tag: mockTag
      });

      mockBlockchain.submitTransaction.mockResolvedValue(mockTxHash);

      // Using the same mockData from beforeEach

      await service.uploadVerificationDocument('test-id', documentType, documentBuffer);

      expect(mockStorage.uploadFile).toHaveBeenCalled();
      expect(mockBlockchain.submitTransaction).toHaveBeenCalledWith({
        type: 'StoreHash',
        hash: mockPath
      });
      expect(mockDatabaseAdapter.updateJewishIdentity).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          verificationDocuments: expect.arrayContaining([
            expect.objectContaining({
              type: documentType,
              ipfsHash: mockPath,
              encryptionTag: mockTag
            })
          ])
        })
      );
    });

    it('should update verification level with proper documents', async () => {
      const verifierId = 'test-verifier';
      // Using the same mockData from beforeEach, but with updated verification documents
      const updatedMockData = {
        ...baseMockData,
        verificationDocuments: [{
          type: 'passport',
          ipfsHash: 'test-hash',
          encryptionTag: 'test-tag',
          verifiedAt: new Date()
        }],
        verificationLevel: VerificationLevel.BASIC
      };
      mockDatabaseAdapter.getJewishIdentityById.mockResolvedValue(updatedMockData);

      await service.updateVerificationLevel('test-id', VerificationLevel.VERIFIED, verifierId);

      expect(mockDatabaseAdapter.updateJewishIdentity).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          verificationLevel: VerificationLevel.VERIFIED,
          verifiedBy: [verifierId]
        })
      );
    });

    it('should reject invalid verification level changes', async () => {
      const mockIdentity = createBaseMockIdentity('test-id', {
        userId: 'test-user-id',
        verificationDocuments: [],
        verificationLevel: VerificationLevel.NONE
      });
      mockDatabaseAdapter.getJewishIdentityByUserId.mockResolvedValue(mockIdentity);

      await expect(
        service.updateVerificationLevel('test-id', VerificationLevel.VERIFIED, 'verifier')
      ).rejects.toThrow('Verification documents required');
    });
  });

  describe('Family History', () => {
    // Using TEST_MOTHER_ID constant defined above
    const documentType = 'birth_certificate';

    it('should add family members with proper documentation', async () => {
      const mockPath = 'test-path';
      const mockTag = 'test-tag';
      const documentBuffer = Buffer.from('test-document');

      mockStorage.uploadFamilyDocument.mockResolvedValue({
        path: mockPath,
        type: StorageType.IPFS,
        tag: mockTag
      });

      await service.addFamilyMember(
        'test-id',
        'mother',
        TEST_MOTHER_ID,
        [{ type: documentType, file: documentBuffer }]
      );

      expect(mockStorage.uploadFamilyDocument).toHaveBeenCalled();
      expect(mockDatabaseAdapter.updateJewishIdentity).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          familyTreeData: expect.objectContaining({
            nodes: expect.arrayContaining([
              expect.objectContaining({
                id: TEST_MOTHER_ID,
                type: 'mother'
              })
            ])
          })
        })
      );
    });

    it('should maintain maternal and paternal lineages', async () => {
      const mockPath = 'test-path';
      const mockTag = 'test-tag';

      mockStorage.uploadFamilyDocument.mockResolvedValue({
        path: mockPath,
        type: StorageType.IPFS,
        tag: mockTag
      });

      // Set up mother's lineage
      const motherLineage = ['grandmother-id', 'great-grandmother-id'];
      const motherWithLineage = {
        ...motherMockData,
        maternalAncestry: {
          lineage: motherLineage,
          documents: []
        }
      };
      mockDatabaseAdapter.getJewishIdentityById.mockImplementation((id) => {
        if (id === 'test-id') {
          return Promise.resolve(baseMockData);
        }
        if (id === TEST_MOTHER_ID) {
          return Promise.resolve(motherWithLineage);
        }
        return Promise.resolve(null);
      });
      // Using the mock implementations from beforeEach

      await service.addFamilyMember('test-id', 'mother', TEST_MOTHER_ID, []);

      expect(mockDatabaseAdapter.updateJewishIdentity).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          maternalAncestry: expect.objectContaining({
            lineage: expect.arrayContaining([TEST_MOTHER_ID, ...motherLineage])
          })
        })
      );
    });

    it('should handle document encryption correctly', async () => {
      const documentBuffer = Buffer.from('test-document');
      const mockPath = 'test-path';
      const mockTag = 'test-tag';

      mockStorage.uploadFamilyDocument.mockResolvedValue({
        path: mockPath,
        type: StorageType.IPFS,
        tag: mockTag
      });

      // Using the mock implementations from beforeEach

      await service.addFamilyMember(
        'test-id',
        'mother',
        TEST_MOTHER_ID,
        [{ type: documentType, file: documentBuffer }]
      );

      expect(mockStorage.uploadFamilyDocument).toHaveBeenCalledWith(
        'test-id',
        TEST_MOTHER_ID,
        documentType,
        documentBuffer
      );
    });
  });
});
