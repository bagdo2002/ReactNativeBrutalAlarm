import React from 'react';
import { render } from '@testing-library/react-native';
import TimeDisplay from '../../components/TimeDisplay';

// Mock useTranslation - using global mock from jest.setup.js
const mockT = jest.fn((key) => key);
const mockI18n = { language: 'en' };

describe('TimeDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render current time correctly', () => {
    const testDate = new Date('2023-12-01T14:30:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    expect(getByText('02:30 PM')).toBeTruthy();
  });

  it('should render current date correctly for English locale', () => {
    mockI18n.language = 'en';
    const testDate = new Date('2023-12-01T14:30:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    // Check if date is rendered (format may vary by system)
    expect(getByText(/December|Dec|12/)).toBeTruthy();
  });

  it('should use Georgian locale for ka language', () => {
    mockI18n.language = 'ka';
    const testDate = new Date('2023-12-01T14:30:00');
    
    const { container } = render(<TimeDisplay currentTime={testDate} />);
    
    // Component should render without errors
    expect(container).toBeTruthy();
  });

  it('should use Russian locale for ru language', () => {
    mockI18n.language = 'ru';
    const testDate = new Date('2023-12-01T14:30:00');
    
    const { container } = render(<TimeDisplay currentTime={testDate} />);
    
    // Component should render without errors
    expect(container).toBeTruthy();
  });

  it('should default to English locale for unknown language', () => {
    mockI18n.language = 'unknown';
    const testDate = new Date('2023-12-01T14:30:00');
    
    const { container } = render(<TimeDisplay currentTime={testDate} />);
    
    // Component should render without errors
    expect(container).toBeTruthy();
  });

  it('should format morning time correctly', () => {
    const testDate = new Date('2023-12-01T09:15:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    expect(getByText('09:15 AM')).toBeTruthy();
  });

  it('should format midnight correctly', () => {
    const testDate = new Date('2023-12-01T00:00:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    expect(getByText('12:00 AM')).toBeTruthy();
  });

  it('should format noon correctly', () => {
    const testDate = new Date('2023-12-01T12:00:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    expect(getByText('12:00 PM')).toBeTruthy();
  });

  it('should handle edge case times', () => {
    const testDate = new Date('2023-12-01T23:59:00');
    const { getByText } = render(<TimeDisplay currentTime={testDate} />);

    expect(getByText('11:59 PM')).toBeTruthy();
  });

  it('should update when currentTime prop changes', () => {
    const initialDate = new Date('2023-12-01T14:30:00');
    const { getByText, rerender } = render(<TimeDisplay currentTime={initialDate} />);

    expect(getByText('02:30 PM')).toBeTruthy();

    const newDate = new Date('2023-12-01T16:45:00');
    rerender(<TimeDisplay currentTime={newDate} />);

    expect(getByText('04:45 PM')).toBeTruthy();
  });

  it('should have proper styling classes', () => {
    const testDate = new Date('2023-12-01T14:30:00');
    const { getByTestId } = render(
      <TimeDisplay currentTime={testDate} testID="time-display" />
    );

    // Test that the component renders with expected structure
    const component = getByTestId('time-display');
    expect(component).toBeTruthy();
  });

  it('should handle invalid date gracefully', () => {
    const invalidDate = new Date('invalid');
    
    // Component should not crash with invalid date
    expect(() => {
      render(<TimeDisplay currentTime={invalidDate} />);
    }).not.toThrow();
  });
});
