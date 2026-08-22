import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' && (window as any).__GEMINI_KEY__);
  if (apiKey) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function explainCiError(errorLog: string, context?: string): Promise<{
  title: string;
  explanation: string;
  suggestedFix: string;
  fixedSnippet?: string;
}> {
  const ai = getAI();
  if (!ai) {
    // Intelligent built-in deterministic fallback analyzer
    if (errorLog.includes('expect(received).toBe(expected)') || errorLog.includes('Test Suites: 1 failed')) {
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
    if (errorLog.includes('SyntaxError') || errorLog.includes('Parsing error')) {
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

  try {
    const prompt = `You are a Principal DevOps & CI/CD Engineer specializing in GitHub Actions.
Analyze this CI pipeline error log and provide:
1. Short Title (e.g. "Jest Assertion Failure in Invoice Test")
2. Concise Root Cause Explanation (2-3 sentences max)
3. Actionable Fix Step
4. Fixed Code Snippet if applicable.

Error Log:
\`\`\`
${errorLog}
\`\`\`
${context ? `Context: ${context}` : ''}

Respond in clean JSON format:
{
  "title": "string",
  "explanation": "string",
  "suggestedFix": "string",
  "fixedSnippet": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      title: parsed.title || 'CI Diagnostic Report',
      explanation: parsed.explanation || 'Error diagnosed in pipeline runner.',
      suggestedFix: parsed.suggestedFix || 'Apply recommended code and workflow adjustments.',
      fixedSnippet: parsed.fixedSnippet
    };
  } catch (err) {
    console.error('Gemini error analysis failed, falling back to local heuristic:', err);
    return {
      title: 'Automated CI Diagnostic',
      explanation: 'The build step failed with exit code 1. Check your test assertions, dependency versions, and script definitions in package.json.',
      suggestedFix: 'Review the failing test output or script command in the terminal logs.'
    };
  }
}

export async function generateCustomWorkflow(promptRequirement: string): Promise<string> {
  const ai = getAI();
  if (!ai) {
    return `# Generated Automated CI Pipeline for: ${promptRequirement}
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

  try {
    const prompt = `Write a production-grade GitHub Actions CI workflow YAML file based on this requirement:
"${promptRequirement}"

Requirements:
- Include proper event triggers (push, pull_request)
- Include checkout action (actions/checkout@v4)
- Include language runtime setup with dependency caching
- Include lint, test, and build steps
- Add descriptive names with emojis
- Return ONLY valid YAML without markdown backticks if possible, or standard YAML block.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || '';
    // Strip markdown code blocks if present
    text = text.replace(/^```ya?ml\n/, '').replace(/\n```$/, '').trim();
    return text;
  } catch (err) {
    console.error('Failed to generate workflow with Gemini:', err);
    return `# Fallback CI Workflow\nname: Automated CI Pipeline\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - uses: actions/setup-node@v4\n      with:\n        node-version: 20\n        cache: 'npm'\n    - run: npm ci\n    - run: npm test`;
  }
}
