/**
 * AutoPipeline - Automated CI Pipeline Platform Types
 */

export type PipelineStatus = 'idle' | 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

export interface PipelineStep {
  id: string;
  name: string;
  command?: string;
  uses?: string;
  with?: Record<string, any>;
  status: PipelineStatus;
  durationMs?: number;
  logs: string[];
  exitCode?: number;
  error?: string;
}

export interface PipelineJob {
  id: string;
  name: string;
  runsOn: string;
  matrix?: {
    nodeVersion?: string[];
    pythonVersion?: string[];
    os?: string[];
  };
  currentMatrixVariation?: string;
  status: PipelineStatus;
  durationMs?: number;
  steps: PipelineStep[];
}

export interface PipelineRun {
  id: string;
  workflowName: string;
  triggerEvent: 'push' | 'pull_request' | 'workflow_dispatch' | 'schedule';
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  avatarUrl?: string;
  startedAt: string;
  completedAt?: string;
  status: PipelineStatus;
  jobs: PipelineJob[];
  totalDurationMs?: number;
  artifactUrl?: string;
}

export interface CodeFile {
  name: string;
  path: string;
  language: 'javascript' | 'typescript' | 'json' | 'yaml' | 'python' | 'markdown' | 'shell';
  content: string;
  isModified?: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  branch: string;
  author: string;
  time: string;
  status: PipelineStatus;
  changedFiles: string[];
}

export interface CIPreset {
  id: string;
  name: string;
  badge: string;
  techStack: 'Node.js' | 'Python' | 'React' | 'Docker' | 'Next.js';
  description: string;
  stars: number;
  workflowYaml: string;
  files: CodeFile[];
  testFile: string;
  appFile: string;
}

export interface LabModule {
  id: string;
  stepNumber: number;
  title: string;
  duration: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  summary: string;
  explanation: string;
  learningObjectives: string[];
  realWorldImpact: string;
  tasks: {
    id: string;
    instruction: string;
    hint: string;
    completed: boolean;
    verificationType: 'code_contains' | 'pipeline_runs' | 'test_passes' | 'yaml_valid';
    targetString?: string;
  }[];
  starterFiles: CodeFile[];
  defaultWorkflow: string;
}

export interface TroubleshootingChallenge {
  id: string;
  title: string;
  category: 'Syntax Error' | 'Failed Test' | 'Dependency Issue' | 'Node Version' | 'Missing Script';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  realWorldSymptom: string;
  errorLogSnippet: string;
  hints: string[];
  initialFiles: CodeFile[];
  initialWorkflow: string;
  solutionExplanation: string;
}

export interface QuizItem {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: 'Basics' | 'Triggers' | 'Jobs & Steps' | 'Caching' | 'Security';
}
