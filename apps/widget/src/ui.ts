import { buildSubmission, deriveContext } from './helpers.js';
import { capturePageScreenshot } from './screenshot.js';
import type { WidgetAction, WidgetState, WidgetInit } from './types.js';

interface ViewDeps {
  dispatch(action: WidgetAction): void;
  submit(payload: ReturnType<typeof buildSubmission>): Promise<void>;
  uploadScreenshot(file: File): Promise<void>;
}

export class WidgetView {
  private root: HTMLElement;
  private button: HTMLButtonElement;
  private modal: HTMLDivElement;
  private form: HTMLFormElement;
  private overlay: HTMLDivElement;
  private deps: ViewDeps;
  private init: WidgetInit;
  private state: WidgetState;
  private captureInFlight = false;
  private captchaWidgetId?: string;
  private previousCaptchaToken?: string;

  constructor(init: WidgetInit, state: WidgetState, deps: ViewDeps) {
    this.init = init;
    this.state = state;
    this.deps = deps;
    this.root = document.createElement('div');
    this.root.className = 'fbw-root';
    this.root.setAttribute('data-position', init.position ?? 'right');
    this.root.setAttribute('data-theme', init.theme ?? 'auto');

    this.button = this.createLauncherButton();
    this.modal = this.createModal();
    this.form = this.modal.querySelector('form')!;
    this.overlay = this.modal.querySelector('.fbw-overlay')!;

    this.root.appendChild(this.button);
    this.root.appendChild(this.modal);
    document.body.appendChild(this.root);

    const captchaContainer = this.form.querySelector('[data-captcha]') as HTMLElement | null;
    if (captchaContainer) {
      this.renderCaptcha(captchaContainer);
    }

    this.attachEvents();
    this.sync();
  }

  update(state: WidgetState) {
    this.previousCaptchaToken = this.state.submit.captchaToken;
    this.state = state;
    this.sync();
  }

