// Mock React Native components and APIs
const React = require('react');

// Create mock components that React Native Testing Library can recognize
const mockComponent = (displayName) => {
  const Component = React.forwardRef((props, ref) => {
    const { children, testID, ...otherProps } = props;
    return React.createElement(
      'div',
      {
        ...otherProps,
        ref,
        'data-testid': testID,
        className: `rn-${displayName.toLowerCase()}`,
      },
      children
    );
  });
  Component.displayName = displayName;
  return Component;
};

// Create host components that React Native Testing Library expects
const View = mockComponent('View');
const Text = mockComponent('Text');
const TouchableOpacity = mockComponent('TouchableOpacity');
const ScrollView = mockComponent('ScrollView');
const SafeAreaView = mockComponent('SafeAreaView');
const StatusBar = mockComponent('StatusBar');

module.exports = {
  // Core components with proper host component names
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  
  // APIs
  Alert: {
    alert: jest.fn(),
  },
  
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },

  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },

  StyleSheet: {
    create: (styles) => styles,
  },
  
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },

  // Additional React Native APIs that might be needed
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },

  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
};
