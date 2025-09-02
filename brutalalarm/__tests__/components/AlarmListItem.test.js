import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlarmListItem from '../../components/AlarmListItem';

describe('AlarmListItem', () => {
  const mockTime = new Date('2023-12-01T08:00:00');
  const mockOnToggle = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct time and sound name', () => {
    const { getByText } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={true}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
      />
    );

    expect(getByText('08:00')).toBeTruthy();
    expect(getByText('Test Sound')).toBeTruthy();
  });

  it('should show switch in correct state based on isEnabled prop', () => {
    const { getByTestId } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={true}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
      />
    );

    const switchComponent = getByTestId('alarm-switch');
    expect(switchComponent.props.value).toBe(true);
  });

  it('should show switch as disabled when isEnabled is false', () => {
    const { getByTestId } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={false}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
      />
    );

    const switchComponent = getByTestId('alarm-switch');
    expect(switchComponent.props.value).toBe(false);
  });

  it('should call onToggle when switch is pressed', () => {
    const { getByTestId } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={true}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
      />
    );

    const switchComponent = getByTestId('alarm-switch');
    fireEvent(switchComponent, 'valueChange', false);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('should call onPress when alarm item is pressed', () => {
    const { getByTestId } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={true}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
      />
    );

    const alarmItem = getByTestId('alarm-item');
    fireEvent.press(alarmItem);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should display repeat days correctly', () => {
    const repeatDays = [1, 3, 5]; // Monday, Wednesday, Friday
    const { getByText } = render(
      <AlarmListItem
        time={mockTime}
        isEnabled={true}
        onToggle={mockOnToggle}
        soundName="Test Sound"
        onPress={mockOnPress}
        repeatDays={repeatDays}
      />
    );

    // Check that the day labels are displayed
    expect(getByText('S')).toBeTruthy();
    expect(getByText('M')).toBeTruthy();
    expect(getByText('T')).toBeTruthy();
    expect(getByText('W')).toBeTruthy();
    expect(getByText('T')).toBeTruthy();
    expect(getByText('F')).toBeTruthy();
    expect(getByText('S')).toBeTruthy();
  });
});