  private attachEvents() {
    this.button.addEventListener('click', () => this.deps.dispatch({ type: 'OPEN' }));
    this.overlay.addEventListener('click', () => this.deps.dispatch({ type: 'CLOSE' }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.state.open) {
        this.deps.dispatch({ type: 'CLOSE' });
      }
    });

    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        this.deps.dispatch({ type: 'SUBMIT_START' });
        const context = deriveContext(window);
        const payload = buildSubmission(this.state, context);
        await this.deps.submit(payload);
        this.deps.dispatch({ type: 'SUBMIT_OK' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to submit feedback.';
        this.deps.dispatch({ type: 'SUBMIT_ERR', payload: { error: message } });
      }
    });

    const titleInput = this.form.querySelector<HTMLInputElement>('input[name="title"]')!;
    const detailsInput = this.form.querySelector<HTMLTextAreaElement>('textarea[name="details"]')!;
    const emailInput = this.form.querySelector<HTMLInputElement>('input[name="email"]')!;
    const includeUserInput = this.form.querySelector<HTMLInputElement>('input[name="includeUser"]')!;
    const includeScreenshotInput = this.form.querySelector<HTMLInputElement>('input[name="includeScreenshot"]')!;
    const includePageDetailsInput = this.form.querySelector<HTMLInputElement>('input[name="includePageDetails"]')!;
    const retakeButton = this.form.querySelector<HTMLButtonElement>('[data-screenshot-retake]');

    titleInput.addEventListener('input', () =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { title: titleInput.value } }),
    );
    detailsInput.addEventListener('input', () =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { details: detailsInput.value } }),
    );
    emailInput.addEventListener('input', () =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { email: emailInput.value } }),
    );
    includeUserInput.addEventListener('change', () =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { includeUser: includeUserInput.checked } }),
    );
    includePageDetailsInput.addEventListener('change', () =>
      this.deps.dispatch({
        type: 'SUBMIT_UPDATE',
        payload: { includePageDetails: includePageDetailsInput.checked },
      }),
    );
    includeScreenshotInput.addEventListener('change', () => {
      const include = includeScreenshotInput.checked;
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { includeScreenshot: include } });
      if (!include) {
        this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { screenshot: undefined } });
      } else {
        void this.captureScreenshot();
      }
    });

    retakeButton?.addEventListener('click', () => {
      void this.captureScreenshot();
    });
  }

  private async handleScreenshotUpload(file: File, options: { skipStateUpdate?: boolean } = {}) {
    if (!options.skipStateUpdate) {
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { screenshot: { file } } });
    }
    this.deps.dispatch({ type: 'UPLOAD_START' });
    try {
      await this.deps.uploadScreenshot(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Screenshot upload failed.';
      this.deps.dispatch({ type: 'UPLOAD_ERR', payload: { error: message } });
    }
  }

  private async captureScreenshot(): Promise<void> {
    if (this.captureInFlight || !this.state.submit.includeScreenshot || this.state.submit.uploading) {
      return;
    }
    this.captureInFlight = true;
    this.deps.dispatch({ type: 'SCREENSHOT_CAPTURE_START' });
    try {
      const result = await capturePageScreenshot();
      if (!this.state.submit.includeScreenshot) {
        return;
      }
      this.deps.dispatch({
        type: 'SCREENSHOT_CAPTURE_OK',
        payload: { file: result.file, previewDataUrl: result.previewDataUrl },
      });
      await this.handleScreenshotUpload(result.file, { skipStateUpdate: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to capture screenshot. Please check browser permissions.';
      this.deps.dispatch({ type: 'SCREENSHOT_CAPTURE_ERR', payload: { error: message } });
    } finally {
      this.captureInFlight = false;
    }
  }

  private sync() {
    this.root.classList.toggle('fbw-open', this.state.open);
    this.modal.classList.toggle('is-visible', this.state.open);
    this.modal.setAttribute('aria-hidden', this.state.open ? 'false' : 'true');
    this.button.setAttribute('aria-expanded', this.state.open ? 'true' : 'false');
    if (this.state.open) {
      const firstInput = this.form.querySelector<HTMLInputElement>('input[name="title"]');
      firstInput?.focus();
    }

    const { submit } = this.state;
    const submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const isCapturing = Boolean(submit.screenshot?.capturing);
    submitButton.disabled = !submit.title?.trim() || submit.submitting || submit.uploading || isCapturing;

    const errorBox = this.form.querySelector('.fbw-error');
    if (errorBox) {
      errorBox.textContent = submit.error ?? '';
      errorBox.classList.toggle('is-visible', Boolean(submit.error));
    }

    const includeUserInput = this.form.querySelector<HTMLInputElement>('input[name="includeUser"]');
    const includeScreenshotInput = this.form.querySelector<HTMLInputElement>('input[name="includeScreenshot"]');
    const includePageDetailsInput = this.form.querySelector<HTMLInputElement>('input[name="includePageDetails"]');

    if (includeUserInput) {
      includeUserInput.checked = submit.includeUser;
    }
    if (includeScreenshotInput) {
      includeScreenshotInput.checked = submit.includeScreenshot;
    }
    if (includePageDetailsInput) {
      includePageDetailsInput.checked = submit.includePageDetails;
    }

    const emailWrapper = this.form.querySelector('[data-email-wrapper]') as HTMLElement;
    emailWrapper.style.display = submit.includeUser ? 'block' : 'none';

    const screenshotWrapper = this.form.querySelector('[data-screenshot-wrapper]') as HTMLElement;
    screenshotWrapper.style.display = submit.includeScreenshot ? 'block' : 'none';

    const previewEl = this.form.querySelector('[data-screenshot-preview]') as HTMLElement;
    const previewImg = this.form.querySelector<HTMLImageElement>('[data-screenshot-image]');
    const emptyEl = this.form.querySelector('[data-screenshot-empty]') as HTMLElement;
    const retakeButton = this.form.querySelector<HTMLButtonElement>('[data-screenshot-retake]');
    const capturingEl = this.form.querySelector('[data-capturing]') as HTMLElement;
    const uploadingEl = this.form.querySelector('[data-uploading]') as HTMLElement;
    const successEl = this.form.querySelector('[data-uploaded]') as HTMLElement;

    const hasPreview = Boolean(submit.screenshot?.previewDataUrl);
    if (previewEl) {
      previewEl.style.display = submit.includeScreenshot && hasPreview ? 'flex' : 'none';
    }
    if (previewImg) {
      if (submit.includeScreenshot && hasPreview && submit.screenshot?.previewDataUrl) {
        previewImg.src = submit.screenshot.previewDataUrl;
      } else {
        previewImg.removeAttribute('src');
      }
    }
    if (emptyEl) {
      emptyEl.style.display = submit.includeScreenshot && !hasPreview ? 'block' : 'none';
    }

    if (capturingEl) {
      capturingEl.style.display = submit.includeScreenshot && isCapturing ? 'inline-flex' : 'none';
    }
    if (uploadingEl) {
      uploadingEl.style.display = submit.includeScreenshot && submit.uploading ? 'inline-flex' : 'none';
    }
    if (successEl) {
      successEl.style.display = submit.includeScreenshot && submit.screenshot?.publicUrl ? 'inline-flex' : 'none';
    }
    if (retakeButton) {
      retakeButton.disabled = !submit.includeScreenshot || submit.uploading || isCapturing;
    }

    if (this.init.captcha && !submit.captchaToken && this.previousCaptchaToken) {
      this.resetCaptcha();
    }

    this.previousCaptchaToken = submit.captchaToken;
  }

  private createLauncherButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fbw-launcher';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Feedback';
    return button;
  }

  private createModal(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'fbw-modal';
    wrapper.innerHTML = `
      <div class="fbw-overlay" role="presentation"></div>
      <div class="fbw-dialog" role="dialog" aria-modal="true" aria-labelledby="fbw-title">
        <header class="fbw-header">
          <h2 id="fbw-title">Send feedback</h2>
          <button type="button" class="fbw-close" aria-label="Close">&times;</button>
        </header>
        <form class="fbw-form">
          <div class="fbw-field">
            <label>Title<span aria-hidden="true">*</span>
              <input name="title" maxlength="120" required />
            </label>
          </div>
          <div class="fbw-field">
            <label>Details
              <textarea name="details" maxlength="2000" rows="4"></textarea>
            </label>
          </div>
          <div class="fbw-field fbw-toggle">
            <label>
              <input type="checkbox" name="includeUser" />
              Include my details
            </label>
          </div>
          <div class="fbw-field" data-email-wrapper>
            <label>Email
              <input type="email" name="email" autocomplete="email" />
            </label>
          </div>
          <div class="fbw-field fbw-toggle">
            <label>
              <input type="checkbox" name="includeScreenshot" />
              Attach screenshot
            </label>
          </div>
          <div class="fbw-field" data-screenshot-wrapper>
            <div class="fbw-screenshot-empty" data-screenshot-empty>
              A screenshot of this page will be captured automatically when enabled.
            </div>
            <div class="fbw-screenshot-preview" data-screenshot-preview>
              <img data-screenshot-image alt="Screenshot preview" />
              <button type="button" class="fbw-retake" data-screenshot-retake>Retake screenshot</button>
            </div>
            <div class="fbw-upload-status">
              <span data-capturing>Capturing...</span>
              <span data-uploading>Uploading...</span>
              <span data-uploaded>Uploaded &#10003;</span>
            </div>
          </div>
          <div class="fbw-field fbw-toggle">
            <label>
              <input type="checkbox" name="includePageDetails" />
              Include page details (page url, console statements)
            </label>
          </div>
          ${this.init.captcha ? '<div class="fbw-field" data-captcha></div>' : ''}
          <div class="fbw-error" role="alert"></div>
          <footer class="fbw-footer">
            <button type="button" class="fbw-cancel">Cancel</button>
            <button type="submit" class="fbw-submit">Submit</button>
          </footer>
        </form>
      </div>
    `;

    const closeButtons = wrapper.querySelectorAll('.fbw-close, .fbw-cancel');
    closeButtons.forEach((btn) =>
      btn.addEventListener('click', () => this.deps.dispatch({ type: 'CLOSE' })),
    );

    const emailWrapper = wrapper.querySelector('[data-email-wrapper]') as HTMLElement;
    emailWrapper.style.display = 'none';
    const screenshotWrapper = wrapper.querySelector('[data-screenshot-wrapper]') as HTMLElement;
    screenshotWrapper.style.display = 'none';
    const previewEl = wrapper.querySelector('[data-screenshot-preview]') as HTMLElement;
    previewEl.style.display = 'none';

    return wrapper;
  }

  private renderCaptcha(container: HTMLElement) {
    if (!this.init.captcha) {
      container.remove();
      return;
    }
    const { provider, siteKey } = this.init.captcha;
    const win = window as typeof window & {
      turnstile?: {
        render(el: HTMLElement, options: Record<string, unknown>): string;
        reset(id: string): void;
      };
      hcaptcha?: {
        render(el: HTMLElement, options: Record<string, unknown>): string;
        reset(id: string): void;
      };
    };

    const onToken = (token: string) =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { captchaToken: token } });
    const onExpire = () =>
      this.deps.dispatch({ type: 'SUBMIT_UPDATE', payload: { captchaToken: undefined } });

    this.captchaWidgetId = undefined;
    if (provider === 'turnstile' && win.turnstile) {
      container.innerHTML = '';
      this.captchaWidgetId = win.turnstile.render(container, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': onExpire,
      });
    } else if (provider === 'hcaptcha' && win.hcaptcha) {
      container.innerHTML = '';
      this.captchaWidgetId = win.hcaptcha.render(container, {
        sitekey: siteKey,
        callback: onToken,
        'expired-callback': onExpire,
      });
    } else {
      container.innerHTML =
        '<div class="fbw-captcha-placeholder">Captcha will appear once loaded.</div>';
    }
  }

  private resetCaptcha() {
    if (!this.init.captcha || !this.captchaWidgetId) {
      return;
    }
    const { provider } = this.init.captcha;
    const win = window as typeof window & {
      turnstile?: { reset(id: string): void };
      hcaptcha?: { reset(id: string): void };
    };

    if (provider === 'turnstile' && win.turnstile) {
      win.turnstile.reset(this.captchaWidgetId);
    }
    if (provider === 'hcaptcha' && win.hcaptcha) {
      win.hcaptcha.reset(this.captchaWidgetId);
    }
  }
}
