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
    if(vend().length<2)return;
    e.preventDefault();ask(a);
  },true);
})();
