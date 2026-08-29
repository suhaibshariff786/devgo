import { CIPreset } from '../types';

export const PIPELINE_PRESETS: CIPreset[] = [
  {
    id: 'nodejs-express',
    name: 'Node.js & Express REST API',
    badge: 'Standard Starter',
    techStack: 'Node.js',
    description: 'Automated testing with Jest, ESLint code validation, and production build artifact packaging for Node.js 18 & 20.',
    stars: 1240,
    testFile: 'tests/app.test.js',
    appFile: 'src/app.js',
    workflowYaml: `name: Node.js Automated CI Pipeline

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

    - name: 🟢 Set up Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'

    - name: 📦 Install Clean Dependencies (npm ci)
      run: npm ci

    - name: 🔍 Run Linter & Static Analysis
      run: npm run lint

    - name: 🧪 Execute Unit & Integration Tests
      run: npm test -- --coverage

    - name: 🏗️ Build Production Web Assets
      run: npm run build

    - name: 📤 Archive Production Build Artifacts
      if: matrix.node-version == '20.x'
      uses: actions/upload-artifact@v4
      with:
        name: web-production-bundle
        path: dist/
        retention-days: 7`,
    files: [
      {
        name: 'app.js',
        path: 'src/app.js',
        language: 'javascript',
        content: `const express = require('express');
const app = express();

app.use(express.json());

// In-memory items database
let items = [
  { id: 1, name: 'Setup CI Pipeline', status: 'completed' },
  { id: 2, name: 'Automate Unit Tests', status: 'in-progress' }
];

// Healthcheck endpoint for pipeline validation
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Calculate tax utility function
function calculateInvoiceTotal(subtotal, taxRate = 0.08) {
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  const tax = Number((subtotal * taxRate).toFixed(2));
  return Number((subtotal + tax).toFixed(2));
}

app.get('/api/items', (req, res) => {
  res.json({ success: true, count: items.length, data: items });
});

app.post('/api/calculate', (req, res) => {
  const { subtotal, taxRate } = req.body;
  try {
    const total = calculateInvoiceTotal(Number(subtotal), taxRate);
    res.json({ success: true, subtotal, taxRate: taxRate || 0.08, total });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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

describe('🚀 CI Automated Test Suite', () => {
  
  describe('GET /api/health', () => {
    it('should return HTTP 200 and healthy status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Invoice Calculation Logic', () => {
    it('should correctly calculate 8% tax on standard amount', () => {
      const total = calculateInvoiceTotal(100, 0.08);
      expect(total).toBe(108.00);
    });

    it('should reject negative subtotals with validation error', () => {
      expect(() => {
        calculateInvoiceTotal(-50);
      }).toThrow('Subtotal cannot be negative');
    });
  });

  describe('GET /api/items', () => {
    it('should return the initial items list', async () => {
      const response = await request(app).get('/api/items');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

});`
      },
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "sample-ci-web-app",
  "version": "1.0.0",
  "description": "Sample web application for automated CI testing",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "lint": "eslint src/ tests/ --max-warnings=0",
    "test": "jest --detectOpenHandles",
    "build": "mkdir -p dist && cp -r src/* dist/"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}`
      }
    ]
  },
  {
    id: 'python-fastapi',
    name: 'Python & FastAPI Microservice',
    badge: 'Pythonic',
    techStack: 'Python',
    description: 'Automated CI with flake8 code quality checks, pytest test runner with coverage reports, and Python 3.11 & 3.12 support.',
    stars: 980,
    testFile: 'tests/test_main.py',
    appFile: 'app/main.py',
    workflowYaml: `name: Python FastAPI CI Pipeline

on:
  push:
    branches: [ "main", "dev" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
    - name: 📥 Check out repository
      uses: actions/checkout@v4

    - name: 🐍 Set up Python \${{ matrix.python-version }}
      uses: actions/setup-python@v5
      with:
        python-version: \${{ matrix.python-version }}
        cache: 'pip'

    - name: 📦 Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: 🔍 Lint with flake8
      run: |
        # Stop the build if there are Python syntax errors or undefined names
        flake8 app/ tests/ --count --select=E9,F63,F7,F82 --show-source --statistics

    - name: 🧪 Test with pytest
      run: |
        pytest --cov=app --cov-report=term-missing`,
    files: [
      {
        name: 'main.py',
        path: 'app/main.py',
        language: 'python',
        content: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="FastAPI Automated CI Microservice")

class CalculationRequest(BaseModel):
    num1: float
    num2: float
    operation: str

@app.get("/")
def read_root():
    return {"message": "CI/CD Pipeline Service Active", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "payment-calculator"}

@app.post("/calculate")
def calculate(req: CalculationRequest):
    if req.operation == "add":
        return {"result": req.num1 + req.num2}
    elif req.operation == "multiply":
        return {"result": req.num1 * req.num2}
    elif req.operation == "divide":
        if req.num2 == 0:
            raise HTTPException(status_code=400, detail="Cannot divide by zero")
        return {"result": req.num1 / req.num2}
    raise HTTPException(status_code=400, detail=f"Unsupported operation: {req.operation}")`
      },
      {
        name: 'test_main.py',
        path: 'tests/test_main.py',
        language: 'python',
        content: `from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["version"] == "1.0.0"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_calculate_addition():
    response = client.post("/calculate", json={"num1": 15, "num2": 25, "operation": "add"})
    assert response.status_code == 200
    assert response.json()["result"] == 40

def test_calculate_divide_by_zero():
    response = client.post("/calculate", json={"num1": 10, "num2": 0, "operation": "divide"})
    assert response.status_code == 400
    assert "Cannot divide by zero" in response.json()["detail"]`
      },
      {
        name: 'requirements.txt',
        path: 'requirements.txt',
        language: 'shell',
        content: `fastapi==0.110.0
uvicorn==0.28.0
pytest==8.1.1
pytest-cov==4.1.0
flake8==7.0.0
httpx==0.27.0`
      }
    ]
  },
  {
    id: 'react-vite',
    name: 'React + TypeScript Frontend',
    badge: 'Modern SPA',
    techStack: 'React',
    description: 'Type check with tsc, unit testing with Vitest, and production Vite bundling with bundle size analysis.',
    stars: 840,
    testFile: 'src/App.test.tsx',
    appFile: 'src/App.tsx',
    workflowYaml: `name: React App CI Build & Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4

    - name: ⚡ Setup Node.js 20
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - name: 📦 Install dependencies
      run: npm ci

    - name: 📐 TypeScript Type Check
      run: npm run type-check

    - name: 🧪 Run Vitest Unit Tests
      run: npm run test:ci

    - name: ⚡ Vite Production Build
      run: npm run build`,
    files: [
      {
        name: 'App.tsx',
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Automated CI Pipeline Demo</h1>
      <p>Continuous Integration ensures code quality on every push!</p>
      <button 
        data-testid="counter-btn"
        onClick={() => setCount(prev => prev + 1)}
      >
        Clicked: {count}
      </button>
    </div>
  );
}`
      },
      {
        name: 'App.test.tsx',
        path: 'src/App.test.tsx',
        language: 'typescript',
        content: `import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App UI Component', () => {
  it('renders headline correctly', () => {
    render(<App />);
    expect(screen.getByText(/Automated CI Pipeline Demo/i)).toBeDefined();
  });

  it('increments counter on button click', () => {
    render(<App />);
    const btn = screen.getByTestId('counter-btn');
    expect(btn.textContent).toContain('Clicked: 0');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('Clicked: 1');
  });
});`
      }
    ]
  }
];
