import React from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  FileCode, 
  Copy, 
  Wrench, 
  Bot, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  Code2
} from 'lucide-react';
import { explainCiError, generateCustomWorkflow } from '../services/geminiService';

interface AIPipelineAssistantProps {
  onApplyGeneratedYaml: (yaml: string) => void;
  initialErrorLog?: string;
}

export const AIPipelineAssistant: React.FC<AIPipelineAssistantProps> = ({
  onApplyGeneratedYaml,
  initialErrorLog = ''
}) => {
  const [activeTab, setActiveTab] = React.useState<'generate' | 'diagnose'>('generate');
  
  // Generator State
  const [userPrompt, setUserPrompt] = React.useState('A Node.js 20 React application with ESLint, Vitest, npm dependency caching, and build artifact upload to dist/');
  const [generatedYaml, setGeneratedYaml] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [yamlCopied, setYamlCopied] = React.useState(false);

  // Diagnostic State
  const [errorInput, setErrorInput] = React.useState(initialErrorLog);
  const [isDiagnosing, setIsDiagnosing] = React.useState(false);
  const [diagnosticResult, setDiagnosticResult] = React.useState<{
    title: string;
    explanation: string;
    suggestedFix: string;
    fixedSnippet?: string;
  } | null>(null);

  React.useEffect(() => {
    if (initialErrorLog) {
      setErrorInput(initialErrorLog);
      setActiveTab('diagnose');
    }
  }, [initialErrorLog]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const yaml = await generateCustomWorkflow(userPrompt);
      setGeneratedYaml(yaml);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorInput.trim()) return;
    setIsDiagnosing(true);
    try {
      const result = await explainCiError(errorInput);
      setDiagnosticResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(generatedYaml);
    setYamlCopied(true);
    setTimeout(() => setYamlCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> AI DevOps Assistant
            </span>
            <span className="text-xs text-slate-400">
              Powered by Gemini
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            Intelligent CI Workflow Generation & Log Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Describe what your web stack needs or paste failing terminal logs to instantly generate hardened CI actions or diagnose root causes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Workflow Generator
          </button>
          <button
            onClick={() => setActiveTab('diagnose')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'diagnose'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Error Log Analyzer
          </button>
        </div>
      </div>

      {/* Tab 1: Workflow Generator */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Describe Your Tech Stack & Requirements
            </h3>

            <form onSubmit={handleGenerate} className="space-y-3">
              <textarea
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono resize-none leading-relaxed"
                placeholder="e.g., Python FastAPI app with PostgreSQL service container, Pytest coverage, and Docker build..."
              />

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Example Prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setUserPrompt('Next.js 14 app with TypeScript, ESLint, Playwright E2E tests, and Vercel preview deployment')
                    }
                    className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800 truncate"
                  >
                    Next.js + Playwright
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setUserPrompt('Python Django microservice with PostgreSQL service container, flake8, pytest, and pip cache')
                    }
                    className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800 truncate"
                  >
                    Django + Postgres
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setUserPrompt('Monorepo with Node 18 & 20 matrix, pnpm workspace caching, and automated Discord notification on fail')
                    }
                    className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800 truncate"
                  >
                    Monorepo Matrix
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-lg shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Workflow with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Production Workflow YAML
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Output */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" /> Generated .github/workflows/ci.yml
              </h4>
              {generatedYaml && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyYaml}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{yamlCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => onApplyGeneratedYaml(generatedYaml)}
                    className="text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 py-1 rounded flex items-center gap-1 shadow transition"
                  >
                    <ArrowRight className="w-3 h-3" /> Load in Studio
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[260px] bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-sky-200 overflow-y-auto whitespace-pre leading-relaxed">
              {generatedYaml || (
                <span className="text-slate-600 italic">
                  Workflow YAML will appear here once generated.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Error Log Diagnoser */}
      {activeTab === 'diagnose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" /> Paste Failing Pipeline Logs
            </h3>

            <form onSubmit={handleDiagnose} className="space-y-3">
              <textarea
                value={errorInput}
                onChange={e => setErrorInput(e.target.value)}
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-rose-300 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono resize-none leading-relaxed"
                placeholder="Paste the raw error message or stack trace from your failing GitHub Actions step..."
              />

              <button
                type="submit"
                disabled={isDiagnosing || !errorInput.trim()}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-lg shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition"
              >
                {isDiagnosing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Diagnosing Error with AI...
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5" />
                    Analyze Root Cause & Fix
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Diagnostic Report */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-400" /> AI Diagnostic Analysis
            </h4>

            {diagnosticResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                  <span className="font-bold text-rose-300 block text-xs mb-1">
                    {diagnosticResult.title}
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {diagnosticResult.explanation}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <span className="font-bold text-emerald-400 uppercase text-[11px] block">
                    Recommended Fix Action:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {diagnosticResult.suggestedFix}
                  </p>
                </div>

                {diagnosticResult.fixedSnippet && (
                  <div className="space-y-1">
                    <span className="font-bold text-sky-400 text-[11px] block">
                      Suggested Code Correction:
                    </span>
                    <pre className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-sky-200 overflow-x-auto">
                      {diagnosticResult.fixedSnippet}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-600 italic text-xs bg-slate-950 border border-slate-800 rounded-lg p-4 text-center">
                Paste error logs and click analyze to see root cause diagnosis and fix guidance.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
