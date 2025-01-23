import { config } from 'dotenv';
import { IdentityService } from '../src/identity/services/identity.service';
import { adapterFactory } from '../src/common/adapters';
import { VerificationLevel, DocumentType } from '../src/common/types/models';
import { BlockchainService } from '../src/common/utils/blockchain';
import { HybridStorageService } from '../src/common/utils/storage';
import { IPFSService } from '../src/common/utils/ipfs';
import { EncryptionService } from '../src/common/utils/encryption';

// Load environment variables
config();

// Verify Supabase credentials are loaded
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Ensure environment variables are defined
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

async function testIdentityService() {
  try {
    // Initialize adapters
    adapterFactory.initialize(supabaseUrl, supabaseKey);
    
    // Initialize services
    const storageService = new HybridStorageService(
      adapterFactory.getStorageAdapter(),
      new IPFSService(),
      new EncryptionService()
    );
    
    const identityService = new IdentityService(
      storageService,
      new BlockchainService()
    );
    
    // Create test user data
    const testUser = {
      email: `test.user.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        synagogue: 'Test Synagogue'
      }
    };

    process.stdout.write('Testing Identity Service...\n');

    // Test user registration
    process.stdout.write('1. Testing user registration... ');
    const user = await identityService.registerUser(
      testUser.email,
      testUser.password,
      testUser.profile
    );
    if (!user || !user.id) throw new Error('User registration failed');
    process.stdout.write('✓\n');

    // Test email verification
    process.stdout.write('2. Testing email verification... ');
    const mockToken = 'test-verification-token';
    await identityService.verifyEmail(user.id, mockToken);
    const verifiedUser = await adapterFactory.getDatabaseAdapter().getUserById(user.id);
    if (verifiedUser?.verificationLevel !== VerificationLevel.BASIC) {
      throw new Error('Email verification failed');
    }
    process.stdout.write('✓\n');

    // Test document upload
    process.stdout.write('3. Testing document upload... ');
    const mockDocument = Buffer.from('Test document content');
    const document = await identityService.uploadKYCDocument(
      user.id,
      DocumentType.ID,
      mockDocument
    );
    if (!document || !document.ipfsCid) throw new Error('Document upload failed');
    process.stdout.write('✓\n');

    process.stdout.write('All Identity Service tests passed!\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    process.stderr.write(`Test failed: ${errorMessage}\n`);
    process.exit(1);
  }
}

// Run tests
testIdentityService().catch((error) => {
  process.stderr.write(`Test execution failed: ${error}\n`);
  process.exit(1);
});
