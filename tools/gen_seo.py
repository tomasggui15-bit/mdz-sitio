#!/usr/bin/env python3
"""Genera una página HTML por producto + sitemap.xml + robots.txt para el catálogo MDZ.
Uso: python3 gen_seo.py <carpeta_del_sitio> <url_base>
"""
import json, re, sys, os, unicodedata, html, collections, urllib.parse
from datetime import date

SITE = sys.argv[1]
BASE = sys.argv[2].rstrip('/')
WA = '5492616609480'

idx = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
R = json.loads(re.search(r'^const R=(\[.*\]);', idx, re.M).group(1))
CAT = json.load(open(os.path.join(SITE, 'catalogo.json'), encoding='utf-8'))
P, SUBS = CAT['p'], CAT['s']
NI = CAT.get('ni', len(P))
F = {int(k): v for k, v in (CAT.get('f') or {}).items()}
X = set(CAT.get('x') or [])
def HP(i): return (i < NI or i in F) and i not in X
KC = CAT.get('c') or CAT.get('k') or [''] * len(P)
NOPH = "background-image:url('../p/sinfoto.svg');background-size:cover;background-position:center"
DESC = {}
for r in range(len(R)):
    try:
        DESC.update(json.load(open(os.path.join(SITE, f'd/{r}.json'), encoding='utf-8')))
    except FileNotFoundError:
        pass

def norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')

def slug(t, i):
    t = re.sub(r'[^a-z0-9]+', '-', norm(t)).strip('-')
    return (t[:70].rstrip('-') or 'producto') + f'-{i}'


AC = re.compile(r'^(IPS|PVC|PPR|PP|LED|FV|HH|MH|HHH|HHC|IRAM|RBM|PKD|ABS|TV|USB|AA|AAA|PE|PEAD|CPVC|ACQUA|EPOXI|SIGAS)$')
def nice(p):
    """Nombre legible para personas (el mismo criterio que la web)."""
    t = str(p[0] or '')
    U = re.sub(r'[^A-ZÁÉÍÓÚÑ]', '', t)
    if len(U) > 3:
        out = []
        for w in t.split(' '):
            l = re.sub(r'[^A-Za-zÁÉÍÓÚÑáéíóúñ]', '', w)
            out.append(w.lower() if len(l) >= 2 and l == l.upper() and not AC.match(l) else w)
        t = ' '.join(out); t = t[:1].upper() + t[1:]
    t = re.sub(r'(\d)\s*[xX]\s*(\d)', r'\1 × \2', t)
    t = re.sub(r'\s*(\(\d+\))+\s*', ' ', t)
    t = re.sub(r'\b(\d+)\s?mm\b', r'\1 mm', t, flags=re.I)
    b = (p[1] or '').strip()
    if b and not re.search(r'vac', b, re.I):
        t = re.sub(r'\b' + re.escape(b) + r'\b', b, t, flags=re.I)
    t = re.sub(r'\b(ips|fv|pvc|ppr|pp|hh|mh|hhh|led)\b', lambda m: m.group(0).upper(), t, flags=re.I)
    t = re.sub(r'\b(fusi[oó]n)\s+(fusi[oó]n)\b', r'\1', t, flags=re.I)
    return re.sub(r'\s{2,}', ' ', t).strip()
def niceB(p):
    b = (p[1] or '').strip()
    return '' if re.search(r'vac[ií]o', b, re.I) else b

def esc(t):
    return html.escape(str(t), quote=True)

def spr(i, pre='../'):
    if i in F: return f"background-image:url('{pre}{F[i]}');background-size:contain;background-repeat:no-repeat;background-position:center"
    if i >= NI: return NOPH
    sh, k = divmod(i, 25)
    c, r = k % 5, k // 5
    return f"background-image:url({pre}s2/{sh}.webp);background-position:{c/4*100:g}% {r/4*100:g}%"

