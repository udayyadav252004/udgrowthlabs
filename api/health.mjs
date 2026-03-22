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
    message: 'Service is healthy.'
  });
}
