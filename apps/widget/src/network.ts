import { buildScreenshotFormData } from './helpers.js';
import type { SubmissionPayload, UploadUrlResponse, WidgetInit } from './types.js';

const DEFAULT_BASE = 'https://api.yourapp.com';

export class FeedbackApiClient {
  private projectKey: string;
  private baseUrl: string;

  constructor(init: WidgetInit) {
    this.projectKey = init.projectKey;
    this.baseUrl = init.apiBaseUrl ?? DEFAULT_BASE;
  }

  async submitFeedback(payload: SubmissionPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-Key': this.projectKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await this.extractError(response);
      throw new Error(message);
    }
  }

  async uploadScreenshot(file: File): Promise<string> {
    const uploadUrl = await this.getUploadUrl(file);
    await this.putFile(uploadUrl.url, file);
    return uploadUrl.publicUrl;
  }

  private async getUploadUrl(file: File): Promise<UploadUrlResponse> {
    const response = await fetch(`${this.baseUrl}/v1/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-Key': this.projectKey,
      },
      body: JSON.stringify({
        kind: 'image',
        contentType: buildScreenshotFormData(file).contentType,
      }),
    });

    if (!response.ok) {
      const message = await this.extractError(response);
      throw new Error(message);
    }
    return (await response.json()) as UploadUrlResponse;
  }

  private async putFile(url: string, file: File): Promise<void> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/png',
      },
      body: file,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to upload screenshot.');
    }
  }

  private async extractError(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (data && typeof data.error === 'string') {
        return data.error;
      }
    } catch (error) {
      // ignore
    }

    const map: Record<string, string> = {
      '400': 'Please check your inputs and try again.',
      '401': 'Project key is invalid.',
      '403': 'Submission blocked. Please try again later.',
      '429': 'Too many submissions. Please slow down.',
      '500': 'Server error. Please try again later.',
    };
    return map[String(response.status)] || 'Unable to submit feedback.';
  }
}
