export const mockIPFSClient = {
  add: jest.fn(),
  cat: jest.fn(),
  pin: {
    add: jest.fn()
  }
};

export const create = jest.fn(() => mockIPFSClient);

export default { create };
