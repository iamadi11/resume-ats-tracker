import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreMeter from '../scoring/ScoreMeter';
import { ScoreBreakdown } from '../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, initial, animate, exit, transition, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ initial, animate, transition, ...props }: any) => <circle {...props} />,
  },
}));

describe('ScoreMeter', () => {
  const mockBreakdown: ScoreBreakdown = {
    keywordMatch: {
      score: 75,
      weight: 35,
      weightedScore: 26.25,
      details: {
        matchedKeywords: 10,
        missingKeywords: 5,
        similarity: 0.8,
      },
    },
    skillsAlignment: {
      score: 80,
      weight: 25,
      weightedScore: 20,
      details: {
        hardSkills: { matched: 8, missing: 2, score: 80 },
        softSkills: { matched: 5, missing: 1, score: 83 },
        tools: { matched: 6, missing: 1, score: 86 },
      },
    },
    formatting: {
      score: 90,
      weight: 20,
      weightedScore: 18,
      details: {
        issues: 0,
        warnings: 1,
      },
    },
    impactMetrics: {
      score: 70,
      weight: 10,
      weightedScore: 7,
      details: {
        metricsCount: 5,
      },
    },
    readability: {
      score: 85,
      weight: 10,
      weightedScore: 8.5,
      details: {
        wordCount: 500,
        issues: 0,
      },
    },
  };

  it('should render score meter', () => {
    render(<ScoreMeter score={75} breakdown={mockBreakdown} />);
    
    expect(screen.getByText(/ATS Compatibility Score/i)).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should display score label based on score range', () => {
    const { rerender } = render(<ScoreMeter score={85} breakdown={mockBreakdown} />);
    expect(screen.getByText(/Excellent/i)).toBeInTheDocument();
    
    rerender(<ScoreMeter score={65} breakdown={mockBreakdown} />);
    expect(screen.getByText(/Good/i)).toBeInTheDocument();
    
    rerender(<ScoreMeter score={45} breakdown={mockBreakdown} />);
    expect(screen.getByText(/Fair/i)).toBeInTheDocument();
    
    rerender(<ScoreMeter score={35} breakdown={mockBreakdown} />);
    expect(screen.getByText(/Needs Improvement/i)).toBeInTheDocument();
  });

  it('should render score breakdown items', () => {
    render(<ScoreMeter score={75} breakdown={mockBreakdown} />);
    
    expect(screen.getByText(/Keyword Match/i)).toBeInTheDocument();
    expect(screen.getByText(/Skills Alignment/i)).toBeInTheDocument();
    expect(screen.getByText(/Formatting/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact & Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Readability/i)).toBeInTheDocument();
  });

  it('should display keyword match details', () => {
    render(<ScoreMeter score={75} breakdown={mockBreakdown} />);
    
    expect(screen.getByText(/10 matched, 5 missing/i)).toBeInTheDocument();
  });

  it('should display skills alignment details', () => {
    render(<ScoreMeter score={75} breakdown={mockBreakdown} />);
    
    expect(screen.getByText(/Hard:/i)).toBeInTheDocument();
    expect(screen.getByText(/Soft:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tools:/i)).toBeInTheDocument();
  });

  it('should handle invalid breakdown gracefully', () => {
    const invalidBreakdown = {} as ScoreBreakdown;
    
    render(<ScoreMeter score={75} breakdown={invalidBreakdown} />);
    
    expect(screen.getByText(/Score breakdown is not available/i)).toBeInTheDocument();
  });

  it('should round score display', () => {
    render(<ScoreMeter score={75.7} breakdown={mockBreakdown} />);
    
    expect(screen.getByText('76')).toBeInTheDocument();
  });
});

