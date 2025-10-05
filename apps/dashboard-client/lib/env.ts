import { z } from 'zod';

const raw = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8787',
  NEXT_PUBLIC_USE_API_MOCKS: process.env.NEXT_PUBLIC_USE_API_MOCKS ?? 'true'
};

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_USE_API_MOCKS: z.union([z.literal('1'), z.literal('true'), z.literal('0'), z.literal('false')])
});

const parsed = envSchema.parse(raw);

export const env = {
  apiBaseUrl: parsed.NEXT_PUBLIC_API_BASE_URL,
  useMocks: parsed.NEXT_PUBLIC_USE_API_MOCKS === '1' || parsed.NEXT_PUBLIC_USE_API_MOCKS === 'true'
};
