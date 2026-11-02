/**
 * Pure utility functions for keyword density, frequency extraction, and match score computation.
 */

export interface KeywordItem {
  keyword: string;
  category: 'technical' | 'soft_skill' | 'qualification' | 'domain';
  jdFrequency: number;
  resumeFrequency: number;
  matched: boolean;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Normalizes text for keyword matching: lowercase, removes punctuation.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  // Keep technical letters, numbers, and symbols like +, #, but strip sentence delimiters
  return text
    .toLowerCase()
    .replace(/[,;!?()\[\]"']/g, ' ')
    // Replace dots that are sentence-ending (followed by space or end of line)
    .replace(/\.(?=\s|$)/g, ' ')
    // Strip other unwanted non-word chars except # and +
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Counts exact or word-boundary occurrences of a keyword or phrase in normalized text.
 */
export function countOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return 0;

  // Escape special regex characters
  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use lookbehind and lookahead so delimiter whitespace is not consumed
  const regex = new RegExp(`(?<=^|\\s)${escaped}(?=\\s|$)`, 'gi');
  const matches = normalizedText.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Calculates keyword density as a percentage of total words in the text.
 */
export function calculateKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const words = normalizeText(text).split(' ').filter(Boolean);
  if (words.length === 0) return 0;

  const count = countOccurrences(text, keyword);
  const keywordWordCount = normalizeText(keyword).split(' ').filter(Boolean).length || 1;
  const percentage = (count * keywordWordCount / words.length) * 100;
  return Math.round(percentage * 100) / 100;
}

/**
 * Computes weighted match score from keyword metrics.
 * High importance = 3x weight, Medium = 2x weight, Low = 1x weight.
 */
export function computeMatchScore(keywords: Array<{ matched: boolean; importance: 'high' | 'medium' | 'low' }>): number {
  if (!keywords || keywords.length === 0) return 0;

  let totalWeight = 0;
  let matchedWeight = 0;

  const weights: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  for (const item of keywords) {
    const weight = weights[item.importance] || 1;
    totalWeight += weight;
    if (item.matched) {
      matchedWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((matchedWeight / totalWeight) * 100);
}

/**
 * Categorizes a match percentage into a qualitative tier.
 */
export function getScoreTier(score: number): {
  label: 'Exceptional Match' | 'Strong Match' | 'Moderate Match' | 'Needs Optimization';
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (score >= 85) {
    return {
      label: 'Exceptional Match',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    };
  }
  if (score >= 70) {
    return {
      label: 'Strong Match',
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate Match',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    };
  }
  return {
    label: 'Needs Optimization',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  };
}
