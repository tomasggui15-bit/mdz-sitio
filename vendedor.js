/* MDZ: red de vendedores con link propio.
   - Cada vendedor tiene un link: https://SITIO/v/german  (o cualquier página con ?v=german).
   - El cliente que entra por ese link queda asignado a ese vendedor por 180 días (si abre el link de otro vendedor, pasa a ese).
   - TODOS los botones de WhatsApp del cliente van directo al número de su vendedor, y el mensaje lleva el código del vendedor.
   - Sin link, va al número principal.
   Los vendedores y las redes se cargan en ajustes.json (se edita desde el panel /admin). Los correos y comisiones NO van ahí (el archivo es público). */
window.MDZ_AJUSTES=fetch('/ajustes.json',{cache:'no-cache'}).then(function(r){return r.json()}).catch(function(){return {}});
(function(){
  var DIAS=180, KEY='mdz_ref';
  var D={principal:{nombre:'Tomás',tel:'5492616609480'},vendedores:{}}, ready=false;
  function slug(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9-]/g,'')}
  function get(){try{var r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&r.s&&Date.now()-r.t<DIAS*864e5)return r.s}catch(e){}return ''}
  function set(s){try{localStorage.setItem(KEY,JSON.stringify({s:s,t:Date.now()}))}catch(e){}}
  function trk(n,d){try{window.umami&&window.umami.track(n,d)}catch(e){}}
  var nuevo=slug(new URLSearchParams(location.search).get('v'));
  if(nuevo){set(nuevo);try{var u=new URL(location.href);u.searchParams.delete('v');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}}
  function actual(){var s=get();var v=s&&D.vendedores[s];return v?{s:s,nombre:v.nombre,tel:String(v.tel).replace(/\D/g,'')}:{s:'',nombre:D.principal.nombre,tel:String(D.principal.tel).replace(/\D/g,'')}}
  window.MDZ_vendedor=actual;
  function fmt(t){t=String(t).replace(/^549/,'');return t.length===10?t.slice(0,3)+' '+t.slice(3,6)+'-'+t.slice(6):t}
  function pintar(){var v=actual();
    document.querySelectorAll('[data-vnom]').forEach(function(e){e.textContent=v.nombre});
    document.querySelectorAll('[data-vtel]').forEach(function(e){e.textContent=fmt(v.tel)});
    document.querySelectorAll('[data-copy][data-vcopy]').forEach(function(e){e.setAttribute('data-copy',v.tel.replace(/^549/,''))});
  }
  function cargar(){window.MDZ_AJUSTES.then(function(j){
      D.principal=j.principal||D.principal;D.vendedores={};Object.keys(j.vendedores||{}).forEach(function(k){D.vendedores[slug(k)]=j.vendedores[k]});
      ready=true;pintar();var v=actual();if(nuevo)trk('visita_vendedor',{vendedor:v.s||'sin-vendedor'});
    }).catch(function(){ready=true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){pintar();cargar()});else{pintar();cargar()}
  /* Reescribe cualquier link de WhatsApp con número al vendedor del cliente */
  function reescribir(a){var h=a.getAttribute('href')||'';var m=h.match(/^https:\/\/wa\.me\/(\d+)(\?.*)?$/);if(!m)return;
    var v=actual();var q=new URLSearchParams((m[2]||'').slice(1));var t=q.get('text')||'Hola MDZ, quiero pedir un presupuesto.';
    if(v.s&&t.indexOf('Código de vendedor')<0)t+='\n\nCódigo de vendedor: '+v.s.toUpperCase();
    return {url:'https://wa.me/'+v.tel+'?text='+encodeURIComponent(t),v:v}}
  window.MDZ_wa=function(href){var x=document.createElement('a');x.setAttribute('href',href);var r=reescribir(x);if(r){try{window.umami&&window.umami.track('whatsapp_vendedor',{vendedor:r.v.s||'sin-vendedor'})}catch(e){}}return r?r.url:href};
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0)return;
    var a=e.target.closest&&e.target.closest('a[href^="https://wa.me/"]');if(!a)return;
    var r=reescribir(a);if(!r)return;
    a.setAttribute('href',r.url);trk('whatsapp_vendedor',{vendedor:r.v.s||'sin-vendedor'});
    /* el navegador sigue el link ya corregido */
  },true);
})();

/* MDZ: redes sociales. Para agregar o cambiar una red, completá su "url" acá (vacía = no se muestra).
   Se dibujan en cada elemento con data-redes, y al pie de todas las páginas que no tengan uno. */
(function(){
  var REDES=[
    {n:'Instagram',url:'https://www.instagram.com/materialesenmdz/',d:'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.8a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3zM12 3.6c2.7 0 3 0 4.1.1 2.8.1 4.1 1.4 4.2 4.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.8-1.4 4.1-4.2 4.2-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4.1-1.4-4.2-4.2C3.6 15 3.6 14.7 3.6 12s0-3 .1-4.1C3.8 5.1 5.1 3.8 7.9 3.7 9 3.6 9.3 3.6 12 3.6zM12 2C9.3 2 8.9 2 7.9 2.1 4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.2 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2z'},
    {n:'Facebook',url:'',d:'M13.4 21.9v-7.4h2.5l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.6V5.8c-.3 0-1.2-.1-2.3-.1-2.2 0-3.8 1.4-3.8 3.9v2.1H7.8v2.9h2.5v7.4a10 10 0 1 1 3.1 0z'},
    {n:'TikTok',url:'',d:'M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z'},
    {n:'YouTube',url:'',d:'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z'}
  ];
  var A;
  function html(lbl){return (lbl?'<span class="mdzr-t">'+lbl+'</span>':'')+A.map(function(r){return '<a class="mdzr-a" href="'+r.url+'" target="_blank" rel="noopener" aria-label="'+r.n+' de Materiales MDZ" title="'+r.n+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+r.d+'"/></svg></a>'}).join('')}
  function run(){
    var st=document.createElement('style');
    st.textContent='.mdzr{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.mdzr-t{font-weight:700;margin-right:4px}'+
    '.mdzr-a{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;transition:transform .15s,background .15s}'+
    '.mdzr-a:hover,.mdzr-a:focus-visible{background:#FFC20E;color:#0F2740;transform:translateY(-2px)}.mdzr-a svg{width:19px;height:19px;fill:currentColor}'+
    '.mdzr.sm .mdzr-a{width:26px;height:26px}.mdzr.sm svg{width:15px;height:15px}'+
    '.mdzr.light .mdzr-a{background:#0F2740;color:#fff}.mdzr.light .mdzr-a:hover{background:#FFC20E;color:#0F2740}'+
    '.mdzr-pie{justify-content:center;padding:14px 16px;background:#0A1C30;color:#9FB0C3;font-size:14px}';
    document.head.appendChild(st);
    var els=document.querySelectorAll('[data-redes]');
    els.forEach(function(e){e.classList.add('mdzr');e.innerHTML=html(e.getAttribute('data-redes'))});
    if(!els.length){var d=document.createElement('div');d.className='mdzr mdzr-pie';d.innerHTML=html('Seguinos');var f=document.querySelector('footer');(f&&f.parentNode?f.parentNode.insertBefore(d,f.nextSibling):document.body.appendChild(d))}
  }
  function arrancar(){window.MDZ_AJUSTES.then(function(j){var rd=(j&&j.redes)||{};REDES.forEach(function(r){var k=r.n.toLowerCase();if(k in rd)r.url=rd[k]});A=REDES.filter(function(r){return r.url});if(A.length)run()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrancar);else arrancar();
})();
