/* MDZ: antes de abrir WhatsApp, el cliente elige con qué vendedor hablar.
   Los vendedores se toman de window.MDZ_CONFIG.vendedores (index.html); si no está, se usan estos. */
(function(){
  var DEF=[{nombre:'Tomás',tel:'5492616609480'},{nombre:'Mauro',tel:'5492615390821'}];
  function vend(){var c=window.MDZ_CONFIG;return (c&&c.vendedores&&c.vendedores.length)?c.vendedores:DEF}
  var css='.mdzv-ov{position:fixed;inset:0;z-index:9999;background:rgba(6,16,28,.62);display:flex;align-items:center;justify-content:center;padding:16px}'+
  '.mdzv-ov[hidden]{display:none}'+
  '.mdzv{background:#fff;color:#0F2740;border-radius:18px;max-width:380px;width:100%;padding:24px 22px 18px;box-shadow:0 24px 60px rgba(0,0,0,.35);font-family:inherit;text-align:center}'+
  '.mdzv h3{margin:0 0 4px;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:.3px}'+
  '.mdzv p{margin:0 0 16px;color:#5B6B7D;font-size:15px}'+
  '.mdzv-b{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:0 0 10px;padding:14px 16px;border:0;border-radius:12px;background:#1F8B4C;color:#fff;font:inherit;font-size:17px;font-weight:700;cursor:pointer}'+
  '.mdzv-b:hover{background:#18733E}.mdzv-b svg{width:22px;height:22px;flex:none}'+
  '.mdzv-x{background:none;border:0;color:#5B6B7D;font:inherit;font-size:14px;cursor:pointer;padding:6px 10px;text-decoration:underline}';
  var ICO='<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"/></svg>';
  var ov,pend;
  function build(){
    if(ov)return;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    ov=document.createElement('div');ov.className='mdzv-ov';ov.hidden=true;
    ov.innerHTML='<div class="mdzv" role="dialog" aria-modal="true" aria-labelledby="mdzv-t"><h3 id="mdzv-t">¿Con quién querés hablar?</h3><p>Elegí un vendedor y te abrimos WhatsApp.</p><div class="mdzv-l"></div><button type="button" class="mdzv-x">Cancelar</button></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){
      var b=e.target.closest('.mdzv-b');
      if(b){var href=pend&&pend.getAttribute('href')||'';var q=href.indexOf('?');var url='https://wa.me/'+b.getAttribute('data-tel')+(q>=0?href.slice(q):'');
        try{localStorage.setItem('mdz_vend',b.getAttribute('data-tel'))}catch(x){}
        close();window.open(url,'_blank','noopener');return}
      if(e.target===ov||e.target.closest('.mdzv-x'))close()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)close()});
  }
  function close(){ov.hidden=true;pend=null}
  function ask(a){
    build();var V=vend();
    ov.querySelector('.mdzv-l').innerHTML=V.map(function(v){return '<button type="button" class="mdzv-b" data-tel="'+String(v.tel).replace(/\D/g,'')+'">'+ICO+'<span>'+String(v.nombre).replace(/[<>&"]/g,'')+'</span></button>'}).join('');
    pend=a;ov.hidden=false;var f=ov.querySelector('.mdzv-b');if(f)f.focus();
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey)return;
    var a=e.target.closest&&e.target.closest('a[href*="wa.me/"]');if(!a)return;
    if(/wa\.me\/\?/.test(a.getAttribute('href')||''))return; /* "compartir" sin número: no preguntar */
    if(a.hasAttribute('data-direct'))return; /* número elegido a mano: no preguntar */
    if(vend().length<2)return;
    e.preventDefault();ask(a);
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
  var A=REDES.filter(function(r){return r.url});if(!A.length)return;
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
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
