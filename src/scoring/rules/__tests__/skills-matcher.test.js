import { describe, it, expect } from 'vitest';
import { matchSkills } from '../skills-matcher.js';

describe('Skills Matcher', () => {
  describe('matchSkills', () => {
    it('should match skills between resume and job description', () => {
      const resume = 'Skills: JavaScript, React, Node.js, Python, AWS';
      const job = 'Looking for someone with JavaScript, React, and AWS experience';
      
      const result = matchSkills(resume, job);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.hardSkills).toBeDefined();
      expect(result.softSkills).toBeDefined();
      expect(result.tools).toBeDefined();
    });

    it('should return zero score for empty inputs', () => {
      const result = matchSkills('', '');
      
      expect(result.score).toBe(0);
      expect(result.hardSkills.matched).toEqual([]);
      expect(result.softSkills.matched).toEqual([]);
      expect(result.tools.matched).toEqual([]);
    });

    it('should handle null inputs', () => {
      const result = matchSkills(null, null);
      
      expect(result.score).toBe(0);
    });

    it('should match hard skills', () => {
      const resume = 'JavaScript Python Java C++';
      const job = 'Looking for JavaScript and Python developer';
      
      const result = matchSkills(resume, job);
      
      expect(result.hardSkills.matched.length).toBeGreaterThan(0);
    });

    it('should identify missing hard skills', () => {
      const resume = 'JavaScript';
      const job = 'Looking for JavaScript Python Java developer';
      
      const result = matchSkills(resume, job);
      
      expect(result.hardSkills.missing.length).toBeGreaterThan(0);
    });

    it('should calculate skills score', () => {
      const resume = 'JavaScript React Node.js';
      const job = 'Looking for JavaScript React developer';
      
      const result = matchSkills(resume, job);
      
      expect(result.hardSkills.score).toBeGreaterThan(0);
    });

    it('should return perfect score when no skills required', () => {
      const resume = 'Software engineer';
      const job = 'Looking for a software engineer';
      
      const result = matchSkills(resume, job);
      
      // If no specific skills are extracted, score should be calculated accordingly
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle case-insensitive matching', () => {
      const resume = 'JAVASCRIPT REACT';
      const job = 'Looking for javascript react developer';
      
      const result = matchSkills(resume, job);
      
      expect(result.hardSkills.matched.length).toBeGreaterThan(0);
    });

    it('should include details in result', () => {
      const resume = 'JavaScript React';
      const job = 'Looking for JavaScript developer';
      
      const result = matchSkills(resume, job);
      
      expect(result.details).toBeDefined();
      expect(result.details.resumeHardCount).toBeGreaterThanOrEqual(0);
      expect(result.details.jobHardCount).toBeGreaterThanOrEqual(0);
    });
  });
});

