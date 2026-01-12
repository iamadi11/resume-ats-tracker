import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';
import { processResumeFile } from '../../processors/file-processor';
import { workerManager } from '../../utils/worker-manager';

// Mock dependencies
vi.mock('../../processors/file-processor');
vi.mock('../../utils/worker-manager');
vi.mock('../../scoring/feedback/feedback-engine', () => ({
  generateFeedback: vi.fn(() => ({
    suggestions: [],
    summary: 'Test feedback',
    bySeverity: { critical: [], warning: [], improvement: [] },
    statistics: { total: 0, critical: 0, warning: 0, improvement: 0 },
  })),
}));

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (workerManager.isAvailable as any) = vi.fn(() => false);
    (workerManager.initialize as any) = vi.fn();
    (workerManager.sendMessage as any) = vi.fn(() => Promise.resolve({
      payload: {
        overallScore: 75,
        breakdown: {
          keywordMatch: { score: 75, weight: 35, weightedScore: 26.25, details: {} },
          skillsAlignment: { score: 80, weight: 25, weightedScore: 20, details: {} },
          formatting: { score: 90, weight: 20, weightedScore: 18, details: {} },
          impactMetrics: { score: 70, weight: 10, weightedScore: 7, details: {} },
          readability: { score: 85, weight: 10, weightedScore: 8.5, details: {} },
        },
        explanation: 'Test explanation',
        recommendations: [],
      },
    }));
  });

  const TestComponent = () => {
    const { state, uploadResume, setJobDescription, calculateScore, clearData } = useApp();
    return (
      <div>
        <div data-testid="resume">{state.resume ? 'Resume loaded' : 'No resume'}</div>
        <div data-testid="job">{state.jobDescription ? 'Job loaded' : 'No job'}</div>
        <div data-testid="score">{state.score ? `Score: ${state.score.overallScore}` : 'No score'}</div>
        <div data-testid="loading">{state.loading ? 'Loading' : 'Not loading'}</div>
        <div data-testid="error">{state.error || 'No error'}</div>
        <button onClick={() => uploadResume(new File(['test'], 'test.pdf', { type: 'application/pdf' }))}>
          Upload
        </button>
        <button onClick={() => setJobDescription('Test job description')}>Set Job</button>
        <button onClick={calculateScore}>Calculate</button>
        <button onClick={clearData}>Clear</button>
      </div>
    );
  };

  it('should provide initial state', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    expect(result.current.state.resume).toBeNull();
    expect(result.current.state.jobDescription).toBeNull();
    expect(result.current.state.score).toBeNull();
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('should upload resume', async () => {
    const mockResume = {
      rawText: 'Test resume text',
      contact: { email: 'test@example.com' },
      experience: [],
      education: [],
      skills: { all: [] },
      metadata: { format: 'pdf' },
    };

    (processResumeFile as any).mockResolvedValue({
      success: true,
      resume: mockResume,
    });

    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.uploadResume(file);
    });

    await waitFor(() => {
      expect(result.current.state.resume).toBeDefined();
      expect(result.current.state.resume?.rawText).toBe('Test resume text');
    });
  });

  it('should handle resume upload error', async () => {
    (processResumeFile as any).mockResolvedValue({
      success: false,
      error: 'Failed to process',
    });

    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.uploadResume(file);
    });

    await waitFor(() => {
      expect(result.current.state.error).toContain('Failed');
    });
  });

  it('should set job description', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    await act(async () => {
      await result.current.setJobDescription('Test job description');
    });

    expect(result.current.state.jobDescription).toBeDefined();
    expect(result.current.state.jobDescription?.text).toBe('Test job description');
  });

  it('should calculate score when both resume and job are set', async () => {
    const mockResume = {
      rawText: 'Test resume text',
      contact: { email: 'test@example.com' },
      experience: [],
      education: [],
      skills: { all: [] },
      metadata: { format: 'pdf' },
    };

    (processResumeFile as any).mockResolvedValue({
      success: true,
      resume: mockResume,
    });

    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.uploadResume(file);
      await result.current.setJobDescription('Test job description');
    });

    await waitFor(() => {
      expect(result.current.state.score).toBeDefined();
      expect(result.current.state.score?.overallScore).toBe(75);
    }, { timeout: 5000 });
  });

  it('should handle calculate score error when missing inputs', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    await act(async () => {
      await result.current.calculateScore();
    });

    expect(result.current.state.error).toContain('required');
  });

  it('should clear data', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider,
    });

    act(() => {
      result.current.clearData();
    });

    expect(result.current.state.resume).toBeNull();
    expect(result.current.state.jobDescription).toBeNull();
    expect(result.current.state.score).toBeNull();
    expect(result.current.state.error).toBeNull();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useApp());
    }).toThrow('useApp must be used within AppProvider');

    consoleSpy.mockRestore();
  });
});

