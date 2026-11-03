/* Parrlo Translate prototype · core: state, i18n, router, overlays, helpers, hub, demo panel */
(function(){
const PP = window.PP = {R:{}, A:{}, SHEETS:{}, ENTER:{}, LEAVE:{}, T:{}};
const KEY = 'parrloProto.v1';
const DEF = () => ({
  ui:'ru', age:null, intro:false, gender:null, scope:null, mic:'unknown', speech:'unknown', localNet:'unknown',
  pair:{mine:'ru', theirs:'es'}, recent:['es','en'], partnerGender:'female', style:'none', autoSpeak:true, shareMyVoice:false,
  waSig:true, autoDone:false, pause:1.5, noisy:false, keepHistory:true, days:30, diag:false,
  history:[
    {id:'h1', date:Date.now()-2*3600e3, pair:['ru','es'], items:[['me','Здравствуйте! Подскажите, пожалуйста, где здесь аптека?','¡Hola! ¿Me puedes decir dónde hay una farmacia por aquí?'],['them','Claro, la farmacia está al final de la calle, a la derecha.','Конечно, аптека в конце улицы, справа.']]},
    {id:'h2', date:Date.now()-26*3600e3, pair:['ru','es'], items:[['me','Счёт, пожалуйста.','La cuenta, por favor.'],['them','Son doce euros con cincuenta.','С вас двенадцать евро пятьдесят.'],['me','Можно оплатить картой?','¿Puedo pagar con tarjeta?']]}
  ],
  hintDismissed:false, sharedOnce:false, bridgeIntro:false, voiceHint:false, tipShown:false,
  voice:{exists:false, on:false, used:10, consentVer:null}, offlineModels:'none',
  kb:{added:false, full:false, everConnected:false, hintSwipe:false},
  demo:{offline:false, limit:false, token:'auto', failNext:false, refine503:false, mvErr:'none', reconsent:false, unavailable:false, waInstalled:true, speed:1, realMic:true, under16kb:false, extState:'auto'}
});
function load(){ try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s) return deepMerge(DEF(), s); }catch(e){} return DEF(); }
function deepMerge(a,b){ for(const k in b){ if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object') deepMerge(a[k],b[k]); else a[k]=b[k]; } return a; }
PP.S = load();
PP.save = () => { try{ localStorage.setItem(KEY, JSON.stringify(PP.S)); }catch(e){} };
PP.reset = () => { localStorage.removeItem(KEY); PP.S = DEF(); PP.T = {}; };
const S = () => PP.S;

/* i18n */
PP.lang = () => { const u=S().ui; if(u!=='auto') return u; const n=(navigator.language||'ru').slice(0,2); return n==='es'||n==='en'?n:'ru'; };
const L = PP.L = (ru,es,en) => { const l=PP.lang(); return l==='es'?(es??ru):l==='en'?(en??es??ru):ru; };
PP.C = (arr) => Array.isArray(arr) ? L(arr[0],arr[1],arr[2]) : '';
PP.li = () => ({ru:0,es:1,en:2})[PP.lang()];
PP.langName = (c) => { const d=DATA.LANGS[c]; return d? d.n[PP.li()] : c; };
PP.langNative = (c) => ({ru:'Русский',es:'Español',en:'English',zh:'中文'})[c]||c;
PP.code = c => DATA.LANGS[c].c;

/* helpers */
const esc = PP.esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
PP.attr = (a,v) => `data-a="${a}"${v!==undefined?` data-v="${esc(v)}"`:''}`;
PP.btn = (label, a, v, cls='pri', extra='') => `<button class="btn ${cls}" ${PP.attr(a,v)} ${extra}>${label}</button>`;
PP.goBtn = (label, href, cls='pri') => `<button class="btn ${cls}" data-go="${href}">${label}</button>`;
const I = PP.I = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M15 5l-7 7 7 7"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="16" height="16"><path d="M9 5l7 7-7 7"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  kbd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" width="18" height="18"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  hist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 103-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>',
  stop:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" width="24" height="24"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M12 9l6 6M18 9l-6 6"/></svg>',
  shift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" width="22" height="22"><path d="M12 4l8 8h-4v7H8v-7H4z"/></svg>',
  ret:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M20 5v7H6M10 8l-4 4 4 4"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12l5 5 9-10"/></svg>',
  spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 15l2 2 4-4"/></svg>',
  msg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><rect x="3" y="4" width="18" height="13" rx="4"/><path d="M8 17l-2 4 5-4"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/></svg>',
  folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><path d="M3 6h7l2 2h9v11H3z"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/></svg>',
};
PP.parrot = (cls='') => `<img class="parrot ${cls}" src="assets/parrlo.svg" alt="Parrlo">`;
PP.nav = (title, back, backLabel, right='') => `<div class="nav">${back?`<button class="back" data-go="${back}">${I.back}<span>${esc(backLabel||L('Назад','Atrás','Back'))}</span></button>`:''}<div class="ttl">${esc(title)}</div><div class="sp"></div>${right}</div>`;
PP.tg = (on, a, v, dis) => `<button class="tg ${on?'on':''} ${dis?'dis':''}" role="switch" aria-checked="${!!on}" ${PP.attr(a,v)}></button>`;
PP.li_ = (o) => { // list item
  const tag = o.a||o.go ? 'button' : 'div';
  const act = o.a ? PP.attr(o.a,o.v) : o.go ? `data-go="${o.go}"` : '';
  const long = o.long ? ` data-long="${o.long}"` : '';
  return `<${tag} class="li ${o.dng?'dng':''}" ${act}${long}>${o.tile?`<span class="tile">${o.tile}</span>`:''}<span class="tx"><b>${esc(o.t)}</b>${o.s?`<small>${esc(o.s)}</small>`:''}</span>${o.right||''}${o.val!==undefined?`<span class="val">${esc(o.val)}</span>`:''}${(o.a||o.go)&&!o.noChev&&!o.right?`<span class="chev">${I.chev}</span>`:''}</${tag}>`;
};
PP.seg = (items, val, a) => `<div class="seg">${items.map(([k,l])=>`<button class="${k===val?'on':''}" ${PP.attr(a,k)}>${esc(l)}</button>`).join('')}</div>`;
PP.paras = (arr) => arr.map(p=>`<p>${esc(p)}</p>`).join('');
PP.mmss = s => { s=Math.max(0,Math.floor(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };

/* timers scoped to route */
let rTimers = [];
PP.rt = (fn, ms, iv) => { const id = iv ? setInterval(fn, ms) : setTimeout(fn, ms); rTimers.push([id,iv]); return id; };
function clearRT(){ for(const [id,iv] of rTimers) iv?clearInterval(id):clearTimeout(id); rTimers=[]; }

/* overlays */
const UI = PP.UI = {sheet:null, dialog:null, alert:null, menu:null, toast:null, demo:false};
PP.closeOv = () => { UI.sheet=null; UI.sheetPrev=null; UI.dialog=null; UI.alert=null; UI.menu=null; };
PP.sheet = (name, arg) => { UI.menu=null; UI.sheet={name,arg}; };
PP.dialog = (d) => { UI.menu=null; UI.dialog=d; };
PP.sysAlert = (d) => { UI.alert=d; };
PP.menu = (m) => { if (UI.nextAnchor) m.anchor = UI.nextAnchor; UI.menu=m; };
let toastT;
PP.toast = (msg) => { UI.toast=msg; UI.toastAt=Date.now(); clearTimeout(toastT); toastT=setTimeout(()=>{UI.toast=null; renderOv();}, 2200); renderOv(); };
function renderOv(){
  const ov = document.getElementById('ov'); let h='';
  if (UI.sheet){ const f=PP.SHEETS[UI.sheet.name]; if(f){ h+=`<div class="scrim" data-a="closeSheet"></div><div class="sheet" data-sheet="${UI.sheet.name}"><div class="grab"></div>${f(UI.sheet.arg)}</div>`; } }
  if (UI.menu){ h+=`<div class="scrim" data-a="closeMenu" style="background:rgba(0,0,0,.25)"></div><div class="menu">${UI.menu.head?`<div class="mh">${esc(UI.menu.head)}</div>`:''}${UI.menu.items.map(it=>`<button class="mi ${it.dng?'dng':''}" ${PP.attr(it.a,it.v)}>${esc(it.t)}${it.r?`<span class="sec">${esc(it.r)}</span>`:''}</button>`).join('')}</div>`; }
  if (UI.demo) h+=demoPanel();
  if (UI.dialog){ const d=UI.dialog; h+=`<div class="scrim top" ${d.noDismiss?'':'data-a="closeDialog"'}></div><div class="dialog" role="dialog"><h3>${esc(d.title)}</h3>${d.msg?`<p>${esc(d.msg)}</p>`:''}${d.html||''}<div class="bts">${d.buttons.map(b=>`<button class="btn ${b.cls||'sec'}" data-dlg="1" ${PP.attr(b.a,b.v)}>${esc(b.t)}</button>`).join('')}</div></div>`; }
  if (UI.alert){ const d=UI.alert; h+=`<div class="scrim top" style="background:rgba(0,0,0,.35)"></div><div class="sysalert" role="alertdialog"><div class="b"><h4>${esc(d.title)}</h4><p>${esc(d.msg)}</p></div><div class="bt">${d.buttons.map(b=>`<button data-dlg="1" ${PP.attr(b.a,b.v)}>${esc(b.t)}</button>`).join('')}</div></div>`; }
  if (UI.toast) h+=`<div class="toast" role="status">${esc(UI.toast)}</div>`;
  ov.innerHTML = h;
  layoutOv(); if (UI.toast){ clearTimeout(PP._toastRelayT); PP._toastRelayT=setTimeout(layoutOv, 280); }
}

/* overlay geometry (device coordinates, works with the desktop scale) */
const INTERACTIVE = '#scr [data-a],#scr [data-go],#scr [data-long],#scr button,#scr input,#scr textarea,#ov .sheet [data-a],#ov .sheet [data-go],#ov .sheet button,#ov .sheet input,#ov .dialog button,#ov .sysalert button,#ov .menu button,#ov .demo button,#ov .demo [data-go],#demoBtn,#home';
function visRect(el){ // visible part of el, clipped by scrolling ancestors; final position for sliding sheets
  let r = PP.devRect(el); if (r.right-r.left<1 || r.bottom-r.top<1) return null;
  const sh = el.closest('.sheet'); if (sh){ const sr=PP.devRect(sh); const dev=document.getElementById('device'); const finalTop = dev.offsetHeight - sh.offsetHeight; const dy = finalTop - sr.top; r={top:r.top+dy,bottom:r.bottom+dy,left:r.left,right:r.right}; }
  for (let p=el.parentElement; p && p.id!=='device'; p=p.parentElement){ const cs=getComputedStyle(p); if (/(auto|scroll|hidden)/.test(cs.overflowY+cs.overflowX)){ let c=PP.devRect(p); if (sh && sh.contains(p)){ const sr=PP.devRect(sh); const dev=document.getElementById('device'); const dy=(dev.offsetHeight - sh.offsetHeight) - sr.top; c={top:c.top+dy,bottom:c.bottom+dy,left:c.left,right:c.right}; } r={top:Math.max(r.top,c.top),bottom:Math.min(r.bottom,c.bottom),left:Math.max(r.left,c.left),right:Math.min(r.right,c.right)}; if (r.bottom-r.top<1||r.right-r.left<1) return null; } }
  if (getComputedStyle(el).visibility==='hidden') return null;
  return r; }
/* QA r4: toasts must not cover banners and cards either */
const CONTENT_BLOCKS = '#scr .hintcard,#scr .banner,#scr .warnbar,#scr .note,#scr .card,#scr .hint,#ov .sheet .note,#ov .sheet .banner';
PP.blockRects = () => { const out=PP.interactiveRects(); document.querySelectorAll(CONTENT_BLOCKS).forEach(el=>{ if (el.closest('.toast')) return; const r=visRect(el); if (r) out.push(r); }); return out; };
PP.interactiveRects = () => { const out=[]; document.querySelectorAll(INTERACTIVE).forEach(el=>{ if (el.classList.contains('scrim') || el.closest('.toast')) return; if (el.id==='demoBtn' && document.body.classList.contains('toasting')) return; const r=visRect(el); if (r) out.push(r); }); return out; };
function layoutOv(){
  const dev=document.getElementById('device'); const H=dev.offsetHeight, W=dev.offsetWidth;
  const m=document.querySelector('#ov .menu');
  if (m && UI.menu && UI.menu.anchor){ const a=UI.menu.anchor, h=m.offsetHeight; let maxB=H-40; const dock=document.querySelector('#scr .dock,#scr .mics,#scr .inp,#scr .composer'); if (dock){ const d=PP.devRect(dock); maxB=Math.min(maxB, d.top-8); } const minT=56;
    let top = a.bottom+8; if (top+h>maxB) top = a.top-8-h; if (top<minT) top = Math.max(minT, Math.min(a.bottom+8, maxB-h));
    m.style.top=top+'px'; m.style.bottom='auto'; }
  else if (m){ // r7: an un-anchored menu («Ещё») opens below the banners at the top (e.g. «Гость на связи») instead of covering them
    let top=112; document.querySelectorAll('#scr .banner').forEach(b=>{ const r=PP.devRect(b); if (r.bottom>r.top && r.top<H/2) top=Math.max(top, r.bottom+8); });
    m.style.top=top+'px'; m.style.bottom='auto'; m.style.maxHeight=Math.max(160, H-top-40)+'px'; m.style.overflowY='auto'; }
  const t=document.querySelector('#ov .toast'); document.body.classList.toggle('toasting', false);
  if (!t) return;
  t.classList.remove('sbz'); t.style.top='0px'; t.style.bottom='auto'; t.style.visibility='hidden';
  const w=t.offsetWidth, h=t.offsetHeight, left=(W-w)/2, right=left+w; const rects=PP.blockRects(); const pad=6;
  const free = (y) => rects.every(r=> r.right<=left-pad || r.left>=right+pad || r.bottom<=y-pad || r.top>=y+h+pad);
  let y=null; for (let yy=54; yy<=H-28-h; yy+=4){ if (free(yy)){ y=yy; break; } }
  if (y===null){ t.classList.add('sbz'); document.body.classList.add('toasting'); t.style.top='4px'; }
  else t.style.top=y+'px';
  t.style.visibility='visible'; }
PP.layoutOv = layoutOv;

PP.renderOv = renderOv;

/* router */
PP.route = () => { const h=location.hash.replace(/^#\/?/,'').replace(/\/$/,''); return h||'hub'; };
PP.go = (h) => { if (location.hash===h) { PP.render(); } else location.hash = h; };
let cur = null;
function resolve(r){
  if (PP.R[r]) return [PP.R[r], null];
  const m = r.match(/^(.*)\/([^/]+)$/); if (m && PP.R[m[1]+'/:id']) return [PP.R[m[1]+'/:id'], decodeURIComponent(m[2])];
  return [PP.R.notfound, null];
}
PP.render = () => {
  const r = PP.route(); const [fn,arg] = resolve(r);
  const scr = document.getElementById('scr');
  const keep = scr.querySelector('.scroll,.feed'); const st = keep && cur===r ? keep.scrollTop : null;
  scr.innerHTML = fn(arg);
  if (st!==null){ const k=scr.querySelector('.scroll,.feed'); if(k) k.scrollTop=st; }
  scr.dataset.route = r;
  renderOv();
  if (PP.afterRender) PP.afterRender(r);
};
function onRoute(){
  const r = PP.route();
  if (cur && cur!==r){ const lv = PP.LEAVE[base(cur)]; if (lv) lv(cur, r); clearRT(); PP.closeOv(); if (UI.toast && Date.now()-(UI.toastAt||0)>400) UI.toast=null; }
  const prev = cur; cur = r;
  if (/^app\//.test(r) && S().kb.full && S().kb.linked===false && S().intro){ S().kb.linked=true; PP.save(); }
  const en = PP.ENTER[base(r)]; if (en) en(r, prev);
  PP.render();
  const f=document.querySelector('#scr .feed'); if(f) f.scrollTop=f.scrollHeight;
}
function base(r){ return PP.R[r] ? r : r.replace(/\/[^/]+$/,'/:id'); }
PP.cur = () => cur;

/* events */
function findAct(el){ while(el && el!==document.body){ if(el.dataset && (el.dataset.a||el.dataset.go)) return el; el=el.parentElement; } return null; }
/* long-press: fires after 520 ms; the menu stays open after release.
   A guard swallows the click/pointerup that follows the long-press (mouse, touch, iOS pointercancel). */
let longT=null, lp=null, guardUntil=0;
const LP_MS=500, LP_SLOP=12;
const releaseGuard = () => { clearTimeout(longT); if (lp && lp.fired && !lp.released){ lp.released=true; guardUntil = Date.now()+450; } };
PP.devRect = (el) => { const dev=document.getElementById('device'); const d=dev.getBoundingClientRect(); const sc=d.width/dev.offsetWidth||1; const r=el.getBoundingClientRect(); return {top:(r.top-d.top)/sc, bottom:(r.bottom-d.top)/sc, left:(r.left-d.left)/sc, right:(r.right-d.left)/sc}; };
/* the pressed element may have been re-rendered during the hold (speech end, timers): resolve it again by its data */
const liveLong = (el) => { if (el && el.isConnected) return el; const k=lp && lp.key; if (!k) return el;
  return [...document.querySelectorAll('[data-long]')].find(x=>x.dataset.long===k[0] && (x.dataset.lv ?? x.dataset.v ?? '')===k[1] && x.tagName===k[2]) || el; };
function fireLong(el){ if (!lp) lp={}; lp.fired=true; lp.released=false; guardUntil=Date.now()+8000; el=liveLong(el);
  UI.nextAnchor = el.isConnected ? PP.devRect(el) : null; run(el.dataset.long, el.dataset.lv ?? el.dataset.v, el); UI.nextAnchor=null; }
function pressStart(e){
  if (e.button>0) return;
  // a new press always ends the previous one: never ignore a press because of a stale guard
  clearTimeout(longT); if (lp && lp.fired && !lp.released) guardUntil=0;
  lp={x:e.clientX, y:e.clientY, fired:false, released:false, el:null, key:null, t:e.type, t0:performance.now(), moved:false};
  const el = e.target.closest && e.target.closest('[data-long]'); if(!el) return;
  if (document.querySelector('#ov .menu')) return;
  lp.el=el; lp.key=[el.dataset.long, el.dataset.lv ?? el.dataset.v ?? '', el.tagName];
  longT=setTimeout(()=>{ if (lp && lp.el===el && !lp.fired && !lp.moved) fireLong(el); }, LP_MS);
}
document.addEventListener('pointerdown', pressStart, true);
// fallback for input that produces only mouse/touch events
document.addEventListener('mousedown', e => { if (!lp || lp.t!=='pointerdown' || Math.abs(e.clientX-lp.x)>2 || Math.abs(e.clientY-lp.y)>2) pressStart(e); }, true);
/* QA r4: never depend on the timer alone. After an idle pause Chrome can delay/align timers (throttled or occluded window),
   so the hold is also measured by elapsed time on every move and on release. */
const holdDue = () => lp && lp.el && !lp.fired && !lp.moved && performance.now()-lp.t0 >= LP_MS;
document.addEventListener('pointermove', e => { if (!lp || !lp.el || lp.fired || e.isPrimary===false) return;
  if (Math.abs(e.clientX-lp.x)>LP_SLOP || Math.abs(e.clientY-lp.y)>LP_SLOP){ lp.moved=true; clearTimeout(longT); return; }
  if (holdDue()){ clearTimeout(longT); fireLong(lp.el); } }, true);
['pointerup','pointercancel','touchend','touchcancel','mouseup'].forEach(t=>document.addEventListener(t, e=>{ if (t==='pointercancel' && lp && !lp.fired) return; if (t!=='pointercancel' && t!=='touchcancel' && holdDue()){ clearTimeout(longT); fireLong(lp.el); } releaseGuard(); }, {capture:true, passive:true}));
document.addEventListener('contextmenu', e => { const el=e.target.closest('[data-long]');
  if (lp && lp.fired && !lp.released){ e.preventDefault(); return; }
  if (el){ e.preventDefault(); clearTimeout(longT); lp={fired:false, key:[el.dataset.long, el.dataset.lv ?? el.dataset.v ?? '', el.tagName]}; fireLong(el); lp.released=true; guardUntil=Date.now()+300; } });
document.addEventListener('click', e => { if (Date.now() < guardUntil){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
PP.longGuardActive = () => Date.now() < guardUntil;
document.addEventListener('click', e => {
  const el = findAct(e.target); if(!el) return;
  if (el.disabled) return;
  e.preventDefault();
  if (el.dataset.dlg){ UI.dialog=null; UI.alert=null; }
  if (el.dataset.go){ if (el.closest('.sheet')) UI.sheet=null; if (el.closest('.menu')) UI.menu=null; if (el.closest('.demo')) UI.demo=false; PP.go(el.dataset.go); return; }
  run(el.dataset.a, el.dataset.v, el);
});
function run(a, v, el){
  const f = PP.A[a]; if (!f){ console.warn('no action', a); return; }
  const res = f(v, el); PP.save();
  if (res!==false) PP.render();
}
PP.run = run;
window.addEventListener('hashchange', onRoute);

/* generic actions */
Object.assign(PP.A, {
  closeSheet(){ const s=UI.sheet; if (s && s.name==='legal' && UI.sheetPrev){ UI.sheet=UI.sheetPrev; UI.sheetPrev=null; return; } UI.sheet=null; UI.sheetPrev=null; if (s && PP.onSheetClose) PP.onSheetClose(s.name); },
  closeMenu(){ UI.menu=null; }, closeDialog(){ UI.dialog=null; }, noop(){},
  toggleDemo(){ UI.demo=!UI.demo; },
  setUi(v){ S().ui=v; },
  legal(v){ const prev = UI.sheet && UI.sheet.name!=='legal' ? UI.sheet : null; PP.sheet('legal', v); UI.sheetPrev = prev; },
  demoSet(v){ const [k,val]=v.split('='); const d=S().demo; d[k] = val==='true'?true:val==='false'?false:k==='speed'?+val:val; PP.demoChanged(k); },
  demoFlip(k){ const d=S().demo; d[k]=!d[k]; PP.demoChanged(k); },
  stateSet(v){ const [k,val]=v.split('='); const path=k.split('.'); let o=S(); while(path.length>1) o=o[path.shift()]; o[path[0]] = val==='true'?true:val==='false'?false:val==='null'?null:val; PP.demoChanged(k); },
  resetAll(){ UI.demo=false; PP.dialog({title:L('Сбросить прототип?','¿Reiniciar el prototipo?','Reset Prototype?'), msg:L('Ответ о возрасте, онбординг, согласия, «Мой голос», история и клавиатура вернутся к началу.','La edad, la introducción, los permisos, «Mi voz», el historial y el teclado volverán al inicio.','Age, onboarding, consents, My Voice, history and keyboard go back to the start.'), buttons:[{t:L('Сбросить','Reiniciar','Reset'),a:'resetDo',cls:'dng'},{t:L('Отмена','Cancelar','Cancel'),a:'noop'}]}); },
  resetDo(){ PP.reset(); UI.demo=false; PP.toast(L('Прототип сброшен','Prototipo reiniciado','Prototype reset')); PP.go('#/'); },
  copyText(v){ PP.copy(v); PP.toast(L('Скопировано','Copiado','Copied')); },
});
PP.demoHooks = []; PP.demoChanged = (k) => { for (const h of PP.demoHooks) h(k); };
PP.copy = (t) => { try{ navigator.clipboard && navigator.clipboard.writeText(t).catch(()=>{}); }catch(e){} PP.T.clip = t; };

/* legal / in-app browser sheet */
PP.SHEETS.legal = (v) => {
  const ttl = v==='terms' ? L('Условия использования','Condiciones de uso','Terms of Use') : L('Политика конфиденциальности','Política de privacidad','Privacy Policy');
  const url = v==='terms' ? L('parrlo.com/ru/terms','parrlo.com/terms','parrlo.com/en/terms') : L('parrlo.com/ru/privacy','parrlo.com/privacy','parrlo.com/en/privacy');
  return `<h3>${esc(ttl)}</h3><div class="sb"><p class="sec sm">${I.lock} ${esc(url)}</p><div class="card legal"><p>${esc(L('В приложении эта ссылка открывается в браузере внутри Parrlo. В прототипе страница не загружается.','En la app este enlace se abre en el navegador dentro de Parrlo. En el prototipo la página no se carga.','In the app this link opens in the in-app browser. The prototype does not load the page.'))}</p></div></div>${PP.btn(L('Готово','Listo','Done'),'closeSheet')}`;
};

/* HUB */
PP.R.hub = () => {
  const l = PP.lang();
  return `<div class="scroll"><div class="hub">
    <div style="display:flex;align-items:center;gap:12px;margin:14px 0 6px"><span class="glow">${PP.parrot('sm')}</span><span class="wordmark" style="font-size:30px">parrlo</span><span class="sec" style="margin-left:auto;font-size:12px">${esc(L('прототип','prototipo','prototype'))} · 5c0c39d0</span></div>
    <h1 class="t" style="font-size:26px">${esc(L('Кликабельный прототип Parrlo Translate','Prototipo interactivo de Parrlo Translate','Parrlo Translate Clickable Prototype'))}</h1>
    <p class="sec sm">${esc(L('Все экраны и тексты — по коду приложения (коммит 5c0c39d0). Переводы заготовлены, ничего не отправляется в сеть.','Pantallas y textos según el código de la app (commit 5c0c39d0). Las traducciones están preparadas; no se envía nada a la red.','Screens and copy follow the app code (commit 5c0c39d0). Translations are canned; nothing is sent over the network.'))}</p>
    <button class="entry" data-a="openApp" id="entry-app"><img src="assets/app-icon-180.png" alt=""><span><b>${esc(L('Приложение','App','App'))}</b><small>${esc(L('Parrlo Translate: онбординг, перевод голосом и текстом, «Мой голос», настройки, мост с мессенджером','Parrlo Translate: introducción, traducción por voz y texto, «Mi voz», ajustes, puente con mensajería','Parrlo Translate: onboarding, voice and text translation, My Voice, settings, messenger bridge'))}</small></span></button>
    <button class="entry" data-go="#/kb" id="entry-kb"><span class="kbic">${I.kbd.replace('<svg','<svg width="30" height="30"')}</span><span><b>${esc(L('Клавиатура','Teclado','Keyboard'))}</b><small>${esc(L('ParrloKeyboard: установка, полный доступ, перевод прямо в чате','ParrloKeyboard: instalación, acceso total, traducción en el chat','ParrloKeyboard: Setup, Full Access, translation right in the chat'))}</small></span></button>
    <div class="gh">${esc(L('Язык интерфейса','Idioma de la interfaz','Interface Language'))}</div>
    ${PP.seg([['ru','Русский'],['es','Español'],['en','English']], S().ui==='auto'?l:S().ui, 'setUi')}
    <div class="gh">${esc(L('Быстрые сценарии','Escenarios rápidos','Quick Scenarios'))}</div>
    <div class="mini">
      <button class="chip" data-go="#/wa/chat">${esc(L('Голосовое из мессенджера','Audio desde mensajería','Voice Message From a Messenger'))}</button>
      <button class="chip" data-go="#/app/myvoice">${esc(L('Мой голос','Mi voz','My Voice'))}</button>
      <button class="chip" data-go="#/app/conv">${esc(L('Разговор','Conversación','Conversation'))}</button>
      <button class="chip" data-a="toggleDemo">${esc(L('Панель «Демо»: ошибки','Panel «Demo»: errores','Demo Panel: Errors'))}</button>
      <button class="chip" data-a="resetAll">${esc(L('Сбросить прототип','Reiniciar','Reset Prototype'))}</button>
    </div>
    <p class="ter xs mt">${esc(L('Кнопка «Демо» вверху открывает панель состояний: офлайн, лимит, сессия клавиатуры, микрофон и др. Полоска внизу экрана возвращает сюда.','El botón «Demo» de arriba abre el panel de estados: sin conexión, límite, sesión del teclado, micrófono, etc. La barra inferior vuelve aquí.','The Demo button at the top opens the state panel: offline, limit, keyboard session, microphone and more. The bar at the bottom returns here.'))}</p>
  </div></div>`;
};
PP.A.openApp = () => {
  const s=S();
  if (s.age===null) return PP.go('#/app/age'), false;
  if (s.age==='under') return PP.go('#/app/age-refusal'), false;
  if (!s.intro) return PP.go('#/app/onb/'+(PP.T.onb||'welcome')), false;
  PP.go('#/app/main'); return false;
};
PP.R.notfound = () => `<div class="cover center"><h2 class="t">404</h2><p class="sec">${esc(L('Такого экрана нет','Esta pantalla no existe','No such screen'))}</p>${PP.goBtn(L('На старт','Al inicio','To Start'),'#/')}</div>`;

/* DEMO PANEL */
function o(label, act, v, on, cls=''){ return `<button class="o ${on?'on':''} ${cls}" ${PP.attr(act,v)}>${esc(label)}</button>`; }
function og(label, href){ return `<button class="o go" data-go="${href}">${esc(label)}</button>`; }
function demoPanel(){
  const s=S(), d=s.demo;
  return `<div class="demo" role="dialog" aria-label="Демо"><div class="dh"><b>Демо · состояния</b><button class="ib" data-a="toggleDemo" aria-label="Закрыть">${I.x}</button></div><div class="db">
  <p class="ter">Панель только для показа. В интерфейсе прототипа пометок «демо» нет.</p>
  <h5>Сеть и облако</h5><div class="opts">
    ${o('Нет интернета','demoFlip','offline',d.offline)}
    ${o('Лимит облачных фраз (429)','demoFlip','limit',d.limit)}
    ${o('Следующий перевод — сбой','demoFlip','failNext',d.failNext)}
    ${o('Стиль: облако 503 → без обработки','demoFlip','refine503',d.refine503)}
  </div>
  <h5>Согласие на облако</h5><div class="opts">
    ${o('Голос и текст','stateSet','scope=voiceText',s.scope==='voiceText')}${o('Только текст','stateSet','scope=text',s.scope==='text')}${o('Выключено','stateSet','scope=none',s.scope==='none')}
  </div>
  <h5>Микрофон (системное разрешение)</h5><div class="opts">
    ${o('Не спрашивали','stateSet','mic=unknown',s.mic==='unknown')}${o('Разрешён','stateSet','mic=granted',s.mic==='granted')}${o('Запрещён','stateSet','mic=denied',s.mic==='denied')}
    ${o('Настоящий микрофон в «Мой голос»','demoFlip','realMic',d.realMic)}
  </div>
  <h5>Клавиатура: сессия (токен)</h5><div class="opts">
    ${o('Авто (по приложению)','demoSet','token=auto',d.token==='auto')}${o('Есть','demoSet','token=ok',d.token==='ok')}${o('Нет токена','demoSet','token=missing',d.token==='missing')}${o('Сессия истекла (401)','demoSet','token=reconnect',d.token==='reconnect')}
    ${o('Полный доступ','stateSet','kb.full='+(!s.kb.full),s.kb.full)}${o('Сервис 503','demoFlip','unavailable',d.unavailable)}${o('Младше 16 (клавиатура): перевод скрыт без пояснения — как в коде','demoFlip','under16kb',d.under16kb)}
  </div>
  <h5>«Мой голос»</h5><div class="opts">
    ${o('Запись ×1','demoSet','speed=1',d.speed===1)}${o('Запись ×8','demoSet','speed=8',d.speed===8)}
    ${o('Отправка: ок','demoSet','mvErr=none',d.mvErr==='none')}${o('Сеть','demoSet','mvErr=net',d.mvErr==='net')}${o('Сессия 401','demoSet','mvErr=401',d.mvErr==='401')}${o('Устаревшая версия приложения','demoSet','mvErr=version',d.mvErr==='version')}${o('Голос не использовали 11 мес. (срок хранения — через 25 дней)','stateSet','voice.idleDays='+((+s.voice.idleDays||0)>=340?0:340),(+s.voice.idleDays||0)>=340)}
    ${o('Нужно повторное согласие v5','demoFlip','reconsent',d.reconsent)}
    ${o('Голос записан','stateSet','voice.exists='+(!s.voice.exists),s.voice.exists)}
  </div>
  <h5>Мост с мессенджером</h5><div class="opts">
    ${o('Мессенджер установлен','demoFlip','waInstalled',d.waInstalled)}
    ${o('Авто','demoSet','extState=auto',d.extState==='auto')}${o('Голосовое > 5 мин','demoSet','extState=tooLong',d.extState==='tooLong')}${o('Формат не поддерживается','demoSet','extState=unsupported',d.extState==='unsupported')}${o('Выбор языка (на телефоне)','demoSet','extState=pickLanguage',d.extState==='pickLanguage')}${o('Сбой перевода','demoSet','extState=failed',d.extState==='failed')}
    ${o('Сбросить «первый раз»','demoResetFirst')}
  </div>
  <h5>Перейти</h5><div class="opts">
    ${og('Старт прототипа','#/')}${og('Гейт 16+','#/app/age')}${og('Онбординг','#/app/onb/welcome')}${og('Подготовка (после обновления)','#/app/onb/prep')}${og('Нет микрофона','#/app/nomic')}${og('Мессенджер: голосовое','#/wa/chat')}${og('Мой голос: запись','#/app/myvoice/record')}${og('Клавиатура в чате','#/kb/chat')}
  </div>
  <h5>Данные демо</h5>
  <p class="ter">Заготовлены фразы RU↔ES↔EN(↔ZH): аптека, оплата, такси, встречи и др. Для незнакомого ввода работает демо-преобразование (замена знакомых слов + транслитерация), его результат правдоподобен, но не настоящий перевод. Литературная обработка демо: убирает слова-паразиты, расставляет заглавные и знаки.</p>
  <div class="opts">${o('Сбросить прототип','resetAll')}</div>
  </div></div>`;
}
PP.A.demoResetFirst = () => { const s=S(); s.bridgeIntro=false; s.voiceHint=false; s.sharedOnce=false; s.hintDismissed=false; s.tipShown=false; PP.toast('Флаги «первый раз» сброшены'); };

/* boot */
function layout(){
  const mobile = window.innerWidth <= 500 || (window.matchMedia('(pointer:coarse)').matches && window.innerWidth < 820);
  document.body.classList.toggle('mobile', mobile);
  const dev = document.getElementById('device');
  if (!mobile){ const sc = Math.min(1, (window.innerHeight-40)/844, (window.innerWidth-40)/390); dev.style.transform = sc<1?`scale(${sc})`:''; dev.style.margin = sc<1?`${-(844*(1-sc))/2}px ${-(390*(1-sc))/2}px`:''; }
  else { dev.style.transform=''; dev.style.margin=''; }
}
window.addEventListener('resize', layout);
document.addEventListener('DOMContentLoaded', () => {
  layout();
  const clock = () => { const d=new Date(); document.getElementById('clk').textContent = d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); };
  clock(); setInterval(clock, 15000);
  document.documentElement.lang = PP.lang();
  onRoute();
});
PP.afterRenderHooks = [];
PP.afterRender = (r) => { document.documentElement.lang = PP.lang(); document.getElementById('demoBtn').textContent = L('Демо','Demo','Demo'); for (const h of PP.afterRenderHooks) h(r); };
})();
