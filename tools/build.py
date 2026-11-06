#!/usr/bin/env python3
"""Armado automático en Netlify (corre en cada publicación):
1) recalcula cantidades por categoría en index.html (sin productos ocultos),
2) cambia la versión de los datos para que nadie vea datos viejos,
3) regenera las páginas de Google (p/, r/, sitemap).
La dirección del sitio sale de la variable URL de Netlify (sirve también con dominio propio)."""
import json, os, re, subprocess, sys, time, collections
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = (os.environ.get('URL') or 'https://mdzmaterialesdeconstruccion.netlify.app').rstrip('/')
ix = os.path.join(SITE, 'index.html')
s = open(ix, encoding='utf-8').read()
C = json.load(open(os.path.join(SITE, 'catalogo.json'), encoding='utf-8'))
P, S, X = C['p'], C['s'], set(C.get('x') or [])
i = s.index('const R=') + 8
R, end = json.JSONDecoder().raw_decode(s, i)
cr = collections.Counter(p[2] for k, p in enumerate(P) if k not in X)
cs = collections.Counter((p[2], p[3]) for k, p in enumerate(P) if k not in X)
for ri, row in enumerate(R):
    row[2] = cr[ri]
    row[3] = sorted([[S[ri][si], cs[(ri, si)]] for si in range(len(S[ri])) if cs[(ri, si)]], key=lambda x: -x[1])
s = s[:i] + json.dumps(R, ensure_ascii=False) + s[end:]
s = re.sub(r"const DV='\d+'", "const DV='%s'" % time.strftime('%Y%m%d%H%M'), s, count=1)
open(ix, 'w', encoding='utf-8').write(s)
subprocess.run([sys.executable, os.path.join(SITE, 'tools', 'gen_seo.py'), SITE, BASE], check=True)
print('listo', BASE, sum(cr.values()), 'productos visibles')
