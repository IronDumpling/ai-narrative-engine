/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  maxWorkers: 1,
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
      testPathIgnorePatterns: ["/node_modules/", "agents.test.ts"],
      roots: ["<rootDir>/tests"],
      setupFiles: ["<rootDir>/tests/setup/setup-unit.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.json",
          },
        ],
      },
    },
    {
      displayName: "unit-agents",
      testMatch: ["<rootDir>/tests/unit/agents.test.ts"],
      roots: ["<rootDir>/tests"],
      setupFiles: ["<rootDir>/tests/setup/setup-unit-agents.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.json",
          },
        ],
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      roots: ["<rootDir>/tests"],
      setupFiles: ["<rootDir>/tests/setup/setup-integration.ts"],
      testTimeout: 30000,
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.json",
          },
        ],
      },
    },
  ],
};
