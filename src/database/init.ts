import { supabase } from '../common/config/database';

const initializeDatabase = async () => {
  try {
    // Initialize MitzvahPoints rules
    const { error } = await supabase
      .from('mitzvah_points_rules')
      .upsert([
        {
          action_type: 'VOLUNTEER',
          base_points: 10,
          multiplier: 1.0,
          max_points: 100,
          is_active: true
        },
        {
          action_type: 'DONATION',
          base_points: 5,
          multiplier: 1.0,
          max_points: 50,
          is_active: true
        },
        {
          action_type: 'EDUCATION',
          base_points: 8,
          multiplier: 1.0,
          max_points: 80,
          is_active: true
        }
      ], { onConflict: 'action_type' });

    if (error) {
      throw error;
    }

    console.log('MitzvahPoints rules initialized');
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
