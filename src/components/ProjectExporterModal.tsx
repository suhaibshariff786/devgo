import React from 'react';
import { 
  X, 
  Download, 
  Copy, 
  FolderArchive, 
  FileCode, 
  CheckCircle2, 
  Terminal, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CodeFile } from '../types';

interface ProjectExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: CodeFile[];
  workflowYaml: string;
}

export const ProjectExporterModal: React.FC<ProjectExporterModalProps> = ({
  isOpen,
  onClose,
  files,
  workflowYaml
}) => {
  const [copiedFile, setCopiedFile] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (path: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadZip = () => {
    // Generate a downloadable shell script / README archive
    const readmeContent = `# Automated CI Pipeline Project
This project contains a complete automated CI pipeline configured with GitHub Actions.

## Setup Instructions
1. Initialize Git repository:
   \`\`\`bash
   git init
   git add .
   git commit -m "feat: initial commit with automated CI"
   \`\`\`

2. Push to GitHub:
   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   \`\`\`

3. Watch your GitHub Actions tab run the pipeline automatically!
`;

    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CI_PROJECT_README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-slate-100">
              Export Ready-to-Use CI Repository
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Copy or download your application files and GitHub Actions workflow to run this automated CI pipeline directly on your real GitHub repository.
          </p>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Repository Structure & Files:
            </h4>

            {/* Workflow File */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="font-mono text-slate-200">.github/workflows/ci.yml</span>
              </div>
              <button
                onClick={() => handleCopy('.github/workflows/ci.yml', workflowYaml)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 flex items-center gap-1 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedFile === '.github/workflows/ci.yml' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Files */}
            {files.map(file => (
              <div key={file.path} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-3">
                  <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-200 truncate">{file.path}</span>
                </div>
                <button
                  onClick={() => handleCopy(file.path, file.content)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 flex items-center gap-1 transition shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFile === file.path ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Quick Terminal Guide */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-sky-400" /> Local Git Commands:
            </span>
            <pre className="bg-black/60 p-2.5 rounded font-mono text-[11px] text-sky-300 leading-relaxed overflow-x-auto">
{`git init
git add .
git commit -m "ci: configure automated build and test pipeline"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Works with GitHub, GitLab, and Bitbucket CI
          </span>
          <button
            onClick={handleDownloadZip}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Download README & Setup
          </button>
        </div>
      </div>
    </div>
  );
};
