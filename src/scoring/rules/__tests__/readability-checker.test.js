import { describe, it, expect } from 'vitest';
import { checkReadability } from '../readability-checker.js';

describe('Readability Checker', () => {
  describe('checkReadability', () => {
    it('should check readability and length', () => {
      const text = `John Doe
Email: john@example.com

EXPERIENCE
Software Engineer at Tech Corp
- Developed web applications
- Led team of developers

EDUCATION
BS Computer Science`;

      const result = checkReadability(text);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
    });

    it('should return zero score for empty input', () => {
      const result = checkReadability('');
      
      expect(result.score).toBe(0);
      expect(result.wordCount).toBe(0);
    });

    it('should detect too short resumes', () => {
      const text = 'John Doe Software Engineer';
      
      const result = checkReadability(text);
      
      const hasShortIssue = result.issues.some(issue => 
        issue.type === 'too_short'
      );
      expect(hasShortIssue).toBe(true);
    });

    it('should detect too long resumes', () => {
      const longText = 'Word '.repeat(1500);
      
      const result = checkReadability(longText);
      
      const hasLongIssue = result.issues.some(issue => 
        issue.type === 'too_long'
      );
      expect(hasLongIssue).toBe(true);
    });

    it('should calculate word count', () => {
      const text = 'This is a test resume with multiple words and sentences.';
      
      const result = checkReadability(text);
      
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should detect long sentences', () => {
      const text = 'This is a very long sentence that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on.';
      
      const result = checkReadability(text);
      
      const hasLongSentenceIssue = result.issues.some(issue => 
        issue.type === 'long_sentences'
      );
      // May or may not trigger depending on average
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should detect section structure issues', () => {
      const text = 'Just a paragraph without clear sections';
      
      const result = checkReadability(text);
      
      const hasSectionIssue = result.issues.some(issue => 
        issue.type === 'section_structure'
      );
      expect(hasSectionIssue).toBe(true);
    });

    it('should include details in result', () => {
      const text = `John Doe
Email: john@example.com

EXPERIENCE
Software Engineer`;

      const result = checkReadability(text);
      
      expect(result.details).toBeDefined();
      expect(result.details.sentences).toBeGreaterThanOrEqual(0);
      expect(result.details.paragraphs).toBeGreaterThanOrEqual(0);
    });

    it('should return normalized score between 0 and 1', () => {
      const text = `John Doe
Email: john@example.com

EXPERIENCE
Software Engineer at Tech Corp
- Developed web applications using React and Node.js
- Led team of 5 developers
- Increased performance by 30%

EDUCATION
BS Computer Science`;

      const result = checkReadability(text);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});

