import type { ConsoleEntry } from './types.js';

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';
type ConsoleMethod = (...args: unknown[]) => void;

const DEFAULT_LIMIT = 50;
const levels: ConsoleLevel[] = ['log', 'info', 'warn', 'error'];
const buffer: ConsoleEntry[] = [];
const originals: Partial<Record<ConsoleLevel, ConsoleMethod>> = {};
let captureEnabled = false;
let maxEntries = DEFAULT_LIMIT;

function serializeArg(arg: unknown): string {
  if (typeof arg === 'string') {
    return arg;
  }
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}`;
  }
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function addEntry(level: ConsoleLevel, args: unknown[]): void {
  const message = args.map(serializeArg).join(' ');
  buffer.push({
    level,
    message: message.slice(0, 5000),
    timestamp: new Date().toISOString(),
  });
  if (buffer.length > maxEntries) {
    buffer.splice(0, buffer.length - maxEntries);
  }
}

export function startConsoleCapture(limit = DEFAULT_LIMIT): void {
  if (captureEnabled || typeof window === 'undefined') {
    return;
  }
  captureEnabled = true;
  maxEntries = limit;

  levels.forEach((level) => {
    const base = (console[level] as ConsoleMethod | undefined)?.bind(console) ?? (() => undefined);
    originals[level] = base;
    (console as Record<ConsoleLevel, ConsoleMethod>)[level] = (...args: unknown[]) => {
      addEntry(level, args);
      base(...args);
    };
  });

  window.addEventListener('error', (event) => {
    addEntry('error', [event.message, `${event.filename}:${event.lineno}:${event.colno}`]);
  });
  window.addEventListener('unhandledrejection', (event) => {
    addEntry('error', ['Unhandled rejection', serializeArg(event.reason)]);
  });
}

export function getConsoleEntries(): ConsoleEntry[] {
  return buffer.slice();
}