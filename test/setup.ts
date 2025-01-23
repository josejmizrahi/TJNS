import { config } from 'dotenv';
import { resolve } from 'path';
import { jest } from '@jest/globals';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test') });

// Set required environment variables if not present
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-key';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.ENCRYPTION_IV = process.env.ENCRYPTION_IV || '0123456789abcdef0123456789abcdef';

// Mock external modules at a higher level
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      verifyOtp: jest.fn()
    },
    storage: {
      from: jest.fn()
    }
  }))
}));

jest.mock('xrpl', () => ({
  Client: jest.fn(() => ({
    connect: jest.fn(),
    submit: jest.fn(),
    request: jest.fn(),
    disconnect: jest.fn()
  })),
  Wallet: { fromSeed: jest.fn() }
}));

// Mock IPFSService
jest.mock('../src/common/utils/ipfs', () => ({
  IPFSService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('mock-cid'),
    uploadEncrypted: jest.fn().mockResolvedValue({ cid: 'mock-cid', tag: 'mock-tag' }),
    downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock-content')),
    downloadEncrypted: jest.fn().mockResolvedValue('mock-decrypted-content'),
    getGatewayUrl: jest.fn().mockReturnValue('https://mock-gateway.ipfs.io/ipfs/mock-cid')
  }))
}));

// Global test setup
beforeAll(() => {
  // Additional setup if needed
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});
