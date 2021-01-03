module.exports = {
  rootDir: "./",
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  setupFiles: ["./jest-setup-file.ts"],
  coverageThreshold: {
    global: {
      branches: 93,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!<rootDir>/src/clients/**/*.{ts,js}",
    "!<rootDir>/src/errors/**/*.{ts,js}",
    "!<rootDir>/src/endpoints/**/*.{ts,js}",
  ],
};
