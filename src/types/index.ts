export interface JobInfo {
  title: string;
  company: string;
  location?: string;
  domain?: string;
  overview: string;
}

export interface AnalysisScores {
  overallScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  matchSummary: string;
}

export interface KeywordDensityItem {
  keyword: string;
  category: 'technical' | 'soft_skill' | 'qualification' | 'domain';
  jdFrequency: number;
  resumeFrequency: number;
  matched: boolean;
  importance: 'high' | 'medium' | 'low';
  contextNote?: string;
}

export interface MissingSkill {
  name: string;
  category: string;
  whyItMatters: string;
}

export interface MissingExperience {
  requirement: string;
  gap: string;
  suggestion: string;
}

export interface MissingEducation {
  requirement: string;
  status: 'missing' | 'partial' | 'met';
  notes: string;
}

export interface MissingRequirements {
  skills: MissingSkill[];
  experience: MissingExperience[];
  education: MissingEducation[];
}

export interface ActionableSuggestion {
  title: string;
  category: 'Quick Win' | 'Skill Addition' | 'Experience Framing' | 'Formatting & ATS';
  priority: 'high' | 'medium' | 'low';
  advice: string;
  beforeExample?: string;
  afterExample?: string;
}

export interface AnalysisResult {
  jobInfo: JobInfo;
  scores: AnalysisScores;
  keywordDensity: KeywordDensityItem[];
  missingRequirements: MissingRequirements;
  actionableSuggestions: ActionableSuggestion[];
  extractedResumeText?: string;
}

export interface TailoredResumeResult {
  markdown: string;
  plainText: string;
  changesMade: string[];
}

export interface TailoredCoverLetterResult {
  letterText: string;
  subjectLine: string;
  keySellingPoints: string[];
}
