# Jest 경로 별칭(Path Alias) 설정 가이드

## 목차

1. [문제 상황](#문제-상황)
2. [경로 별칭이란](#경로-별칭이란)
3. [NestJS에서의 경로 별칭 설정](#nestjs에서의-경로-별칭-설정)
4. [Jest에서의 경로 별칭 설정](#jest에서의-경로-별칭-설정)
5. [문제 해결 과정](#문제-해결-과정)
6. [Best Practices](#best-practices)

---

## 문제 상황

### 발생한 에러

```bash
Configuration error:

Could not locate module @app/integrations/mariadb/constants/mariadb.constants mapped as:
/home/orca/devs/projects/minpass/backend/nestjs-msa/libs/$1/src.

Please check your configuration for these entries:
{
  "moduleNameMapper": {
    "/^@app\/(.*)$/": "/home/orca/devs/projects/minpass/backend/nestjs-msa/libs/$1/src"
  },
  "resolver": undefined
}
```

### 문제 분석

**Import 문:**

```typescript
import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
```

**실제 파일 위치:**

```
libs/integrations/src/mariadb/constants/mariadb.constants.ts
```

**Jest가 변환한 경로 (잘못됨):**

```
libs/integrations/mariadb/constants/mariadb.constants/src  ❌
```

**올바른 경로:**

```
libs/integrations/src/mariadb/constants/mariadb.constants  ✅
```

---

## 경로 별칭이란

### 개념

경로 별칭(Path Alias)은 긴 상대 경로를 짧고 명확한 별칭으로 대체하는 기능입니다.

### Before: 상대 경로 사용

```typescript
// ❌ 문제점: 길고 복잡하며, 파일 위치 변경 시 모든 import 수정 필요
import { UserService } from "../../../services/user.service";
import { AuthGuard } from "../../../../guards/auth.guard";
import { DatabaseConfig } from "../../../../../config/database.config";
```

### After: 경로 별칭 사용

```typescript
// ✅ 개선: 짧고 명확하며, 파일 위치와 무관
import { UserService } from "@app/services/user.service";
import { AuthGuard } from "@app/guards/auth.guard";
import { DatabaseConfig } from "@app/config/database.config";
```

### 장점

1. **가독성 향상**: 경로가 짧고 의미가 명확
2. **유지보수성**: 파일 구조 변경 시 import 수정 불필요
3. **일관성**: 프로젝트 전체에서 동일한 패턴 사용
4. **자동완성**: IDE가 경로를 더 잘 인식

---

## NestJS에서의 경로 별칭 설정

### 1. Monorepo 구조

NestJS CLI를 사용한 Monorepo 구조:

```
nestjs-msa/
├── apps/
│   ├── auth/           # 인증 마이크로서비스
│   ├── users/          # 사용자 마이크로서비스
│   └── apis/           # API Gateway
├── libs/               # 공유 라이브러리
│   ├── integrations/   # DB, 외부 API 통합
│   ├── contracts/      # Protobuf 계약
│   ├── config/         # 설정
│   └── logging/        # 로깅
├── nest-cli.json       # NestJS CLI 설정
└── tsconfig.json       # TypeScript 설정
```

### 2. nest-cli.json 설정

```json
{
  "projects": {
    "integrations": {
      "type": "library",
      "root": "libs/integrations",
      "entryFile": "index",
      "sourceRoot": "libs/integrations/src",
      "compilerOptions": {
        "tsConfigPath": "libs/integrations/tsconfig.lib.json"
      }
    },
    "contracts": {
      "type": "library",
      "root": "libs/contracts",
      "entryFile": "index",
      "sourceRoot": "libs/contracts/src"
    }
  }
}
```

**핵심 포인트:**

- `sourceRoot`: 실제 소스 코드 위치 (`libs/integrations/src`)
- `entryFile`: 라이브러리의 진입점 (`index.ts`)

### 3. tsconfig.json의 paths 설정

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      // 라이브러리 루트 import
      "@app/integrations": ["libs/integrations/src"],
      "@app/contracts": ["libs/contracts/src"],
      "@app/config": ["libs/config/src"],

      // 라이브러리 내부 경로 import
      "@app/integrations/*": ["libs/integrations/src/*"],
      "@app/contracts/*": ["libs/contracts/src/*"],
      "@app/config/*": ["libs/config/src/*"],

      // 앱 별칭
      "@auth": ["apps/auth/src"],
      "@auth/*": ["apps/auth/src/*"],
      "@users": ["apps/users/src"],
      "@users/*": ["apps/users/src/*"]
    }
  }
}
```

### 4. 경로 매핑 이해

#### 패턴 1: 루트 import

```typescript
// Import: @app/integrations
// 실제 경로: libs/integrations/src/index.ts
import { MariaDbModule } from "@app/integrations";
```

#### 패턴 2: 하위 경로 import

```typescript
// Import: @app/integrations/mariadb/constants/mariadb.constants
// 매핑: libs/integrations/src/* → libs/integrations/src/mariadb/constants/mariadb.constants
// 실제 경로: libs/integrations/src/mariadb/constants/mariadb.constants.ts
import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
```

---

## Jest에서의 경로 별칭 설정

### 1. 문제: TypeScript와 Jest의 차이

- **TypeScript (tsc)**: `tsconfig.json`의 `paths`를 사용
- **Jest**: 자체 모듈 해석 시스템 사용 → `moduleNameMapper` 필요

Jest는 TypeScript 설정을 자동으로 읽지 않으므로 별도 설정이 필요합니다.

### 2. 잘못된 설정 (Before)

```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/../../libs/$1/src", // ❌ 문제
  },
};
```

**문제점:**

```
@app/integrations/mariadb/constants/mariadb.constants
↓
libs/integrations/mariadb/constants/mariadb.constants/src  ❌
```

`/src`가 끝에 붙어서 잘못된 경로가 생성됩니다!

### 3. 올바른 설정 (After)

```javascript
// jest.config.js
module.exports = {
  // 순서 중요: 더 구체적인 패턴을 먼저 매칭
  moduleNameMapper: {
    // 1. 각 라이브러리별 구체적 매핑 (우선순위 높음)
    "^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",
    "^@app/contracts/(.*)$": "<rootDir>/../../libs/contracts/src/$1",
    "^@app/config/(.*)$": "<rootDir>/../../libs/config/src/$1",
    "^@app/logging/(.*)$": "<rootDir>/../../libs/logging/src/$1",
    "^@app/utils/(.*)$": "<rootDir>/../../libs/utils/src/$1",

    // 2. 라이브러리 루트 import (index.ts)
    "^@app/integrations$": "<rootDir>/../../libs/integrations/src",
    "^@app/contracts$": "<rootDir>/../../libs/contracts/src",
    "^@app/config$": "<rootDir>/../../libs/config/src",

    // 3. 앱 내부 경로
    "^@auth/(.*)$": "<rootDir>/src/$1",
  },
};
```

### 4. 매핑 순서의 중요성

Jest의 `moduleNameMapper`는 **첫 번째로 매칭되는 패턴**을 사용합니다.

```javascript
// ❌ 잘못된 순서
"^@app/(.*)$": "<rootDir>/../../libs/$1/src",  // 너무 일반적 (먼저 매칭됨)
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",  // 도달 불가!

// ✅ 올바른 순서
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",  // 구체적 (먼저)
"^@app/(.*)$": "<rootDir>/../../libs/$1/src",  // 일반적 (나중)
```

---

## 문제 해결 과정

### Step 1: 에러 분석

```bash
Could not locate module @app/integrations/mariadb/constants/mariadb.constants
mapped as: libs/$1/src
```

**분석:**

1. `@app/integrations/mariadb/constants/mariadb.constants`를 변환
2. 정규식 `^@app/(.*)$`에서 `$1` = `integrations/mariadb/constants/mariadb.constants`
3. 변환 결과: `libs/integrations/mariadb/constants/mariadb.constants/src` ❌

### Step 2: 실제 파일 위치 확인

```bash
$ ls libs/integrations/src/mariadb/constants/
mariadb.constants.ts  ✅

$ ls libs/integrations/mariadb/constants/mariadb.constants/src
No such file or directory  ❌
```

### Step 3: tsconfig.json 확인

```json
{
  "paths": {
    "@app/integrations/*": ["libs/integrations/src/*"]
  }
}
```

**이해:**

- `@app/integrations/*` → `libs/integrations/src/*`
- `@app/integrations/mariadb/constants/mariadb.constants`
- → `libs/integrations/src/mariadb/constants/mariadb.constants`

### Step 4: Jest 설정 수정

```javascript
// Before
"^@app/(.*)$": "<rootDir>/../../libs/$1/src"

// After
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1"
```

### Step 5: 검증

```bash
$ npm run test:auth
✓ All tests passed!
```

---

## Best Practices

### 1. 일관성 유지

tsconfig.json과 jest.config.js의 경로 매핑을 일치시킵니다.

```typescript
// tsconfig.json
"@app/integrations/*": ["libs/integrations/src/*"]

// jest.config.js
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1"
```

### 2. 명확한 네이밍

```typescript
// ✅ Good: 목적이 명확
@app/integrations    // 공유 통합 라이브러리
@app/contracts       // gRPC 계약
@auth                // auth 앱 내부

// ❌ Bad: 모호함
@lib                 // 어떤 라이브러리?
@common              // 너무 일반적
```

### 3. 계층 구조 반영

```typescript
@app/*               // 프로젝트 전체 공유
@auth/*              // auth 앱 전용
@users/*             // users 앱 전용
```

### 4. 모노레포 전용 헬퍼 스크립트

경로 별칭 검증 스크립트를 만들어 CI/CD에 통합:

```javascript
// scripts/verify-path-aliases.js
const tsconfig = require("../tsconfig.json");
const jestConfig = require("../apps/auth/test/jest.config");

function verifyPathAliases() {
  const tsPaths = Object.keys(tsconfig.compilerOptions.paths);
  const jestMappers = Object.keys(jestConfig.moduleNameMapper);

  // 검증 로직
  tsPaths.forEach((tsPath) => {
    const jestPattern = tsPath.replace(/\*/g, "(.*)");
    if (!jestMappers.includes(jestPattern)) {
      console.error(`Missing Jest mapping for: ${tsPath}`);
    }
  });
}
```

### 5. 문서화

프로젝트 README에 경로 별칭 가이드 포함:

```markdown
## 경로 별칭 사용법

