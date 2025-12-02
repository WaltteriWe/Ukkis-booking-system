const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",

  // kertoo missä tiedostoissa testit voivat olla
  testMatch: ["**/?(*.)+(test).ts"],

  // käyttää ts-jestiä TS-tiedostojen kääntämiseen
  transform: {
    ...tsJestTransformCfg,
  },

  // jos käytät importteja ilman tiedostopäätettä (yleinen ts-jest varoitus)
  moduleFileExtensions: ["ts", "js", "json"],

  // estää jestiä ignoraamasta TS-tiedostoja node_moduleissa
  transformIgnorePatterns: [],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",
    "!generated/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
