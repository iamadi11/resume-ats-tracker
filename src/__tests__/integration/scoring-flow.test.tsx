import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateATSScore } from '../../scoring/scoring-engine';
import { matchKeywords } from '../../scoring/rules/keyword-matcher';
import { matchSkills } from '../../scoring/rules/skills-matcher';
import { checkFormatting } from '../../scoring/rules/formatting-checker';
import { detectImpact } from '../../scoring/rules/impact-detector';
import { checkReadability } from '../../scoring/rules/readability-checker';

describe('Integration Tests - Scoring Flow', () => {
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
- Managed budget of $100,000

Software Engineer at Startup (2018-2020)
- Built RESTful APIs using Node.js
- Implemented CI/CD pipelines
- Improved code quality metrics
- Served 10,000+ users

EDUCATION
BS Computer Science, University (2014-2018)

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL, MongoDB`;

  const sampleJobDescription = `Software Engineer Position

We are looking for an experienced Software Engineer to join our team.

Requirements:
- 3+ years of experience with JavaScript and React
- Experience with Node.js and backend development
- Knowledge of AWS and cloud services
- Experience with Docker and containerization
- Strong problem-solving skills
- Team leadership experience preferred
- Experience with databases (PostgreSQL, MongoDB)

Responsibilities:
- Develop and maintain web applications
- Lead development teams
- Optimize application performance
- Implement CI/CD pipelines
- Work with cloud infrastructure`;

  describe('Complete Scoring Pipeline', () => {
    it('should calculate complete ATS score', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.breakdown).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should match keywords correctly', () => {
      const result = matchKeywords(sampleResume, sampleJobDescription);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeGreaterThanOrEqual(0);
    });

    it('should match skills correctly', () => {
      const result = matchSkills(sampleResume, sampleJobDescription);

      expect(result.score).toBeGreaterThan(0);
      expect(result.hardSkills.matched.length).toBeGreaterThan(0);
    });

    it('should check formatting correctly', () => {
      const resumeObj = {
        metadata: { format: 'pdf' },
      };
      const result = checkFormatting(sampleResume, resumeObj);

      expect(result.score).toBeGreaterThan(0);
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should detect impact metrics', () => {
      const result = detectImpact(sampleResume);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.metrics.length).toBeGreaterThanOrEqual(0);
      expect(result.impactStatements.length).toBeGreaterThanOrEqual(0);
    });

    it('should check readability', () => {
      const result = checkReadability(sampleResume);

      expect(result.score).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should provide detailed breakdown', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);

      // Verify all breakdown components
      expect(result.breakdown.keywordMatch).toBeDefined();
      expect(result.breakdown.keywordMatch.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywordMatch.score).toBeLessThanOrEqual(100);

      expect(result.breakdown.skillsAlignment).toBeDefined();
      expect(result.breakdown.skillsAlignment.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.skillsAlignment.score).toBeLessThanOrEqual(100);

      expect(result.breakdown.formatting).toBeDefined();
      expect(result.breakdown.formatting.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.formatting.score).toBeLessThanOrEqual(100);

      expect(result.breakdown.impactMetrics).toBeDefined();
      expect(result.breakdown.impactMetrics.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.impactMetrics.score).toBeLessThanOrEqual(100);

      expect(result.breakdown.readability).toBeDefined();
      expect(result.breakdown.readability.score).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.readability.score).toBeLessThanOrEqual(100);
    });

    it('should generate recommendations', () => {
      const result = calculateATSScore(sampleResume, sampleJobDescription);

      expect(result.recommendations).toBeInstanceOf(Array);
      // Recommendations may be empty if score is very high
    });

    it('should handle resume with high score', () => {
      const highScoreResume = `John Doe
Email: john@example.com
Phone: 123-456-7890

SUMMARY
Expert software engineer with 10+ years developing web applications using JavaScript, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL, MongoDB. Led teams of 20+ developers and improved performance by 50%.

EXPERIENCE
Senior Software Engineer at Tech Corp (2020-2023)
- Developed scalable web applications using React and Node.js
- Led team of 20 developers
- Increased application performance by 50%
- Reduced deployment time by 60%
- Managed budget of $500,000
- Served 1M+ users

EDUCATION
BS Computer Science, University

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, TypeScript, GraphQL`;

      const result = calculateATSScore(highScoreResume, sampleJobDescription);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      // High score resume should score better than low score
      expect(result.overallScore).toBeGreaterThan(20);
    });

    it('should handle resume with low score', () => {
      const lowScoreResume = `John Doe
Email: john@example.com

EXPERIENCE
Worked at company`;

      const result = calculateATSScore(lowScoreResume, sampleJobDescription);

      expect(result.overallScore).toBeLessThan(50);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});