### 공유 라이브러리

- `@app/integrations` - DB, 외부 API 통합
- `@app/contracts` - gRPC 계약 정의
- `@app/config` - 공유 설정

### 앱 내부

- `@auth/*` - auth 마이크로서비스 내부
- `@users/*` - users 마이크로서비스 내부
```

### 6. IDE 설정

VSCode `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## 트러블슈팅

### 문제 1: "Cannot find module" 에러

**증상:**

```
Cannot find module '@app/integrations' or its corresponding type declarations
```

**해결:**

1. `tsconfig.json`에 경로 매핑 확인
2. IDE 재시작 (TypeScript 서버 리로드)
3. `node_modules` 삭제 후 `npm install`

### 문제 2: Jest 테스트에서만 실패

**증상:**

- 일반 실행: 정상 ✅
- Jest 테스트: 실패 ❌

**해결:**

1. `jest.config.js`의 `moduleNameMapper` 확인
2. 경로 매핑 순서 확인 (구체적 → 일반적)
3. `<rootDir>` 기준 경로 확인

### 문제 3: Monorepo에서 libs 참조 실패

**증상:**

```
Cannot locate module @app/integrations mapped as: libs/$1/src
```

**해결:**
Jest 설정을 라이브러리별로 구체화:

```javascript
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1",
```

