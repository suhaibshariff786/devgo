import React from 'react';
import { 
  Bug, 
  Terminal, 
  CheckCircle2, 
  Wrench, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TroubleshootingChallenge, CodeFile } from '../types';
import { TROUBLESHOOTING_SCENARIOS } from '../data/troubleshootingScenarios';

interface TroubleshootingCenterProps {
  onLoadScenario: (scenario: TroubleshootingChallenge) => void;
  onExplainErrorWithAI: (log: string) => void;
}

export const TroubleshootingCenter: React.FC<TroubleshootingCenterProps> = ({
  onLoadScenario,
  onExplainErrorWithAI
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);

  const currentScenario = TROUBLESHOOTING_SCENARIOS[selectedScenarioIndex];

  const handleApplyScenario = () => {
    onLoadScenario(currentScenario);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Bug className="w-3.5 h-3.5" /> CI Break-Fix Lab
              </span>
              <span className="text-xs text-slate-400">
                Interactive Diagnostic Challenges
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              Diagnose & Fix Real-World Pipeline Failures
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Test your DevOps debugging skills against common failure modes: broken unit test assertions, missing npm scripts, and syntax errors that fail CI runners.
            </p>
          </div>

          <button
            onClick={handleApplyScenario}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <Wrench className="w-4 h-4" /> Load Scenario into Simulator
          </button>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TROUBLESHOOTING_SCENARIOS.map((scenario, idx) => {
          const isSelected = selectedScenarioIndex === idx;
          return (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setShowSolution(false);
              }}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-rose-950/30 border-rose-500/60 ring-2 ring-rose-500/20 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  {scenario.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{scenario.difficulty}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 mb-1">{scenario.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{scenario.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Detailed View */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            {currentScenario.title}
          </h3>
          <p className="text-xs text-slate-300">
            <strong>Symptom:</strong> {currentScenario.realWorldSymptom}
          </p>
        </div>

        {/* Error Terminal Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-rose-400" /> Raw Runner Terminal Output (Exit Code 1)
            </span>
            <button
              onClick={() => onExplainErrorWithAI(currentScenario.errorLogSnippet)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20"
            >
              <Sparkles className="w-3 h-3" /> Explain with AI
            </button>
          </div>

          <div className="bg-black/80 border border-rose-900/50 rounded-lg p-4 font-mono text-xs text-rose-300 leading-relaxed overflow-x-auto whitespace-pre">
            {currentScenario.errorLogSnippet}
          </div>
        </div>

        {/* Hints & Solution Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Investigation Hints
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
              {currentScenario.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solution & Root Cause
              </h4>
              {showSolution ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentScenario.solutionExplanation}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Try solving the issue first! If stuck, reveal the explanation.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded self-start transition"
            >
              {showSolution ? 'Hide Solution' : 'Reveal Solution Explanation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
