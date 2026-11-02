import React, { useState } from 'react';
import { AnalysisResult, TailoredResumeResult } from '../types';
import { downloadTextAsPdf } from '../utils/pdfExport';
import { createGoogleDoc, signInWithGoogle } from '../utils/firebase';
import { User } from 'firebase/auth';
import {
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Edit3,
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ResumeStudioProps {
  analysis: AnalysisResult;
  candidateResumeText: string;
  jobDescription: string;
  user: User | null;
  onUserLoginSuccess: (user: User, token: string) => void;
  onClose: () => void;
}

export const ResumeStudio: React.FC<ResumeStudioProps> = ({
  analysis,
  candidateResumeText,
  jobDescription,
  user,
  onUserLoginSuccess,
  onClose,
}) => {
  const { jobInfo, missingRequirements } = analysis;

  // Selected missing skills to incorporate
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    missingRequirements.skills.map((s) => s.name)
  );

  // Resume state
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<TailoredResumeResult | null>(null);
  const [editableText, setEditableText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  // Export states
  const [isExportingDocs, setIsExportingDocs] = useState(false);
  const [docsUrl, setDocsUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setExportError(null);
    setDocsUrl(null);

    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: candidateResumeText || analysis.extractedResumeText,
          jobDescription,
          jobInfo,
          missingSkillsToIncorporate: selectedSkills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tailored resume.');
      }

      setResumeData(data);
      setEditableText(data.plainText || data.markdown);
      setViewMode('preview');
    } catch (err: any) {
      setExportError(err.message || 'Error creating tailored resume.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    const textToDownload = editableText || resumeData?.plainText || '';
    if (!textToDownload) return;
    const fileName = `${jobInfo.company || 'Tailored'}_Resume_${jobInfo.title || 'Role'}`.replace(
      /[^\w-]/g,
      '_'
    );
    downloadTextAsPdf(`Tailored Resume: ${jobInfo.title}`, textToDownload, fileName);
  };

  const handleExportGoogleDocs = async () => {
    const textToExport = editableText || resumeData?.plainText || '';
    if (!textToExport) return;

    setIsExportingDocs(true);
    setExportError(null);

    try {
      let accessToken = null;

      // If user not signed in with Google, trigger sign in
      if (!user) {
        const loginRes = await signInWithGoogle();
        onUserLoginSuccess(loginRes.user, loginRes.accessToken);
        accessToken = loginRes.accessToken;
      }

      // If already signed in, check cached token or prompt sign in
      const res = await createGoogleDoc(
        accessToken || '',
        `${jobInfo.company} - ${jobInfo.title} - Tailored Resume`,
        textToExport
      );

      setDocsUrl(res.url);
    } catch (err: any) {
      console.error('Google Docs export error:', err);
      setExportError(
        err.message ||
          'Failed to export to Google Docs. Please make sure Google account popups are allowed or sign in again.'
      );
    } finally {
      setIsExportingDocs(false);
    }
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(editableText || resumeData?.plainText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Resume Studio
            </span>
            <span className="text-xs text-slate-500">
              Targeting: <strong className="text-slate-800">{jobInfo.title}</strong> at{' '}
              <strong className="text-slate-800">{jobInfo.company}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create an Updated, Tailored Resume
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Naturally integrates target keywords, frames experience around employer requirements, and exports to PDF or Google Docs.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-start sm:self-center text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Missing Skills Selector (Optional customization) */}
      {missingRequirements.skills.length > 0 && !resumeData && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select missing skills to weave into the optimized resume:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingRequirements.skills.map((skill, idx) => {
              const isSelected = selectedSkills.includes(skill.name);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSkill(skill.name)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* If Not Generated Yet -> Big CTA */}
      {!resumeData ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Generate Your Tailored Resume
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mt-1 mb-6">
            We will rewrite your executive summary, align your bullet points with the job's key technical requirements, and format the structure cleanly for ATS systems.
          </p>

          <button
            type="button"
            onClick={handleGenerateResume}
            disabled={isGenerating}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Optimized Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Tailored Resume Now</span>
              </>
            )}
          </button>

          {exportError && (
            <p className="text-xs text-rose-600 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{exportError}</span>
            </p>
          )}
        </div>
      ) : (
        /* Resume Generated: View/Edit & Export Toolbar */
        <div className="space-y-6">
          {/* Changes Made Highlight Box */}
          {resumeData.changesMade && resumeData.changesMade.length > 0 && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strategic Enhancements Made for This Role:</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-emerald-800">
                {resumeData.changesMade.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* View / Edit Mode Switcher */}
            <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'edit'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Text</span>
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy entire resume text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
                title="Download clean ATS PDF document"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportGoogleDocs}
                disabled={isExportingDocs}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors"
                title="Create Google Doc in your Google Drive"
              >
                {isExportingDocs ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export to Google Docs</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGenerateResume}
                disabled={isGenerating}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white"
                title="Regenerate resume"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Docs Success Link */}
          {docsUrl && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Document successfully created in your Google Docs!</span>
              </div>
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
              >
                <span>Open in Google Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {exportError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Editor / Preview Area */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            {viewMode === 'edit' ? (
              <div className="p-4 bg-white">
                <p className="text-xs text-slate-500 mb-2">
                  Edit your resume content below. Any changes here will be reflected when you download as PDF or export to Google Docs:
                </p>
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full min-h-[500px] p-4 text-xs sm:text-sm font-mono text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-slate-50/30"
                />
              </div>
            ) : (
              <div className="p-6 sm:p-8 bg-white max-w-4xl mx-auto shadow-2xs font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {editableText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
