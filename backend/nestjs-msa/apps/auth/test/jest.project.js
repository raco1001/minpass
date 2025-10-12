module.exports = {
  displayName: "auth",
  roots: ["<rootDir>/apps/auth/src", "<rootDir>/apps/auth/test"],
  testMatch: ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"],
  collectCoverageFrom: [
    "apps/auth/src/**/*.ts",
    "!apps/auth/src/main.ts",
    "!apps/auth/src/**/*.module.ts",
  ],
};
