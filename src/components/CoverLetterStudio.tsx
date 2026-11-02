import React, { useState } from 'react';
import { AnalysisResult, TailoredCoverLetterResult } from '../types';
import { downloadTextAsPdf } from '../utils/pdfExport';
import { createGoogleDoc, signInWithGoogle } from '../utils/firebase';
import { User } from 'firebase/auth';
import {
  Mail,
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
  FileUp,
} from 'lucide-react';

interface CoverLetterStudioProps {
  analysis: AnalysisResult;
  candidateResumeText: string;
  jobDescription: string;
  sampleCoverLetter: string;
  setSampleCoverLetter: (val: string) => void;
  user: User | null;
  onUserLoginSuccess: (user: User, token: string) => void;
  onClose: () => void;
}

export const CoverLetterStudio: React.FC<CoverLetterStudioProps> = ({
  analysis,
  candidateResumeText,
  jobDescription,
  sampleCoverLetter,
  setSampleCoverLetter,
  user,
  onUserLoginSuccess,
  onClose,
}) => {
  const { jobInfo } = analysis;

  const [isGenerating, setIsGenerating] = useState(false);
  const [letterData, setLetterData] = useState<TailoredCoverLetterResult | null>(null);
  const [editableLetter, setEditableLetter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  // Export states
  const [isExportingDocs, setIsExportingDocs] = useState(false);
  const [docsUrl, setDocsUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCoverLetter = async () => {
    setIsGenerating(true);
    setExportError(null);
    setDocsUrl(null);

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: candidateResumeText || analysis.extractedResumeText,
          jobDescription,
          jobInfo,
          sampleCoverLetter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tailored cover letter.');
      }

      setLetterData(data);
      setEditableLetter(data.letterText);
      setViewMode('preview');
    } catch (err: any) {
      setExportError(err.message || 'Error generating tailored cover letter.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    const textToDownload = editableLetter || letterData?.letterText || '';
    if (!textToDownload) return;
    const fileName = `${jobInfo.company || 'Tailored'}_Cover_Letter_${jobInfo.title || 'Role'}`.replace(
      /[^\w-]/g,
      '_'
    );
    downloadTextAsPdf(`Cover Letter: ${jobInfo.title} at ${jobInfo.company}`, textToDownload, fileName);
  };

  const handleExportGoogleDocs = async () => {
    const textToExport = editableLetter || letterData?.letterText || '';
    if (!textToExport) return;

    setIsExportingDocs(true);
    setExportError(null);

    try {
      let accessToken = null;

      if (!user) {
        const loginRes = await signInWithGoogle();
        onUserLoginSuccess(loginRes.user, loginRes.accessToken);
        accessToken = loginRes.accessToken;
      }

      const res = await createGoogleDoc(
        accessToken || '',
        `${jobInfo.company} - ${jobInfo.title} - Cover Letter`,
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
    navigator.clipboard.writeText(editableLetter || letterData?.letterText || '');
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
              Cover Letter Studio
            </span>
            <span className="text-xs text-slate-500">
              Targeting: <strong className="text-slate-800">{jobInfo.company}</strong> ({jobInfo.title})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tailored Cover Letter Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Generates a persuasive cover letter tailored to this company and position, adopting your tone and highlighting relevant impact.
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

      {/* Sample Cover Letter Reference Box */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="sample-cover-input" className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <FileUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sample Cover Letter (Optional Reference):</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Helps the AI match your authentic writing style
          </span>
        </div>
        <textarea
          id="sample-cover-input"
          value={sampleCoverLetter}
          onChange={(e) => setSampleCoverLetter(e.target.value)}
          placeholder="Paste an existing cover letter you like to mimic its voice, tone, and personal anecdotes..."
          className="w-full min-h-[90px] p-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      {/* Main Generator CTA or Result */}
      {!letterData ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Generate Company-Specific Cover Letter
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mt-1 mb-6">
            We will craft a personalized cover letter addressed to {jobInfo.company}, aligning your specific achievements with their requirements.
          </p>

          <button
            type="button"
            onClick={handleGenerateCoverLetter}
            disabled={isGenerating}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Writing Tailored Cover Letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Cover Letter for {jobInfo.company}</span>
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
        <div className="space-y-6">
          {/* Key Selling Points & Subject Line */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
            {letterData.subjectLine && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-indigo-900">Recommended Email Subject:</span>
                <span className="bg-white px-2.5 py-1 rounded-md border border-indigo-200 text-slate-800 font-mono">
                  {letterData.subjectLine}
                </span>
              </div>
            )}

            {letterData.keySellingPoints && letterData.keySellingPoints.length > 0 && (
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide block mb-1">
                  Core Highlights Featured:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-indigo-800">
                  {letterData.keySellingPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* View / Edit Mode */}
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
                <span>Letter View</span>
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

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy letter to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
                title="Download as PDF"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportGoogleDocs}
                disabled={isExportingDocs}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs transition-colors"
                title="Export to Google Docs"
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
                onClick={handleGenerateCoverLetter}
                disabled={isGenerating}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white"
                title="Regenerate cover letter"
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
                <span>Cover letter exported to your Google Docs!</span>
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

          {/* View / Edit container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {viewMode === 'edit' ? (
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-2">
                  Edit the cover letter text below:
                </p>
                <textarea
                  value={editableLetter}
                  onChange={(e) => setEditableLetter(e.target.value)}
                  className="w-full min-h-[450px] p-4 text-xs sm:text-sm font-sans text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-slate-50/30"
                />
              </div>
            ) : (
              <div className="p-8 sm:p-12 max-w-3xl mx-auto font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {editableLetter}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
