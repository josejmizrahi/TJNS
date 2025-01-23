export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    verifyOtp: jest.fn()
  },
  storage: {
    from: jest.fn()
  }
};

export const createClient = jest.fn(() => mockSupabaseClient);

export default { createClient };
