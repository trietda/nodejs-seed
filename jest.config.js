module.exports = {
  verbose: true,
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '**/src/**/*.(spec|test).js',
      ],
      setupFilesAfterEnv: [
        'jest-extended',
      ],
    },
    {
      displayName: 'api',
      testMatch: [
        '**/test/api/**/*.(spec|test).js',
      ],
      setupFilesAfterEnv: [
        'jest-extended',
        '<rootDir>/test/api/setup.js',
      ],
    },
    {
      displayName: 'integration',
      testMatch: [
        '**/test/**/*.(spec|test).js',
      ],
      testPathIgnorePatterns: [
        'test/api',
      ],
      setupFilesAfterEnv: [
        'jest-extended',
      ],
    },
  ],
};