STOP = set('para con sin de del la el los las una uno por x mm cm en y o a al tipo color blanco negro'.split())
def toks(t):
    return {w for w in re.split(r'[^a-z0-9]+', norm(t)) if len(w) > 2 and w not in STOP}

HEAD_RE = re.compile(r'^(caracter[ií]sticas|descripci[oó]n|usos|aplicaci[oó]n|rendimiento|modo de empleo|composici[oó]n|soporte|especificaciones|ficha t[eé]cnica|otras caracter[ií]sticas|incluye|medidas|beneficios|ventajas)', re.I)
def fmt_desc(d):
    out, ul = [], False
    for l in [x.strip() for x in d.split('\n') if x.strip()]:
        m = re.match(r'^(?:[•\-\*·?]|\d+[.)])\s*(.+)', l)
        if m:
            if not ul:
                out.append('<ul>'); ul = True
            out.append(f'<li>{esc(m.group(1))}</li>'); continue
        if ul:
            out.append('</ul>'); ul = False
        if len(l) < 48 and (l.endswith(':') or HEAD_RE.match(l)):
            out.append(f'<h3>{esc(l.rstrip(":"))}</h3>')
        else:
            out.append(f'<p>{esc(l)}</p>')
    if ul:
        out.append('</ul>')
    return '\n'.join(out)

def plain(d, n=155):
    t = re.sub(r'\s+', ' ', re.sub(r'[•\-\*·]\s*', '', d)).strip()
    return (t[:n-1].rsplit(' ', 1)[0] + '…') if len(t) > n else t

# similares
by_r = {}
for i, p in enumerate(P):
    if i not in X: by_r.setdefault(p[2], []).append(i)
TK = [toks(p[0]) for p in P]
POST = collections.defaultdict(list)
for i, p in enumerate(P):
    for w in TK[i]:
        POST[(p[2], w)].append(i)
BYSUB = collections.defaultdict(list)
for i, p in enumerate(P):
    BYSUB[(p[2], p[3])].append(i)
def similar(i):
    p = P[i]; sc = collections.Counter()
    for w in TK[i]:
        L = POST[(p[2], w)]
        if len(L) > 3000: continue
        for j in L: sc[j] += 1
    for j in BYSUB[(p[2], p[3])][:80]: sc[j] += 0
    res_sc = []
    for j, v in sc.items():
        if j == i or not HP(j): continue
        q = P[j]; s = v
        if q[3] == p[3]: s += 3
        if p[1] and q[1] == p[1]: s += 1.5
        if HP(j): s += 0.5
        res_sc.append((s, j))
    res_sc.sort(key=lambda x: (-x[0], x[1]))
    seen, res = {norm(p[0])}, []
    for _, j in res_sc:
        k = norm(P[j][0])
        if k in seen: continue
        seen.add(k); res.append(j)
        if len(res) >= 10: break
    return res

SL = [slug(p[0], i) for i, p in enumerate(P)]
RSL = [re.sub(r'[^a-z0-9]+', '-', norm(r[0])).strip('-') for r in R]
os.makedirs(os.path.join(SITE, 'p'), exist_ok=True)

