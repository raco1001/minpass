# Jest Configuration Guide for Testing

## Test File Structure (Ex. Auth Microservice)

```bash
nestjs-msa/
├── jest.config.js              # For Testing Entire Projects
├── jest.preset.js              # Common Configuration (reuse in every Microservices)
├── apps/
│   └── auth/
│       ├── src/
│       │   ├── **/*.spec.ts   # Files for Unit Testing
│       │   └── ...
│       └── test/
│           ├── jest.config.js        # Auth Unit Testing Configuration
│           ├── jest-e2e.config.js    # Auth E2E Testing Configuration
│           └── *.e2e-spec.ts         # E2E Testing Codes
└── package.json
```

## Roles of Configuration Files

### 1. `jest.preset.js` (common configuration)

**Objective**: Basic Jest Configuration Shared By Every Microservices

**Characteristics**:

- Reuse preset configurations as `require("../../../jest.preset")` in every microservices
- Configured to Convert into TypeScript
- Paths of Modules are mapped. (tsconfig paths)
- Coverage Collection Configured (as default)

### 2. `jest.config.js` (for Root)

**Objective**: Use to Test all microservices at once.

**When to use it**:

- On every CI/CD stages.
- Coverage Check for Entire Codebase

```bash
# For Testing Entire Microservices
pnpm test
```

### 3. `apps/{service}/test/jest.config.js` (Unit Tests for each Microservices)

**Objective**: Settings for each Microservices

**Characteristics**:

- Tests `src/**/*.spec.ts` files
- Excludes E2E Test (ignore `/test/` path)
- For Faster Testing

**How to Use**:

```bash
# ex. Unit Testing for Auth Microservice
pnpm test:auth

# Watch mode
pnpm test:auth:watch

# Coverage Included
pnpm test:auth:cov
```

### 4. `apps/{service}/test/jest-e2e.config.js` (E2E Testing for each Microservices)

**Objectives**: Settings for End-to-End Testing of each Microservices

**Characteristics**:

- tests `test/**/*.e2e-spec.ts` files only
- Integration Testing which similar to runtime applications
- Timeout: 30 seconds (Long - runtime)

**How to Use**:

```bash
# E2E Testing for Auth Microservice
pnpm test:auth:e2e
```

## 🚀 Testing Commands

### For Auth Microservice

| Command                | Description       |
| ---------------------- | ----------------- |
| `pnpm test:auth`       | Runs Unit tests   |
| `pnpm test:auth:watch` | Watch Mode        |
| `pnpm test:auth:cov`   | Includes Coverage |
| `pnpm test:auth:e2e`   | Runs E2E tests    |

### For Entire Projects

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm test`       | Runs Tests for Entire Microservices |
| `pnpm test:watch` | Watch mode                          |
| `pnpm test:cov`   | Includes Coverage                   |

## 📋 How To Add Testing

If you want to add testing to other Microservices(ex. `users`)

### Step 1: Create Configuration Files for Testing

```bash
# Create Directories
mkdir -p apps/users/test

# Copy Configuration Files From other Microservices which Already Set to Test
cp apps/auth/test/jest.config.js apps/users/test/
cp apps/auth/test/jest-e2e.config.js apps/users/test/
```

### Step 2: Modify Configuration Files For Current Microservice

`apps/users/test/jest.config.js`:

```javascript
const preset = require("../../../jest.preset");

module.exports = {
  ...preset,
  displayName: "users-unit", // ← Modify
  rootDir: "..",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/test/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts", "!src/**/*.module.ts"],
  coverageDirectory: "<rootDir>/coverage/unit",
  moduleNameMapper: {
    "^@app/(.*)$": "<rootDir>/../../libs/$1/src",
    "^@users/(.*)$": "<rootDir>/src/$1", // ← Modify
  },
};
```

`apps/users/test/jest-e2e.config.js`:

```javascript
const preset = require("../../../jest.preset");

