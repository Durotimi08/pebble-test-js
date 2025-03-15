/**
 * Frequency-Based Sequence Partitioning
 *
 * Implement a solution that efficiently processes an array of integers and answers
 * frequency-based range queries using principles similar to Adaptive Wavelet Trees.
 *
 * The function should build a data structure that partitions the sequence based on
 * element frequencies, allowing for efficient querying of the kth most frequent element
 * within any subrange of the original array.
 *
 * @param {number[]} arr - An array of integers where 0 ≤ arr[i] ≤ 10^6
 * @param {number[][]} queries - Array of queries, each containing [left, right, k]
 *                              where:
 *                              - left and right define the range [left, right] (inclusive)
 *                              - k is the frequency rank (1 = most frequent, 2 = second most frequent, etc.)
 *
 * @returns {number[]} - Array of query results, where each element is the kth most
 *                       frequent element in the subarray defined by the query, or -1 if
 *                       there's no such element.
 *
 * @throws {Error} - If the input array is empty
 * @throws {Error} - If any query has invalid range (left > right or out of bounds)
 * @throws {Error} - If any query has invalid k value (k ≤ 0 or k > distinct elements in range)
 *
 * Example:
 * Input:
 *   arr = [1, 2, 3, 2, 1, 3, 1, 4, 2]
 *   queries = [[0, 8, 1], [2, 5, 2], [4, 7, 3]]
 * Output: [1, 3, 4]
 * Explanation:
 *   - In the entire array [1,2,3,2,1,3,1,4,2], element 1 appears 3 times (most frequent)
 *   - In subarray [3,2,1,3], elements 3 appears 2 times (2nd most frequent)
 *   - In subarray [1,3,1,4], element 4 appears 1 time (3rd most frequent)
 *
 * Constraints:
 * - 1 ≤ arr.length ≤ 10^5
 * - 0 ≤ arr[i] ≤ 10^6
 * - 1 ≤ queries.length ≤ 10^4
 * - 0 ≤ left ≤ right < arr.length
 * - 1 ≤ k ≤ 100
 * - Time complexity should be O((n + q) * log(n)) where n is the array length and q is the number of queries
 */

function createNode(start, end) {
  return {
    start,
    end,
    frequencyMap: {},  // Maps element -> frequency
    frequencySorted: [],  // Elements sorted by frequency in descending order
    left: null,
    right: null
  };
}

function buildSegmentTree(arr, start, end) {
  const node = createNode(start, end);

  if (start === end) {
    // Leaf node
    node.frequencyMap[arr[start]] = 1;
    node.frequencySorted = [arr[start]];
    return node;
  }

  const mid = Math.floor((start + end) / 2);
  node.left = buildSegmentTree(arr, start, mid);
  node.right = buildSegmentTree(arr, mid + 1, end);

  // Merge frequency maps from children
  const mergedFrequencyMap = {};

  // Process left child
  for (const [element, frequency] of Object.entries(node.left.frequencyMap)) {
    mergedFrequencyMap[element] = (mergedFrequencyMap[element] || 0) + frequency;
  }

  // Process right child
  for (const [element, frequency] of Object.entries(node.right.frequencyMap)) {
    mergedFrequencyMap[element] = (mergedFrequencyMap[element] || 0) + frequency;
  }

  node.frequencyMap = mergedFrequencyMap;

  // Sort elements by frequency
  node.frequencySorted = Object.keys(mergedFrequencyMap).map(Number);
  node.frequencySorted.sort((a, b) => {
    const freqDiff = mergedFrequencyMap[b] - mergedFrequencyMap[a];
    // If frequencies are the same, use element value as tiebreaker
    return freqDiff !== 0 ? freqDiff : a - b;
  });

  return node;
}

