/**
 * Type definitions for the extension
 */

export interface Resume {
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience?: Array<{
    company: string;
    position?: string;
    bullets?: string[];
  }>;
  education?: Array<{
    institution: string;
    degree?: string;
  }>;
  skills?: {
    hard?: string[];
    soft?: string[];
    tools?: string[];
    all?: string[];
  };
  rawText: string;
  metadata?: {
    format?: string;
    parsedAt?: number;
  };
}

export interface JobDescription {
  text: string;
  title?: string;
  company?: string;
  location?: string;
  extractedAt?: number;
}

export interface ScoreBreakdown {
  keywordMatch: {
    score: number;
    weight: number;
    weightedScore: number;
    details: {
      matchedKeywords: number;
      missingKeywords: number;
      similarity: number;
    };
  };
  skillsAlignment: {
    score: number;
    weight: number;
    weightedScore: number;
    details: {
      hardSkills: {
        matched: number;
        missing: number;
        score: number;
      };
      softSkills: {
        matched: number;
        missing: number;
        score: number;
      };
      tools: {
        matched: number;
        missing: number;
        score: number;
      };
    };
  };
  formatting: {
    score: number;
    weight: number;
    weightedScore: number;
    details: {
      issues: number;
      warnings: number;
    };
  };
  impactMetrics: {
    score: number;
    weight: number;
    weightedScore: number;
    details: {
      metricsCount: number;
    };
  };
  readability: {
    score: number;
    weight: number;
    weightedScore: number;
    details: {
      wordCount: number;
      issues: number;
    };
  };
}

export interface ATSResult {
  overallScore: number;
  breakdown: ScoreBreakdown;
  explanation: string;
  recommendations: string[];
}

export interface FeedbackSuggestion {
  category: string;
  severity: 'critical' | 'warning' | 'improvement';
  title: string;
  message: string;
  suggestion: string;
  [key: string]: any;
}

export interface Feedback {
  suggestions: FeedbackSuggestion[];
  summary: string;
  bySeverity: {
    critical: FeedbackSuggestion[];
    warning: FeedbackSuggestion[];
    improvement: FeedbackSuggestion[];
  };
  statistics: {
    total: number;
    critical: number;
    warning: number;
    improvement: number;
  };
}

export interface AnalysisProgress {
  currentStep: string;
  progress: number; // 0-100
  steps: Array<{ label: string; completed: boolean }>;
}

export interface AppState {
  resume: Resume | null;
  jobDescription: JobDescription | null;
  score: ATSResult | null;
  feedback: Feedback | null;
  loading: boolean;
  error: string | null;
  progress: AnalysisProgress | null;
}

