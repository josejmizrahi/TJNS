export const mockIPFSClient = {
  add: jest.fn(),
  cat: jest.fn(),
  pin: {
    add: jest.fn()
  }
};

export const mockCreate = jest.fn(() => mockIPFSClient);

const mock = {
  create: mockCreate
};

export default mock;
