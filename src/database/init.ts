import { DataSource } from 'typeorm';
import { postgresConnection } from '../common/config/database';
import { UserEntity, KYCDocumentEntity } from '../identity/models/user.model';
import { TokenBalanceEntity, TransactionEntity, MitzvahPointsRuleEntity } from '../token/models/token.model';

const initializeDatabase = async () => {
  try {
    await postgresConnection.initialize();
    console.log('Connected to PostgreSQL');

    // Run migrations
    await postgresConnection.runMigrations();
    console.log('Migrations completed');

    // Initialize MitzvahPoints rules
    const mitzvahPointsRules = [
      {
        actionType: 'VOLUNTEER',
        basePoints: 10,
        multiplier: 1.0,
        maxPoints: 100
      },
      {
        actionType: 'DONATION',
        basePoints: 5,
        multiplier: 1.0,
        maxPoints: 50
      },
      {
        actionType: 'EDUCATION',
        basePoints: 8,
        multiplier: 1.0,
        maxPoints: 80
      }
    ];

    const ruleRepository = postgresConnection.getRepository(MitzvahPointsRuleEntity);
    await ruleRepository.save(mitzvahPointsRules);
    console.log('MitzvahPoints rules initialized');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
