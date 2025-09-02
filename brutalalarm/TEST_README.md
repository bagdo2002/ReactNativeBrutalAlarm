# Brutal Alarm - Test Suite Documentation

This document describes the comprehensive test suite for the Brutal Alarm React Native application.

## Overview

The test suite covers all major components, hooks, utilities, and integration flows of the application. It uses Jest as the test runner and React Native Testing Library for component testing.

## Test Structure

```
__tests__/
├── components/           # Component unit tests
│   ├── TimeDisplay.test.js
│   └── AlarmStatus.test.js
├── hooks/               # Custom hooks tests
│   ├── useAlarmLogic.test.js
│   └── useAudioManager.test.js
├── utils/               # Utility function tests
│   ├── elevenlabs.test.js
│   └── i18n.test.js
├── integration/         # Integration tests
│   └── AlarmFlow.test.js
└── App.test.js          # Main app component test

__mocks__/               # Mock files
├── audioMock.js
└── imageMock.js

jest.config.js           # Jest configuration
jest.setup.js            # Test setup and mocks
```

## Test Categories

### 1. Unit Tests

#### Components (`__tests__/components/`)
- **TimeDisplay.test.js**: Tests time formatting, locale handling, and display updates
- **AlarmStatus.test.js**: Tests alarm status display, interaction handling, and state management

#### Hooks (`__tests__/hooks/`)
- **useAlarmLogic.test.js**: Tests alarm scheduling, triggering, stopping, and time management
- **useAudioManager.test.js**: Tests audio recording, playback, file management, and permissions

#### Utilities (`__tests__/utils/`)
- **elevenlabs.test.js**: Tests TTS voice generation, character voices, and API error handling
- **i18n.test.js**: Tests internationalization, language detection, and translation loading

### 2. Integration Tests (`__tests__/integration/`)
- **AlarmFlow.test.js**: Tests complete alarm workflows, error handling, and component interactions

### 3. App Tests (`__tests__/App.test.js`)
- Tests main app initialization, onboarding flow, and component integration

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Run hook tests only
npm test hooks

# Run component tests only
npm test components

# Run integration tests only
npm test integration

# Run specific test file
npm test TimeDisplay.test.js
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses React Native preset
- Configured for React Native environment
- Includes transform ignore patterns for Expo and React Native modules
- Maps audio/image files to mocks
- Collects coverage from source files

### Test Setup (`jest.setup.js`)
- Extends Jest with React Native Testing Library matchers
- Mocks Expo modules (Audio, Notifications, FileSystem, etc.)
- Mocks React Native components and APIs
- Provides global test utilities

### Mocks (`__mocks__/`)
- **audioMock.js**: Mock for audio file imports
- **imageMock.js**: Mock for image file imports

## Coverage Goals

The test suite aims for high coverage across all categories:

- **Functions**: >90%
- **Lines**: >85%
- **Branches**: >80%
- **Statements**: >85%

### Current Coverage Areas

1. **Alarm Logic**
   - Time management and formatting
   - Alarm scheduling and notifications
   - Audio playback and stopping
   - Error handling and fallbacks

2. **Audio Management**
   - Recording start/stop/cancel
   - File saving and loading
   - Permission handling
   - Sound preview and deletion

3. **Voice Generation**
   - ElevenLabs API integration
   - Character voice selection
   - TTS generation and saving
   - Error handling for API failures

4. **Internationalization**
   - Language detection and switching
   - Translation loading and caching
   - Locale-specific formatting

5. **Component Rendering**
   - UI state management
   - User interaction handling
   - Props validation and edge cases

6. **Integration Flows**
   - Complete alarm setting workflow
   - Custom sound creation and management
   - Error recovery and user feedback

## Test Best Practices

### 1. Isolation
- Each test is independent and can run in any order
- Proper setup and teardown in `beforeEach`/`afterEach`
- Mocked external dependencies

### 2. Comprehensive Coverage
- Happy path scenarios
- Error conditions and edge cases
- User interaction flows
- Async operations and timing

### 3. Realistic Testing
- Uses actual date/time objects
- Simulates real user interactions
- Tests with various data inputs
- Validates expected behaviors

### 4. Maintainability
- Clear test descriptions
- Logical test grouping
- Reusable test utilities
- Well-documented mocks

## Common Test Patterns

### Testing Async Operations
```javascript
await act(async () => {
  await result.current.someAsyncFunction();
});
```

### Testing Timer-based Code
```javascript
jest.useFakeTimers();
act(() => {
  jest.advanceTimersByTime(1000);
});
jest.useRealTimers();
```

### Testing Component Interactions
```javascript
const { getByText } = render(<Component />);
fireEvent.press(getByText('Button'));
expect(mockFunction).toHaveBeenCalled();
```

### Testing Hooks
```javascript
const { result } = renderHook(() => useCustomHook());
expect(result.current.someValue).toBe(expectedValue);
```

## Continuous Integration

The tests are designed to run in CI environments:
- No external dependencies (all mocked)
- Deterministic results
- Fast execution
- Clear failure reporting

## Debugging Tests

### Running Single Test
```bash
npm test -- --testNamePattern="specific test name"
```

### Debugging with Verbose Output
```bash
npm test -- --verbose
```

### Debugging Failed Tests
```bash
npm test -- --no-coverage --verbose
```

## Maintenance

### Adding New Tests
1. Follow the existing directory structure
2. Use descriptive test names
3. Include both positive and negative test cases
4. Mock external dependencies appropriately
5. Update this documentation

### Updating Mocks
When app dependencies change:
1. Update corresponding mocks in `jest.setup.js`
2. Verify all tests still pass
3. Update mock return values if needed

### Performance Considerations
- Keep tests focused and fast
- Use appropriate mocking to avoid slow operations
- Group related tests in describe blocks
- Clean up resources in afterEach hooks

## Troubleshooting

### Common Issues

1. **Metro bundler conflicts**: Ensure Jest config excludes Metro files
2. **Transform errors**: Check `transformIgnorePatterns` in Jest config
3. **Mock issues**: Verify mocks match actual module exports
4. **Timing issues**: Use proper async/await patterns and fake timers
5. **React Native Testing Library issues**: Ensure proper setup and imports

### Getting Help

- Check Jest documentation for configuration issues
- Review React Native Testing Library docs for component testing
- Examine existing tests for patterns and examples
- Use `console.log` in tests for debugging (but remove before committing)