CSS = """:root{--bg:#F4F6F9;--surface:#fff;--ink:#0E1B2B;--muted:#56657A;--line:#DCE3EC;--chip:#EEF2F7;--y:#FFC20E;--y2:#B98700;--navy:#0F2740;--wa:#128C4A;--d:"Barlow Condensed","Arial Narrow",Arial,sans-serif;--b:"Barlow",Arial,Helvetica,sans-serif}
@media (prefers-color-scheme:dark){:root{--bg:#0A1420;--surface:#111F31;--ink:#EAF0F6;--muted:#9DADBF;--line:#22344A;--chip:#18293E;--y2:#FFC20E;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--b);font-size:16px;line-height:1.5;padding-bottom:env(safe-area-inset-bottom,0px)}
a{color:inherit}.wrap{max-width:1200px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.hdr{background:var(--navy);border-bottom:3px solid var(--y);position:sticky;top:0;z-index:10}.hdr .wrap{display:flex;align-items:center;gap:14px;padding-block:10px}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-family:var(--d);font-weight:800;font-size:21px;white-space:nowrap}
.brand small{display:block;font-family:var(--b);font-size:10.5px;font-weight:700;letter-spacing:1.6px;color:var(--y)}
.hdr nav{margin-left:auto;display:flex;gap:10px;align-items:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;text-decoration:none;border-radius:999px;padding:12px 20px;font-size:15.5px;border:0;cursor:pointer}
.bwa{background:var(--wa);color:#fff}.by{background:var(--y);color:var(--navy)}.bg{color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.3)}
h1,h2{font-family:var(--d);line-height:1.02;margin:0;text-wrap:balance}
.crumb{display:flex;flex-wrap:wrap;gap:6px;font-size:14px;color:var(--muted);margin:18px 0 14px}.crumb a{font-weight:600;color:var(--ink)}
.top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;align-items:start}
@media (max-width:860px){.top{grid-template-columns:minmax(0,1fr);gap:16px}.hdr .bg{display:none}}
.img{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px;display:grid;place-items:center}
.pimg{aspect-ratio:1;width:100%;max-width:440px;background-color:#fff;background-repeat:no-repeat;background-size:500% 500%}
.info{display:flex;flex-direction:column;gap:14px;min-width:0}
.brd{font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--y2);font-size:14px}
.info h1{font-size:clamp(30px,3.6vw,46px);font-weight:800}
.tags{display:flex;flex-wrap:wrap;gap:6px}.tags span{background:var(--chip);border-radius:999px;padding:5px 11px;font-size:13.5px;font-weight:600}
.box{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px}
.box p{margin:0;font-size:14px;color:var(--muted)}
.perks{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:14.5px}.perks li{display:flex;gap:10px}.perks li::before{content:"";width:9px;height:9px;margin-top:7px;background:var(--y);border-radius:2px;flex:none}
.sec{margin-top:36px;max-width:820px}.sec h2,.sim h2{font-size:clamp(26px,3vw,36px);font-weight:800;text-transform:uppercase;border-bottom:2px solid var(--ink);padding-bottom:8px;margin-bottom:14px}
.txt{line-height:1.65}.txt p{margin:0 0 10px}.txt h3{font-size:17px;margin:16px 0 6px}.txt ul{margin:0 0 12px;padding-left:20px}
.sim{margin:40px 0 50px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
@media (max-width:420px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}}
.pc{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;min-width:0}
.pc .pb{background:#fff;padding:10px;border-bottom:1px solid var(--line)}.pc .pimg{max-width:none}
.pc .pi{padding:10px 11px 12px;display:flex;flex-direction:column;gap:3px}.pc .b{font-size:11.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--y2);min-height:1.2em}
.pc .n{font-size:14px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
footer{background:#0A1C30;color:#9FB0C3;font-size:14px}footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding-block:22px}footer a{color:#fff;font-weight:600}
a:focus-visible,.btn:focus-visible{outline:3px solid var(--y);outline-offset:3px}
.brand{min-width:0}
@media (max-width:520px){.brand{font-size:18px}.brand small{display:none}.hdr .bwa{padding:9px 14px;font-size:14px}}
"""
open(os.path.join(SITE, 'p', 'estilo.css'), 'w', encoding='utf-8').write(CSS)
open(os.path.join(SITE, 'p', 'sinfoto.svg'), 'w', encoding='utf-8').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F1F4F8"/><rect x="62" y="58" width="76" height="56" rx="8" fill="none" stroke="#B8C3D1" stroke-width="5"/><circle cx="100" cy="86" r="14" fill="none" stroke="#B8C3D1" stroke-width="5"/><text x="100" y="148" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#7A8799">FOTO A PEDIDO</text></svg>')

