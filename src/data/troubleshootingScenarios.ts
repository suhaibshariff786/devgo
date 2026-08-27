import { TroubleshootingChallenge } from '../types';

export const TROUBLESHOOTING_SCENARIOS: TroubleshootingChallenge[] = [
  {
    id: 'broken-assertion',
    title: 'Failing Unit Test Assertion',
    category: 'Failed Test',
    difficulty: 'Easy',
    description: 'A newly pushed commit broke the invoice calculation test because the expected sales tax math returned an unexpected value.',
    realWorldSymptom: 'GitHub PR shows a red ❌ status check on `npm test` step with Jest reporting `Expected: 110, Received: 108`.',
    errorLogSnippet: `● Invoice Calculation Logic › calculates 10% tax on 100 correctly

  expect(received).toBe(expected) // Object.is equality

  Expected: 110
  Received: 108

    15 |   it('calculates 10% tax on 100 correctly', () => {
  > 16 |     expect(calculateInvoiceTotal(100, 0.10)).toBe(110);
       |                                             ^
    17 |   });

  Test Suites: 1 failed, 1 total
  Tests:       1 failed, 2 passed, 3 total
  Snapshots:   0 total
  Time:        1.428 s
  Error: Process completed with exit code 1.`,
    hints: [
      'Inspect `src/app.js`: check what the default tax rate is or if the parameter is passed.',
      'Check the math in `calculateInvoiceTotal` in `src/app.js`.'
    ],
    initialFiles: [
      {
        name: 'app.js',
        path: 'src/app.js',
        language: 'javascript',
        content: `// BUG: Hardcoded 0.08 tax calculation ignoring the taxRate argument!
function calculateInvoiceTotal(subtotal, taxRate = 0.08) {
  const tax = Number((subtotal * 0.08).toFixed(2)); // BUG here!
  return Number((subtotal + tax).toFixed(2));
}

module.exports = { calculateInvoiceTotal };`
      },
      {
        name: 'app.test.js',
        path: 'tests/app.test.js',
        language: 'javascript',
        content: `const { calculateInvoiceTotal } = require('../src/app');

describe('Invoice Calculation Logic', () => {
  it('calculates 10% tax on 100 correctly', () => {
    expect(calculateInvoiceTotal(100, 0.10)).toBe(110);
  });
});`
      }
    ],
    initialWorkflow: `name: CI Test Runner
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm test`,
    solutionExplanation: 'The function `calculateInvoiceTotal` was hardcoding `0.08` instead of using the `taxRate` parameter passed to it. Replacing `subtotal * 0.08` with `subtotal * taxRate` fixes the test.'
  },
  {
    id: 'missing-script-package',
    title: 'Missing "lint" Script in package.json',
    category: 'Missing Script',
    difficulty: 'Easy',
    description: 'The CI workflow file specifies `run: npm run lint`, but the developer forgot to define a `"lint"` script in `package.json`.',
    realWorldSymptom: 'Runner terminates early with `npm error Missing script: "lint"`.',
    errorLogSnippet: `Run npm run lint
  npm error Missing script: "lint"
  npm error 
  npm error To see a list of scripts, run:
  npm error   npm run
  npm error A complete log of this run can be found in:
  npm error   /home/runner/.npm/_logs/2026-08-21T18_20_14_219Z-debug-0.log
  Error: Process completed with exit code 1.`,
    hints: [
      'Open `package.json` and look under the `"scripts"` key.',
      'Add `"lint": "eslint src/ tests/"` to scripts.'
    ],
    initialFiles: [
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "sample-web-app",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "build": "mkdir -p dist && cp -r src/* dist/"
  }
}`
      }
    ],
    initialWorkflow: `name: CI Lint & Test
on: [push]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test`,
    solutionExplanation: 'CI runners execute commands verbatim. When you configure `npm run lint` in YAML, `package.json` must contain a matching script definition.'
  },
  {
    id: 'uncaught-syntax-error',
    title: 'SyntaxError in Production Code Breaking Linter',
    category: 'Syntax Error',
    difficulty: 'Easy',
    description: 'A developer left an unclosed bracket or typo in a controller file, triggering an immediate fail-fast during static analysis.',
    realWorldSymptom: 'Linter catches `SyntaxError: Unexpected token` before expensive test suites are run.',
    errorLogSnippet: `Run npm run lint
  /home/runner/work/app/src/controller.js
    12:3  error  Parsing error: Unexpected token '}'

  ✖ 1 problem (1 error, 0 warnings)
  Error: Process completed with exit code 1.`,
    hints: [
      'Look for misplaced braces or unclosed strings in `src/controller.js`.'
    ],
    initialFiles: [
      {
        name: 'controller.js',
        path: 'src/controller.js',
        language: 'javascript',
        content: `function formatResponse(data) {
  return {
    success: true,
    payload: data,
  }} // Extra trailing brace here!
}

module.exports = { formatResponse };`
      }
    ],
    initialWorkflow: `name: CI Quality Gate
on: [push]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm run lint`,
    solutionExplanation: 'Removing the extraneous curly brace resolves the parse error and satisfies ESLint.'
  }
];
