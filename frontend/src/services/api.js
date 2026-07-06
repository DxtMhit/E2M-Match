const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Start the analysis by uploading resume and JD.
 * Returns an EventSource for SSE progress updates.
 */
export function startAnalysis(resumeFile, jdFile, jdText) {
  const formData = new FormData();
  formData.append('resume', resumeFile);

  if (jdFile) {
    formData.append('jd_file', jdFile);
  }
  if (jdText) {
    formData.append('jd_text', jdText);
  }

  // Use fetch with SSE parsing since EventSource doesn't support POST
  return fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Parse SSE events from a ReadableStream response.
 */
export async function* parseSSEStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = null;
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6).trim();
      } else if (line === '' && currentEvent && currentData) {
        try {
          yield { event: currentEvent, data: JSON.parse(currentData) };
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
        currentEvent = null;
        currentData = '';
      }
    }
  }
}

/**
 * Download the analysis report as a ZIP bundle.
 */
export async function downloadReport(resumeFile, jdFile, jdText, analysisResult) {
  const formData = new FormData();
  formData.append('resume', resumeFile);

  if (jdFile) {
    formData.append('jd_file', jdFile);
  }
  if (jdText) {
    formData.append('jd_text', jdText);
  }

  formData.append('analysis_json', JSON.stringify(analysisResult));

  const response = await fetch(`${API_BASE}/api/report/download`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  // Trigger file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition
    ? disposition.split('filename=')[1]?.replace(/"/g, '')
    : 'E2M_Match_Report.zip';

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Check API health.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}
