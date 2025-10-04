import { createHash } from './polyfills.js';
import type {
  AttachmentPayload,
  SubmissionContext,
  SubmissionPayload,
  SubmitState,
  WidgetState,
} from './types.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function deriveContext(win: Window): SubmissionContext {
  return {
    pageUrl: win.location?.href ?? '',
    referrer: win.document?.referrer ?? '',
    ua: win.navigator?.userAgent ?? '',
    locale: win.navigator?.language ?? 'en',
    viewport: {
      w: win.innerWidth || win.document?.documentElement?.clientWidth || 0,
      h: win.innerHeight || win.document?.documentElement?.clientHeight || 0,
    },
  };
}

export function buildSubmission(state: WidgetState, context: SubmissionContext): SubmissionPayload {
  const { submit, profileHash, tags, captcha } = state;
  const title = submit.title.trim();
  const body = submit.details?.trim() || undefined;
  const includeUser = Boolean(submit.includeUser);
  const email = submit.email?.trim();
  const attachments: AttachmentPayload[] | undefined = submit.screenshot?.publicUrl
    ? [{ kind: 'screenshot', url: submit.screenshot.publicUrl }]
    : undefined;

  if (!title) {
    throw new Error('Title is required.');
  }
  if (title.length > 120) {
    throw new Error('Title must be 120 characters or fewer.');
  }
  if (body && body.length > 2000) {
    throw new Error('Details must be 2000 characters or fewer.');
  }
  if (includeUser && email && !EMAIL_REGEX.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  const payload: SubmissionPayload = {
    title,
    body,
    includeUser: includeUser || undefined,
    tags: [...tags],
    context,
    attachments,
  };

  if (includeUser && email) {
    payload.email = email;
  }
  if (profileHash) {
    payload.profileHash = profileHash;
  }
  if (submit.captchaToken && captcha) {
    payload.captcha = { provider: captcha.provider, token: submit.captchaToken };
  }

  return payload;
}

export async function hashIdentity(input: { email?: string; name?: string; userId?: string }): Promise<string> {
  const normalized = JSON.stringify({
    email: input.email?.trim().toLowerCase() || undefined,
    name: input.name?.trim() || undefined,
    userId: input.userId?.trim() || undefined,
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const digest = await createHash(data);
  return digest;
}

export function fingerprintAnon(win: Window): string | undefined {
  try {
    const storageKey = 'fbw_profile';
    const existing = win.localStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }
    const random = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const fingerprint = random;
    win.localStorage.setItem(storageKey, fingerprint);
    return fingerprint;
  } catch (error) {
    console.warn('[FBW] Unable to access storage for fingerprint.', error);
    return undefined;
  }
}

export function buildScreenshotFormData(file: File): { contentType: string } {
  return { contentType: file.type || 'image/png' };
}

export function assertWindow(): Window {
  if (typeof window === 'undefined') {
    throw new Error('Feedback widget requires a browser environment.');
  }
  return window;
}
