// jest.config.js (repo root)
// 전체 프로젝트 테스트를 한번에 실행할 때 사용
// 개별 마이크로서비스는 각자의 설정 파일을 사용하는 것을 권장

module.exports = {
  // 각 마이크로서비스의 jest 설정을 프로젝트로 등록
  projects: [
    "<rootDir>/apps/auth/test/jest.config.js",
    // 다른 마이크로서비스 추가 시:
    // "<rootDir>/apps/users/test/jest.config.js",
    // "<rootDir>/apps/apis/test/jest.config.js",
  ],
};
