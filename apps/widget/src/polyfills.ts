export async function createHash(data: Uint8Array): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const view = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    const buffer = await crypto.subtle.digest('SHA-256', view);
    return bufferToHex(buffer);
  }
  // Fallback for environments without Web Crypto (e.g. tests)
  const { createHash: nodeCreateHash } = await import('crypto');
  return nodeCreateHash('sha256').update(Buffer.from(data)).digest('hex');
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
