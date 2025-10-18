const preset = require("../../../jest.preset");

// Auth 마이크로서비스 Unit 테스트 설정
module.exports = {
  ...preset,
  displayName: "auth-unit",

  // rootDir은 test 폴더를 기준으로 설정
  rootDir: "..",

  // 테스트 대상 디렉토리 (src 폴더의 모든 spec 파일)
  testMatch: ["<rootDir>/src/**/*.spec.ts"],

  // E2E 테스트는 제외
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test/"],

  // Coverage 수집 대상
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts",
  ],

  coverageDirectory: "<rootDir>/coverage/unit",

  // 모듈 경로 매핑 (tsconfig paths와 동일하게)
  // 순서 중요: 더 구체적인 패턴을 먼저 매칭해야 함
  moduleNameMapper: {
    // libs 내의 각 라이브러리별 매핑
    "^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",
    "^@app/contracts/(.*)$": "<rootDir>/../../libs/contracts/src/$1",
    "^@app/config/(.*)$": "<rootDir>/../../libs/config/src/$1",
    "^@app/logging/(.*)$": "<rootDir>/../../libs/logging/src/$1",
    "^@app/utils/(.*)$": "<rootDir>/../../libs/utils/src/$1",

    // 라이브러리 루트 import (index.ts)
    "^@app/integrations$": "<rootDir>/../../libs/integrations/src",
    "^@app/contracts$": "<rootDir>/../../libs/contracts/src",
    "^@app/config$": "<rootDir>/../../libs/config/src",
    "^@app/logging$": "<rootDir>/../../libs/logging/src",
    "^@app/utils$": "<rootDir>/../../libs/utils/src",

    // auth 앱 내부 경로
    "^@auth/(.*)$": "<rootDir>/src/$1",
  },
};
