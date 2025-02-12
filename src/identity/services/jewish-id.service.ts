import { JewishIdentityEntity, HebrewNameType, JewishAffiliation } from '../models/jewish-id.model';
// Removed unused import
import { AppError } from '../../common/middleware/error';
import { DatabaseAdapter } from '../../common/adapters/database.adapter';
import { adapterFactory } from '../../common/adapters/adapter-factory';
import { HybridStorageService } from '../../common/utils/storage';
import { User } from '../../common/types/models';

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

  constructor(storageService: HybridStorageService) {
    this.storage = storageService;
    this.database = adapterFactory.getDatabaseAdapter();
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

  async verifyIdentity(
    identityId: string,
    verifierId: string,
    verificationData: {
      documentType: string;
      verificationNotes?: string;
    }
  ): Promise<void> {
    const identity = await this.database.getJewishIdentityById(identityId);
    if (!identity) {
      throw new AppError(404, 'Jewish identity profile not found');
    }

    // Add verifier to the list if not already present
    if (!identity.verifiedBy.includes(verifierId)) {
      await this.database.updateJewishIdentity(identityId, {
        verifiedBy: [...identity.verifiedBy, verifierId],
        metadata: {
          ...identity.metadata,
          verifications: [
            ...((identity.metadata.verifications as any[]) || []),
            {
              verifierId,
              timestamp: new Date().toISOString(),
              documentType: verificationData.documentType,
              notes: verificationData.verificationNotes
            }
          ]
        }
      });
    }
  }
}

export default new JewishIdentityService(
  new HybridStorageService(
    adapterFactory.getStorageAdapter(),
    adapterFactory.getIPFSService(),
    adapterFactory.getEncryptionService()
  )
);
