import { HebrewNameType, JewishAffiliation } from '../../identity/models/jewish-id.model';

export interface JewishIdentity {
  id: string;
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
  verifiedBy: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
