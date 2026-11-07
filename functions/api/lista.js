// Recibe la foto, PDF o lista escrita del cliente y la guarda 90 días.
// Devuelve un link privado (/l/<código>) que viaja en el mensaje de WhatsApp al vendedor.
// Requiere un espacio KV vinculado a Pages con el nombre LISTAS.
const MAX = 10 * 1024 * 1024; // 10 MB
const TIPOS = /^(image\/(jpeg|png|webp|heic|heif|gif)|application\/pdf)$/;
const id = () => { const a = new Uint8Array(12); crypto.getRandomValues(a); return [...a].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 18); };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.LISTAS) return json({ error: 'Falta configurar el almacenamiento (KV LISTAS).' }, 500);
  const origin = new URL(request.url).origin;
  const ref = request.headers.get('origin');
  if (ref && ref !== origin) return json({ error: 'Origen no permitido.' }, 403);
  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: 'No pudimos leer el archivo.' }, 400); }
  const f = form.get('archivo');
  if (!f || typeof f === 'string') return json({ error: 'No llegó ningún archivo.' }, 400);
  if (f.size > MAX) return json({ error: 'El archivo pesa más de 10 MB.' }, 413);
  const tipo = f.type || 'application/octet-stream';
  if (!TIPOS.test(tipo)) return json({ error: 'Solo fotos (JPG, PNG, WEBP, HEIC) o PDF.' }, 415);
  const k = id();
  await env.LISTAS.put(k, await f.arrayBuffer(), {
    expirationTtl: 60 * 60 * 24 * 90,
    metadata: { tipo, nombre: String(f.name || 'lista').slice(0, 80), t: Date.now() }
  });
  return json({ url: origin + '/l/' + k });
}

export const onRequest = () => json({ error: 'Método no permitido.' }, 405);
