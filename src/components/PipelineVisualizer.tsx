import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  GitCommit, 
  Layers, 
  Box, 
  Server, 
  FileCode, 
  Download, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PipelineJob, PipelineRun, PipelineStatus, PipelineStep } from '../types';

interface PipelineVisualizerProps {
  currentRun: PipelineRun;
  activeStepId: string | null;
  onSelectStep: (stepId: string) => void;
  selectedMatrixIndex?: number;
  onSelectMatrixIndex?: (idx: number) => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  currentRun,
  activeStepId,
  onSelectStep,
  selectedMatrixIndex = 0,
  onSelectMatrixIndex
}) => {
  const activeJob = currentRun.jobs[selectedMatrixIndex] || currentRun.jobs[0];

  const getStatusBadge = (status: PipelineStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> In Progress
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Queued
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            Idle
          </span>
        );
    }
  };

  const getStepNodeStyle = (step: PipelineStep, isSelected: boolean) => {
    if (isSelected) {
      return 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/50 shadow-lg shadow-sky-500/10';
    }
    switch (step.status) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/90 hover:border-emerald-400/80 text-slate-200';
      case 'failed':
        return 'border-rose-500/60 bg-rose-950/20 hover:border-rose-400 text-rose-200';
      case 'running':
        return 'border-sky-500 bg-slate-900 glow-active text-slate-100';
      case 'queued':
        return 'border-slate-800 bg-slate-950/60 text-slate-400 opacity-80';
      default:
        return 'border-slate-800 bg-slate-950/40 text-slate-500';
    }
  };

  const calculateTotalDuration = () => {
    if (!activeJob) return '0s';
    const totalMs = activeJob.steps.reduce((sum, s) => sum + (s.durationMs || 0), 0);
    return `${(totalMs / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Workflow Run Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              {currentRun.workflowName}
            </h3>
            {getStatusBadge(currentRun.status)}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5 text-slate-400" />
              branch: <strong className="text-slate-200 font-semibold">{currentRun.branch}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-400">
              commit: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">{currentRun.commitHash}</code>
            </span>
            <span>•</span>
            <span className="text-slate-300 truncate max-w-xs">"{currentRun.commitMessage}"</span>
          </div>
        </div>

        {/* Matrix Selector */}
        {currentRun.jobs.length > 1 && onSelectMatrixIndex && (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-lg">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Matrix:
            </span>
            {currentRun.jobs.map((job, idx) => (
              <button
                key={job.id}
                onClick={() => onSelectMatrixIndex(idx)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                  selectedMatrixIndex === idx
                    ? 'bg-sky-500 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {job.currentMatrixVariation || job.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Runner Context Bar */}
      <div className="py-3 px-3.5 my-4 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Runner: <strong>{activeJob?.runsOn || 'ubuntu-latest'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Total Duration: <strong>{calculateTotalDuration()}</strong></span>
          </div>
        </div>

        {currentRun.artifactUrl && (
          <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/30">
            <Download className="w-3.5 h-3.5" />
            <span>Artifact: <strong>web-production-bundle.zip (1.2 MB)</strong></span>
          </div>
        )}
      </div>

      {/* Stage Graph Nodes */}
      <div className="relative pt-2 pb-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Execution Graph ({activeJob?.steps.length || 0} Steps)</span>
          <span className="text-[11px] text-slate-500 normal-case">Click any step to inspect terminal logs</span>
        </div>

        {/* Horizontal Node Flow Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {activeJob?.steps.map((step, idx) => {
            const isSelected = activeStepId === step.id;
            return (
              <div key={step.id} className="relative group">
                <button
                  onClick={() => onSelectStep(step.id)}
                  className={`w-full h-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getStepNodeStyle(
                    step,
                    isSelected
                  )}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                      Step {idx + 1}
                    </span>
                    {step.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {step.status === 'failed' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    {step.status === 'running' && (
                      <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    {step.status === 'queued' && <Clock className="w-4 h-4 text-slate-600 shrink-0" />}
                  </div>

                  <div className="space-y-1 my-1">
                    <h4 className="text-xs font-bold leading-tight line-clamp-2">{step.name}</h4>
                    {step.command ? (
                      <p className="text-[10px] text-slate-400 font-mono truncate">{step.command}</p>
                    ) : step.uses ? (
                      <p className="text-[10px] text-indigo-300 font-mono truncate">{step.uses}</p>
                    ) : null}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : '--'}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500">{step.status}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
