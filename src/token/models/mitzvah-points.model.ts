// Mitzvah points model types

export interface MitzvahPointsRuleEntity {
  id: string;
  action_type: string;
  base_points: number;
  multiplier: number;
  max_points?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, unknown>;
}
