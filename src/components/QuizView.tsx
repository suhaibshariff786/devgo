import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';

export const QuizView: React.FC = () => {
  const [userAnswers, setUserAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    if (score >= QUIZ_QUESTIONS.length * 0.75) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const total = QUIZ_QUESTIONS.length;
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> CI Knowledge Check
            </span>
            <span className="text-xs text-slate-400">
              Test your understanding of CI concepts
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            Continuous Integration Mastery Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Answer the questions below to evaluate your knowledge of YAML workflow definitions, event triggers, and optimization techniques.
          </p>
        </div>

        {submitted ? (
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-right">
              <div className="text-xl font-black text-emerald-400">{score} / {total}</div>
              <div className="text-[11px] text-slate-400">{percentage}% Score</div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Retake Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length === 0}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 text-xs font-bold rounded-lg shadow-lg transition"
          >
            Submit Answers ({Object.keys(userAnswers).length}/{total})
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const selected = userAnswers[q.id];
          const isCorrect = selected === q.correctAnswer;
          return (
            <div
              key={q.id}
              className={`bg-slate-900/70 border rounded-xl p-5 space-y-3 transition-all ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-rose-500/40 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-start gap-2">
                  <span className="text-sky-400 font-mono">0{idx + 1}.</span>
                  <span>{q.question}</span>
                </h4>
                <span className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-400 shrink-0">
                  {q.topic}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isChoice = selected === optIdx;
                  let optStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      optStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium';
                    } else if (isChoice && !isCorrect) {
                      optStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-300';
                    }
                  } else if (isChoice) {
                    optStyle = 'bg-sky-500/10 border-sky-500 text-sky-200 ring-1 ring-sky-500/30';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition ${optStyle}`}
                    >
                      <span className="whitespace-pre-line leading-relaxed">{opt}</span>
                      {submitted && optIdx === q.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {submitted && isChoice && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submit */}
              {submitted && (
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Explanation:
                  </p>
                  <p className="text-slate-400 text-xs">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
