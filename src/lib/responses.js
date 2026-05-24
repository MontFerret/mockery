export const jsonResponse = (payload) =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const textResponse = (body, contentType) =>
  new Response(body, {
    headers: { 'Content-Type': contentType },
  });