MRE = re.compile(r'(\d+(?:[.,]\d+)?\s?(?:mm|cm|mts?|m|lts?|l|kg|w|hp|v|a)\b|\d+(?:\s\d)?/\d+\s?"?)', re.I)
def meas(name):
    out = []
    for t in MRE.findall(name):
        t = re.sub(r'\s+', ' ', t.lower()).strip()
        if t not in out: out.append(t)
    return out[:4]

today = date.today().isoformat()
for fn in os.listdir(os.path.join(SITE, 'p')):
    if fn.endswith('.html'): os.remove(os.path.join(SITE, 'p', fn))
for i, p in enumerate(P):
    if not HP(i): continue
    name, brand, r, sb = nice(p), niceB(p), p[2], SUBS[p[2]][p[3]]
    rub = R[r][0]
    d = DESC.get(str(i), '') or ''
    code = KC[i] if i < len(KC) else ''
    title = f"{name}{' - Cód. ' + code if code else ''} | Materiales MDZ Mendoza"
    mdesc = plain(d) if d else f"{name}{' ' + brand if brand and brand not in name else ''}. Pedí tu presupuesto por WhatsApp: envío a domicilio en todo Gran Mendoza."
    url = f"{BASE}/p/{SL[i]}.html"
    msg = f"Hola MDZ, quiero un presupuesto de: {name}{' (' + brand + ')' if brand else ''}{' - Cód. ' + code if code else ''}."
    wa = f"https://wa.me/{WA}?text=" + re.sub(r'%20', '%20', __import__('urllib.parse').parse.quote(msg))
    ld = {"@context": "https://schema.org", "@type": "Product", "name": name, "category": f"{rub} > {sb}",
          "url": url, "description": plain(d, 500) if d else mdesc}
    if code: ld["sku"] = code
    if brand: ld["brand"] = {"@type": "Brand", "name": brand}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Catálogo", "item": f"{BASE}/"},
        {"@type": "ListItem", "position": 2, "name": rub, "item": f"{BASE}/r/{RSL[r]}.html"},
        {"@type": "ListItem", "position": 3, "name": name, "item": url}]}
    sim = similar(i)
    sim_html = ''.join(
        f'<a class="pc" href="{SL[j]}.html"><div class="pb"><div class="pimg" style="{spr(j)}"></div></div>'
        f'<div class="pi"><span class="b">{esc(niceB(P[j]))}</span><span class="n">{esc(nice(P[j]))}</span></div></a>' for j in sim)
    tags = (f'<span style="background:#0F2740;color:#FFC20E">Código {esc(code)}</span>' if code else '') + ''.join(f'<span>{esc(t)}</span>' for t in meas(name))
    page = f"""<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(mdesc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="product"><meta property="og:title" content="{esc(name)}"><meta property="og:description" content="{esc(mdesc)}"><meta property="og:url" content="{url}"><meta property="og:site_name" content="Materiales de Construcción MDZ"><meta property="og:locale" content="es_AR">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Barlow:wght@400;600;700&display=swap">
<link rel="stylesheet" href="estilo.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>
</head><body>
<header class="hdr"><div class="wrap"><a class="brand" href="../">MATERIALES MDZ<small>MATERIALES DE CONSTRUCCIÓN</small></a><nav><a class="btn bg" href="../#explorar">Ver catálogo</a><a class="btn bwa" href="{esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></nav></div></header>
<main class="wrap">
<nav class="crumb" aria-label="Ubicación"><a href="../">Catálogo</a><span>›</span><a href="../r/{RSL[r]}.html">{esc(rub)}</a><span>›</span><span>{esc(sb)}</span></nav>
<div class="top"><div class="img"><div class="pimg" style="{spr(i)}" role="img" aria-label="{esc(name)}"></div></div>
<div class="info">{f'<div class="brd">{esc(brand)}</div>' if brand else ''}<h1>{esc(name)}</h1>{f'<div class="tags">{tags}</div>' if tags else ''}
<div class="box"><a class="btn bwa" href="{esc(wa)}" target="_blank" rel="noopener">Pedir presupuesto por WhatsApp</a><a class="btn by" href="../#p-{i}">Agregar a mi lista</a><p>Precio en pesos y costo de envío detallado: te lo pasamos por WhatsApp en el día.</p></div>
<ul class="perks"><li>Envío a domicilio en todo Gran Mendoza, en 24 a 48 h hábiles</li><li>Pagás por transferencia, Mercado Pago o efectivo contra entrega</li><li>Te ayudamos a elegir y a armar la lista completa</li></ul></div></div>
<section class="sec"><h2>Descripción</h2><div class="txt">{fmt_desc(d) if d else '<p>Consultanos por WhatsApp y te pasamos la ficha técnica.</p>'}</div></section>
{f'<section class="sim"><h2>Productos similares</h2><div class="grid">{sim_html}</div></section>' if sim else ''}
</main>
<footer><div class="wrap"><span>© Materiales de Construcción MDZ · Mendoza · Venta online con envío a domicilio</span><a href="https://www.instagram.com/materialesenmdz/" target="_blank" rel="noopener">Instagram @materialesenmdz</a></div></footer>
<script src="../vendedor.js" defer></script>
</body></html>"""
    open(os.path.join(SITE, 'p', SL[i] + '.html'), 'w', encoding='utf-8').write(page)


