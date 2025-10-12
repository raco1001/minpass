// Mock for uuid to avoid ESM issues in Jest
module.exports = {
  v4: jest.fn(() => "00000000-0000-0000-0000-000000000000"),
  v7: jest.fn(() => "00000000-0000-0000-0000-000000000000"),
};
