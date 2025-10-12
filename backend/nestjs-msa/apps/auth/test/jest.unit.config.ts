import preset from "../../../jest.preset";

export default {
  ...preset,
  displayName: "unit-auth",
  rootDir: "../../..",
  roots: ["<rootDir>/apps/auth/src"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/apps/auth/test/"],
  setupFiles: ["<rootDir>/apps/auth/test/setup.env.ts"],
  setupFilesAfterEnv: ["<rootDir>/apps/auth/test/setup.after.ts"],
};
