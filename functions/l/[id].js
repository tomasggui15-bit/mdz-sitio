// Muestra el archivo de lista que subió el cliente (link privado, no indexado).
export async function onRequestGet({ params, env }) {
  const k = String(params.id || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
  const r = k && env.LISTAS ? await env.LISTAS.getWithMetadata(k, 'arrayBuffer') : null;
  if (!r || !r.value) return new Response('Este archivo no existe o ya venció (se guardan 90 días).', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex' } });
  const m = r.metadata || {};
  return new Response(r.value, { headers: {
    'content-type': m.tipo || 'application/octet-stream',
    'content-disposition': 'inline; filename="' + String(m.nombre || 'lista').replace(/[^\w.\- ]/g, '_') + '"',
    'cache-control': 'private, max-age=3600',
    'x-robots-tag': 'noindex, nofollow',
    'x-content-type-options': 'nosniff'
  } });
}
