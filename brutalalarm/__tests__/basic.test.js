/**
 * Basic test to verify Jest setup is working
 */

describe('Basic Test Suite', () => {
  it('should run basic JavaScript tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    await expect(promise).resolves.toBe('test');
  });

  it('should work with dates', () => {
    const date = new Date('2023-12-01T14:30:00');
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name', 'test');
    expect(obj.value).toBe(42);
  });
});