module.exports = {
  ...preset,
  displayName: "users-e2e", // ← Modify
  rootDir: ".",
  testRegex: ".e2e-spec.ts$",
  collectCoverage: false,
  testTimeout: 30000,
  moduleNameMapper: {
    "^@users/(.*)$": "<rootDir>/../src/$1", // ← Modify
  },
};
```

### Step 3: Add Testing Commands to package.json

```json
{
  "scripts": {
    "test:users": "jest --config apps/users/test/jest.config.js",
    "test:users:watch": "jest --config apps/users/test/jest.config.js --watch",
    "test:users:cov": "jest --config apps/users/test/jest.config.js --coverage",
    "test:users:e2e": "jest --config apps/users/test/jest-e2e.config.js"
  }
}
```

### Step 4: Add jest configuration file path to jest.config.js on Root

```javascript
module.exports = {
  projects: [
    "<rootDir>/apps/auth/test/jest.config.js",
    "<rootDir>/apps/users/test/jest.config.js", // ← 추가
  ],
};
```

## ✅ Checklist

If you are going to test this newly added configurations, check:

- [ ] `apps/{service}/test/jest.config.js` created and `displayName` modified
- [ ] `apps/{service}/test/jest-e2e.config.js` created and `displayName` modified
- [ ] aliases of `moduleNameMapper` in Current Microservice's jest.config.js & jest.e2e.js (`@{service}`) are configured correctly
- [ ] 4 testing scripts are added to `package.json`
- [ ] Current Microservice is added to `projects` Array of Root `jest.config.js`
- [ ] `pnpm test:{service}` command runs correctly
- [ ] `pnpm test:{service}:e2e` command runs correctly

## 🎓 Best Practices

### 1. Locations of Testing Files

- **Unit Testing**: `apps/{service}/src/**/*.spec.ts`
  - Locate at same directory of the target base code
  - Ex: `login.service.ts` → `login.service.spec.ts`

- **E2E Testing**: `apps/{service}/test/**/*.e2e-spec.ts`
  - Locate at Separate Directory (Ex. `test`)
  - Entire Flow testing for a Microservice

### 2. Module Path Mapping

Should Be Same AS `paths` setting of tsconfig.json:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@auth/*": ["apps/auth/src/*"],
      "@app/config": ["libs/config/src"]
    }
  }
}

// jest.config.js
{
  "moduleNameMapper": {
    "^@auth/(.*)$": "<rootDir>/src/$1",
    "^@app/config$": "<rootDir>/../../libs/config/src"
  }
}
```

### 3. Coverage Goals

| Layers                       | Target Coverage |
| ---------------------------- | --------------- |
| Application Layer (Services) | 90%+            |
| Domain Layer                 | 95%+            |
| Infrastructure Layer         | 80%+            |
| **Total**                    | **85%+**        |

### 4. Test Execution Order (Recommendations)

1. **Under Development**: `pnpm test:auth:watch`
   - Gives Quick Feedback
   - Auto-runs on the Save Event

2. **Before Commit**: `pnpm test:auth:cov`
   - Coverage Check
   - Identifies Missing Tests

3. **Before PR**: `pnpm test:auth:e2e`
   - Integration testing for a Microservice
   - Simulates Runtime

4. **CI/CD**: `pnpm test`
   - Integration testing for Entire Applications
   - Verifies all applications

## 🐛 Trouble Shooting

### 1. Cannot find module

**Causes**: `moduleNameMapper` configurations are differ from tsconfig paths

**Solution**:

- Check`paths` of tsconfig.json
- Check `moduleNameMapper` of jest.config.js
- Check `<rootDir>` set correctly

### 2. No tests found

**Causes**: Patterns of `testMatch` or `testRegex` is wrong

**Solution**:

```bash
# Checks testing lists
pnpm test:auth --listTests
```

### 3. E2E Test Timeout

**Causes**: Exceeds Default Timeout (5 seconds)

**Solution**: Add Test Timeout to `jest-e2e.config.js`( which is long enough)

```javascript
{
  testTimeout: 30000; // 30 Seconds
}
```

### 4. ts-jest Warning

**Causes**: ts-jest Modify Options Follow ts-jest version update

**Solution**: Modify `jest.preset.js` To Use Recent Options

```javascript
{
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { useESM: false }]
  }
}
```

## 📚 References

- [Official Jest Documentation](https://jestjs.io/)
- [Testing Guide for NestJS](https://docs.nestjs.com/fundamentals/testing)
- [ts-jest Configurations](https://kulshekhar.github.io/ts-jest/)
- [TESTING_GUIDE.md for each Microservices (Ex. Auth)](apps/auth/TESTING_GUIDE.md)

## 📝 Summary

Principles of testing configurations

1. **Simplicity**: Maintain File only Needed
2. **Clarity**: Roles of Each Files Should Be Clear
3. **Scalability**: Easy to Add Testing for other Microservices
4. **Consistency**: Every Microservices Should Use Same Configuration Patterns
