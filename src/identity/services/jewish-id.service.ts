import { JewishIdentityEntity, HebrewNameType, JewishAffiliation, TribalAffiliation } from '../models/jewish-id.model';
import { AppError } from '../../common/middleware/error';
import { DatabaseAdapter } from '../../common/adapters/database.adapter';
import { adapterFactory } from '../../common/adapters/adapter-factory';
import { HybridStorageService, StorageType } from '../../common/utils/storage';
import { User, VerificationLevel } from '../../common/types/models';
import { BlockchainService } from '../../common/utils/blockchain';

export interface CreateJewishIdentityDTO {
  userId: string;
  hebrewName?: string;
  hebrewNameType?: HebrewNameType;
  affiliation?: JewishAffiliation;
  synagogue?: string;
  rabbi?: string;
  community?: string;
  familyHistory?: {
    maternalLineage?: string[];
    paternalLineage?: string[];
    conversionDetails?: {
      date: string;
      location: string;
      authority: string;
    };
  };
}

export class JewishIdentityService {
  private database: DatabaseAdapter;
  private storage: HybridStorageService;
  private blockchain: BlockchainService;

  constructor(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ) {
    this.storage = storageService;
    this.database = adapterFactory.getDatabaseAdapter();
    this.blockchain = blockchainService;
  }

  async createIdentity(data: CreateJewishIdentityDTO): Promise<JewishIdentityEntity> {
    const user = await this.database.getUserById(data.userId) as User;
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.profile?.jewishIdentityId) {
      throw new AppError(400, 'User already has a Jewish identity profile');
    }

    const identity = new JewishIdentityEntity({
      ...data,
      verifiedBy: []
    });

    const savedIdentity = await this.database.createJewishIdentity(identity);

    // Update user profile with identity reference
    await this.database.updateUser(user.id, {
      profile: {
        ...user.profile,
        jewishIdentityId: savedIdentity.id
      }
    });

    return savedIdentity;
  }

  async getIdentity(userId: string): Promise<JewishIdentityEntity> {
    const identity = await this.database.getJewishIdentityByUserId(userId);
    if (!identity) {
      throw new AppError(404, 'Jewish identity profile not found');
    }
    return identity;
  }

  async updateIdentity(
    userId: string,
    data: Partial<CreateJewishIdentityDTO>
  ): Promise<JewishIdentityEntity> {
    const identity = await this.getIdentity(userId);
    
    const updatedIdentity = {
      ...identity,
      ...data
    };

    return this.database.updateJewishIdentity(identity.id, updatedIdentity);
  }

  async uploadVerificationDocument(
    identityId: string,
    documentType: string,
    file: Buffer
  ): Promise<void> {
    const identity = await this.getIdentity(identityId);
    const { path, type, tag } = await this.storage.uploadFile(
      `verification/${identityId}/${documentType}_${Date.now()}`,
      file,
      { type: StorageType.IPFS, encrypted: true }
    );

    // Store document hash on XRPL for immutability
    const documentHash = await this.blockchain.submitTransaction({
      type: 'StoreHash',
      hash: path
    });

    await this.database.updateJewishIdentity(identityId, {
      verificationDocuments: [
        ...identity.verificationDocuments,
        {
          type: documentType,
          ipfsHash: path,
          encryptionTag: tag || '',
          verifiedAt: new Date(),
          verifiedBy: undefined
        }
      ]
    });
  }

  async updateVerificationLevel(
    identityId: string,
    newLevel: VerificationLevel,
    verifierId: string
  ): Promise<void> {
    const identity = await this.getIdentity(identityId);
    
    // Validate requirements for new level
    await this.validateVerificationRequirements(identity, newLevel);
    
    await this.database.updateJewishIdentity(identityId, {
      verificationLevel: newLevel,
      verifiedBy: [...identity.verifiedBy, verifierId],
      metadata: {
        ...identity.metadata,
        verificationHistory: [
          ...((identity.metadata.verificationHistory as Array<Record<string, unknown>>) || []),
          {
            level: newLevel,
            verifierId,
            timestamp: new Date().toISOString()
          }
        ]
      }
    });
  }

  async addFamilyMember(
    identityId: string,
    relation: 'mother' | 'father' | 'child',
    memberId: string,
    documents?: Array<{ type: string; file: Buffer }>
  ): Promise<void> {
    const identity = await this.getIdentity(identityId);
    const member = await this.getIdentity(memberId);

    // Upload and process any supporting documents
    const documentRefs = await Promise.all(
      (documents || []).map(async doc => {
        const { path, tag } = await this.storage.uploadFamilyDocument(
          identityId,
          memberId,
          doc.type,
          doc.file
        );
        return { type: doc.type, ipfsHash: path, encryptionTag: tag || '' };
      })
    );

    // Update family tree data
    const newNode = {
      id: memberId,
      type: relation,
      name: member.hebrewName || '',
      documents: documentRefs
    };

    const newEdge = {
      from: relation === 'child' ? memberId : identityId,
      to: relation === 'child' ? identityId : memberId,
      relationship: relation
    };

    await this.database.updateJewishIdentity(identityId, {
      familyTreeData: {
        nodes: [...(identity.familyTreeData?.nodes || []), newNode],
        edges: [...(identity.familyTreeData?.edges || []), newEdge]
      }
    });

    // Update ancestry data based on relation
    if (relation === 'mother') {
      await this.updateMaternalLineage(identity, member, documentRefs);
    } else if (relation === 'father') {
      await this.updatePaternalLineage(identity, member, documentRefs);
    }
  }

  private async updateMaternalLineage(
    identity: JewishIdentityEntity,
    mother: JewishIdentityEntity,
    documents: Array<{ type: string; ipfsHash: string; encryptionTag: string }>
  ): Promise<void> {
    await this.database.updateJewishIdentity(identity.id, {
      maternalAncestry: {
        lineage: [mother.id, ...(mother.maternalAncestry?.lineage || [])],
        documents: [...documents, ...(mother.maternalAncestry?.documents || [])]
      }
    });
  }

  private async updatePaternalLineage(
    identity: JewishIdentityEntity,
    father: JewishIdentityEntity,
    documents: Array<{ type: string; ipfsHash: string; encryptionTag: string }>
  ): Promise<void> {
    await this.database.updateJewishIdentity(identity.id, {
      paternalAncestry: {
        lineage: [father.id, ...(father.paternalAncestry?.lineage || [])],
        documents: [...documents, ...(father.paternalAncestry?.documents || [])]
      }
    });
  }

  private async validateVerificationRequirements(
    identity: JewishIdentityEntity,
    newLevel: VerificationLevel
  ): Promise<void> {
    switch (newLevel) {
      case VerificationLevel.BASIC:
        // Basic level only requires profile completion
        if (!identity.hebrewName || !identity.affiliation) {
          throw new AppError(400, 'Profile must be complete for basic verification');
        }
        break;

      case VerificationLevel.VERIFIED:
        // Verified level requires documents
        if (!identity.verificationDocuments.length) {
          throw new AppError(400, 'Verification documents required');
        }
        break;

      case VerificationLevel.COMPLETE:
        // Complete level requires verified status and family history
        if (
          identity.verificationLevel !== VerificationLevel.VERIFIED ||
          !identity.familyTreeData?.nodes.length
        ) {
          throw new AppError(400, 'Must be verified and have family history');
        }
        break;

      default:
        throw new AppError(400, 'Invalid verification level');
    }
  }
}

const storageService = adapterFactory.getStorageAdapter();
const blockchainService = new BlockchainService();
export default new JewishIdentityService(storageService, blockchainService);
