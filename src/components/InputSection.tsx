import React, { useState, useRef } from 'react';
import {
  Link as LinkIcon,
  FileText,
  Upload,
  FileUp,
  X,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface InputSectionProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  resumeText: string;
  setResumeText: (val: string) => void;
  resumePdf: { name: string; size: number; base64: string } | null;
  setResumePdf: (val: { name: string; size: number; base64: string } | null) => void;
  sampleCoverLetter: string;
  setSampleCoverLetter: (val: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
}

export const InputSection: React.FC<InputSectionProps> = ({
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  resumePdf,
  setResumePdf,
  sampleCoverLetter,
  setSampleCoverLetter,
  onAnalyze,
  isAnalyzing,
  errorMessage,
}) => {
  // Mode toggles
  const [jobMode, setJobMode] = useState<'text' | 'url'>('text');
  const [resumeMode, setResumeMode] = useState<'upload' | 'text'>('text');
  const [showCoverLetterInput, setShowCoverLetterInput] = useState<boolean>(false);

  // URL extraction state
  const [jobUrl, setJobUrl] = useState<string>('');
  const [isExtractingUrl, setIsExtractingUrl] = useState<boolean>(false);
  const [urlExtractSuccess, setUrlExtractSuccess] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchUrl = async () => {
    if (!jobUrl || !jobUrl.trim()) {
      setUrlError('Please enter a valid URL.');
      return;
    }
    setUrlError(null);
    setUrlExtractSuccess(null);
    setIsExtractingUrl(true);

    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch job posting from URL.');
      }

      setJobDescription(data.description || '');
      setUrlExtractSuccess(`Extracted: ${data.jobTitle} at ${data.companyName}`);
    } catch (err: any) {
      setUrlError(err.message || 'Error fetching URL. You can paste the job description text directly.');
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setResumePdf({
        name: file.name,
        size: file.size,
        base64: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  const canAnalyze =
    jobDescription.trim().length > 30 &&
    (resumeMode === 'upload' ? !!resumePdf : resumeText.trim().length > 30);

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Target Job Description */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>1. Target Job Description</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste the job requirements or fetch directly from a job board URL
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setJobMode('text')}
                className={`px-3 py-1 rounded-md transition-all ${
                  jobMode === 'text'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setJobMode('url')}
                className={`px-3 py-1 rounded-md transition-all ${
                  jobMode === 'url'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enter URL
              </button>
            </div>
          </div>

          {jobMode === 'url' ? (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <label htmlFor="job-url-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Job Posting URL (LinkedIn, Indeed, Greenhouse, Lever, etc.)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="job-url-input"
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://company.careers/job/12345"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFetchUrl();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={isExtractingUrl || !jobUrl.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isExtractingUrl ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <span>Fetch Job</span>
                    )}
                  </button>
                </div>

                {urlError && (
                  <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlError}</span>
                  </p>
                )}

                {urlExtractSuccess && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{urlExtractSuccess}</span>
                  </p>
                )}
              </div>

              <div className="mt-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Extracted Job Text</span>
                  {jobDescription && <span>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>}
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Fetched text will appear here. You can also edit it directly..."
                  className="w-full flex-1 min-h-[220px] p-3 text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-y bg-slate-50/30"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Paste complete job requirements, role responsibilities & tech stack</span>
                {jobDescription && <span>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>}
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g., We are looking for a Senior Software Engineer with 5+ years experience in React, TypeScript, and AWS to architect high-scale systems..."
                className="w-full flex-1 min-h-[260px] p-3 text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y bg-slate-50/30"
              />
            </div>
          )}
        </div>

        {/* Right Card: Your Resume */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>2. Your Resume</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your resume PDF directly or paste plain text
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setResumeMode('upload')}
                className={`px-3 py-1 rounded-md transition-all ${
                  resumeMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('text')}
                className={`px-3 py-1 rounded-md transition-all ${
                  resumeMode === 'text'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {resumeMode === 'upload' ? (
            <div className="flex-1 flex flex-col justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {resumePdf ? (
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-5 flex flex-col items-center justify-center text-center my-auto">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 max-w-[280px] truncate">
                    {resumePdf.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {(resumePdf.size / 1024).toFixed(1)} KB • PDF Ready for Analysis
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumePdf(null)}
                      className="px-3 py-1.5 bg-white text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/40 hover:bg-indigo-50/20 my-auto"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:bg-indigo-100">
                    <Upload className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Click to browse or drop your resume PDF here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF format up to 25MB
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mt-4 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100">
                    <FileUp className="w-3.5 h-3.5" />
                    Select PDF
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Paste your full resume text (Work experience, skills, education)</span>
                {resumeText && <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>}
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="e.g., Alex Morgan - Senior Software Engineer. Experience: Spearheaded React frontend architecture for 40k daily users..."
                className="w-full flex-1 min-h-[260px] p-3 text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y bg-slate-50/30"
              />
            </div>
          )}
        </div>
      </div>

      {/* Optional: Sample Cover Letter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <button
          type="button"
          onClick={() => setShowCoverLetterInput(!showCoverLetterInput)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              3. Sample Cover Letter <span className="text-xs font-normal text-slate-500">(Optional)</span>
            </span>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
              Used to match your writing voice
            </span>
          </div>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-800">
            {showCoverLetterInput ? 'Hide Section' : 'Add Cover Letter Sample +'}
          </span>
        </button>

        {showCoverLetterInput && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">
              If you have a past cover letter you like, paste it below. When creating a new tailored cover letter, the AI will maintain your authentic voice, phrasing, and style.
            </p>
            <textarea
              value={sampleCoverLetter}
              onChange={(e) => setSampleCoverLetter(e.target.value)}
              placeholder="Paste your past cover letter here..."
              className="w-full min-h-[140px] p-3 text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y bg-slate-50/30"
            />
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>
            {canAnalyze
              ? 'Ready to evaluate match score and keyword density.'
              : 'Please enter a Job Description and provide your Resume to run the analysis.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Keywords & Match...</span>
            </>
          ) : (
            <>
              <span>Analyze Match & Keyword Density</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
