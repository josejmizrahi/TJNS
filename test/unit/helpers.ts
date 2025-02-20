import { JewishIdentityEntity, JewishAffiliation } from '../../src/identity/models/jewish-id.model';
import { VerificationLevel } from '../../src/common/enums/user';

export const createBaseMockIdentity = (id: string, overrides: Partial<JewishIdentityEntity> = {}): JewishIdentityEntity => ({
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
