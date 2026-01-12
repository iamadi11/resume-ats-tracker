import { describe, it, expect } from 'vitest';
import { calculateATSScore, getWeightJustification } from '../scoring-engine.js';

describe('Scoring Engine', () => {
  const sampleResume = `John Doe
Email: john@example.com
Phone: 123-456-7890

SUMMARY
Experienced software engineer with 5+ years developing web applications using JavaScript, React, and Node.js. Led teams and improved performance by 30%.

EXPERIENCE
Senior Software Engineer at Tech Corp (2020-2023)
- Developed scalable web applications using React and Node.js
- Led team of 5 developers
- Increased application performance by 30%
- Reduced deployment time by 50%

Software Engineer at Startup (2018-2020)
- Built RESTful APIs using Node.js
- Implemented CI/CD pipelines
- Improved code quality metrics

EDUCATION
BS Computer Science, University (2014-2018)

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL`;

  const sampleJobDescription = `Software Engineer Position

We are looking for an experienced Software Engineer to join our team.

Requirements:
- 3+ years of experience with JavaScript and React
- Experience with Node.js and backend development
- Knowledge of AWS and cloud services
- Experience with Docker and containerization
- Strong problem-solving skills
- Team leadership experience preferred

Responsibilities:
- Develop and maintain web applications
- Lead development teams
- Optimize application performance
- Implement CI/CD pipelines`;

  describe('calculateATSScore', () => {
    it('should calculate score with valid inputs', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should return valid breakdown structure', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.keywordMatch).toBeDefined();
      expect(result.breakdown.skillsAlignment).toBeDefined();
      expect(result.breakdown.formatting).toBeDefined();
      expect(result.breakdown.impactMetrics).toBeDefined();
      expect(result.breakdown.readability).toBeDefined();
    });

    it('should handle empty resume text', () => {
      const result = calculateATSScore('', sampleJobDescription);
      
      expect(result.overallScore).toBe(0);
      expect(result.explanation).toContain('Missing');
    });

    it('should handle empty job description', () => {
      const result = calculateATSScore(sampleResume, '');
      
      expect(result.overallScore).toBe(0);
      expect(result.explanation).toContain('Missing');
    });

    it('should handle null inputs', () => {
      const result = calculateATSScore(null, null);
      
      expect(result.overallScore).toBe(0);
      expect(result.breakdown).toBeDefined();
    });

    it('should calculate weighted scores correctly', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      const expectedWeighted = 
        result.breakdown.keywordMatch.weightedScore +
        result.breakdown.skillsAlignment.weightedScore +
        result.breakdown.formatting.weightedScore +
        result.breakdown.impactMetrics.weightedScore +
        result.breakdown.readability.weightedScore;
      
      // Allow small floating point differences
      expect(Math.abs(result.overallScore - expectedWeighted)).toBeLessThan(0.01);
    });

    it('should include keyword match details', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.keywordMatch.details.matchedKeywords).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywordMatch.details.missingKeywords).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywordMatch.details.similarity).toBeGreaterThanOrEqual(0);
    });

    it('should include skills alignment details', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.skillsAlignment.details.hardSkills).toBeDefined();
      expect(result.breakdown.skillsAlignment.details.softSkills).toBeDefined();
      expect(result.breakdown.skillsAlignment.details.tools).toBeDefined();
    });

    it('should include formatting details', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.formatting.details.issues).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.formatting.details.warnings).toBeGreaterThanOrEqual(0);
    });

    it('should include impact metrics details', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.impactMetrics.details.metricsCount).toBeGreaterThanOrEqual(0);
    });

    it('should include readability details', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.breakdown.readability.details.wordCount).toBeGreaterThan(0);
      expect(result.breakdown.readability.details.issues).toBeGreaterThanOrEqual(0);
    });

    it('should generate recommendations', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.recommendations).toBeInstanceOf(Array);
      // Recommendations may be empty if score is high
    });

    it('should handle very long text', () => {
      const longResume = sampleResume.repeat(10);
      const longJob = sampleJobDescription.repeat(10);
      
      const result = calculateATSScore(longResume, longJob);
      
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should handle special characters', () => {
      const specialResume = `John Doe
Email: john@example.com
Skills: C++, C#, .NET, SQL Server`;

      const result = calculateATSScore(specialResume, sampleJobDescription);
      
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return raw scores', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);
      
      expect(result.rawScores).toBeDefined();
      expect(result.rawScores.keywordMatch).toBeGreaterThanOrEqual(0);
      expect(result.rawScores.keywordMatch).toBeLessThanOrEqual(1);
    });
  });

  describe('getWeightJustification', () => {
    it('should return weight justifications', () => {
      const justification = getWeightJustification();
      
      expect(justification).toBeDefined();
      expect(justification.keywordMatch).toBeDefined();
      expect(justification.skillsAlignment).toBeDefined();
      expect(justification.formatting).toBeDefined();
      expect(justification.impactMetrics).toBeDefined();
      expect(justification.readability).toBeDefined();
    });

    it('should include weight and percentage for each category', () => {
      const justification = getWeightJustification();
      
      expect(justification.keywordMatch.weight).toBe(0.35);
      expect(justification.keywordMatch.percentage).toBe(35);
      expect(justification.keywordMatch.justification).toBeDefined();
    });
  });
});

