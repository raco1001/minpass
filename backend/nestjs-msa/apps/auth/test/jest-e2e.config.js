const preset = require("../../../jest.preset");

// Auth Microservice E2E Test Configuration
module.exports = {
  ...preset,
  displayName: "auth-e2e",

  // rootDir = test folder itself
  rootDir: ".",

  // E2E Test Files Only
  testRegex: ".e2e-spec.ts$",

  // Coverage Collection (E2E is Integration Test, so optional)
  collectCoverage: false,

  // Timeout Setting (E2E can take a long time)
  testTimeout: 30000,

  // Module Path Mapping
  moduleNameMapper: {
    // libs internal path mapping for each library
    "^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",
    "^@app/contracts/(.*)$": "<rootDir>/../../libs/contracts/src/$1",
    "^@app/config/(.*)$": "<rootDir>/../../libs/config/src/$1",
    "^@app/logging/(.*)$": "<rootDir>/../../libs/logging/src/$1",
    "^@app/utils/(.*)$": "<rootDir>/../../libs/utils/src/$1",

    // Library Root Import (index.ts)
    "^@app/integrations$": "<rootDir>/../../libs/integrations/src",
    "^@app/contracts$": "<rootDir>/../../libs/contracts/src",
    "^@app/config$": "<rootDir>/../../libs/config/src",
    "^@app/logging$": "<rootDir>/../../libs/logging/src",
    "^@app/utils$": "<rootDir>/../../libs/utils/src",

    // auth app internal path
    "^@auth/(.*)$": "<rootDir>/../src/$1",
  },
};
