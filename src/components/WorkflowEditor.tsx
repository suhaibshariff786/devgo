import React from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Code2, 
  Cpu, 
  Box, 
  ShieldCheck, 
  Play,
  RotateCcw
} from 'lucide-react';

interface WorkflowEditorProps {
  yamlContent: string;
  onChangeYaml: (newYaml: string) => void;
  onRunWorkflow: () => void;
  isPipelineRunning?: boolean;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  yamlContent,
  onChangeYaml,
  onRunWorkflow,
  isPipelineRunning = false
}) => {
  const [copied, setCopied] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Simple real-time validator for GitHub Actions syntax
  React.useEffect(() => {
    const errors: string[] = [];
    if (!yamlContent.includes('name:')) {
      errors.push('Missing top-level workflow "name:" definition.');
    }
    if (!yamlContent.includes('on:')) {
      errors.push('Missing workflow trigger "on:" event specification (e.g. push, pull_request).');
    }
    if (!yamlContent.includes('jobs:')) {
      errors.push('Missing "jobs:" section containing job definitions.');
    }
    if (!yamlContent.includes('runs-on:')) {
      errors.push('Jobs must specify a runner OS using "runs-on: ubuntu-latest".');
    }
    if (!yamlContent.includes('actions/checkout')) {
      errors.push('Warning: No checkout action found (`actions/checkout@v4`). The runner won\'t have access to repo files.');
    }
    setValidationErrors(errors);
  }, [yamlContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ci.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (snippet: string) => {
    onChangeYaml(yamlContent + '\n\n' + snippet);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-bold text-slate-200">
            .github/workflows/ci.yml
          </span>
          {validationErrors.length === 0 ? (
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Valid Actions YAML
            </span>
          ) : (
            <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {validationErrors.length} Warning(s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied YAML!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={onRunWorkflow}
            disabled={isPipelineRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 text-xs font-bold rounded-lg shadow-lg shadow-sky-500/20 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      {/* Quick Insert Snippet Pills */}
      <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Stage:
        </span>
        <button
          onClick={() =>
            insertSnippet(`    - name: 📦 Cache npm dependencies
      uses: actions/cache@v4
      with:
        path: ~/.npm
        key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          \${{ runner.os }}-node-`)
          }
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-800 shrink-0 transition"
        >
          + npm Cache
        </button>

        <button
          onClick={() =>
            insertSnippet(`    - name: 📊 Upload Code Coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        token: \${{ secrets.CODECOV_TOKEN }}
        files: ./coverage/lcov.info`)
          }
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-800 shrink-0 transition"
        >
          + Code Coverage
        </button>

        <button
          onClick={() =>
            insertSnippet(`    - name: 📤 Upload Build Artifacts
      uses: actions/upload-artifact@v4
      with:
        name: production-build
        path: dist/
        retention-days: 14`)
          }
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-800 shrink-0 transition"
        >
          + Upload Artifact
        </button>

        <button
          onClick={() =>
            insertSnippet(`    - name: 🔔 Slack Notification on Failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: \${{ job.status }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
      env:
        SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}`)
          }
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-800 shrink-0 transition"
        >
          + Slack Alert
        </button>
      </div>

      {/* Editor & Validation Panel */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[380px]">
        <div className="flex-1 p-3 bg-slate-950/90 font-mono text-xs">
          <textarea
            value={yamlContent}
            onChange={e => onChangeYaml(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[320px] bg-transparent text-sky-200 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            placeholder="# Write or paste your .github/workflows/ci.yml configuration here..."
          />
        </div>

        {/* Validation & Actions Info Card */}
        <div className="w-full md:w-72 bg-slate-950/95 border-t md:border-t-0 md:border-l border-slate-800 p-4 space-y-4 text-xs shrink-0">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-sky-400" /> Pipeline Anatomy
            </h4>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <p>
                <strong className="text-slate-200">on:</strong> Defines which GitHub events start the pipeline (push, pull_request, schedule).
              </p>
              <p>
                <strong className="text-slate-200">jobs:</strong> Group of steps running on an isolated virtual environment (`runs-on`).
              </p>
              <p>
                <strong className="text-slate-200">steps:</strong> Individual tasks executed sequentially. Can run shell commands or reusable actions.
              </p>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Workflow Validation:
              </span>
              <ul className="list-disc list-inside text-amber-200/80 text-[11px] space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
