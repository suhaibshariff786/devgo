import { QuizItem } from '../types';

export const QUIZ_QUESTIONS: QuizItem[] = [
  {
    id: 'q1',
    topic: 'Basics',
    question: 'What is the primary goal of an automated Continuous Integration (CI) pipeline?',
    options: [
      'To replace all software engineers with automated code generators',
      'To automatically test and build code on every push to detect defects early and reduce manual effort',
      'To host live production databases directly in GitHub Actions runners',
      'To encrypt git repositories using proprietary key vaults'
    ],
    correctAnswer: 1,
    explanation: 'Continuous Integration automates code building and testing whenever commits are pushed, providing fast feedback and catching defects before they reach production.'
  },
  {
    id: 'q2',
    topic: 'Triggers',
    question: 'Which YAML block correctly configures a GitHub Actions workflow to trigger on pushes to the main branch?',
    options: [
      'trigger: main',
      'on:\n  push:\n    branches: [ "main" ]',
      'execute:\n  when: push.main == true',
      'events: [ git_push_main ]'
    ],
    correctAnswer: 1,
    explanation: 'In GitHub Actions, the `on:` keyword specifies event triggers. The `push:` key with a `branches:` array defines which branch pushes initiate the run.'
  },
  {
    id: 'q3',
    topic: 'Jobs & Steps',
    question: 'Why should you prefer `npm ci` over `npm install` in automated CI pipelines?',
    options: [
      '`npm ci` installs dependencies strictly according to package-lock.json for reproducible, deterministic builds',
      '`npm ci` automatically updates all dependencies to their latest major version',
      '`npm ci` skips installing devDependencies completely',
      '`npm ci` runs your unit test suite in parallel'
    ],
    correctAnswer: 0,
    explanation: '`npm ci` is designed specifically for automated CI environments. It performs a clean install strictly based on `package-lock.json` and deletes any existing `node_modules`.'
  },
  {
    id: 'q4',
    topic: 'Caching',
    question: 'What is the benefit of adding `cache: "npm"` in `actions/setup-node@v4`?',
    options: [
      'It stores test results in a public database',
      'It caches downloaded npm packages between workflow runs, drastically reducing dependency installation time',
      'It compiles your code into binary format',
      'It prevents secrets from being logged'
    ],
    correctAnswer: 1,
    explanation: 'Caching dependency directories avoids re-downloading identical npm packages across repeated pipeline runs, often shaving minutes off CI execution times.'
  },
  {
    id: 'q5',
    topic: 'Jobs & Steps',
    question: 'What is a "Matrix Strategy" in CI pipelines?',
    options: [
      'A method to run 3D simulations inside runners',
      'A configuration that automatically executes jobs across multiple OS and runtime versions (e.g. Node 18 & 20) in parallel',
      'A movie reference with no practical utility in software engineering',
      'A security scanner that audits cryptographic keys'
    ],
    correctAnswer: 1,
    explanation: 'Matrix builds let you test your code across multiple operating systems (Ubuntu, macOS, Windows) and language runtime versions simultaneously.'
  },
  {
    id: 'q6',
    topic: 'Security',
    question: 'How should sensitive credentials (like deployment API keys) be handled in GitHub Actions?',
    options: [
      'Hardcoded directly into `.github/workflows/ci.yml`',
      'Committed as plain text inside `package.json`',
      'Stored as encrypted GitHub Repository Secrets and referenced via `${{ secrets.API_KEY }}`',
      'Sent via public pull request comments'
    ],
    correctAnswer: 2,
    explanation: 'Secrets must never be stored in source code. GitHub Repository Secrets encrypt sensitive values and mask them from public build logs.'
  }
];
