import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobDescriptionInput from '../resume/JobDescriptionInput';
import { AppProvider } from '../../context/AppContext';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, initial, animate, exit, transition, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('JobDescriptionInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AppProvider>
        <JobDescriptionInput />
      </AppProvider>
    );
  };

  it('should render textarea', () => {
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Paste job description here...');
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    
    await user.type(textarea, 'Software Engineer position');
    
    expect(textarea.value).toBe('Software Engineer position');
  });

  it('should display character count', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    
    await user.type(textarea, 'Software Engineer');
    
    await waitFor(() => {
      expect(screen.getByText(/\d+ characters/i)).toBeInTheDocument();
    });
  });

  it('should show warning for short job description', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    
    await user.type(textarea, 'Short');
    
    await waitFor(() => {
      expect(screen.getByText(/seems too short/i)).toBeInTheDocument();
    });
  });

  it('should handle paste event', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    const longText = 'This is a long job description that should trigger processing when pasted. '.repeat(10);
    
    await user.click(textarea);
    await user.paste(longText);
    
    await waitFor(() => {
      expect(textarea.value.length).toBeGreaterThan(50);
    });
  });

  it('should handle blur event', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    const longText = 'This is a job description that is long enough to be saved when blurred. '.repeat(10);
    
    await user.type(textarea, longText);
    await user.tab(); // Blur the textarea
    
    // Should save the job description
    await waitFor(() => {
      expect(textarea.value.length).toBeGreaterThan(50);
    });
  });

  it('should not save text shorter than 50 characters on blur', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const textarea = screen.getByLabelText(/job description input/i) as HTMLTextAreaElement;
    
    await user.type(textarea, 'Short text');
    await user.tab();
    
    // Should not trigger save
    expect(textarea.value).toBe('Short text');
  });
});

