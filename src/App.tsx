/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, signInWithGoogle, logOutGoogle } from './utils/firebase';
import { Navbar } from './components/Navbar';
import { InputSection } from './components/InputSection';
import { MatchDashboard } from './components/MatchDashboard';
import { ResumeStudio } from './components/ResumeStudio';
import { CoverLetterStudio } from './components/CoverLetterStudio';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME, SAMPLE_COVER_LETTER } from './data/sampleData';
import { AnalysisResult } from './types';
import { FileCheck, Sparkles, ArrowLeft, Layers, FileEdit, Mail } from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Form input states
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [resumePdf, setResumePdf] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [sampleCoverLetter, setSampleCoverLetter] = useState<string>('');

  // Analysis status & results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Active view tab: 'input' | 'match' | 'resume-studio' | 'cover-letter-studio'
  const [activeTab, setActiveTab] = useState<'match' | 'resume-studio' | 'cover-letter-studio'>('match');

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) setAuthToken(token);
      },
      () => {
        setUser(null);
        setAuthToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await signInWithGoogle();
      setUser(res.user);
      setAuthToken(res.accessToken);
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Could not sign in with Google: ' + (err.message || 'Please check popup settings.'));
    }
  };

  const handleLogout = async () => {
    await logOutGoogle();
    setUser(null);
    setAuthToken(null);
  };

  const handleLoadSample = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setResumeText(SAMPLE_RESUME);
    setResumePdf(null);
    setSampleCoverLetter(SAMPLE_COVER_LETTER);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setJobDescription('');
    setResumeText('');
    setResumePdf(null);
    setSampleCoverLetter('');
    setAnalysis(null);
    setErrorMessage(null);
    setActiveTab('match');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        jobDescription: jobDescription.trim(),
        resume: {},
      };

      if (resumePdf) {
        payload.resume = {
          pdfBase64: resumePdf.base64,
          fileName: resumePdf.name,
        };
      } else {
        payload.resume = {
          text: resumeText.trim(),
        };
      }

      if (sampleCoverLetter.trim()) {
        payload.sampleCoverLetter = {
          text: sampleCoverLetter.trim(),
        };
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete analysis.');
      }

      setAnalysis(data.analysis);
      setActiveTab('match');

      // Smooth scroll down to results
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while analyzing the job match.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section if no analysis yet */}
        {!analysis && (
          <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Resume & Job Description Matcher</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Know exactly how well your resume matches any job
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
              Calculate ATS keyword density scores, pinpoint missing requirements and skill gaps, and export optimized resumes and tailored cover letters directly to PDF or Google Docs.
            </p>
          </div>
        )}

        {/* Input Card Section */}
        <section aria-label="Job and Resume Inputs">
          <InputSection
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumePdf={resumePdf}
            setResumePdf={setResumePdf}
            sampleCoverLetter={sampleCoverLetter}
            setSampleCoverLetter={setSampleCoverLetter}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            errorMessage={errorMessage}
          />
        </section>

        {/* Analysis Results View */}
        {analysis && (
          <section className="space-y-6 pt-4 border-t border-slate-200" aria-label="Analysis Results">
            {/* Navigation Tabs for Analysis / Resume Studio / Cover Letter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('match')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'match'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Match Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('resume-studio')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'resume-studio'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileEdit className="w-4 h-4 text-indigo-600" />
                  <span>Tailored Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cover-letter-studio')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'cover-letter-studio'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Tailored Cover Letter</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust Inputs</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'match' && (
              <MatchDashboard
                analysis={analysis}
                onOpenResumeStudio={() => setActiveTab('resume-studio')}
                onOpenCoverLetterStudio={() => setActiveTab('cover-letter-studio')}
              />
            )}

            {activeTab === 'resume-studio' && (
              <ResumeStudio
                analysis={analysis}
                candidateResumeText={resumeText || analysis.extractedResumeText || ''}
                jobDescription={jobDescription}
                user={user}
                onUserLoginSuccess={(u, t) => {
                  setUser(u);
                  setAuthToken(t);
                }}
                onClose={() => setActiveTab('match')}
              />
            )}

            {activeTab === 'cover-letter-studio' && (
              <CoverLetterStudio
                analysis={analysis}
                candidateResumeText={resumeText || analysis.extractedResumeText || ''}
                jobDescription={jobDescription}
                sampleCoverLetter={sampleCoverLetter}
                setSampleCoverLetter={setSampleCoverLetter}
                user={user}
                onUserLoginSuccess={(u, t) => {
                  setUser(u);
                  setAuthToken(t);
                }}
                onClose={() => setActiveTab('match')}
              />
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>RoleFit ATS & Profile Optimizer</span>
          </div>
          <p>
            Supports PDF upload, URL job scraping, keyword density breakdown, and direct export to Google Docs & PDF.
          </p>
        </div>
      </footer>
    </div>
  );
}
