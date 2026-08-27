import { LabModule } from '../types';

export const LAB_STEPS: LabModule[] = [
  {
    id: 'step-1-sample-app',
    stepNumber: 1,
    title: 'Create a Sample Web Application',
    duration: '1.5–2 hours',
    difficulty: 'Easy',
    summary: 'Build a lightweight Node.js/Express web application with testable business logic and an automated Jest test suite.',
    explanation: `Before you can automate testing, you need a testable code base. A solid continuous integration candidate has:
1. Clearly defined entry points and HTTP routes (e.g. \`app.js\`).
2. Isolated, pure utility functions (e.g. invoice or math calculators) that don't depend on external databases.
3. Fast-running unit tests (e.g. with Jest or Supertest) that assert expected inputs, outputs, and edge-case exceptions.
4. Predictable dependency scripts inside \`package.json\` (\`lint\`, \`test\`, \`build\`).`,
    learningObjectives: [
      'Structure a clean, testable JavaScript web service with modular exports',
      'Write assertions with Jest to verify HTTP status codes and JSON payloads',
      'Standardize npm test commands that exit with status 0 on success and 1 on failure'
    ],
    realWorldImpact: 'In production software teams, having modular code with fast local unit tests ensures tests run in under 30 seconds inside CI runners, preventing developer bottlenecks.',
    tasks: [
      {
        id: 'task-1-1',
        instruction: 'Inspect the sample Express app in `src/app.js` and verify it exports both `app` and `calculateInvoiceTotal`.',
        hint: 'Check the bottom of `src/app.js` for module.exports.',
        completed: false,
        verificationType: 'code_contains',
        targetString: 'module.exports'
      },
      {
        id: 'task-1-2',
        instruction: 'Add a new unit test in `tests/app.test.js` to test zero tax calculations.',
        hint: 'Add an it() block in tests/app.test.js checking calculateInvoiceTotal(100, 0) equals 100.',
        completed: false,
        verificationType: 'code_contains',
        targetString: 'calculateInvoiceTotal(100, 0)'
      },
      {
        id: 'task-1-3',
        instruction: 'Run the test suite in the simulated runner and confirm all tests pass.',
        hint: 'Click "Run Tests" or trigger the pipeline in the interactive simulator.',
        completed: false,
        verificationType: 'test_passes'
      }
    ],
    starterFiles: [
      {
        name: 'app.js',
        path: 'src/app.js',
        language: 'javascript',
        content: `const express = require('express');
const app = express();
app.use(express.json());

// Business logic: Invoice tax calculator
function calculateInvoiceTotal(subtotal, taxRate = 0.08) {
  if (subtotal < 0) {
    throw new Error('Subtotal cannot be negative');
  }
  const tax = Number((subtotal * taxRate).toFixed(2));
  return Number((subtotal + tax).toFixed(2));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'web-api' });
});

app.post('/api/calculate', (req, res) => {
  const { subtotal, taxRate } = req.body;
  try {
    const total = calculateInvoiceTotal(Number(subtotal), taxRate);
    res.json({ total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = { app, calculateInvoiceTotal };`
      },
      {
        name: 'app.test.js',
        path: 'tests/app.test.js',
        language: 'javascript',
        content: `const request = require('supertest');
const { app, calculateInvoiceTotal } = require('../src/app');

describe('Web Application Test Suite', () => {
  it('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('calculates invoice tax correctly for 8%', () => {
    expect(calculateInvoiceTotal(100, 0.08)).toBe(108.00);
  });

  // TASK 1.2: Add your zero tax calculation test here!
});`
      },
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "sample-ci-web-app",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "lint": "eslint src/ tests/",
    "build": "mkdir -p dist && cp -r src/* dist/"
  }
}`
      }
    ],
    defaultWorkflow: `name: CI Initial Setup
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test`
  },
  {
    id: 'step-2-workflow-config',
    stepNumber: 2,
    title: 'Configure CI Workflow File',
    duration: '1.5–2 hours',
    difficulty: 'Easy',
    summary: 'Master GitHub Actions workflow syntax (`.github/workflows/ci.yml`), understand runner operating systems, and configure automated event triggers.',
    explanation: `GitHub Actions is configured declaratively using YAML files stored in the \`.github/workflows/\` directory.
Key concepts:
- **Events / Triggers (\`on:\`)**: Define when the workflow should execute (e.g. \`push\` to \`main\`, \`pull_request\`, or manual dispatch).
- **Runners (\`runs-on:\`)**: Virtual machine or container environment hosted by GitHub (e.g. \`ubuntu-latest\`, \`windows-latest\`, \`macos-latest\`).
- **Jobs**: Sets of steps executed on the same runner. By default, separate jobs run in parallel unless specified with \`needs:\`.
- **Steps & Actions**: Individual tasks, which can be shell commands (\`run:\`) or reusable community actions (\`uses: actions/checkout@v4\`).`,
    learningObjectives: [
      'Write valid YAML workflow definitions for GitHub Actions',
      'Target specific branches (`main`, `develop`) for push and PR events',
      'Understand how runner VMs pull your repository code via `actions/checkout`'
    ],
    realWorldImpact: 'Granular trigger filters save thousands of build minutes per month by only running heavy integration tests when relevant code branches or pull requests change.',
    tasks: [
      {
        id: 'task-2-1',
        instruction: 'Configure the workflow to trigger on both `push` and `pull_request` events targeting `main`.',
        hint: 'Use on: push: branches: [main] and pull_request: branches: [main].',
        completed: false,
        verificationType: 'yaml_valid',
        targetString: 'pull_request'
      },
      {
        id: 'task-2-2',
        instruction: 'Add `cache: "npm"` to the `actions/setup-node@v4` action step.',
        hint: 'Under with: add cache: "npm" to speed up package installations.',
        completed: false,
        verificationType: 'yaml_valid',
        targetString: "cache: 'npm'"
      }
    ],
    starterFiles: [
      {
        name: 'ci.yml',
        path: '.github/workflows/ci.yml',
        language: 'yaml',
        content: `name: Automated CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  ci-build:
    name: Build & Validate
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci`
      }
    ],
    defaultWorkflow: `name: Automated CI Pipeline
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  ci-build:
    name: Build & Validate
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      - name: 🟢 Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: 📦 Install dependencies
        run: npm ci`
  },
  {
    id: 'step-3-build-test-stages',
    stepNumber: 3,
    title: 'Add Build and Test Stages',
    duration: '2–2.5 hours',
    difficulty: 'Intermediate',
    summary: 'Implement a comprehensive multi-stage pipeline: code linting, unit tests with code coverage thresholds, matrix builds across Node versions, and build artifact uploads.',
    explanation: `A robust CI pipeline moves through distinct validation phases in order of increasing cost and execution time:
1. **Linting & Formatting (Fast fail)**: Catch syntax errors, unused variables, and style violations in 5 seconds without executing tests.
2. **Unit Tests & Code Coverage**: Verify business logic correctness. Ensure code coverage doesn't drop below critical thresholds.
3. **Matrix Strategy**: Run identical test suites across multiple runtime versions (e.g. Node 18, Node 20) simultaneously.
4. **Production Build**: Compile TypeScript/React bundles or Docker containers.
5. **Artifact Retention**: Save compiled distribution bundles (\`dist/\`) using \`actions/upload-artifact@v4\` for deployment pipelines.`,
    learningObjectives: [
      'Construct a fail-fast multi-stage pipeline (Lint -> Test -> Build)',
      'Leverage GitHub Actions matrix builds for multi-version validation',
      'Upload compiled build artifacts for downstream deployment workflows'
    ],
    realWorldImpact: 'Catching breaking changes in an automated matrix test prevents regressions for users running different Node.js or Python versions in production.',
    tasks: [
      {
        id: 'task-3-1',
        instruction: 'Add a matrix strategy with Node versions `[18.x, 20.x]` to the workflow.',
        hint: 'Add strategy: matrix: node-version: [18.x, 20.x] inside the job.',
        completed: false,
        verificationType: 'yaml_valid',
        targetString: 'matrix:'
      },
      {
        id: 'task-3-2',
        instruction: 'Add the test execution step `run: npm test -- --coverage`.',
        hint: 'Add a step with name: Run Tests and run: npm test -- --coverage.',
        completed: false,
        verificationType: 'yaml_valid',
        targetString: 'npm test'
      },
      {
        id: 'task-3-3',
        instruction: 'Add `actions/upload-artifact@v4` to store the `dist/` directory.',
        hint: 'Use uses: actions/upload-artifact@v4 with path: dist/.',
        completed: false,
        verificationType: 'yaml_valid',
        targetString: 'upload-artifact'
      }
    ],
    starterFiles: [
      {
        name: 'ci.yml',
        path: '.github/workflows/ci.yml',
        language: 'yaml',
        content: `name: Comprehensive CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test-and-build:
    name: Test & Build (Node \${{ matrix.node-version }})
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: 📦 Clean install dependencies
        run: npm ci

      - name: 🔍 Run ESLint
        run: npm run lint

      - name: 🧪 Run Unit Tests & Coverage
        run: npm test -- --coverage

      - name: 🏗️ Compile Web Build
        run: npm run build

      - name: 📤 Upload Build Artifacts
        if: matrix.node-version == '20.x'
        uses: actions/upload-artifact@v4
        with:
          name: production-dist
          path: dist/`
      }
    ],
    defaultWorkflow: `name: Comprehensive CI Pipeline
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test-and-build:
    name: Test & Build (Node \${{ matrix.node-version }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4
      - name: 🟢 Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      - name: 📦 Clean install dependencies
        run: npm ci
      - name: 🔍 Run ESLint
        run: npm run lint
      - name: 🧪 Run Unit Tests & Coverage
        run: npm test -- --coverage
      - name: 🏗️ Compile Web Build
        run: npm run build
      - name: 📤 Upload Build Artifacts
        if: matrix.node-version == '20.x'
        uses: actions/upload-artifact@v4
        with:
          name: production-dist
          path: dist/`
  },
  {
    id: 'step-4-trigger-push',
    stepNumber: 4,
    title: 'Trigger Pipeline on Code Push & Pull Requests',
    duration: '1–1.5 hours',
    difficulty: 'Easy',
    summary: 'Experience the live feedback loop: make commits, simulate push events, inspect real-time runner logs, and observe status checks protecting the main branch.',
    explanation: `The heart of Continuous Integration is the automated feedback loop.
Whenever an engineer runs \`git push origin feature-branch\`:
1. **GitHub Webhook** triggers the workflow engine within 2 seconds.
2. **Ephemeral VM** starts up, clones your exact commit SHA, and executes your workflow steps.
3. **Pull Request Status Checks** block merging if any test or lint step fails.
4. **Live Logs** stream each step's output to the terminal, allowing developers to spot and fix defects immediately.`,
    learningObjectives: [
      'Simulate the Git push event and observe webhook execution triggers',
      'Read and diagnose terminal step outputs in real time',
      'Understand branch protection rules that enforce passing CI status checks before merging'
    ],
    realWorldImpact: 'Startups and enterprise teams rely on automated CI status checks to prevent untested code from reaching production, reducing customer-impacting outages by over 70%.',
    tasks: [
      {
        id: 'task-4-1',
        instruction: 'Create a new feature branch and make a simulated commit with a commit message.',
        hint: 'Use the Git Workbench in the simulator to type a message and press "Commit & Push".',
        completed: false,
        verificationType: 'pipeline_runs'
      },
      {
        id: 'task-4-2',
        instruction: 'Watch the pipeline run in the visual graph and examine the terminal log outputs.',
        hint: 'Click on any pipeline step in the graph to view its real-time terminal output.',
        completed: false,
        verificationType: 'pipeline_runs'
      },
      {
        id: 'task-4-3',
        instruction: 'Introduce an intentional test failure to see the pipeline fail and block the commit status.',
        hint: 'Change an expectation in `tests/app.test.js` or choose a break scenario from the Troubleshooting tab.',
        completed: false,
        verificationType: 'pipeline_runs'
      }
    ],
    starterFiles: [
      {
        name: 'app.js',
        path: 'src/app.js',
        language: 'javascript',
        content: `const express = require('express');
const app = express();
app.use(express.json());

function calculateInvoiceTotal(subtotal, taxRate = 0.08) {
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  return Number((subtotal * (1 + taxRate)).toFixed(2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.0.0' });
});

module.exports = { app, calculateInvoiceTotal };`
      },
      {
        name: 'app.test.js',
        path: 'tests/app.test.js',
        language: 'javascript',
        content: `const request = require('supertest');
const { app, calculateInvoiceTotal } = require('../src/app');

describe('🚀 Push Verification Test Suite', () => {
  it('verifies /api/health responds with 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('calculates invoice tax correctly', () => {
    expect(calculateInvoiceTotal(50, 0.10)).toBe(55.00);
  });
});`
      }
    ],
    defaultWorkflow: `name: Production CI Push & PR Gate
on:
  push:
    branches: [ "main", "feature/*" ]
  pull_request:
    branches: [ "main" ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test`
  }
];