function queryRange(node, left, right, k) {
  // If the current node's range is completely within the query range
  if (node.start >= left && node.end <= right) {
    if (k > node.frequencySorted.length) {
      return { element: -1, frequency: 0 };
    }
    const element = node.frequencySorted[k - 1];
    return { element, frequency: node.frequencyMap[element] };
  }

  // If there's no overlap with the query range
  if (node.end < left || node.start > right) {
    return { element: -1, frequency: 0 };
  }

  // Partial overlap - compute frequencies for this range
  const rangeFrequencyMap = {};

  // Recursively query left and right children
  const mid = Math.floor((node.start + node.end) / 2);

  if (left <= mid) {
    const leftResult = queryRange(node.left, left, Math.min(right, mid), 1);
    if (leftResult.element !== -1) {
      for (const [element, frequency] of Object.entries(node.left.frequencyMap)) {
        if (element >= left && element <= right) {
          rangeFrequencyMap[element] = (rangeFrequencyMap[element] || 0) + frequency;
        }
      }
    }
  }

  if (right > mid) {
    const rightResult = queryRange(node.right, Math.max(left, mid + 1), right, 1);
    if (rightResult.element !== -1) {
      for (const [element, frequency] of Object.entries(node.right.frequencyMap)) {
        if (element >= left && element <= right) {
          rangeFrequencyMap[element] = (rangeFrequencyMap[element] || 0) + frequency;
        }
      }
    }
  }

  // Sort elements by frequency
  const frequencySorted = Object.keys(rangeFrequencyMap).map(Number);
  frequencySorted.sort((a, b) => {
    const freqDiff = rangeFrequencyMap[b] - rangeFrequencyMap[a];
    return freqDiff !== 0 ? freqDiff : a - b;
  });

  if (k > frequencySorted.length) {
    return { element: -1, frequency: 0 };
  }

  const element = frequencySorted[k - 1];
  return { element, frequency: rangeFrequencyMap[element] };
}

export function frequencyBasedQueries(arr, queries) {
  if (!arr || arr.length === 0) {
    throw new Error("Input array cannot be empty");
  }

  // Build the segment tree
  const root = buildSegmentTree(arr, 0, arr.length - 1);

  // Process queries
  const results = [];

  for (const [left, right, k] of queries) {
    // Validate the query
    if (left < 0 || right >= arr.length || left > right) {
      throw new Error(`Invalid range: [${left}, ${right}]`);
    }

    if (k <= 0) {
      throw new Error(`Invalid k value: ${k}`);
    }

    // Calculate the subarray for this range to count distinct elements
    const subarray = arr.slice(left, right + 1);
    const distinctElements = new Set(subarray).size;

    if (k > distinctElements) {
      throw new Error(`k (${k}) exceeds number of distinct elements (${distinctElements}) in range [${left}, ${right}]`);
    }

    // Get the kth most frequent element
    const result = queryRange(root, left, right, k);
    results.push(result.element);
  }

  return results;
}

function optimizedFrequencyBasedQueries(arr, queries) {
  if (!arr || arr.length === 0) {
    throw new Error("Input array cannot be empty");
  }

  const results = [];

  for (const [left, right, k] of queries) {
    // Validate the query
    if (left < 0 || right >= arr.length || left > right) {
      throw new Error(`Invalid range: [${left}, ${right}]`);
    }

    if (k <= 0) {
      throw new Error(`Invalid k value: ${k}`);
    }

    // Calculate frequencies in the range
    const frequencyMap = {};
    for (let i = left; i <= right; i++) {
      frequencyMap[arr[i]] = (frequencyMap[arr[i]] || 0) + 1;
    }

    const distinctElements = Object.keys(frequencyMap).length;

    if (k > distinctElements) {
      throw new Error(`k (${k}) exceeds number of distinct elements (${distinctElements}) in range [${left}, ${right}]`);
    }

    // Sort elements by frequency in descending order
    const sortedElements = Object.keys(frequencyMap).map(Number);
    sortedElements.sort((a, b) => {
      const freqDiff = frequencyMap[b] - frequencyMap[a];
      return freqDiff !== 0 ? freqDiff : a - b;  // Use value as tiebreaker
    });

    results.push(sortedElements[k - 1]);
  }

  return results;
}
