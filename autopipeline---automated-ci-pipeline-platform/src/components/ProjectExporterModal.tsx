import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  FolderArchive, 
  FileCode, 
  CheckCircle2, 
  Terminal, 
  ExternalLink,
  Sparkles,
  Loader2,
  Package
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isDownloadingFullApp, setIsDownloadingFullApp] = useState(false);
  const [isDownloadingPresetZip, setIsDownloadingPresetZip] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (path: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Download entire full-stack project source code ZIP
  const handleDownloadFullProjectZip = async () => {
    setIsDownloadingFullApp(true);
    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      saveAs(blob, 'autopipeline-ci-project.zip');
    } catch (err) {
      console.error('Failed to download server ZIP, fallback to direct anchor:', err);
      const a = document.createElement('a');
      a.href = '/api/download-zip';
      a.download = 'autopipeline-ci-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloadingFullApp(false);
    }
  };

  // Download curated active preset files & CI workflow as a ZIP
  const handleDownloadPresetZip = async () => {
    setIsDownloadingPresetZip(true);
    try {
      const zip = new JSZip();

      // Add workflow
      zip.file('.github/workflows/ci.yml', workflowYaml);

      // Add project files
      files.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add README
      const readmeContent = `# Automated CI Pipeline Project
This repository is configured with an automated Continuous Integration pipeline using GitHub Actions.

## Project Structure
- \`.github/workflows/ci.yml\` - Automated CI Pipeline
${files.map(f => `- \`${f.path}\``).join('\n')}

## Getting Started
\`\`\`bash
# 1. Initialize git
git init
git add .
git commit -m "feat: setup automated CI pipeline"

# 2. Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
\`\`\`
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'ci-repository-starter.zip');
    } catch (err) {
      console.error('Failed to build client ZIP:', err);
    } finally {
      setIsDownloadingPresetZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderArchive className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Export Project & CI Repository (.zip)
              </h3>
              <p className="text-[11px] text-slate-400">
                Download the complete codebase or curated CI workflow files
              </p>
            </div>
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
          {/* Quick ZIP Download Banner */}
          <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-sky-200 flex items-center gap-1.5 text-sm">
                <Package className="w-4 h-4 text-sky-400" /> Complete App Source Code (.zip)
              </div>
              <p className="text-slate-300 text-[11px]">
                Exports the entire full-stack application (server, UI, pipelines & AI engine) in a single zip archive.
              </p>
            </div>
            <button
              onClick={handleDownloadFullProjectZip}
              disabled={isDownloadingFullApp}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-lg shadow-lg shadow-sky-500/20 flex items-center gap-1.5 transition shrink-0"
            >
              {isDownloadingFullApp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download Project .zip</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Curated Pipeline Files:
              </h4>
              <button
                onClick={handleDownloadPresetZip}
                disabled={isDownloadingPresetZip}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                {isDownloadingPresetZip ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Download Pipeline Files (.zip)</span>
              </button>
            </div>

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
            Exports fully self-contained Node.js & Vite workspace
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={handleDownloadFullProjectZip}
              disabled={isDownloadingFullApp}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Download Complete ZIP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

