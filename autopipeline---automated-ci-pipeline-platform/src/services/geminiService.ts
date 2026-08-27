/**
 * AutoPipeline Gemini Client Service
 * Calls server-side proxy routes to ensure secure execution and zero client-side credential exposure.
 */

import { RepoAnalysisResult } from '../types';

export interface DiagnosticResult {
  title: string;
  explanation: string;
  suggestedFix: string;
  fixedSnippet?: string;
}

export async function analyzeGithubRepo(
  repoUrl: string,
  customToken?: string,
  branchOverride?: string
): Promise<RepoAnalysisResult> {
  const response = await fetch('/api/analyze-github-repo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl, customToken, branchOverride }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to analyze GitHub repository (HTTP ${response.status})`);
  }

  return await response.json();
}

export async function explainCiError(errorLog: string, context?: string): Promise<DiagnosticResult> {
  try {
    const response = await fetch('/api/diagnose-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errorLog, context }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      title: data.title || 'CI Diagnostic Report',
      explanation: data.explanation || 'Analyzed pipeline logs.',
      suggestedFix: data.suggestedFix || 'Review code and workflow configurations.',
      fixedSnippet: data.fixedSnippet,
    };
  } catch (err) {
    console.warn('Network call to /api/diagnose-error failed, using local diagnostic:', err);
    return getLocalDiagnosticFallback(errorLog);
  }
}

export async function generateCustomWorkflow(promptRequirement: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptRequirement }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.workflowYaml || getLocalWorkflowFallback(promptRequirement);
  } catch (err) {
    console.warn('Network call to /api/generate-workflow failed, using local template:', err);
    return getLocalWorkflowFallback(promptRequirement);
  }
}

function getLocalDiagnosticFallback(errorLog: string): DiagnosticResult {
  if (errorLog.includes('expect(received).toBe(expected)') || errorLog.includes('FAIL') || errorLog.includes('Test Suites: 1 failed')) {
    return {
      title: 'Unit Test Assertion Failure (Exit Code 1)',
      explanation: 'Jest or your test runner caught a mismatch between the received function return value and the expected test assertion value. This typically indicates a business logic bug in your source code or an outdated test assertion.',
      suggestedFix: 'Review the diff between the expected output and received output in your test logs. Correct the calculation or logic inside your source file before pushing again.',
      fixedSnippet: `// Verify your calculations match the test expectation
function calculateInvoiceTotal(subtotal, taxRate = 0.08) {
  const tax = Number((subtotal * taxRate).toFixed(2));
  return Number((subtotal + tax).toFixed(2));
}`
    };
  }

  if (errorLog.includes('Missing script: "lint"') || errorLog.includes('npm error Missing script')) {
    return {
      title: 'Missing npm Script in package.json',
      explanation: 'The GitHub Actions workflow called `npm run lint`, but the target repository `package.json` does not declare a "lint" entry under `"scripts"`.',
      suggestedFix: 'Add the `"lint"` script to your `package.json` file, specifying the linter command (e.g. `"lint": "eslint src/ tests/"`).',
      fixedSnippet: `"scripts": {\n  "lint": "eslint src/ tests/",\n  "test": "jest",\n  "build": "vite build"\n}`
    };
  }

  if (errorLog.includes('SyntaxError') || errorLog.includes('Parsing error') || errorLog.includes('Unexpected token')) {
    return {
      title: 'Syntax Parsing Error (Static Analysis Failed)',
      explanation: 'The static analyzer (ESLint/Babel/tsc) discovered invalid JavaScript or Python syntax (e.g. unclosed bracket, misspelled keyword, or duplicate token). The runner terminated early before running tests.',
      suggestedFix: 'Open the file indicated in the error stack trace, locate the reported line and column, and correct the syntax error.',
      fixedSnippet: `// Ensure all brackets and quotes are balanced\nfunction processData(items) {\n  return items.map(item => item.name);\n}`
    };
  }

  return {
    title: 'CI Step Failure Analysis',
    explanation: 'A step in the workflow exited with a non-zero status code. In GitHub Actions, any non-zero exit code stops subsequent dependent steps from executing.',
    suggestedFix: 'Examine the step command and logs immediately preceding the failure. Check for missing environment variables, network timeouts, or unhandled exceptions.'
  };
}

function getLocalWorkflowFallback(promptRequirement: string): string {
  return `# Automated CI Pipeline for: ${promptRequirement}
name: Custom CI Automation

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - name: 📥 Checkout Repository Code
      uses: actions/checkout@v4

    - name: 🟢 Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'

    - name: 📦 Clean Install Dependencies
      run: npm ci

    - name: 🔍 Static Code Analysis & Linting
      run: npm run lint --if-present

    - name: 🧪 Execute Automated Tests with Coverage
      run: npm test -- --coverage

    - name: 🏗️ Compile Production Bundle
      run: npm run build --if-present

    - name: 📤 Upload Build Artifacts
      if: matrix.node-version == '20.x'
      uses: actions/upload-artifact@v4
      with:
        name: production-artifacts
        path: dist/
        retention-days: 5`;
}
