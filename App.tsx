import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  PipelineRun, 
  PipelineJob, 
  PipelineStep, 
  PipelineStatus, 
  CodeFile, 
  CIPreset, 
  TroubleshootingChallenge 
} from './types';
import { PIPELINE_PRESETS } from './src/data/pipelinePresets';
import { LAB_STEPS } from './src/data/labSteps';
import { Navbar, ActiveTab } from './src/components/Navbar';
import { PipelineVisualizer } from './src/components/PipelineVisualizer';
import { TerminalLogs } from './src/components/TerminalLogs';
import { GitWorkbench } from './src/components/GitWorkbench';
import { WorkflowEditor } from './src/components/WorkflowEditor';
import { InteractiveLab } from './src/components/InteractiveLab';
import { TroubleshootingCenter } from './src/components/TroubleshootingCenter';
import { RealWorldArchitecture } from './src/components/RealWorldArchitecture';
import { QuizView } from './src/components/QuizView';
import { AIPipelineAssistant } from './src/components/AIPipelineAssistant';
import { ProjectExporterModal } from './src/components/ProjectExporterModal';

export default function App() {
  // Navigation & Presets State
  const [activeTab, setActiveTab] = useState<ActiveTab>('lab');
  const [selectedPreset, setSelectedPreset] = useState<CIPreset>(PIPELINE_PRESETS[0]);
  const [currentLabStepIndex, setCurrentLabStepIndex] = useState<number>(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Active Code Repository State
  const [files, setFiles] = useState<CodeFile[]>(() => [...selectedPreset.files]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [workflowYaml, setWorkflowYaml] = useState<string>(selectedPreset.workflowYaml);

  // Pipeline Execution State
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [selectedMatrixIndex, setSelectedMatrixIndex] = useState<number>(0);
  const [initialErrorLogForAI, setInitialErrorLogForAI] = useState<string>('');

  // Initial Pipeline Run Structure
  const [currentRun, setCurrentRun] = useState<PipelineRun>(() => ({
    id: 'run-101',
    workflowName: 'Automated CI Pipeline',
    triggerEvent: 'push',
    branch: 'main',
    commitHash: '7f9a2c1',
    commitMessage: 'feat: setup automated test suite & CI workflow',
    author: 'devops-engineer',
    startedAt: new Date().toLocaleTimeString(),
    status: 'idle',
    jobs: [
      {
        id: 'job-node-18',
        name: 'Node.js 18.x Test & Build',
        runsOn: 'ubuntu-latest',
        currentMatrixVariation: 'Node 18.x',
        status: 'idle',
        steps: [
          {
            id: 'step-1',
            name: '📥 Checkout Repository',
            uses: 'actions/checkout@v4',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-2',
            name: '🟢 Setup Runtime Environment',
            uses: 'actions/setup-node@v4',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-3',
            name: '📦 Clean Install Dependencies',
            command: 'npm ci',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-4',
            name: '🔍 Static Code Linting',
            command: 'npm run lint',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-5',
            name: '🧪 Run Automated Tests & Coverage',
            command: 'npm test -- --coverage',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-6',
            name: '🏗️ Compile Production Build',
            command: 'npm run build',
            status: 'idle',
            logs: []
          }
        ]
      },
      {
        id: 'job-node-20',
        name: 'Node.js 20.x Test & Build',
        runsOn: 'ubuntu-latest',
        currentMatrixVariation: 'Node 20.x',
        status: 'idle',
        steps: [
          {
            id: 'step-20-1',
            name: '📥 Checkout Repository',
            uses: 'actions/checkout@v4',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-20-2',
            name: '🟢 Setup Runtime Environment',
            uses: 'actions/setup-node@v4',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-20-3',
            name: '📦 Clean Install Dependencies',
            command: 'npm ci',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-20-4',
            name: '🔍 Static Code Linting',
            command: 'npm run lint',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-20-5',
            name: '🧪 Run Automated Tests & Coverage',
            command: 'npm test -- --coverage',
            status: 'idle',
            logs: []
          },
          {
            id: 'step-20-6',
            name: '🏗️ Compile Production Build',
            command: 'npm run build',
            status: 'idle',
            logs: []
          }
        ]
      }
    ]
  }));

  // Sync preset changes
  const handleSelectPreset = (preset: CIPreset) => {
    setSelectedPreset(preset);
    setFiles([...preset.files]);
    setActiveFileIndex(0);
    setWorkflowYaml(preset.workflowYaml);
  };

  const handleUpdateFileContent = (fileIdx: number, newContent: string) => {
    setFiles(prev => {
      const copy = [...prev];
      if (copy[fileIdx]) {
        copy[fileIdx] = {
          ...copy[fileIdx],
          content: newContent,
          isModified: true
        };
      }
      return copy;
    });
  };

  const handleResetFiles = () => {
    setFiles([...selectedPreset.files]);
    setWorkflowYaml(selectedPreset.workflowYaml);
  };

  // Quick scenario injection
  const handleInjectScenario = (type: 'break_test' | 'fix_test' | 'break_syntax' | 'missing_script') => {
    if (type === 'break_test') {
      const appFileIdx = files.findIndex(f => f.name.includes('app') || f.name.includes('main'));
      if (appFileIdx >= 0) {
        const brokenContent = files[appFileIdx].content.replace(
          'calculateInvoiceTotal(subtotal, taxRate = 0.08)',
          'calculateInvoiceTotal(subtotal, taxRate = 0.08)\n  // INTENTIONAL BREAKAGE: Tax math returned 0\n  return 0;'
        );
        handleUpdateFileContent(appFileIdx, brokenContent);
      }
    } else if (type === 'fix_test') {
      handleResetFiles();
    } else if (type === 'break_syntax') {
      const appFileIdx = files.findIndex(f => f.name.includes('app') || f.name.includes('main'));
      if (appFileIdx >= 0) {
        handleUpdateFileContent(appFileIdx, files[appFileIdx].content + '\n\nfunction brokenSyntax() {');
      }
    } else if (type === 'missing_script') {
      const pkgIdx = files.findIndex(f => f.name === 'package.json');
      if (pkgIdx >= 0) {
        const brokenPkg = files[pkgIdx].content.replace('"lint": "eslint src/ tests/",', '');
        handleUpdateFileContent(pkgIdx, brokenPkg);
      }
    }
  };

  // Load troubleshooting challenge
  const handleLoadTroubleshootScenario = (scenario: TroubleshootingChallenge) => {
    setFiles([...scenario.initialFiles]);
    setActiveFileIndex(0);
    setWorkflowYaml(scenario.initialWorkflow);
    setActiveTab('simulator');
  };

  // Dynamic Runner Simulation Engine
  const executePipelineRun = useCallback(async (
    commitMsg = 'ci: trigger automated build & test validation',
    branch = 'main',
    isPR = false
  ) => {
    if (pipelineStatus === 'running') return;

    setPipelineStatus('running');
    const randomHash = Math.random().toString(16).substring(2, 9);

    // Deep copy current run structure & reset step statuses
    const updatedRun: PipelineRun = {
      ...currentRun,
      id: `run-${Date.now().toString().slice(-4)}`,
      commitHash: randomHash,
      commitMessage: commitMsg,
      branch: isPR ? 'refs/pull/42/merge' : branch,
      triggerEvent: isPR ? 'pull_request' : 'push',
      startedAt: new Date().toLocaleTimeString(),
      status: 'running',
      jobs: currentRun.jobs.map(job => ({
        ...job,
        status: 'running',
        steps: job.steps.map(step => ({
          ...step,
          status: 'queued',
          logs: [],
          durationMs: undefined,
          error: undefined
        }))
      }))
    };

    setCurrentRun(updatedRun);
    setActiveStepId(updatedRun.jobs[0].steps[0].id);

    // Evaluate live file contents for errors
    const currentCode = files.map(f => f.content).join('\n');
    const pkgFile = files.find(f => f.name === 'package.json');
    const isSyntaxBroken = currentCode.includes('brokenSyntax() {') || currentCode.includes('}} // Extra');
    const isTestBroken = currentCode.includes('return 0;') || currentCode.includes('0.08 tax calculation ignoring');
    const isMissingScript = pkgFile && !pkgFile.content.includes('"lint"') && workflowYaml.includes('npm run lint');

    const job = updatedRun.jobs[0];
    let hasFailed = false;

    // Sequentially execute steps
    for (let i = 0; i < job.steps.length; i++) {
      const step = job.steps[i];
      setActiveStepId(step.id);

      // Set current step to running
      job.steps[i] = { ...step, status: 'running', logs: [`$ Starting step: ${step.name}`] };
      setCurrentRun({ ...updatedRun, jobs: [job] });

      // Step execution delay
      await new Promise(r => setTimeout(r, 650));

      let stepDuration = Math.floor(Math.random() * 800) + 400;
      let logs: string[] = [];
      let stepStatus: PipelineStatus = 'success';

      if (step.uses?.includes('checkout')) {
        logs = [
          'Syncing repository: org/sample-web-app',
          `Getting Git metadata for ref ${isPR ? 'refs/pull/42/merge' : branch}`,
          `Fetching SHA: ${randomHash}`,
          `HEAD is now at ${randomHash} ${commitMsg}`,
          '✓ Successfully checked out code (0.4s)'
        ];
      } else if (step.uses?.includes('setup-node') || step.uses?.includes('setup-python')) {
        logs = [
          'Found in cache: Node.js (20.12.0)',
          'Setting up environment variables: PATH, NODE_AUTH_TOKEN',
          'Resolving npm cache directory: ~/.npm',
          '✓ Environment setup complete (0.3s)'
        ];
      } else if (step.command === 'npm ci') {
        logs = [
          '$ npm ci',
          'added 42 packages in 1.1s',
          'audit: 0 vulnerabilities found',
          '✓ Clean dependency install completed'
        ];
      } else if (step.command?.includes('lint') || step.command?.includes('flake8')) {
        if (isSyntaxBroken) {
          stepStatus = 'failed';
          hasFailed = true;
          logs = [
            '$ npm run lint',
            '> eslint src/ tests/',
            'src/app.js:28:1 error Parsing error: Unexpected token',
            '✖ 1 problem (1 error, 0 warnings)',
            'Error: Process completed with exit code 1.'
          ];
        } else if (isMissingScript) {
          stepStatus = 'failed';
          hasFailed = true;
          logs = [
            '$ npm run lint',
            'npm error Missing script: "lint"',
            'npm error To see a list of scripts, run: npm run',
            'Error: Process completed with exit code 1.'
          ];
        } else {
          logs = [
            '$ npm run lint',
            '> eslint src/ tests/ --max-warnings=0',
            'Checking 4 source files...',
            '✨ 0 lint errors found. Code style passed!'
          ];
        }
      } else if (step.command?.includes('test')) {
        if (isTestBroken) {
          stepStatus = 'failed';
          hasFailed = true;
          logs = [
            '$ npm test -- --coverage',
            '> jest --detectOpenHandles',
            'FAIL tests/app.test.js',
            '  ● Invoice Calculation Logic › calculates tax correctly',
            '',
            '    expect(received).toBe(expected)',
            '    Expected: 108',
            '    Received: 0',
            '',
            '  Test Suites: 1 failed, 1 total',
            '  Tests:       1 failed, 2 passed, 3 total',
            '  Time:        1.428 s',
            'Error: Process completed with exit code 1.'
          ];
        } else {
          logs = [
            '$ npm test -- --coverage',
            '> jest --detectOpenHandles',
            'PASS tests/app.test.js',
            '  🚀 CI Automated Test Suite',
            '    GET /api/health',
            '      ✓ should return HTTP 200 and healthy status (24 ms)',
            '    Invoice Calculation Logic',
            '      ✓ should correctly calculate 8% tax on standard amount (4 ms)',
            '      ✓ should reject negative subtotals with validation error (2 ms)',
            '    GET /api/items',
            '      ✓ should return the initial items list (12 ms)',
            '',
            '----------------|---------|----------|---------|---------|',
            'File            | % Stmts | % Branch | % Funcs | % Lines |',
            '----------------|---------|----------|---------|---------|',
            'All files       |     100 |      100 |     100 |     100 |',
            ' src/app.js     |     100 |      100 |     100 |     100 |',
            '----------------|---------|----------|---------|---------|',
            'Test Suites: 1 passed, 1 total',
            'Tests:       4 passed, 4 total',
            'Time:        1.342 s'
          ];
        }
      } else if (step.command?.includes('build')) {
        logs = [
          '$ npm run build',
          'vite v5.2.0 building for production...',
          '✓ 14 modules transformed.',
          'dist/index.html                   0.45 kB │ gzip:  0.30 kB',
          'dist/assets/index-D8K2j.js       48.12 kB │ gzip: 16.24 kB',
          '✓ built in 420ms'
        ];
      }

      job.steps[i] = {
        ...step,
        status: stepStatus,
        durationMs: stepDuration,
        logs,
        exitCode: stepStatus === 'failed' ? 1 : 0
      };

      setCurrentRun({ ...updatedRun, jobs: [job] });

      if (hasFailed) {
        // Mark remaining steps as cancelled/skipped
        for (let j = i + 1; j < job.steps.length; j++) {
          job.steps[j] = {
            ...job.steps[j],
            status: 'cancelled',
            logs: ['Step cancelled due to previous failure.']
          };
        }
        job.status = 'failed';
        setPipelineStatus('failed');
        setCurrentRun({ ...updatedRun, status: 'failed', jobs: [job] });
        return;
      }
    }

    // All steps passed!
    job.status = 'success';
    setPipelineStatus('success');
    setCurrentRun({
      ...updatedRun,
      status: 'success',
      artifactUrl: 'https://github.com/org/repo/actions/artifacts/1048',
      jobs: [job]
    });

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 }
    });
  }, [files, workflowYaml, currentRun, pipelineStatus]);

  // AI error explanation handler
  const handleExplainErrorWithAI = (errorLog: string) => {
    setInitialErrorLogForAI(errorLog);
    setActiveTab('ai');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        pipelineStatus={pipelineStatus}
        onTriggerPipeline={() => executePipelineRun('Manual workflow dispatch', 'main')}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Tab 1: Guided 4-Step Lab */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <InteractiveLab
              currentStepIndex={currentLabStepIndex}
              onSelectStepIndex={setCurrentLabStepIndex}
              files={files}
              workflowYaml={workflowYaml}
              onUpdateFileContent={handleUpdateFileContent}
              onUpdateWorkflow={setWorkflowYaml}
              onRunPipeline={() => executePipelineRun('Step verification run', 'main')}
              pipelineStatus={pipelineStatus}
            />

            {/* Embedded Live Runner & Visualizer */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                ⚡ Live Runner Feedback & Visualization
              </h3>
              <PipelineVisualizer
                currentRun={currentRun}
                activeStepId={activeStepId}
                onSelectStep={setActiveStepId}
                selectedMatrixIndex={selectedMatrixIndex}
                onSelectMatrixIndex={setSelectedMatrixIndex}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GitWorkbench
                  files={files}
                  activeFileIndex={activeFileIndex}
                  onSelectFile={setActiveFileIndex}
                  onUpdateFileContent={handleUpdateFileContent}
                  onResetFiles={handleResetFiles}
                  onTriggerPipeline={(msg, branch, isPR) => executePipelineRun(msg, branch, isPR)}
                  pipelineStatus={pipelineStatus}
                  onInjectScenario={handleInjectScenario}
                />
                <TerminalLogs
                  jobs={currentRun.jobs}
                  activeStepId={activeStepId}
                  onSelectStep={setActiveStepId}
                  onExplainError={handleExplainErrorWithAI}
                  isStreaming={pipelineStatus === 'running'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live CI Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <PipelineVisualizer
              currentRun={currentRun}
              activeStepId={activeStepId}
              onSelectStep={setActiveStepId}
              selectedMatrixIndex={selectedMatrixIndex}
              onSelectMatrixIndex={setSelectedMatrixIndex}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GitWorkbench
                files={files}
                activeFileIndex={activeFileIndex}
                onSelectFile={setActiveFileIndex}
                onUpdateFileContent={handleUpdateFileContent}
                onResetFiles={handleResetFiles}
                onTriggerPipeline={(msg, branch, isPR) => executePipelineRun(msg, branch, isPR)}
                pipelineStatus={pipelineStatus}
                onInjectScenario={handleInjectScenario}
              />
              <TerminalLogs
                jobs={currentRun.jobs}
                activeStepId={activeStepId}
                onSelectStep={setActiveStepId}
                onExplainError={handleExplainErrorWithAI}
                isStreaming={pipelineStatus === 'running'}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Workflow Studio */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <WorkflowEditor
              yamlContent={workflowYaml}
              onChangeYaml={setWorkflowYaml}
              onRunWorkflow={() => executePipelineRun('ci: run updated workflow YAML', 'main')}
              isPipelineRunning={pipelineStatus === 'running'}
            />

            <PipelineVisualizer
              currentRun={currentRun}
              activeStepId={activeStepId}
              onSelectStep={setActiveStepId}
              selectedMatrixIndex={selectedMatrixIndex}
              onSelectMatrixIndex={setSelectedMatrixIndex}
            />
          </div>
        )}

        {/* Tab 4: Break-Fix Troubleshooting Lab */}
        {activeTab === 'troubleshoot' && (
          <TroubleshootingCenter
            onLoadScenario={handleLoadTroubleshootScenario}
            onExplainErrorWithAI={handleExplainErrorWithAI}
          />
        )}

        {/* Tab 5: Architecture & Best Practices */}
        {activeTab === 'architecture' && <RealWorldArchitecture />}

        {/* Tab 6: AI DevOps Assistant */}
        {activeTab === 'ai' && (
          <AIPipelineAssistant
            onApplyGeneratedYaml={yaml => {
              setWorkflowYaml(yaml);
              setActiveTab('workflow');
            }}
            initialErrorLog={initialErrorLogForAI}
          />
        )}

        {/* Tab 7: Knowledge Assessment Quiz */}
        {activeTab === 'quiz' && <QuizView />}
      </main>

      {/* Repository Exporter Modal */}
      <ProjectExporterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        files={files}
        workflowYaml={workflowYaml}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>AutoPipeline • Automated Continuous Integration Platform with GitHub Actions & Git</p>
      </footer>
    </div>
  );
}
