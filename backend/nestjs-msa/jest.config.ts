// jest.config.js (repo root)
const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require("./tsconfig.json"); // 또는 tsconfig.base.json

module.exports = {
  testEnvironment: "node",
  // Nx 없이도 projects 배열 지원 (apps/*, libs/* 단위로 실행)
  projects: [
    "<rootDir>/apps/auth/test/jest.project.js",
    "<rootDir>/apps/apis/test/jest.project.js",
    // ... 다른 앱들
    "<rootDir>/libs/contracts/jest.project.js",
    "<rootDir>/libs/integrations/jest.project.js",
    // ... 다른 라이브러리들
  ],
  // 공통 transform
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.spec.json", isolatedModules: true },
    ],
  },
  // tsconfig paths → jest moduleNameMapper
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths || {},
    { prefix: "<rootDir>/" },
  ),
  // ESM 예외(예: uuid, nanoid 등)
  transformIgnorePatterns: ["node_modules/(?!(uuid|nanoid)/)"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.jest.ts"],
};
