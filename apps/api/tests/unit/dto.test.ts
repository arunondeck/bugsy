import { describe, expect, it } from 'vitest';

import { FeedbackSubmitDTO } from '../../src/lib/z';

describe('FeedbackSubmitDTO', () => {
  it('validates minimum payload', () => {
    const result = FeedbackSubmitDTO.safeParse({
      title: 'Great feature',
      context: {
        pageUrl: 'https://example.com',
        ua: 'jest',
        locale: 'en-US',
        viewport: { w: 1200, h: 800 }
      }
    });
    expect(result.success).toBe(true);
  });
});
