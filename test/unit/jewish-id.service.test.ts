import { JewishIdentityService } from '../../src/identity/services/jewish-id.service';
import { HybridStorageService } from '../../src/common/utils/storage';
import { BlockchainService } from '../../src/common/utils/blockchain';
import { DatabaseAdapter } from '../../src/common/adapters/database.adapter';
import { VerificationLevel } from '../../src/common/types/models';
import { StorageType } from '../../src/common/utils/storage';
import { JewishAffiliation, JewishIdentityEntity } from '../../src/identity/models/jewish-id.model';

jest.mock('../../src/common/utils/storage');
jest.mock('../../src/common/utils/blockchain');
jest.mock('../../src/common/adapters/database.adapter');

describe('JewishIdentityService', () => {
  let service: JewishIdentityService;
  let mockStorage: jest.Mocked<HybridStorageService>;
  let mockBlockchain: jest.Mocked<BlockchainService>;
  let mockDatabase: jest.Mocked<DatabaseAdapter>;

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
    
    mockDatabase = {
      getJewishIdentityById: jest.fn(),
      updateJewishIdentity: jest.fn(),
      getUserById: jest.fn()
    } as unknown as jest.Mocked<DatabaseAdapter>;
    service = new JewishIdentityService(mockStorage, mockBlockchain);
  });

  describe('Document Verification', () => {
    const userId = 'test-user-id';
    const documentId = 'test-doc-id';
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

      mockDatabase.getJewishIdentityById.mockResolvedValue({
        id: documentId,
        userId,
        hebrewName: 'Test Name',
        affiliation: JewishAffiliation.ORTHODOX,
        verificationDocuments: [],
        verificationLevel: VerificationLevel.NONE,
        verifiedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
        familyTreeData: { nodes: [], edges: [] },
        maternalAncestry: { lineage: [], documents: [] },
        paternalAncestry: { lineage: [], documents: [] }
      } as unknown as JewishIdentityEntity);

      await service.uploadVerificationDocument(documentId, documentType, documentBuffer);

      expect(mockStorage.uploadFile).toHaveBeenCalled();
      expect(mockBlockchain.submitTransaction).toHaveBeenCalledWith({
        type: 'StoreHash',
        hash: mockPath
      });
      expect(mockDatabase.updateJewishIdentity).toHaveBeenCalledWith(
        documentId,
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
      mockDatabase.getJewishIdentityById.mockResolvedValue({
        id: documentId,
        userId,
        hebrewName: 'Test Name',
        affiliation: JewishAffiliation.ORTHODOX,
        verificationDocuments: [{
          type: 'passport',
          ipfsHash: 'test-hash',
          encryptionTag: 'test-tag',
          verifiedAt: new Date()
        }],
        verificationLevel: VerificationLevel.BASIC,
        verifiedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {}
      } as any);

      await service.updateVerificationLevel(documentId, VerificationLevel.VERIFIED, verifierId);

      expect(mockDatabase.updateJewishIdentity).toHaveBeenCalledWith(
        documentId,
        expect.objectContaining({
          verificationLevel: VerificationLevel.VERIFIED,
          verifiedBy: [verifierId]
        })
      );
    });

    it('should reject invalid verification level changes', async () => {
      mockDatabase.getJewishIdentityById.mockResolvedValue({
        id: documentId,
        userId,
        hebrewName: 'Test Name',
        affiliation: JewishAffiliation.ORTHODOX,
        verificationDocuments: [],
        verificationLevel: VerificationLevel.NONE,
        verifiedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
        familyTreeData: { nodes: [], edges: [] },
        maternalAncestry: { lineage: [], documents: [] },
        paternalAncestry: { lineage: [], documents: [] }
      } as unknown as JewishIdentityEntity);

      await expect(
        service.updateVerificationLevel(documentId, VerificationLevel.VERIFIED, 'verifier')
      ).rejects.toThrow('Verification documents required');
    });
  });

  describe('Family History', () => {
    const identityId = 'test-identity';
    const motherId = 'test-mother';
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

      mockDatabase.getJewishIdentityById
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: identityId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          familyTreeData: { nodes: [], edges: [] },
          maternalAncestry: { lineage: [], documents: [] }
        })
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: motherId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          hebrewName: 'Mother Name',
          maternalAncestry: { lineage: [], documents: [] }
        });

      await service.addFamilyMember(
        identityId,
        'mother',
        motherId,
        [{ type: documentType, file: documentBuffer }]
      );

      expect(mockStorage.uploadFamilyDocument).toHaveBeenCalled();
      expect(mockDatabase.updateJewishIdentity).toHaveBeenCalledWith(
        identityId,
        expect.objectContaining({
          familyTreeData: expect.objectContaining({
            nodes: expect.arrayContaining([
              expect.objectContaining({
                id: motherId,
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

      const motherLineage = ['grandmother-id', 'great-grandmother-id'];
      mockDatabase.getJewishIdentityById
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: identityId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          familyTreeData: { nodes: [], edges: [] },
          maternalAncestry: { lineage: [], documents: [] }
        })
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: motherId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          hebrewName: 'Mother Name',
          maternalAncestry: {
            lineage: motherLineage,
            documents: []
          }
        });

      await service.addFamilyMember(identityId, 'mother', motherId, []);

      expect(mockDatabase.updateJewishIdentity).toHaveBeenCalledWith(
        identityId,
        expect.objectContaining({
          maternalAncestry: expect.objectContaining({
            lineage: expect.arrayContaining([motherId, ...motherLineage])
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

      mockDatabase.getJewishIdentityById
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: identityId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          familyTreeData: { nodes: [], edges: [] }
        })
        .mockResolvedValueOnce({
          id: identityId,
          userId: 'test-user',
          hebrewName: 'Test Name',
          affiliation: JewishAffiliation.ORTHODOX,
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          id: motherId,
          userId: 'test-user',
          verificationLevel: VerificationLevel.NONE,
          verifiedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
          hebrewName: 'Mother Name'
        });

      await service.addFamilyMember(
        identityId,
        'mother',
        motherId,
        [{ type: documentType, file: documentBuffer }]
      );

      expect(mockStorage.uploadFamilyDocument).toHaveBeenCalledWith(
        identityId,
        motherId,
        documentType,
        documentBuffer
      );
    });
  });
});
