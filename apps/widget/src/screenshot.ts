type Html2CanvasFn = (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
let loader: Promise<Html2CanvasFn> | null = null;

function loadHtml2Canvas(): Promise<Html2CanvasFn> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Screenshots require a browser environment.'));
  }

  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas as Html2CanvasFn);
  }

  if (loader) {
    return loader;
  }

  loader = new Promise<Html2CanvasFn>((resolve, reject) => {
    const resolveWithInstance = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas as Html2CanvasFn);
      } else {
        loader = null;
        reject(new Error('Failed to initialise html2canvas.'));
      }
    };

    const fail = (message: string) => {
      loader = null;
      reject(new Error(message));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-fbw-html2canvas]');
    if (existing) {
      existing.addEventListener('load', resolveWithInstance, { once: true });
      existing.addEventListener('error', () => fail('Unable to load html2canvas.'), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.fbwHtml2canvas = '1';
    script.addEventListener('load', resolveWithInstance, { once: true });
    script.addEventListener('error', () => fail('Unable to load html2canvas.'), { once: true });
    document.head.appendChild(script);
  });

  return loader;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Unable to create screenshot blob.'));
      }
    }, 'image/png', 0.92);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read screenshot preview.'));
    reader.readAsDataURL(blob);
  });
}

export interface PageScreenshot {
  file: File;
  previewDataUrl: string;
}

export async function capturePageScreenshot(): Promise<PageScreenshot> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Screenshots require a browser environment.');
  }

  const html2canvas = await loadHtml2Canvas();
  const target = document.documentElement;
  const canvas = await html2canvas(target, {
    backgroundColor: window.getComputedStyle(document.body).backgroundColor ?? '#ffffff',
    useCORS: true,
    windowWidth: Math.max(document.documentElement.scrollWidth, window.innerWidth),
    windowHeight: Math.max(document.documentElement.scrollHeight, window.innerHeight),
  });

  const blob = await canvasToBlob(canvas);
  const file = new File([blob], `feedback-screenshot-${Date.now()}.png`, { type: blob.type || 'image/png' });
  const previewDataUrl = await blobToDataUrl(blob);

  return { file, previewDataUrl };
}

declare global {
  interface Window {
    html2canvas?: Html2CanvasFn;
  }
}