# ===== portadas de rubro =====
RD = json.loads(re.search(r'const RD=(\[.*?\]);', idx).group(1))
os.makedirs(os.path.join(SITE, 'r'), exist_ok=True)
RCSS = CSS.replace('url(../','url(../') + """
.band{background:var(--navy);color:#fff}.band .wrap{padding-block:26px 32px}.band .crumb{color:#AFC0D3;margin-top:0}.band .crumb a{color:#fff}
.band h1{font-size:clamp(40px,6vw,76px);font-weight:800;text-transform:uppercase}.band p{color:#C9D5E2;max-width:60ch;font-size:17px}
.cnt{display:inline-block;background:var(--y);color:var(--navy);font-family:var(--d);font-weight:800;padding:3px 10px;border-radius:6px;margin-top:10px}
.subnav{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}.subnav a{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:7px 13px;font-weight:600;font-size:14px;text-decoration:none}
.sub{margin:30px 0}.sub h2{font-size:clamp(24px,2.6vw,32px);font-weight:800;text-transform:uppercase;border-bottom:2px solid var(--ink);padding-bottom:6px;margin-bottom:12px}
.links{columns:3 260px;column-gap:24px;margin:14px 0 0;padding:0;list-style:none}.links li{break-inside:avoid;padding:4px 0;border-bottom:1px solid var(--line);font-size:14.5px}.links a{text-decoration:none}.links a:hover{text-decoration:underline}
"""
open(os.path.join(SITE, 'r', 'estilo.css'), 'w', encoding='utf-8').write(RCSS)
for r, rr in enumerate(R):
    rub = rr[0]; items = by_r.get(r, [])
    groups = {}
    for i in items: groups.setdefault(P[i][3], []).append(i)
    order = sorted(groups.items(), key=lambda x: -len(x[1]))
    url = f"{BASE}/r/{RSL[r]}.html"
    mdesc = f"{RD[r]} {len(items)} productos con envío a domicilio en Gran Mendoza. Pedí tu presupuesto por WhatsApp."
    wa = f"https://wa.me/{WA}?text=" + __import__('urllib.parse').parse.quote(f"Hola MDZ, necesito presupuesto de {rub.lower()}.")
    secs = []
    for k, L in order:
        sb = SUBS[r][k]; anchor = re.sub(r'[^a-z0-9]+', '-', norm(sb)).strip('-')
        top = ''.join(f'<a class="pc" href="../p/{SL[j]}.html"><div class="pb"><div class="pimg" style="{spr(j)}"></div></div><div class="pi"><span class="b">{esc(niceB(P[j]))}</span><span class="n">{esc(nice(P[j]))}</span></div></a>' for j in L[:5])
        Lp = [j for j in L if HP(j)]; Ln = [j for j in L if not HP(j) and j not in X]
        top = ''.join(f'<a class="pc" href="../p/{SL[j]}.html"><div class="pb"><div class="pimg" style="{spr(j)}"></div></div><div class="pi"><span class="b">{esc(niceB(P[j]))}</span><span class="n">{esc(nice(P[j]))}</span></div></a>' for j in Lp[:5])
        rest = ''.join(f'<li><a href="../p/{SL[j]}.html">{esc(nice(P[j]))}</a></li>' for j in Lp[5:]) + ''.join(f'<li><a href="../#p-{j}">{esc(nice(P[j]))}</a>{" <small>Cód. " + esc(KC[j]) + "</small>" if KC[j] else ""}</li>' for j in Ln)
        secs.append(f'<section class="sub" id="{anchor}"><h2>{esc(sb)} <small style="font-size:.5em;color:var(--muted)">{len(L)}</small></h2><div class="grid">{top}</div>{f"<ul class=links>{rest}</ul>" if rest else ""}</section>')
    subnav = ''.join(f'<a href="#{re.sub(r"[^a-z0-9]+", "-", norm(SUBS[r][k])).strip("-")}">{esc(SUBS[r][k])} ({len(L)})</a>' for k, L in order)
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": rub, "url": url, "description": mdesc}
    page = f"""<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(rub)} en Mendoza | Materiales MDZ</title>
<meta name="description" content="{esc(mdesc)}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{esc(rub)} | Materiales MDZ"><meta property="og:description" content="{esc(mdesc)}"><meta property="og:url" content="{url}"><meta property="og:locale" content="es_AR">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Barlow:wght@400;600;700&display=swap">
<link rel="stylesheet" href="estilo.css"><script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script></head><body>
<header class="hdr"><div class="wrap"><a class="brand" href="../">MATERIALES MDZ<small>MATERIALES DE CONSTRUCCIÓN</small></a><nav><a class="btn bg" href="../#r-{r}">Ver en el catálogo</a><a class="btn bwa" href="{esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></nav></div></header>
<div class="band"><div class="wrap"><nav class="crumb"><a href="../">Inicio</a><span>›</span><span>{esc(rub)}</span></nav><h1>{esc(rub)}</h1><span class="cnt">{len(items)} productos</span><p>{esc(RD[r])} Te lo llevamos a tu obra en todo Gran Mendoza.</p><a class="btn by" href="../#r-{r}">Ver y armar mi lista</a></div></div>
<main class="wrap"><nav class="subnav">{subnav}</nav>{''.join(secs)}</main>
<footer><div class="wrap"><span>© Materiales de Construcción MDZ · Mendoza · Venta online con envío a domicilio</span><a href="https://www.instagram.com/materialesenmdz/" target="_blank" rel="noopener">Instagram @materialesenmdz</a></div></footer>
<script src="../vendedor.js" defer></script>
</body></html>"""
    open(os.path.join(SITE, 'r', RSL[r] + '.html'), 'w', encoding='utf-8').write(page)

# sitemap + robots + mapa de slugs para el catálogo
urls = [f"<url><loc>{BASE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>"]
urls += [f"<url><loc>{BASE}/r/{x}.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>" for x in RSL]
urls += [f"<url><loc>{BASE}/p/{s}.html</loc><lastmod>{today}</lastmod></url>" for i, s in enumerate(SL) if HP(i)]
open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf-8').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>\n')
open(os.path.join(SITE, 'robots.txt'), 'w', encoding='utf-8').write(f"User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tools/\n\nSitemap: {BASE}/sitemap.xml\n")
print('paginas', sum(1 for i in range(len(P)) if HP(i)))
