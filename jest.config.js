const path = require('path');

module.exports = {
  //preset: "ts-jest",
  preset: "ts-jest/presets/js-with-ts-esm",
  //resolver: "ts-jest-resolver",
  rootDir: "./",
  roots: [
    "<rootDir>/packages/cli",
    "<rootDir>/packages/phi/src",
    "<rootDir>/packages/psi/src"
  ],
  collectCoverage: true,

  collectCoverageFrom: [
    "**/dist/*.{js,jsx,ts}",
    "!**/node_modules/**",
    "!**/generated/**",
  ],
  coveragePathIgnorePatterns: [
    ".*/src/.*\\.d\\.ts",
    ".*/src/.*\\.test\\.{ts,js}",
    ".*/src/.*\\.test\\.headless\\.js",
  ],
  globalSetup: "<rootDir>/jest/node.setup.js",
  globalTeardown: "<rootDir>/jest/node.teardown.js",
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // // TODO: This requires Jest 28, but installing Jest 28 runs into other issues
  // // Fix ts-jest / ESM issues (https://stackoverflow.com/questions/66154478/jest-ts-jest-typescript-with-es-modules-import-cannot-find-module)
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    // all exceptions must be first line
    "/node_modules/(?!(mainnet-js))"
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: "jest-environment-node",
  setupFiles: ["fake-indexeddb/auto"],
  testTimeout: 65000,
  maxWorkers: 2,
  verbose: true

};
