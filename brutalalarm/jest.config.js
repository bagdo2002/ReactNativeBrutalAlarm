module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-native-localize|@react-native-async-storage|@react-native-community)/)',
  ],
  moduleNameMapper: {
    '\\.(mp3|m4a|wav|ogg)$': '<rootDir>/__mocks__/audioMock.js',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/imageMock.js',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
  },
  collectCoverageFrom: [
    'App.js',
    'components/**/*.js',
    'hooks/**/*.js',
    'elevenlabs.js',
    'i18n/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.setup.js',
    '!jest.config.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],
};
