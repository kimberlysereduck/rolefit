import React, { useState, useMemo } from 'react';
import {
  AnalysisResult,
  KeywordDensityItem,
} from '../types';
import { getScoreTier } from '../utils/keywordAnalysis';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  Filter,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  FileEdit,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

interface MatchDashboardProps {
  analysis: AnalysisResult;
  onOpenResumeStudio: () => void;
  onOpenCoverLetterStudio: () => void;
}

export const MatchDashboard: React.FC<MatchDashboardProps> = ({
  analysis,
  onOpenResumeStudio,
  onOpenCoverLetterStudio,
}) => {
  const { jobInfo, scores, keywordDensity, missingRequirements, actionableSuggestions } = analysis;

  const scoreTier = getScoreTier(scores.overallScore);

  // Keyword filter states
  const [keywordSearch, setKeywordSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [matchStatusFilter, setMatchStatusFilter] = useState<'all' | 'matched' | 'missing'>('all');

  // Copy helper
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    return keywordDensity.filter((item) => {
      const matchesSearch =
        item.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(keywordSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus =
        matchStatusFilter === 'all' ||
        (matchStatusFilter === 'matched' && item.matched) ||
        (matchStatusFilter === 'missing' && !item.matched);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [keywordDensity, keywordSearch, categoryFilter, matchStatusFilter]);

  const matchedCount = keywordDensity.filter((k) => k.matched).length;
  const missingCount = keywordDensity.length - matchedCount;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Score Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Target Evaluation
                </span>
                {jobInfo.domain && (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {jobInfo.domain}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {jobInfo.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-800">{jobInfo.company}</span>
                {jobInfo.location && <span>• {jobInfo.location}</span>}
              </p>
            </div>

            {/* Overall Score Dial & Tier */}
            <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 shrink-0">
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      scores.overallScore >= 75
                        ? 'text-emerald-500'
                        : scores.overallScore >= 55
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }
                    strokeDasharray={`${scores.overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-slate-900 leading-none">
                    {scores.overallScore}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">Match</span>
                </div>
              </div>

              <div>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${scoreTier.bgColor} ${scoreTier.color} ${scoreTier.borderColor}`}
                >
                  {scoreTier.label}
                </span>
                <p className="text-xs text-slate-500 mt-1 max-w-[140px]">
                  Based on keyword density, skills & credentials
                </p>
              </div>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">Keyword Density Score</span>
                <span className="text-sm font-bold text-slate-900">{scores.keywordScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scores.keywordScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {matchedCount} of {keywordDensity.length} critical keywords present
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">Experience Alignment</span>
                <span className="text-sm font-bold text-slate-900">{scores.experienceScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scores.experienceScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Seniority, responsibilities & scope alignment
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">Education & Qualifications</span>
                <span className="text-sm font-bold text-slate-900">{scores.educationScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scores.educationScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Degree and certification requirements
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-700 text-sm leading-relaxed">
            <span className="font-semibold text-indigo-900 block mb-0.5">Recruiter Match Summary:</span>
            {scores.matchSummary}
          </div>

          {/* Quick Actions Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Next step: Optimize your profile using the tools below
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenResumeStudio}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <FileEdit className="w-4 h-4" />
                <span>Create Tailored Resume</span>
              </button>
              <button
                type="button"
                onClick={onOpenCoverLetterStudio}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Create Cover Letter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Missing Requirements Breakdown (Requested specifically by user) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Missing Requirements & Gaps</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific qualifications, skills, and background expected by the employer that are not clearly demonstrated
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Missing Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Missing Skills</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                {missingRequirements.skills.length} identified
              </span>
            </div>

            {missingRequirements.skills.length === 0 ? (
              <p className="text-xs text-slate-500 italic my-auto py-4 text-center">
                All key technical and soft skills from the job description are present in your profile!
              </p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {missingRequirements.skills.map((skill, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900">{skill.name}</span>
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {skill.whyItMatters}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Experience */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Experience Alignment</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                {missingRequirements.experience.length} notes
              </span>
            </div>

            {missingRequirements.experience.length === 0 ? (
              <p className="text-xs text-slate-500 italic my-auto py-4 text-center">
                Experience level and scope match the target job description well.
              </p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {missingRequirements.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-900 block mb-1">
                      {exp.requirement}
                    </span>
                    <p className="text-rose-700 text-[11px] mb-1 font-medium">
                      Gap: {exp.gap}
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-medium text-slate-700">How to frame: </span>
                      {exp.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Education & Credentials */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Education & Credentials</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {missingRequirements.education.length} evaluated
              </span>
            </div>

            {missingRequirements.education.length === 0 ? (
              <p className="text-xs text-slate-500 italic my-auto py-4 text-center">
                Education requirements appear fully satisfied.
              </p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {missingRequirements.education.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900">{edu.requirement}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          edu.status === 'met'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : edu.status === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {edu.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{edu.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Keyword Density Dashboard (Requested specifically by user) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Keyword Density & ATS Frequency Analysis
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare exact keyword occurrences between the Job Posting and your Resume
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{matchedCount} Matched</span>
              </span>
              <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>{missingCount} Missing</span>
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3 mt-4">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="Search keywords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {['all', 'technical', 'soft_skill', 'qualification', 'domain'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all'
                    ? 'All'
                    : cat === 'soft_skill'
                    ? 'Soft Skills'
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 ml-auto shrink-0">
              {(['all', 'matched', 'missing'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMatchStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    matchStatusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords Table */}
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Keyword / Requirement</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Importance</th>
                    <th className="py-2.5 px-3 text-center">Job Frequency</th>
                    <th className="py-2.5 px-3 text-center">Resume Frequency</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No keywords matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredKeywords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-slate-900">{item.keyword}</span>
                          {item.contextNote && (
                            <span className="block text-[11px] text-slate-500">{item.contextNote}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                            {item.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              item.importance === 'high'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : item.importance === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.importance}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                          {item.jdFrequency}x
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-medium">
                          {item.resumeFrequency > 0 ? (
                            <span className="text-emerald-700 font-bold">{item.resumeFrequency}x</span>
                          ) : (
                            <span className="text-rose-500">0x</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {item.matched ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Matched</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              <span>Missing</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Suggestions & Concrete Rewrites */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <span>Actionable Profile Optimization Suggestions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Concrete suggestions and rewritten bullet points to boost your ATS match and recruiter interview rate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {actionableSuggestions.map((sug, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {sug.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      sug.priority === 'high'
                        ? 'bg-rose-50 text-rose-700'
                        : sug.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sug.priority} priority
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{sug.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{sug.advice}</p>

                {/* Before & After Rewrite Example */}
                {sug.beforeExample && sug.afterExample && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-200/80">
                    <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 text-[11px]">
                      <span className="font-bold text-rose-800 block mb-0.5">Before (Typical):</span>
                      <span className="text-slate-700 font-mono text-[11px]">{sug.beforeExample}</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px] relative group">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-emerald-800">After (Optimized for Role):</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(sug.afterExample!, idx)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <span className="text-slate-800 font-mono text-[11px]">{sug.afterExample}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
