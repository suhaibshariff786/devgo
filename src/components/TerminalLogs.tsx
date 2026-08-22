import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { PipelineJob, PipelineStatus } from '../types';

interface TerminalLogsProps {
  jobs: PipelineJob[];
  activeStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onExplainError?: (errorLog: string) => void;
  isStreaming?: boolean;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  jobs,
  activeStepId,
  onSelectStep,
  onExplainError,
  isStreaming = false,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedSteps, setExpandedSteps] = React.useState<Record<string, boolean>>({});
  const [copied, setCopied] = React.useState(false);
  const terminalEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-expand active or failed steps
  React.useEffect(() => {
    const newExpanded: Record<string, boolean> = { ...expandedSteps };
    jobs.forEach(job => {
      job.steps.forEach(step => {
        if (step.status === 'running' || step.status === 'failed' || step.id === activeStepId) {
          newExpanded[step.id] = true;
        }
      });
    });
    setExpandedSteps(newExpanded);
  }, [jobs, activeStepId]);

  // Auto-scroll when streaming
  React.useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [jobs, isStreaming]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
    onSelectStep(stepId);
  };

  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'running':
        return (
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
        );
      case 'queued':
        return <Clock className="w-4 h-4 text-slate-500 shrink-0" />;
      default:
        return <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />;
    }
  };

  const handleCopyLogs = () => {
    const allLogs = jobs
      .flatMap(j => j.steps.flatMap(s => [`=== [STEP: ${s.name}] ===`, ...s.logs, '']))
      .join('\n');
    navigator.clipboard.writeText(allLogs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLogLine = (line: string, idx: number) => {
    let colorClass = 'text-slate-300';
    if (line.includes('PASS') || line.includes('✓') || line.includes('success') || line.includes('Successfully')) {
      colorClass = 'text-emerald-400';
    } else if (line.includes('FAIL') || line.includes('✕') || line.includes('error') || line.includes('Error:') || line.includes('Failed')) {
      colorClass = 'text-rose-400 font-semibold';
    } else if (line.includes('WARN') || line.includes('warning')) {
      colorClass = 'text-amber-400';
    } else if (line.startsWith('$') || line.startsWith('>')) {
      colorClass = 'text-sky-400 font-mono';
    } else if (line.startsWith('actions/')) {
      colorClass = 'text-indigo-300';
    }

    return (
      <div key={idx} className={`py-0.5 px-3 hover:bg-slate-800/40 rounded flex items-start font-mono text-xs leading-relaxed ${colorClass}`}>
        <span className="text-slate-600 select-none mr-3 text-right w-7 shrink-0 font-mono">
          {idx + 1}
        </span>
        <span className="break-all whitespace-pre-wrap">{line}</span>
      </div>
    );
  };

  const allSteps = jobs.flatMap(j => j.steps);
  const failedStep = allSteps.find(s => s.status === 'failed');

  return (
    <div className="bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Terminal Header Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-semibold text-slate-300 tracking-wide">
            runner@ubuntu-24.04:~/work/app
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              Live Stream
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-36 sm:w-48 transition-all"
            />
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition"
            title="Copy all logs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Failure Banner if any step failed */}
      {failedStep && onExplainError && (
        <div className="bg-rose-950/40 border-b border-rose-800/40 px-4 py-2 flex items-center justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Step Failed:</strong> {failedStep.name} (Exit code {failedStep.exitCode || 1})
            </span>
          </div>
          <button
            onClick={() => onExplainError(failedStep.logs.join('\n'))}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium px-3 py-1 rounded shadow transition shrink-0 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Diagnose with AI
          </button>
        </div>
      )}

      {/* Log Output Body */}
      <div className="p-3 overflow-y-auto flex-1 font-mono text-xs space-y-2 min-h-[320px]">
        {allSteps.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No active pipeline run logs. Push code to trigger the runner.</p>
          </div>
        ) : (
          allSteps.map(step => {
            const isExpanded = expandedSteps[step.id] ?? (step.status === 'running' || step.status === 'failed');
            const isSelected = activeStepId === step.id;
            const filteredLogs = searchQuery
              ? step.logs.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
              : step.logs;

            return (
              <div
                key={step.id}
                className={`border rounded-lg transition-all ${
                  isSelected
                    ? 'border-sky-500/60 bg-slate-900/50'
                    : step.status === 'failed'
                    ? 'border-rose-900/50 bg-rose-950/10'
                    : 'border-slate-800/70 bg-slate-950/40'
                }`}
              >
                {/* Step Header Accordion */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/30 rounded-t-lg transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    {getStatusIcon(step.status)}
                    <span className="font-semibold text-slate-200 truncate">{step.name}</span>
                    {step.command && (
                      <span className="text-[11px] text-slate-500 font-mono hidden md:inline truncate">
                        `{step.command}`
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0 ml-2">
                    {step.durationMs !== undefined && (
                      <span className="font-mono">{(step.durationMs / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </button>

                {/* Step Logs Content */}
                {isExpanded && (
                  <div className="border-t border-slate-800/60 p-2 bg-black/40 space-y-0.5 rounded-b-lg">
                    {filteredLogs.length === 0 ? (
                      <div className="text-slate-600 italic px-3 py-2">
                        {step.status === 'queued' ? 'Waiting in runner queue...' : 'No output logs recorded.'}
                      </div>
                    ) : (
                      filteredLogs.map((line, idx) => formatLogLine(line, idx))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
