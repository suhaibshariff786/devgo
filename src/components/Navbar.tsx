import React from 'react';
import { 
  Layers, 
  Play, 
  BookOpen, 
  Terminal, 
  FileCode, 
  Bug, 
  Building2, 
  Bot, 
  Award, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown,
  Sparkles,
  GitPullRequest
} from 'lucide-react';
import { PipelineStatus, CIPreset } from '../types';
import { PIPELINE_PRESETS } from '../data/pipelinePresets';

export type ActiveTab = 'lab' | 'simulator' | 'workflow' | 'troubleshoot' | 'architecture' | 'ai' | 'quiz';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedPreset: CIPreset;
  onSelectPreset: (preset: CIPreset) => void;
  pipelineStatus: PipelineStatus;
  onTriggerPipeline: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedPreset,
  onSelectPreset,
  pipelineStatus,
  onTriggerPipeline,
  onOpenExportModal
}) => {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = React.useState(false);

  const getStatusPill = () => {
    switch (pipelineStatus) {
      case 'success':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CI: Passing</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CI: Failed</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-xs font-semibold">
            <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">CI: Running</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CI: Ready</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-[#0B0F19]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Branding & Stack Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-slate-950 font-black text-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                AutoPipeline
                <span className="text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  CI Platform
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Automated Continuous Integration Lab & Simulator
              </p>
            </div>
          </div>

          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition"
            >
              <span className="text-slate-400">Stack:</span>
              <strong className="text-sky-400">{selectedPreset.techStack}</strong>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in">
                {PIPELINE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      setIsPresetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs transition flex items-center justify-between ${
                      selectedPreset.id === preset.id
                        ? 'bg-sky-500/10 text-sky-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-[10px] text-slate-500">{preset.badge}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Status & Global Action */}
        <div className="flex items-center gap-2.5">
          {getStatusPill()}

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition"
            title="Export repository files"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Repo</span>
          </button>

          <button
            onClick={onTriggerPipeline}
            disabled={pipelineStatus === 'running'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 rounded-lg text-xs font-bold shadow-lg shadow-sky-500/20 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1 text-xs">
          <button
            onClick={() => onSelectTab('lab')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'lab'
                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Guided 4-Step Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'simulator'
                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Live CI Simulator</span>
          </button>

          <button
            onClick={() => onSelectTab('workflow')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'workflow'
                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Workflow Studio</span>
          </button>

          <button
            onClick={() => onSelectTab('troubleshoot')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'troubleshoot'
                ? 'bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>4. Break-Fix Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'architecture'
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>5. Architecture & Best Practices</span>
          </button>

          <button
            onClick={() => onSelectTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'ai'
                ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>6. AI DevOps Copilot</span>
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'quiz'
                ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>7. Knowledge Quiz</span>
          </button>
        </div>
      </div>
    </header>
  );
};
