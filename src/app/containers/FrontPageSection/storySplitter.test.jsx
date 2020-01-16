import { range } from 'ramda';
import getItems from './storySplitter';

const numberOfStories = {
  0: {
    input: [],
    expectedFirstSection: {
      topRowItems: [],
      standardItems: [],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [],
      standardItems: [],
      noImageItems: [],
    },
  },
  1: {
    input: range(0, 1),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0],
      standardItems: [],
      noImageItems: [],
    },
  },
  2: {
    input: range(0, 2),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [],
      noImageItems: [],
    },
  },
  3: {
    input: range(0, 3),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [],
      noImageItems: [],
    },
  },
  4: {
    input: range(0, 4),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [],
      standardItems: [[0, 1, 2, 3]],
      noImageItems: [],
    },
  },
  5: {
    input: range(0, 5),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4]],
      noImageItems: [],
    },
  },
  6: {
    input: range(0, 6),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5]],
      noImageItems: [],
    },
  },
  7: {
    input: range(0, 7),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5]],
      noImageItems: [],
    },
  },
  8: {
    input: range(0, 8),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [],
      standardItems: [[0, 1, 2, 3], [4, 5, 6, 7]],
      noImageItems: [],
    },
  },
  9: {
    input: range(0, 9),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [],
    },
  },
  10: {
    input: range(0, 10),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
  11: {
    input: range(0, 11),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
  12: {
    input: range(0, 12),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
  13: {
    input: range(0, 13),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [9, 10, 11, 12],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
  14: {
    input: range(0, 14),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [9, 10, 11, 12],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
  20: {
    input: range(0, 20),
    expectedFirstSection: {
      topRowItems: [0],
      standardItems: [[1, 2, 3, 4], [5, 6, 7, 8]],
      noImageItems: [9, 10, 11, 12],
    },
    expectedNotFirstSection: {
      topRowItems: [0, 1],
      standardItems: [[2, 3, 4, 5], [6, 7, 8, 9]],
      noImageItems: [],
    },
  },
};

describe('getItems for first section', () => {
  describe('assertions', () => {
    Object.keys(numberOfStories).forEach(value =>
      it(`should return right splitting for ${value} stories`, () => {
        expect(getItems(numberOfStories[value].input, true)).toStrictEqual(
          numberOfStories[value].expectedFirstSection,
        );
      }),
    );
  });
});

describe('getItems for non-first section', () => {
  describe('assertions', () => {
    Object.keys(numberOfStories).forEach(value =>
      it(`should return right splitting for ${value} stories`, () => {
        expect(getItems(numberOfStories[value].input, false)).toStrictEqual(
          numberOfStories[value].expectedNotFirstSection,
        );
      }),
    );
  });
});
