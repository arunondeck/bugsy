export type ThemeOption = 'light' | 'dark' | 'auto';
export type PositionOption = 'left' | 'right';

export interface WidgetInit {
  projectKey: string;
  theme?: ThemeOption;
  position?: PositionOption;
  apiBaseUrl?: string;
  captcha?: CaptchaConfig;
}

export interface CaptchaConfig {
  provider: 'turnstile' | 'hcaptcha';
  siteKey: string;
}

export interface WidgetRuntimeApi {
  open(): void;
  close(): void;
  identify(input: IdentifyInput): Promise<void>;
  setTags(tags: string[]): void;
}

export interface IdentifyInput {
  email?: string;
  name?: string;
  userId?: string;
}

export interface SubmitState {
  title: string;
  details?: string;
  email?: string;
  includeUser: boolean;
  includeScreenshot: boolean;
  uploading: boolean;
  submitting: boolean;
  error?: string;
  captchaToken?: string;
  screenshot?: ScreenshotState;
}

export interface ScreenshotState {
  file?: File;
  publicUrl?: string;
}

export interface WidgetState {
  open: boolean;
  submit: SubmitState;
  profileHash?: string;
  tags: string[];
  captcha?: CaptchaConfig;
}

export type WidgetAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SUBMIT_UPDATE'; payload: Partial<SubmitState> }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_OK'; payload: { publicUrl: string } }
  | { type: 'UPLOAD_ERR'; payload: { error: string } }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_OK' }
  | { type: 'SUBMIT_ERR'; payload: { error: string } }
  | { type: 'IDENTIFY_SET'; payload?: { profileHash?: string } }
  | { type: 'SET_TAGS'; payload: string[] };

export interface SubmissionContext {
  pageUrl: string;
  referrer: string;
  ua: string;
  locale: string;
  viewport: { w: number; h: number };
}

export interface SubmissionPayload {
  title: string;
  body?: string;
  email?: string;
  profileHash?: string;
  includeUser?: boolean;
  tags: string[];
  context: SubmissionContext;
  attachments?: AttachmentPayload[];
  captcha?: { provider: CaptchaConfig['provider']; token: string };
}

export interface AttachmentPayload {
  kind: 'screenshot';
  url: string;
}

export interface UploadUrlResponse {
  url: string;
  publicUrl: string;
}
