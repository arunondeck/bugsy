import { assertWindow, fingerprintAnon, hashIdentity } from './helpers.js';
import { startConsoleCapture } from './diagnostics.js';
import { FeedbackApiClient } from './network.js';
import { createInitialState, widgetReducer } from './state.js';
import { WidgetView } from './ui.js';
import type { IdentifyInput, SubmissionPayload, WidgetInit, WidgetRuntimeApi, WidgetState } from './types.js';

function ensureStylesheet() {
  if (typeof document === 'undefined') {
    return;
  }
  const href = new URL('./styles.css', import.meta.url).toString();
  const marker = `fbw-styles-${href}`;
  if (document.querySelector(`link[data-fbw-styles="${marker}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.fbwStyles = marker;
  document.head.appendChild(link);
}

class WidgetController implements WidgetRuntimeApi {
  private init: WidgetInit;
  private state: WidgetState;
  private api: FeedbackApiClient;
  private view: WidgetView;

  constructor(init: WidgetInit) {
    const win = assertWindow();
    const anon = fingerprintAnon(win);
    this.init = init;
    this.api = new FeedbackApiClient(init);
    this.state = createInitialState(init, anon);
    ensureStylesheet();
    this.view = new WidgetView(init, this.state, {
      dispatch: (action) => this.dispatch(action),
      submit: (payload) => this.submit(payload),
      uploadScreenshot: (file) => this.uploadScreenshot(file),
    });
  }

  open(): void {
    this.dispatch({ type: 'OPEN' });
  }

  close(): void {
    this.dispatch({ type: 'CLOSE' });
  }

  async identify(input: IdentifyInput): Promise<void> {
    if (!input.email && !input.name && !input.userId) {
      return;
    }
    const hash = await hashIdentity(input);
    this.dispatch({ type: 'IDENTIFY_SET', payload: { profileHash: hash } });
  }

  setTags(tags: string[]): void {
    const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
    this.dispatch({ type: 'SET_TAGS', payload: normalized });
  }

  private async submit(payload: SubmissionPayload): Promise<void> {
    await this.api.submitFeedback(payload);
  }

  private async uploadScreenshot(file: File): Promise<void> {
    const publicUrl = await this.api.uploadScreenshot(file);
    this.dispatch({ type: 'UPLOAD_OK', payload: { publicUrl } });
  }

  private dispatch(action: Parameters<typeof widgetReducer>[1]): void {
    this.state = widgetReducer(this.state, action);
    this.view.update(this.state);
  }
}

declare global {
  interface Window {
    FBW_INIT?: WidgetInit;
    FBW?: WidgetRuntimeApi;
  }
}

function bootstrap() {
  const win = assertWindow();
  const config = win.FBW_INIT;
  if (!config || !config.projectKey) {
    console.warn('[FBW] Missing project key. Widget disabled.');
    return;
  }
  startConsoleCapture();
  const controller = new WidgetController(config);
  win.FBW = controller;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootstrap());
  } else {
    bootstrap();
  }
}

export {}; // ensure this file is treated as a module
