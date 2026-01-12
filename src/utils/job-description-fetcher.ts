/**
 * Job Description Fetcher
 * 
 * Fetches and parses job descriptions from URLs.
 * Handles various job posting sites.
 */

export interface JobFetchResult {
  success: boolean;
  text?: string;
  title?: string;
  company?: string;
  location?: string;
  error?: string;
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract text content from HTML
 */
function extractTextFromHTML(html: string): string {
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());
  
  // Try to find job description in common selectors
  const selectors = [
    '[data-job-description]',
    '.job-description',
    '.jobDescription',
    '#job-description',
    '[class*="description"]',
    '[id*="description"]',
    'article',
    'main',
    '.content',
    '[role="main"]'
  ];
  
  let content = '';
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      content = element.textContent || element.innerText || '';
      if (content.length > 200) {
        break;
      }
    }
  }
  
  // If no specific content found, get body text
  if (!content || content.length < 200) {
    content = doc.body?.textContent || doc.body?.innerText || '';
  }
  
  // Clean up the text
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Extract job title from HTML
 */
function extractJobTitle(doc: Document): string | undefined {
  const titleSelectors = [
    'h1[data-job-title]',
    '.job-title',
    'h1',
    '[data-testid*="title"]',
    '[class*="title"]'
  ];
  
  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const title = element.textContent?.trim();
      if (title && title.length > 0 && title.length < 200) {
        return title;
      }
    }
  }
  
  return doc.title?.split('|')[0]?.split('-')[0]?.trim();
}

/**
 * Extract company name from HTML
 */
function extractCompany(doc: Document): string | undefined {
  const companySelectors = [
    '[data-company]',
    '.company-name',
    '[class*="company"]',
    '[data-testid*="company"]'
  ];
  
  for (const selector of companySelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const company = element.textContent?.trim();
      if (company && company.length > 0 && company.length < 100) {
        return company;
      }
    }
  }
  
  return undefined;
}

/**
 * Fetch job description from URL
 * 
 * Note: Due to CORS restrictions, this may not work for all sites.
 * For production, consider using a backend proxy or CORS proxy service.
 */
export async function fetchJobDescription(url: string): Promise<JobFetchResult> {
  if (!isValidUrl(url)) {
    return {
      success: false,
      error: 'Invalid URL. Please provide a valid HTTP or HTTPS URL.'
    };
  }

  try {
    // Use a CORS proxy for fetching
    // Most job sites block direct CORS requests, so we use a proxy
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    
    let response: Response;
    try {
      // Try direct fetch first (might work for some sites)
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        mode: 'cors',
      });
      
      // Check if response is actually OK (some sites return 200 but block CORS)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (corsError) {
      // If CORS fails, try with proxy
      console.warn('Direct fetch failed, trying CORS proxy:', corsError);
      try {
        const proxyUrl = corsProxy + encodeURIComponent(url);
        response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
      } catch (proxyError) {
        throw new Error('Failed to fetch through proxy. Please try copying and pasting the job description text directly.');
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch job description: ${response.status} ${response.statusText}`
      };
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const text = extractTextFromHTML(html);
    const title = extractJobTitle(doc);
    const company = extractCompany(doc);

    if (!text || text.length < 100) {
      return {
        success: false,
        error: 'Could not extract sufficient job description text from the URL. The page may require authentication or have a different structure.'
      };
    }

    return {
      success: true,
      text,
      title,
      company
    };

  } catch (error) {
    console.error('[Job Fetcher] Error:', error);
    return {
      success: false,
      error: error instanceof Error 
        ? `Failed to fetch job description: ${error.message}`
        : 'Failed to fetch job description. Please try copying and pasting the job description text directly.'
    };
  }
}

/**
 * Check if input is a URL or plain text
 */
export function isUrl(input: string): boolean {
  return isValidUrl(input.trim());
}

