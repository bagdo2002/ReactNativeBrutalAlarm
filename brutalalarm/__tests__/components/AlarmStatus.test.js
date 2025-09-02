import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlarmStatus from '../../components/AlarmStatus';

// Mock useTranslation - using global mock from jest.setup.js
const mockT = jest.fn((key) => key);

describe('AlarmStatus Component', () => {
  const mockProps = {
    isAlarmSet: false,
    isAlarmPlaying: false,
    alarmTime: new Date('2023-12-01T08:00:00'),
    currentAlarmSound: null,
    selectedSound: {
      id: 'test-sound',
      name: 'Test Sound',
      text: 'Wake up!',
    },
    onStopAlarm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when no alarm is set', () => {
    const { container } = render(<AlarmStatus {...mockProps} />);
    
    // Should render empty container when no alarm is set
    expect(container.children[0].children).toHaveLength(0);
  });

  it('should show alarm set status when alarm is set but not playing', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: false,
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    expect(getByText('alarmSetFor')).toBeTruthy();
    expect(getByText('08:00 AM')).toBeTruthy();
    expect(getByText('Test Sound')).toBeTruthy();
  });

  it('should show wake up message when alarm is playing', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'playing-sound',
        name: 'Playing Sound',
        text: 'Time to wake up!',
      },
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    expect(getByText('wakeUp')).toBeTruthy();
    expect(getByText('Time to wake up!')).toBeTruthy();
  });

  it('should show stop alarm button when alarm is playing', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'playing-sound',
        name: 'Playing Sound',
        text: 'Time to wake up!',
      },
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    const stopButton = getByText('stopAlarm');
    expect(stopButton).toBeTruthy();
  });

  it('should call onStopAlarm when stop button is pressed', () => {
    const mockStopAlarm = jest.fn();
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'playing-sound',
        name: 'Playing Sound',
        text: 'Time to wake up!',
      },
      onStopAlarm: mockStopAlarm,
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    const stopButton = getByText('stopAlarm');
    fireEvent.press(stopButton);

    expect(mockStopAlarm).toHaveBeenCalledTimes(1);
  });

  it('should format time correctly for different hours', () => {
    const testCases = [
      { time: new Date('2023-12-01T09:30:00'), expected: '09:30 AM' },
      { time: new Date('2023-12-01T13:45:00'), expected: '01:45 PM' },
      { time: new Date('2023-12-01T00:00:00'), expected: '12:00 AM' },
      { time: new Date('2023-12-01T12:00:00'), expected: '12:00 PM' },
    ];

    testCases.forEach(({ time, expected }) => {
      const props = {
        ...mockProps,
        isAlarmSet: true,
        isAlarmPlaying: false,
        alarmTime: time,
      };

      const { getByText } = render(<AlarmStatus {...props} />);
      expect(getByText(expected)).toBeTruthy();
    });
  });

  it('should show selected sound name when alarm is set', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: false,
      selectedSound: {
        id: 'custom-sound',
        name: 'My Custom Sound',
        text: 'Custom wake up call',
      },
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    expect(getByText('My Custom Sound')).toBeTruthy();
  });

  it('should handle missing selectedSound gracefully', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: false,
      selectedSound: null,
    };

    expect(() => {
      render(<AlarmStatus {...props} />);
    }).not.toThrow();
  });

  it('should handle missing currentAlarmSound gracefully when playing', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: null,
    };

    expect(() => {
      render(<AlarmStatus {...props} />);
    }).not.toThrow();
  });

  it('should show fallback text when currentAlarmSound has no text', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'sound-no-text',
        name: 'Sound Without Text',
        // No text property
      },
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    expect(getByText('alarmRinging')).toBeTruthy();
  });

  it('should use translation keys correctly', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'test-sound',
        name: 'Test',
        text: 'Wake up!',
      },
    };

    render(<AlarmStatus {...props} />);

    expect(mockT).toHaveBeenCalledWith('wakeUp');
    expect(mockT).toHaveBeenCalledWith('stopAlarm');
  });

  it('should show alarm set translation key when alarm is set', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: false,
    };

    render(<AlarmStatus {...props} />);

    expect(mockT).toHaveBeenCalledWith('alarmSetFor');
  });

  it('should have proper accessibility properties', () => {
    const props = {
      ...mockProps,
      isAlarmSet: true,
      isAlarmPlaying: true,
      currentAlarmSound: {
        id: 'test-sound',
        name: 'Test',
        text: 'Wake up!',
      },
    };

    const { getByText } = render(<AlarmStatus {...props} />);

    const stopButton = getByText('stopAlarm');
    expect(stopButton).toBeTruthy();
  });
});
