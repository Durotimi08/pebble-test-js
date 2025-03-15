/**
 * Frequency-Based Sequence Partitioning Solution
 *
 * This implementation uses a segment tree combined with frequency-based partitioning
 * to efficiently answer queries about the kth most frequent element in a range.
 */

/**
 * Create a segment tree node
 * @param {number} start - Start index of the range
 * @param {number} end - End index of the range
 * @returns {Object} - A segment tree node
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

/**
 * Build the segment tree
 * @param {number[]} arr - The input array
 * @param {number} start - Start index of the current range
 * @param {number} end - End index of the current range
 * @returns {Object} - The root of the segment tree
 */
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

/**
 * Find the kth most frequent element in the given range
 * @param {Object} node - The current segment tree node
 * @param {number} left - Left bound of the query range
 * @param {number} right - Right bound of the query range
 * @param {number} k - The frequency rank (1 = most frequent, etc.)
 * @returns {Object} - Contains the kth most frequent element and its frequency
 */
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

/**
 * Main function to process queries
 * @param {number[]} arr - The input array
 * @param {number[][]} queries - Array of queries [left, right, k]
 * @returns {number[]} - Array of query results
 */
function frequencyBasedQueries(arr, queries) {
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

/**
 * More efficient implementation using a frequency-based approach without full segment tree
 * This optimized version computes frequencies directly for each query
 * @param {number[]} arr - The input array
 * @param {number[][]} queries - Array of queries [left, right, k]
 * @returns {number[]} - Array of query results
 */
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

// Export the optimized version as the main function
module.exports = optimizedFrequencyBasedQueries;