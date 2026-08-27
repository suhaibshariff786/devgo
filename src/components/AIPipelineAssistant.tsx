import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  FileCode, 
  Copy, 
  Wrench, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  GitBranch,
  FolderGit2,
  Search,
  AlertTriangle,
  AlertOctagon,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sliders,
  PlayCircle,
  Layers,
  Star,
  GitFork,
  FileCheck,
  Bug
} from 'lucide-react';
import { explainCiError, generateCustomWorkflow, analyzeGithubRepo } from '../services/geminiService';
import { CodeFile, RepoAnalysisResult } from '../types';

interface AIPipelineAssistantProps {
  onApplyGeneratedYaml: (yaml: string) => void;
  onLoadRepoFiles?: (files: CodeFile[], workflowYaml: string) => void;
  initialErrorLog?: string;
}

export const AIPipelineAssistant: React.FC<AIPipelineAssistantProps> = ({
  onApplyGeneratedYaml,
  onLoadRepoFiles,
  initialErrorLog = ''
}) => {
  const [activeTab, setActiveTab] = React.useState<'repo' | 'diagnose' | 'generate'>('repo');
  
  // Repo Analyzer State
  const [repoUrlInput, setRepoUrlInput] = React.useState('');
  const [branchInput, setBranchInput] = React.useState('');
  const [githubToken, setGithubToken] = React.useState('');
  const [showAdvancedRepoSettings, setShowAdvancedRepoSettings] = React.useState(false);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = React.useState(false);
  const [repoAnalysisError, setRepoAnalysisError] = React.useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = React.useState<RepoAnalysisResult | null>(null);
  const [appliedNotification, setAppliedNotification] = React.useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = React.useState<string | null>(null);

  // Generator State
  const [userPrompt, setUserPrompt] = React.useState('A Node.js 20 React application with ESLint, Vitest, npm dependency caching, and build artifact upload to dist/');
  const [generatedYaml, setGeneratedYaml] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [yamlCopied, setYamlCopied] = React.useState(false);

  // Diagnostic State (Raw Log)
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

  const handleAnalyzeRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrlInput.trim()) return;

    setIsAnalyzingRepo(true);
    setRepoAnalysisError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeGithubRepo(
        repoUrlInput.trim(),
        githubToken.trim() || undefined,
        branchInput.trim() || undefined
      );
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setRepoAnalysisError(err.message || 'Failed to analyze repository. Please check the URL or your network.');
    } finally {
      setIsAnalyzingRepo(false);
    }
  };

  const handleQuickSampleRepo = (url: string) => {
    setRepoUrlInput(url);
    setIsAnalyzingRepo(true);
    setRepoAnalysisError(null);
    setAnalysisResult(null);

    analyzeGithubRepo(url)
      .then(res => setAnalysisResult(res))
      .catch(err => setRepoAnalysisError(err.message || 'Failed to analyze demo repository.'))
      .finally(() => setIsAnalyzingRepo(false));
  };

  const handleLoadIntoStudio = () => {
    if (!analysisResult) return;
    const yaml = analysisResult.recommendedWorkflowYaml || 
      (analysisResult.workflowFiles.length > 0 ? analysisResult.workflowFiles[0].content : '');

    if (onLoadRepoFiles && analysisResult.files && analysisResult.files.length > 0) {
      onLoadRepoFiles(analysisResult.files, yaml);
      setAppliedNotification('Loaded repository files and workflow into Simulator!');
    } else {
      onApplyGeneratedYaml(yaml);
      setAppliedNotification('Applied workflow to Studio!');
    }

    setTimeout(() => setAppliedNotification(null), 3000);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

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
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> AI DevOps Copilot
            </span>
            <span className="text-xs text-slate-400">
              Powered by Gemini & GitHub Actions Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            Automated Repository Bug Analysis & CI/CD Hardening
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Insert your failing GitHub repository link or terminal error logs to diagnose root causes, inspect workflow syntax, and generate one-click bug fixes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('repo')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'repo'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repo Link Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnose')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'diagnose'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Error Log Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'generate'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow Generator</span>
          </button>
        </div>
      </div>

      {appliedNotification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{appliedNotification}</span>
          </div>
        </div>
      )}

      {/* Tab 1: Repository Link Analyzer (NEW) */}
      {activeTab === 'repo' && (
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-400" /> Insert Your Failing GitHub Repository
              </h3>
              <span className="text-xs text-slate-400">
                Supports public repositories, action runs, and custom branches
              </span>
            </div>

            <form onSubmit={handleAnalyzeRepo} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={repoUrlInput}
                    onChange={e => setRepoUrlInput(e.target.value)}
                    placeholder="https://github.com/owner/repo or owner/repo (e.g. facebook/jest, vercel/next.js)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingRepo || !repoUrlInput.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-lg shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition shrink-0"
                >
                  {isAnalyzingRepo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Repo...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Analyze & Fix Repository Bugs
                    </>
                  )}
                </button>
              </div>

              {/* Quick Sample Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Try Sample Repositories:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickSampleRepo('https://github.com/Leleep/buggyGarlic')}
                  className="text-[11px] bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40 transition flex items-center gap-1 font-semibold"
                >
                  <Bug className="w-3 h-3 text-purple-400" /> Leleep/buggyGarlic
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleRepo('https://github.com/facebook/jest')}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition flex items-center gap-1"
                >
                  <GitBranch className="w-3 h-3 text-slate-400" /> facebook/jest
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleRepo('https://github.com/expressjs/express')}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-800 transition flex items-center gap-1"
                >
                  <GitBranch className="w-3 h-3 text-slate-400" /> expressjs/express
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAdvancedRepoSettings(!showAdvancedRepoSettings)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline ml-auto flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  {showAdvancedRepoSettings ? 'Hide Options' : 'Branch / Auth Token Options'}
                </button>
              </div>

              {/* Advanced Settings Drawer */}
              {showAdvancedRepoSettings && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 mt-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Branch Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={branchInput}
                      onChange={e => setBranchInput(e.target.value)}
                      placeholder="e.g. main, master, or fix/ci"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      GitHub Personal Access Token (Optional for Private Repos)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={e => setGithubToken(e.target.value)}
                      placeholder="ghp_... (keeps token local for API requests)"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Loading Indicator */}
          {isAnalyzingRepo && (
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  Inspecting GitHub Repository & Running CI Diagnostics
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Fetching repository tree, evaluating workflow syntax, inspecting dependencies, and discovering bug fixes...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {repoAnalysisError && !isAnalyzingRepo && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-5 text-xs text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Repository Analysis Failed
              </div>
              <p className="text-slate-300">{repoAnalysisError}</p>
              <p className="text-[11px] text-slate-400">
                Make sure the repository exists and is public, or provide a personal access token if it's a private repository.
              </p>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && !isAnalyzingRepo && (
            <div className="space-y-6">
              {/* Overview & Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Repository
                    </span>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-purple-400" />
                      <a
                        href={analysisResult.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-slate-100 hover:text-purple-300 transition flex items-center gap-1 truncate"
                      >
                        {analysisResult.repoFullName}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {analysisResult.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> {analysisResult.stars?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-sky-400" /> {analysisResult.forks?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" /> {analysisResult.detectedStack}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CI Health Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${
                        analysisResult.score >= 80 ? 'text-emerald-400' :
                        analysisResult.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {analysisResult.score}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ 100</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-auto ${
                        analysisResult.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        analysisResult.score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {analysisResult.score >= 80 ? 'Healthy CI' : analysisResult.score >= 50 ? 'Needs Attention' : 'Critical Bugs'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Workflows & Run Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {analysisResult.workflowFiles.length} workflow file(s) found
                      </span>
                    </div>
                    {analysisResult.recentRunDetails && (
                      <p className="text-xs text-slate-300 mt-1.5 bg-slate-950 p-2 rounded border border-slate-800 leading-relaxed font-mono text-[11px]">
                        {analysisResult.recentRunDetails}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center gap-2">
                    <button
                      onClick={handleLoadIntoStudio}
                      className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Load Repo in Simulator
                    </button>
                  </div>
                </div>
              </div>

              {/* Bug List & Suggested Fixes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Detected Issues & Recommended Bug Fixes ({analysisResult.bugs.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    One-click patches and corrections
                  </span>
                </div>

                {analysisResult.bugs.length === 0 ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-6 text-center space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-200">No Critical CI Bugs Detected</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      This repository has a healthy GitHub Actions configuration with proper checkout actions, caching, and script triggers.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {analysisResult.bugs.map((bug, idx) => (
                      <div
                        key={bug.id || idx}
                        className={`bg-slate-900/80 border rounded-xl p-5 space-y-3 transition ${
                          bug.severity === 'critical' ? 'border-rose-800/50 bg-rose-950/10' :
                          bug.severity === 'warning' ? 'border-amber-800/50 bg-amber-950/10' :
                          'border-slate-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              bug.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              bug.severity === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                              {bug.severity}
                            </span>
                            <h4 className="text-sm font-bold text-slate-100">
                              {bug.title}
                            </h4>
                          </div>

                          <span className="text-[11px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            {bug.location}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {bug.description}
                        </p>

                        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> How to Fix:
                            </span>
                            {bug.fixedCodeSnippet && (
                              <button
                                onClick={() => handleCopyText(bug.fixedCodeSnippet!, `snippet-${idx}`)}
                                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 transition"
                              >
                                {copiedSnippetId === `snippet-${idx}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy Fix
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed">
                            {bug.fixDescription}
                          </p>

                          {bug.fixedCodeSnippet && (
                            <pre className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-sky-200 overflow-x-auto whitespace-pre">
                              {bug.fixedCodeSnippet}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hardened Recommended Workflow YAML */}
              {analysisResult.recommendedWorkflowYaml && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      Production Hardened Workflow for {analysisResult.repoFullName}
                    </h4>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(analysisResult.recommendedWorkflowYaml!, 'full-yaml')}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded flex items-center gap-1 transition"
                      >
                        {copiedSnippetId === 'full-yaml' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied YAML
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy YAML
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          onApplyGeneratedYaml(analysisResult.recommendedWorkflowYaml!);
                          setAppliedNotification('Loaded hardened workflow into Workflow Studio!');
                          setTimeout(() => setAppliedNotification(null), 3000);
                        }}
                        className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded flex items-center gap-1 shadow transition"
                      >
                        <ArrowRight className="w-3 h-3" /> Open in Workflow Studio
                      </button>
                    </div>
                  </div>

                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-sky-200 overflow-x-auto whitespace-pre leading-relaxed max-h-80 overflow-y-auto">
                    {analysisResult.recommendedWorkflowYaml}
                  </pre>
                </div>
              )}
            </div>
          )}
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
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-rose-300 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono resize-none leading-relaxed"
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
              <div className="h-48 flex items-center justify-center text-slate-600 italic text-xs bg-slate-950 border border-slate-800 rounded-lg p-4 text-center">
                Paste error logs and click analyze to see root cause diagnosis and fix guidance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Workflow Generator */}
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
                className="w-full h-36 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono resize-none leading-relaxed"
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
                    <ArrowRight className="w-3 h-3" /> Open in Studio
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
    </div>
  );
};
