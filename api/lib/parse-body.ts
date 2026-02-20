/**
 * Parse request body for both Web Request API and Vercel Node.js (IncomingMessage).
 * Locally, vite-plugin-api passes a Web Request. On Vercel, the Node runtime passes IncomingMessage.
 */
export async function parseBody(
  req: Request | { json?: () => Promise<unknown>; body?: unknown; on?: (event: string, cb: (chunk?: Buffer) => void) => void }
): Promise<unknown> {
  if (typeof (req as Request).json === 'function') {
    return (req as Request).json();
  }
  if ((req as { body?: unknown }).body !== undefined && (req as { body?: unknown }).body !== null) {
    return (req as { body: unknown }).body;
  }
  // Fallback: read Node IncomingMessage stream
  return new Promise<string>((resolve, reject) => {
    let data = '';
    const r = req as NodeJS.ReadableStream & { on?: (e: string, cb: (chunk?: Buffer) => void) => void };
    r.on?.('data', (chunk: Buffer) => {
      data += chunk?.toString?.() ?? '';
    });
    r.on?.('end', () => resolve(data));
    r.on?.('error', reject);
  }).then((raw) => {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  });
}

/** Get raw body string (for webhooks that need signature verification). */
export async function getRawBody(
  req: Request | { text?: () => Promise<string>; body?: unknown; on?: (event: string, cb: (chunk?: Buffer) => void) => void }
): Promise<string> {
  if (typeof (req as Request).text === 'function') {
    return (req as Request).text();
  }
  if (typeof (req as { body?: string }).body === 'string') {
    return (req as { body: string }).body;
  }
  return new Promise<string>((resolve, reject) => {
    let data = '';
    const r = req as NodeJS.ReadableStream & { on?: (e: string, cb: (chunk?: Buffer) => void) => void };
    r.on?.('data', (chunk: Buffer) => {
      data += chunk?.toString?.() ?? '';
    });
    r.on?.('end', () => resolve(data));
    r.on?.('error', reject);
  });
}

/** Get a request header (works for both Web Headers and Node IncomingHttpHeaders). */
export function getHeader(
  req: Request | { headers?: Record<string, string | string[] | undefined> | Headers },
  name: string
): string | null {
  const headers = (req as { headers?: Headers | Record<string, string | string[] | undefined> }).headers;
  if (!headers) return null;
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name);
  }
  const key = name.toLowerCase();
  const v = (headers as Record<string, string | string[] | undefined>)[key] ?? (headers as Record<string, string | string[] | undefined>)[name];
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}
