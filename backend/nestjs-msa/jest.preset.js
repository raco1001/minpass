const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

// 모든 마이크로서비스에서 공통으로 사용하는 Jest 기본 설정
module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        // ts-jest v30+ 권장 설정
        useESM: false,
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: "<rootDir>/../../", // 각 앱의 test 폴더 기준으로 repo root로 이동
  }),
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/*.module.ts",
    "!**/main.ts",
    "!**/index.ts",
  ],
  coverageDirectory: "./coverage",
};
