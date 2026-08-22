import React from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Send, 
  FileCode, 
  RotateCcw, 
  Bug, 
  CheckCheck, 
  FileCheck2,
  FolderTree,
  Plus,
  Play
} from 'lucide-react';
import { CodeFile, PipelineStatus } from '../types';

interface GitWorkbenchProps {
  files: CodeFile[];
  activeFileIndex: number;
  onSelectFile: (idx: number) => void;
  onUpdateFileContent: (idx: number, newContent: string) => void;
  onResetFiles: () => void;
  onTriggerPipeline: (commitMsg: string, branch: string, isPR?: boolean) => void;
  pipelineStatus: PipelineStatus;
  onInjectScenario?: (type: 'break_test' | 'fix_test' | 'break_syntax' | 'missing_script') => void;
}

export const GitWorkbench: React.FC<GitWorkbenchProps> = ({
  files,
  activeFileIndex,
  onSelectFile,
  onUpdateFileContent,
  onResetFiles,
  onTriggerPipeline,
  pipelineStatus,
  onInjectScenario
}) => {
  const [branch, setBranch] = React.useState('main');
  const [commitMessage, setCommitMessage] = React.useState('feat: update invoice tax logic & add health checks');
  const [isPRMode, setIsPRMode] = React.useState(false);

  const activeFile = files[activeFileIndex] || files[0];

  const handlePush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    onTriggerPipeline(commitMessage, branch, isPRMode);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Git Control Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs">
            <GitBranch className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="bg-transparent text-slate-200 font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="main" className="bg-slate-900">main</option>
              <option value="feature/speedup" className="bg-slate-900">feature/speedup</option>
              <option value="fix/invoice-tax" className="bg-slate-900">fix/invoice-tax</option>
              <option value="refactor/api" className="bg-slate-900">refactor/api</option>
            </select>
          </div>

          <button
            onClick={() => setIsPRMode(!isPRMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              isPRMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Simulate Pull Request trigger"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            {isPRMode ? 'Pull Request (PR #42)' : 'Direct Push'}
          </button>
        </div>

        {/* Quick Scenario Buttons */}
        {onInjectScenario && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 hidden xl:inline">Simulate code changes:</span>
            <button
              onClick={() => onInjectScenario('break_test')}
              className="text-[11px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-1 rounded transition flex items-center gap-1"
              title="Change tax logic to break unit tests"
            >
              <Bug className="w-3 h-3" /> Break Test
            </button>
            <button
              onClick={() => onInjectScenario('fix_test')}
              className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded transition flex items-center gap-1"
              title="Apply correct tax math to pass tests"
            >
              <CheckCheck className="w-3 h-3" /> Fix Code
            </button>
            <button
              onClick={onResetFiles}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition flex items-center gap-1"
              title="Reset repository to initial clean state"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Code Editing Workspace */}
      <div className="flex flex-col md:flex-row flex-1 min-h-[380px]">
        {/* File Explorer Sidebar */}
        <div className="w-full md:w-56 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-2 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-2 mb-2">
            <FolderTree className="w-3.5 h-3.5" /> Repository Files
          </div>
          <div className="space-y-1">
            {files.map((file, idx) => {
              const isSelected = activeFileIndex === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => onSelectFile(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  {file.isModified && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Modified" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="flex-1 flex flex-col bg-slate-950/90 font-mono text-xs">
          <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 text-slate-400 text-xs flex items-center justify-between">
            <span>{activeFile?.path || 'src/app.js'}</span>
            <span className="text-[11px] text-slate-500 uppercase">{activeFile?.language || 'javascript'}</span>
          </div>

          <div className="flex-1 relative p-3">
            <textarea
              value={activeFile?.content || ''}
              onChange={e => onUpdateFileContent(activeFileIndex, e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[280px] bg-transparent text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
              placeholder="// Write your code or tests here..."
            />
          </div>
        </div>
      </div>

      {/* Commit & Push Bottom Bar */}
      <form
        onSubmit={handlePush}
        className="bg-slate-950 p-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
      >
        <div className="flex-1 flex items-center gap-2 w-full">
          <GitCommit className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="Commit message (e.g. 'feat: implement automated CI test')..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={pipelineStatus === 'running'}
          className={`w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
            pipelineStatus === 'running'
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 hover:shadow-sky-500/20 active:scale-95'
          }`}
        >
          {pipelineStatus === 'running' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              Pipeline Running...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Commit & Trigger Pipeline
            </>
          )}
        </button>
      </form>
    </div>
  );
};
