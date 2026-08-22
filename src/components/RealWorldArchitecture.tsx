import React from 'react';
import { 
  Building2, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp, 
  Lock, 
  Cpu, 
  Server,
  Workflow
} from 'lucide-react';

export const RealWorldArchitecture: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> DevOps & Engineering Best Practices
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
            Real-World CI/CD Architecture in Production
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            How modern startups and high-scale enterprise engineering organizations implement automated Continuous Integration pipelines to ship code safely with fast developer feedback loops.
          </p>
        </div>
      </div>

      {/* Two Columns: Startups vs Enterprise Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Startup Pipeline */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Startup & High-Velocity Teams</h3>
              <p className="text-xs text-slate-400">Lean, fast, continuous delivery to staging/prod</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-sky-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Target Pipeline Duration: &lt; 3 Minutes
              </strong>
              <p className="text-slate-400">
                Speed is prioritized so PR authors get immediate green checks without waiting around.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-slate-200">Pipeline Flow:</strong>
              <p className="text-slate-400 font-mono text-[11px]">
                git push ➔ Lint (5s) ➔ Unit Tests (30s) ➔ Fast Build (45s) ➔ Auto-Deploy Staging
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Core Focus:
              </strong>
              <p className="text-slate-400">
                Aggressive dependency caching, small atomic pull requests, automated preview environments (Vercel / Cloud Run).
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Pipeline */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Enterprise & Scaled Organizations</h3>
              <p className="text-xs text-slate-400">Security compliance, matrix testing, multi-service gates</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-indigo-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Security & Compliance Scanning
              </strong>
              <p className="text-slate-400">
                SAST (CodeQL), Dependency vulnerability scanning (Dependabot/Snyk), Secrets scanning.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-slate-200">Pipeline Flow:</strong>
              <p className="text-slate-400 font-mono text-[11px]">
                PR ➔ Lint ➔ Matrix Test (Node 18/20/22) ➔ E2E Cypress ➔ Security Audit ➔ Artifact Promotion
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Strict Branch Protection:
              </strong>
              <p className="text-slate-400">
                Requires 2 senior code reviews, 100% passing status checks, and up-to-date branch with main.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Feedback Loop ROI Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          The Economics of Automated CI: Cost to Fix Defects
        </h3>
        <p className="text-xs text-slate-300">
          The relative cost and time required to fix a software bug escalates exponentially as code moves further through the development lifecycle:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 p-4 rounded-lg border border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">1. Local / CI</span>
            <div className="text-2xl font-black text-emerald-400">1x ($)</div>
            <p className="text-[11px] text-slate-400">Caught in 30s during push. Fixed in 2 minutes.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-sky-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-sky-400">2. Code Review</span>
            <div className="text-2xl font-black text-sky-400">3x ($$)</div>
            <p className="text-[11px] text-slate-400">Reviewer context switch. Delayed PR approval.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400">3. Staging / QA</span>
            <div className="text-2xl font-black text-amber-400">10x ($$$)</div>
            <p className="text-[11px] text-slate-400">QA filing tickets, re-deploying environments.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-rose-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-rose-400">4. Production</span>
            <div className="text-2xl font-black text-rose-400">100x ($$$$)</div>
            <p className="text-[11px] text-slate-400">Outages, rollbacks, customer churn, incident reviews.</p>
          </div>
        </div>
      </div>

      {/* Speed & Optimization Best Practices Checklist */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          5 Pro Tips to Optimize GitHub Actions Speed & Cost
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-slate-100">1. Prefer `npm ci` over `npm install`</strong>
            <p className="text-slate-400">
              `npm ci` bypasses package version resolution, installing exact hashes from `package-lock.json` up to 2x faster.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-slate-100">2. Enable Built-in Action Caching</strong>
            <p className="text-slate-400">
              Use `cache: 'npm'` in `actions/setup-node@v4` or `cache: 'pip'` in `actions/setup-python@v5` to avoid re-downloading packages.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-slate-100">3. Fail Fast with Static Analysis First</strong>
            <p className="text-slate-400">
              Run linters and type checkers first so broken syntax terminates the job in 5 seconds before running 2-minute test suites.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <strong className="text-slate-100">4. Target Specific Path Changes</strong>
            <p className="text-slate-400">
              Use `paths-ignore: ['**.md', 'docs/**']` in your `on.push` trigger so docs updates don't waste CI minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
