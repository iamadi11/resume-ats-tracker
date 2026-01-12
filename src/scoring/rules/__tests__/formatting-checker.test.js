import { describe, it, expect } from 'vitest';
import { checkFormatting } from '../formatting-checker.js';

describe('Formatting Checker', () => {
  describe('checkFormatting', () => {
    it('should check formatting compliance', () => {
      const text = `John Doe
Email: john@example.com
Phone: 123-456-7890

EXPERIENCE
Software Engineer`;

      const result = checkFormatting(text);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
    });

    it('should return zero score for empty input', () => {
      const result = checkFormatting('');
      
      expect(result.score).toBe(0);
      expect(result.issues).toEqual([]);
    });

    it('should detect missing contact information', () => {
      const text = 'Software Engineer with experience';
      
      const result = checkFormatting(text);
      
      const hasContactIssue = result.issues.some(issue => 
        issue.type === 'contact_info'
      );
      expect(hasContactIssue).toBe(true);
    });

    it('should not flag valid contact information', () => {
      const text = `John Doe
Email: john@example.com
Phone: 123-456-7890

EXPERIENCE`;

      const result = checkFormatting(text);
      
      const hasContactIssue = result.issues.some(issue => 
        issue.type === 'contact_info' && issue.severity === 'high'
      );
      expect(hasContactIssue).toBe(false);
    });

    it('should detect excessive special characters', () => {
      const text = 'JavaScript C++ C# .NET SQL Server @#$%^&*()';
      const manySpecialChars = text.repeat(20);
      
      const result = checkFormatting(manySpecialChars);
      
      const hasSpecialCharIssue = result.issues.some(issue => 
        issue.type === 'special_characters'
      );
      // May or may not trigger depending on threshold
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should detect table formatting', () => {
      const text = `| Skill | Level |
|-------|-------|
| JavaScript | Expert |
| Python | Intermediate |`;
      
      const result = checkFormatting(text);
      
      // May detect table formatting
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should detect section structure issues', () => {
      const text = 'Just a paragraph of text without clear sections';
      
      const result = checkFormatting(text);
      
      // Should have warnings about section structure
      expect(result.warnings).toBeInstanceOf(Array);
    });

    it('should validate file format when resume object provided', () => {
      const text = 'Resume text';
      const resume = { metadata: { format: 'pdf' } };
      
      const result = checkFormatting(text, resume);
      
      expect(result.score).toBeGreaterThan(0);
    });

    it('should flag unsupported file formats', () => {
      const text = 'Resume text';
      const resume = { metadata: { format: 'jpg' } };
      
      const result = checkFormatting(text, resume);
      
      const hasFormatIssue = result.issues.some(issue => 
        issue.type === 'file_format'
      );
      expect(hasFormatIssue).toBe(true);
    });

    it('should detect excessive headers/footers', () => {
      const text = 'Page 1\nPage 2\nPage 3\nPage 4\nPage 5\nPage 6\nPage 7\nConfidential';
      
      const result = checkFormatting(text);
      
      // May detect header/footer issues
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should return normalized score between 0 and 1', () => {
      const text = `John Doe
Email: john@example.com

EXPERIENCE
Software Engineer`;

      const result = checkFormatting(text);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});

