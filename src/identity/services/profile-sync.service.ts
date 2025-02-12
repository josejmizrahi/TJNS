import { DatabaseAdapter } from '../../common/adapters/database.adapter';
import { adapterFactory } from '../../common/adapters/adapter-factory';
import { AppError } from '../../common/middleware/error';
import { User } from '../../common/types/models';
import { JewishIdentityEntity } from '../models';

export class ProfileSyncService {
  private database: DatabaseAdapter;

  constructor() {
    this.database = adapterFactory.getDatabaseAdapter();
  }

  async syncUserProfile(userId: string): Promise<void> {
    const user = await this.database.getUserById(userId) as User;
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const jewishId = await this.database.getJewishIdentityByUserId(userId);
    if (!jewishId) {
      return; // No JewishID profile to sync
    }

    // Update user profile with latest JewishID data
    await this.database.updateUser(userId, {
      profile: {
        ...user.profile,
        jewishIdentityId: jewishId.id,
        synagogue: jewishId.synagogue,
        community: jewishId.community
      }
    });

    // Log sync in history
    await this.database.query(`
      INSERT INTO profile_sync_history (
        user_id,
        jewish_identity_id,
        sync_type,
        sync_status,
        sync_details
      ) VALUES (
        $1, $2, 'automatic', 'success',
        $3::jsonb
      )
    `, [
      userId,
      jewishId.id,
      JSON.stringify({
        syncedFields: ['jewishIdentityId', 'synagogue', 'community'],
        timestamp: new Date().toISOString()
      })
    ]);
  }

  async linkMFAToJewishID(userId: string): Promise<void> {
    const user = await this.database.getUserById(userId) as User;
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const jewishId = await this.database.getJewishIdentityByUserId(userId);
    if (!jewishId) {
      throw new AppError(404, 'JewishID profile not found');
    }

    // Transfer MFA settings to JewishID profile
    if (user.profile.mfaEnabled && user.profile.mfaVerified) {
      await this.database.updateJewishIdentity(jewishId.id, {
        metadata: {
          ...jewishId.metadata,
          mfa: {
            enabled: user.profile.mfaEnabled,
            verified: user.profile.mfaVerified,
            migratedAt: new Date().toISOString()
          }
        }
      });

      // Log MFA migration in history
      await this.database.query(`
        INSERT INTO profile_sync_history (
          user_id,
          jewish_identity_id,
          sync_type,
          sync_status,
          sync_details
        ) VALUES (
          $1, $2, 'mfa_migration', 'success',
          $3::jsonb
        )
      `, [
        userId,
        jewishId.id,
        JSON.stringify({
          mfaEnabled: user.profile.mfaEnabled,
          mfaVerified: user.profile.mfaVerified,
          migratedAt: new Date().toISOString()
        })
      ]);
    }
  }
}

export default new ProfileSyncService();
