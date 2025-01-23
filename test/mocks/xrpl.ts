export const mockClient = {
  connect: jest.fn(),
  submit: jest.fn(),
  request: jest.fn(),
  disconnect: jest.fn()
};

export const mockWallet = {
  fromSeed: jest.fn()
};

const mock = {
  Client: jest.fn(() => mockClient),
  Wallet: mockWallet
};

export default mock;
