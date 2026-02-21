/**
 * Minimal health check - no imports, no deps.
 * Test: GET https://your-domain.com/api/health
 * If this returns 200, API routes are deployed. If 404, api folder may not be deployed.
 */
export default function handler(_req: Request) {
  return new Response(JSON.stringify({ status: 'ok', api: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
