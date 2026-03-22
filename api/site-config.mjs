import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = require('../src/config');

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

export function GET() {
  return jsonResponse({
    success: true,
    site: config.publicSite
  });
}
