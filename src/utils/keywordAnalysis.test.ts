import { describe, expect, it } from 'vitest';
import {
  normalizeText,
  countOccurrences,
  calculateKeywordDensity,
  computeMatchScore,
  getScoreTier
} from './keywordAnalysis';

describe('keyword analysis', () => {
  it('normalizes text by stripping punctuation and lowercasing it', () => {
    const input = 'Senior React.js & TypeScript Engineer, with CI/CD experience!';
    const expected = 'senior react.js typescript engineer with ci cd experience';
    expect(normalizeText(input)).toBe(expected);
  });

  it('returns an empty string when normalizing empty input', () => {
    expect(normalizeText('')).toBe('');
  });

  it('counts exact word and phrase occurrences', () => {
    const text = 'We need a React developer proficient in React and React Native with TypeScript.';
    expect(countOccurrences(text, 'React')).toBe(3);
    expect(countOccurrences(text, 'TypeScript')).toBe(1);
    expect(countOccurrences(text, 'Python')).toBe(0);
    expect(countOccurrences(text, 'React Native')).toBe(1);
  });

  it('returns zero for empty inputs or keywords without searchable characters', () => {
    expect(countOccurrences('', 'React')).toBe(0);
    expect(countOccurrences('React', '')).toBe(0);
    expect(countOccurrences('React', '!!!')).toBe(0);
  });

  it('calculates keyword density as a percentage of the total words', () => {
    const text = 'React developer building React applications with React tools';
    expect(calculateKeywordDensity(text, 'React')).toBe(37.5);
    expect(calculateKeywordDensity('React Native developer', 'React Native')).toBeCloseTo(66.67);
  });

  it('returns zero density for empty text, empty keyword, or text without words', () => {
    expect(calculateKeywordDensity('', 'React')).toBe(0);
    expect(calculateKeywordDensity('React', '')).toBe(0);
    expect(calculateKeywordDensity('!!!', 'React')).toBe(0);
  });

  it('computes a weighted score for high, medium, and low importance keywords', () => {
    const items: Array<{ matched: boolean; importance: 'high' | 'medium' | 'low' }> = [
      { matched: true, importance: 'high' },
      { matched: true, importance: 'high' },
      { matched: false, importance: 'high' },
      { matched: true, importance: 'medium' },
      { matched: false, importance: 'low' },
    ];
    expect(computeMatchScore(items)).toBe(67);
  });

  it('returns zero when there are no keywords to score', () => {
    expect(computeMatchScore([])).toBe(0);
  });

  it('classifies scores at each match tier boundary', () => {
    expect(getScoreTier(85).label).toBe('Exceptional Match');
    expect(getScoreTier(70).label).toBe('Strong Match');
    expect(getScoreTier(50).label).toBe('Moderate Match');
    expect(getScoreTier(49).label).toBe('Needs Optimization');
  });
});
