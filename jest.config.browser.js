module.exports = {
    verbose: true,
    rootDir: "./",
    roots: [
        "<rootDir>/packages/annuity/src",
        "<rootDir>/packages/bus/src",
        "<rootDir>/packages/divide/src",
        "<rootDir>/packages/faucet/src",
        "<rootDir>/packages/lock/src",
        "<rootDir>/packages/mine/src",
        "<rootDir>/packages/perpetuity/src",
        "<rootDir>/packages/record/src",
        "<rootDir>/packages/shares/src",
    ],
    preset: "jest-playwright-preset",
    collectCoverageFrom: ["**/*.{js}", "!**/node_modules/**", "!**/generated/**"],
    coveragePathIgnorePatterns: [
      ".*/src/.*\\.d\\.ts",
      ".*/src/.*\\.test\\.{ts,js}",
    ],
    testMatch: ["**/**.test.headless.js"],
    testPathIgnorePatterns: ["/node_modules/"], //
    testEnvironment: "node",
    testEnvironmentOptions: {
      "jest-playwright": {
        browsers: ["chromium", "firefox"],
      },
    },
    transform: {
      "^.+\\.ts?$": "ts-jest",
    },
    globalSetup: "<rootDir>/jest/browser.setup.js",
    globalTeardown: "<rootDir>/jest/browser.teardown.js",
    testTimeout: 95000,
  };
  