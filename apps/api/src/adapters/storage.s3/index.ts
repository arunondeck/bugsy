import type { StoragePort } from '../../ports';

export interface S3Client {
  presign(input: { kind: 'image'; contentType: string }): Promise<{ url: string; publicUrl: string }>;
}

export class S3StorageAdapter implements StoragePort {
  constructor(private readonly client: S3Client) {}

  presign(kind: 'image', contentType: string): Promise<{ url: string; publicUrl: string }> {
    return this.client.presign({ kind, contentType });
  }
}