---

## 참고 자료

### TypeScript

- [Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

### Jest

- [moduleNameMapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)
- [Handling Module Path Aliases](https://jestjs.io/docs/webpack#handling-static-assets)

### NestJS

- [Monorepo Mode](https://docs.nestjs.com/cli/monorepo)
- [Libraries](https://docs.nestjs.com/cli/libraries)

---

## 요약

### 핵심 원칙

1. **tsconfig.json과 jest.config.js를 일치시킨다**
2. **구체적인 패턴을 먼저 매핑한다**
3. **실제 파일 구조를 정확히 반영한다**
4. **일관된 네이밍 규칙을 사용한다**

### Before & After

```javascript
// ❌ Before: 잘못된 매핑
"^@app/(.*)$": "<rootDir>/../../libs/$1/src"
// → libs/integrations/mariadb/.../src (잘못됨)

// ✅ After: 올바른 매핑
"^@app/integrations/(.*)$": "<rootDir>/../../libs/integrations/src/$1"
// → libs/integrations/src/mariadb/... (올바름)
```

### 체크리스트

- [ ] `nest-cli.json`에 라이브러리 등록
- [ ] `tsconfig.json`의 `paths` 설정
- [ ] `jest.config.js`의 `moduleNameMapper` 설정
- [ ] 매핑 순서 확인 (구체적 → 일반적)
- [ ] 테스트 실행으로 검증
- [ ] 문서화 (README, 주석)

---

**작성일**: 2024-10-18  
**프로젝트**: MinPass Backend (NestJS Monorepo)  
**문제**: Jest 경로 별칭 설정 오류  
**해결**: moduleNameMapper 구체화
