export const mockClient = {
  connect: jest.fn(),
  submit: jest.fn(),
  request: jest.fn(),
  disconnect: jest.fn()
};

export const Client = jest.fn(() => mockClient);
export const Wallet = {
  fromSeed: jest.fn()
};

export default { Client, Wallet };
