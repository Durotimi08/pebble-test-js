const frequencyBasedQueries = require('./solution');

describe('Frequency-Based Sequence Partitioning', () => {
  test('Example 1: Basic test with the example from the problem', () => {
    const arr = [1, 2, 3, 2, 1, 3, 1, 4, 2];
    const queries = [[0, 8, 1], [2, 5, 2], [4, 7, 3]];
    expect(frequencyBasedQueries(arr, queries)).toEqual([1, 1, 4]);
  });

  test('Example 2: Small array with uniform frequencies', () => {
    const arr = [5, 6, 7, 5, 6, 7, 5, 6, 7];
    const queries = [[0, 8, 1], [0, 8, 2], [0, 8, 3]];
    expect(frequencyBasedQueries(arr, queries)).toEqual([5, 6, 7]);
  });

  test('Example 3: Single element repeated multiple times', () => {
    const arr = [42, 42, 42, 42, 42];
    const queries = [[0, 4, 1]];
    expect(frequencyBasedQueries(arr, queries)).toEqual([42]);
  });

  test('Example 4: Multiple elements with same frequency but different values', () => {
    const arr = [100, 200, 300, 100, 200, 300];
    const queries = [[0, 5, 1], [0, 5, 2], [0, 5, 3]];
    // All have frequency 2, so sort by value
    expect(frequencyBasedQueries(arr, queries)).toEqual([100, 200, 300]);
  });

  test('Example 5: Disjoint ranges with different frequency distributions', () => {
    const arr = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4];
    const queries = [
      [0, 4, 1],  // In [1,1,2,2,2], 2 is most frequent
      [5, 8, 1],  // In [3,3,3,3], 3 is most frequent
      [9, 13, 1]  // In [4,4,4,4,4], 4 is most frequent
    ];
    expect(frequencyBasedQueries(arr, queries)).toEqual([2, 3, 4]);
  });

  test('Error handling: Empty array', () => {
    const arr = [];
    const queries = [[0, 0, 1]];
    expect(() => frequencyBasedQueries(arr, queries)).toThrow("Input array cannot be empty");
  });

  test('Error handling: Invalid range', () => {
    const arr = [1, 2, 3, 4, 5];
    const queries = [[2, 10, 1]];  // right > arr.length - 1
    expect(() => frequencyBasedQueries(arr, queries)).toThrow("Invalid range");
  });

  test('Error handling: Invalid k value', () => {
    const arr = [1, 2, 3, 4, 5];
    const queries = [[0, 4, 0]];  // k should be positive
    expect(() => frequencyBasedQueries(arr, queries)).toThrow("Invalid k value");
  });

  test('Error handling: k exceeds distinct elements', () => {
    const arr = [1, 1, 1, 2, 2];
    const queries = [[0, 4, 3]];  // There are only 2 distinct elements
    expect(() => frequencyBasedQueries(arr, queries)).toThrow("k (3) exceeds number of distinct elements (2)");
  });
});