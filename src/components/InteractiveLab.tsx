import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Award, 
  Lightbulb, 
  Sparkles, 
  Play, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LabModule, CodeFile, PipelineStatus } from '../types';
import { LAB_STEPS } from '../data/labSteps';

interface InteractiveLabProps {
  currentStepIndex: number;
  onSelectStepIndex: (idx: number) => void;
  files: CodeFile[];
  workflowYaml: string;
  onUpdateFileContent: (fileIdx: number, newContent: string) => void;
  onUpdateWorkflow: (yaml: string) => void;
  onRunPipeline: () => void;
  pipelineStatus: PipelineStatus;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({
  currentStepIndex,
  onSelectStepIndex,
  files,
  workflowYaml,
  onUpdateFileContent,
  onUpdateWorkflow,
  onRunPipeline,
  pipelineStatus
}) => {
  const [completedTasks, setCompletedTasks] = React.useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = React.useState<Record<string, boolean>>({});

  const currentModule: LabModule = LAB_STEPS[currentStepIndex] || LAB_STEPS[0];

  // Evaluate task completion against live files & workflow state
  React.useEffect(() => {
    const newCompleted: Record<string, boolean> = { ...completedTasks };

    currentModule.tasks.forEach(task => {
      if (task.verificationType === 'code_contains' && task.targetString) {
        const found = files.some(f => f.content.includes(task.targetString!));
        if (found) newCompleted[task.id] = true;
      } else if (task.verificationType === 'yaml_valid' && task.targetString) {
        if (workflowYaml.includes(task.targetString)) {
          newCompleted[task.id] = true;
        }
      } else if (task.verificationType === 'pipeline_runs' && pipelineStatus === 'success') {
        newCompleted[task.id] = true;
      }
    });

    setCompletedTasks(newCompleted);
  }, [files, workflowYaml, pipelineStatus, currentModule]);

  const handleVerifyStep = () => {
    // Manually trigger verification & confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const isStepComplete = currentModule.tasks.every(t => completedTasks[t.id]);

  return (
    <div className="space-y-6">
      {/* Step Selector Horizontal Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LAB_STEPS.map((step, idx) => {
          const isSelected = currentStepIndex === idx;
          const allTasksDone = step.tasks.every(t => completedTasks[t.id]);
          return (
            <button
              key={step.id}
              onClick={() => onSelectStepIndex(idx)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-500/30 shadow-lg'
                  : allTasksDone
                  ? 'bg-slate-900/60 border-emerald-500/40 hover:border-emerald-400 text-slate-300'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  Step 0{step.stepNumber}
                </span>
                {allTasksDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">{step.title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{step.duration}</span>
                <span>•</span>
                <span className="text-slate-400">{step.difficulty}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Step Detail Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
                Step 0{currentModule.stepNumber} of 04
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Estimated Duration: {currentModule.duration}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {currentModule.title}
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {currentModule.summary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={() => onSelectStepIndex(currentStepIndex - 1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
              </button>
            )}
            {currentStepIndex < LAB_STEPS.length - 1 ? (
              <button
                onClick={() => onSelectStepIndex(currentStepIndex + 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleVerifyStep}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> Complete Full Lab!
              </button>
            )}
          </div>
        </div>

        {/* Theoretical Breakdown & Real-World Note */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" /> Deep Dive Concept & Implementation
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {currentModule.explanation}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Key Learning Objectives:
              </h5>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentModule.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" /> Real-World Impact
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentModule.realWorldImpact}
              </p>
            </div>

            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-xs text-sky-200">
              <span className="font-bold flex items-center gap-1 text-sky-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Fast Feedback
              </span>
              Automating this step eliminates up to 30 minutes of manual verification per pull request.
            </div>
          </div>
        </div>

        {/* Interactive Lab Tasks / Milestones */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" /> Practical Interactive Tasks ({currentModule.tasks.filter(t => completedTasks[t.id]).length}/{currentModule.tasks.length} Done)
            </h3>
            {isStepComplete && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Step Tasks Completed!
              </span>
            )}
          </div>

          <div className="space-y-3">
            {currentModule.tasks.map(task => {
              const isDone = completedTasks[task.id];
              const isHintOpen = showHint[task.id];
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          setCompletedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))
                        }
                        className="mt-0.5 shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 hover:text-sky-400" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <p className={`text-xs font-medium ${isDone ? 'text-emerald-200 line-through' : 'text-slate-200'}`}>
                          {task.instruction}
                        </p>
                        {isHintOpen && (
                          <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded border border-amber-800/40 font-mono">
                            💡 Hint: {task.hint}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowHint(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 shrink-0"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{isHintOpen ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
