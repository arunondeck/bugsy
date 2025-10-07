import type { ConfigPort } from '../../ports';

export class EnvConfigAdapter implements ConfigPort {
  constructor(private readonly keys: string[]) {}

  async get(): Promise<Record<string, string>> {
    return this.keys.reduce<Record<string, string>>((acc, key) => {
      const value = process.env[key];
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}
