/* Parrlo · голос в клавиатуре — экраны. Каждый экран: r(c, x) → HTML внутри телефона.
   c — тексты языка, x — {os:'ios'|'and', small:bool, big:bool, lang, theme}. */
(function(){
const SW = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const I = {
  mic: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5"/><path d="M5 11.5a7 7 0 0 0 14 0"/><path d="M12 18.5v3"/></svg>`,
  micOff: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M15.5 9.5V6a3.5 3.5 0 0 0-6.6-1.6"/><path d="M8.5 9v2.5a3.5 3.5 0 0 0 5.6 2.8"/><path d="M5 11.5a7 7 0 0 0 11.3 5.5M19 11.5a7 7 0 0 1-.6 2.8"/><path d="M12 18.5v3"/><path d="M3 3l18 18"/></svg>`,
  voice: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M3.5 9.5v5h3.5l4.5 4V5.5L7 9.5z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.3 6.3a8.2 8.2 0 0 1 0 11.4"/></svg>`,
  x: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.9l11.3-7.2a1 1 0 0 0 0-1.7L8.5 3.9A1 1 0 0 0 7 4.8z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4.5" height="16" rx="1.5"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.5"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>`,
  wifiOff: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 5-2.9M10.7 5a15 15 0 0 1 11.3 3.5M5 12a10 10 0 0 1 3.5-2M15 10.3a10 10 0 0 1 4 1.7M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8" fill="currentColor"/><path d="M3 3l18 18"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></svg>`,
  info: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/></svg>`,
  ear: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M6.5 9a5.5 5.5 0 1 1 11 0c0 3-2.5 4-3.5 6-.7 1.5-1 4-3.5 4a3 3 0 0 1-3-3"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0"/></svg>`,
  share: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 15V3.5M7.5 8L12 3.5 16.5 8"/><path d="M8 11H6a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 18 11h-2"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.4-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.7.7 0 0 0-1 .8L4.5 11l8 1-8 1-2.1 6.6a.7.7 0 0 0 1 .8z"/></svg>`,
  up: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l7 7h-4.5v9h-5v-9H5z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>`,
  redo: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>`,
  tr: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M3 5h9M7.5 3v2M5 5c.5 3 2.5 6 6 7.5M10 5c-.8 3.5-3 6.5-6.5 8"/><path d="M12.5 21l4-10 4 10M14 17.5h5"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/></svg>`,
  text: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4 6h16M4 11h16M4 16h10"/></svg>`,
  file: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9.5 15.5v-3M12 17v-6M14.5 15.5v-3"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M5 3.5h3.5l1.5 4.5-2.3 1.4a11 11 0 0 0 6.9 6.9L16 14l4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z"/></svg>`,
  del: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12z"/><path d="M11 9.5l5 5M16 9.5l-5 5" stroke-linecap="round"/></svg>`,
  shift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l8 8.5h-4.5v7.5h-7V12H4z"/></svg>`,
  chev: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`,
  chevL: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>`,
};
I.swap = `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4 8h14l-3.5-3.5"/><path d="M20 16H6l3.5 3.5"/></svg>`;
I.trash = `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/></svg>`;
I.lock = `<svg viewBox="0 0 24 24" ${SW} aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>`;
window.ICONS = I;
const MARK = (theme) => `<img src="../brandbook/assets/logo/${theme==='dark'?'mark-color-dark':'mark-color'}.svg" alt="" width="30" height="30" class="bm">`;
const MASCOT = (pose, theme) => `<img src="../brandbook/assets/mascot/mascot-${pose}-${theme}.svg" alt="" style="width:calc(132px*min(var(--fs),1.2));height:auto">`;
const fmt = (s, o={}) => s.replace(/\{(\w+)\}/g, (_,k) => o[k] ?? `{${k}}`);
const LEFT = {ru:'2\u00A0ч\u00A015\u00A0мин', es:'2\u00A0h\u00A015\u00A0min', en:'2\u00A0h\u00A015\u00A0min'};
const A11Y = (s) => s.replace(/"/g,'&quot;');

/* ---------- общие куски ---------- */
function sb(c, x, o={}) {
  const back = o.back ? `<span class="backapp ${o.hl?'hl':''}">◀ ${c.chat}</span>` : '';
  if (x.os === 'and') return `<div class="sb"><span>9:41</span><span class="isl"></span><span class="ic"><s></s><i></i></span></div>`;
  if (x.small) return `<div class="sb"><span>${back || '<span class="ic"><s></s></span>'}</span><span>9:41</span><span class="ic"><i></i></span></div>`;
  return `<div class="sb"><span>${back || '9:41'}</span><span class="isl"></span><span class="ic"><s></s><i></i></span></div>`;
}
const hm = () => `<div class="hm"><i></i></div>`;

function waveBars(n=26, seed=3) {
  let h=''; for (let i=0;i<n;i++){ const a=(.35+.65*Math.abs(Math.sin((i+seed)*1.7)*Math.cos(i*.45))).toFixed(2); h+=`<i style="--a:${a};--d:${(i*.07%1.1).toFixed(2)}"></i>`; } return h;
}
function staticWave(n, played, seed=1) {
  let h=''; for (let i=0;i<n;i++){ const a=Math.round(8+26*Math.abs(Math.sin((i+seed)*1.3)*Math.cos(i*.31))); h+=`<i class="${i<played?'p':''}" style="height:${a}px"></i>`; } return h;
}

/* мессенджер: нейтральный чужой чат */
function messenger(c, x, o={}) {
  const av = c.partner[0];
  const extra = o.sentAudio ? `<div class="bub out au"><span class="pl">${I.play}</span><span class="wv">${staticWave(22,0,4).replace(/class="[^"]*"/g,'').replace(/px/g,'px;width:2.5px')}</span><span style="font-size:12px;opacity:.8">0:06</span></div>` : '';
  const sent = o.sentText ? `<div class="bub out">${o.sentText}</div>` : '';
  let fld;
  if (o.field) fld = `<div class="fld">${o.mark?`<mark>${o.field}</mark>`:o.field}<span class="caret"></span></div>`;
  else fld = `<div class="fld ph0"><span class="caret"></span>${c.msgPh}</div>`;
  return `<div class="ms"><div class="mh"><span style="color:var(--sys);font-size:22px;line-height:1">‹</span><span class="av">${av}</span><b>${c.partner}</b></div>
    <div class="mb"><div class="bub">${c.partnerMsg}</div>${sent}${extra}</div>
    <div class="mi">${fld}<span class="snd">${I.up}</span></div></div>`;
}

const ROWS = {
  ru: ['йцукенгшщзх','фывапролджэ','ячсмитьбю'],
  es: ['qwertyuiop','asdfghjklñ','zxcvbnm'],
  en: ['qwertyuiop','asdfghjkl','zxcvbnm'],
};
function keys(c, x) {
  const R = ROWS[x.lang];
  const r = (s) => [...s].map(k=>`<span class="k">${k}</span>`).join('');
  const pad = R[1].length < R[0].length ? ' pad' : '';
  const bottom = x.os === 'and'
    ? `<span class="k f">?123</span><span class="k f" style="flex:.9 1 0">,</span><span class="k space">${x.lang==='ru'?'Русский':x.lang==='es'?'Español':'English'}</span><span class="k f" style="flex:.9 1 0">.</span><span class="k ret" style="background:var(--pri);color:var(--onpri)">↵</span>`
    : `<span class="k f">123</span>${x.small?`<span class="k f" style="flex:1 1 0">${I.globe.replace('<svg','<svg style="width:22px;height:22px"')}</span>`:''}<span class="k space">${c.space}</span><span class="k ret">${c.ret}</span>`;
  return `<div class="keys ${x.lang}"><div class="r">${r(R[0])}</div><div class="r${pad}">${r(R[1])}</div>
    <div class="r"><span class="k f">${I.shift.replace('<svg','<svg style="width:22px;height:22px"')}</span>${r(R[2])}<span class="k f">${I.del.replace('<svg','<svg style="width:24px;height:24px"')}</span></div>
    <div class="r">${bottom}</div></div>`;
}
/* панель инструментов: 🎤 🔊 | Улучшить Перевести */
function andTbar(c, x, o={}) {
  const off = o.off ? ' off' : '';
  const pl = (ic, t) => `<span class="pill ap" role="button" aria-label="${A11Y(t)}">${ic.replace('<svg','<svg class="pi"')}<span class="pt">${t}</span></span>`;
  const ib = (ic, t, act) => `<span class="ib${off}${act?' act':''}" role="button" aria-label="${A11Y(t)}">${ic}</span>`;
  const pc = x.lang==='es' ? 'RU' : 'ES', pn = x.lang==='es' ? 'Русский' : 'Español';
  const chip = `<span class="lchip"><span class="lc" role="button" aria-label="${A11Y(fmt(c.partnerA11y,{lang:pn}))}">${pc}</span><span class="sw" role="button" aria-label="${A11Y(c.swapA11y)}">${I.swap}</span></span>`;
  const voice = o.noVoice ? '' : `${ib(I.mic,c.dict,o.act==='mic')}${ib(I.voice,c.voice,o.act==='voice')}`;
  return `<div class="tbar atb">${chip}<span class="sp"></span>${pl(I.spark,c.improve)}${pl(I.tr,c.translate)}${voice}</div>`;
}
function tbar(c, x, o={}) {
  if (x.os === 'and') return andTbar(c, x, o);
  const lab = false;                         // 🎤/🔊 — только иконки 44×40: подписи не помещаются в es/ru рядом с «Улучшить»/«Перевести»
  const off = o.off ? ' off' : '';
  const ib = (ic, t, act) => `<span class="ib${off}${act?' act':''}" role="button" aria-label="${A11Y(t)}">${ic}${lab?`<span>${t}</span>`:''}</span>`;
  return `<div class="tbar">${ib(I.mic,c.dict,o.act==='mic')}${ib(I.voice,c.voice,o.act==='voice')}<span class="sp"></span>
    <span class="pill">${I.spark.replace('<svg','<svg style="width:18px;height:18px;color:var(--pri)"')}${c.improve}</span><span class="pill">${I.tr.replace('<svg','<svg style="width:18px;height:18px;color:var(--pri)"')}${c.translate}</span></div>`;
}
function kb(c, x, o={}) {
  let top = '';
  if (o.banner) top = `<div class="ban">${MARK(x.theme)}<div class="bt"><b>${o.banT||c.kbOffT}</b><span>${o.banner}</span></div>${o.bannerBtn===false?'':`<span class="bo">${o.bannerBtn||c.kbOpen}</span>`}</div>`;
  if (o.chip === 'ready') top = `<div class="chiprow"><span class="chip" role="button" aria-label="${A11Y(c.insertA11y)}">${I.mic}<span class="ct"><b>${c.insert}:</b>«${c.lit.first}»</span><span class="cx" role="button" aria-label="${A11Y(c.dismiss)}">${I.x.replace('<svg','<svg style="width:18px;height:18px;color:var(--sec)"')}</span></span></div>`;
  if (o.chip === 'inserted') top = `<div class="chiprow"><span class="chip done">${I.check.replace('<svg','<svg style="color:var(--pri)"')}<span class="ct"><b>${c.inserted}</b></span><span class="undo"><svg class="ring" viewBox="0 0 18 18"><circle class="bg" cx="9" cy="9" r="7"/><circle class="fg" cx="9" cy="9" r="7"/></svg>${c.undo}</span></span></div>`;
  if (o.chip === 'sent') top = `<div class="chiprow"><span class="chip done">${I.check.replace('<svg','<svg style="color:var(--pri)"')}<span class="ct"><b>${c.voiceSent}</b> <span class="muted">${c.voiceSentSub}</span></span></span></div>`;
  if (o.chip === 'sent2') top = `<div class="chiprow"><span class="chip done two">${I.check.replace('<svg','<svg style="color:var(--pri)"')}<span class="ct"><b>${o.chipT}</b> <span class="muted">${o.chipS}</span></span></span></div>`;
  if (o.tip) top = `<div style="position:relative;height:0"><div style="position:absolute;left:6px;bottom:-4px;z-index:4;background:var(--tx);color:var(--bg);border-radius:12px;padding:8px 12px;font-size:calc(14px*var(--kfs));line-height:1.35;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100% - 12px)"><div style="display:flex;gap:6px;align-items:center"><span style="width:18px;height:18px;display:inline-flex">${I.mic}</span><b>${c.dict}</b></div><div style="display:flex;gap:6px;align-items:center"><span style="width:18px;height:18px;display:inline-flex">${I.voice}</span><b>${c.voice}</b></div><span style="position:absolute;left:24px;bottom:-6px;width:12px;height:12px;background:var(--tx);transform:rotate(45deg)"></span></div></div>`;
  const body = o.panel ? `<div class="andpanel">${o.panel}</div>` : keys(c, x);
  const glob = x.os==='ios' && !x.small ? `<div class="glob">${I.globe}<span></span></div>` : '';
  return `<div class="kb">${top}${o.noTbar?'':tbar(c, x, o)}${body}${glob}</div>`;
}
function kbScreen(c, x, m={}, k={}) {
  return `${sb(c,x,{back:m.back})}${messenger(c,x,m)}${kb(c,x,k)}${x.os==='and'||!x.small?hm():''}`;
}

/* хост-приложение */
function host(c, x, o) {
  const nv = o.nav === false ? '' : `<div class="nv">${o.backBtn?`<span class="bk">${I.chevL.replace('<svg','<svg style="width:24px;height:24px"')}</span>`:''}<span class="tt">${o.title||''}</span>${o.close?`<span class="x">${o.close}</span>`:''}</div>`;
  return `${sb(c,x,{back:o.fromKb!==false && x.os==='ios',hl:o.hl})}${nv}<div class="body${o.center?' center':''}">${o.body}</div>${o.foot?`<div class="foot${o.row?' row':''}">${o.foot}</div>`:''}${hm()}${o.overlay||''}`;
}
const btn = (t, cls='', ic='') => `<span class="btn ${cls}" role="button">${ic}${t}</span>`;
const msg = (kind, ic, t, b) => `<div class="msg ${kind}"><span class="mi">${ic}</span><div><b>${t}</b>${b}</div></div>`;

function settingsGroup(c, x, o={}) {
  return `<div class="grp">
    <div class="rowi"><span class="t">${c.speechLang}<small>${c.autoSub}</small></span><span class="v">${c.auto} ›</span></div>
    <div class="rowi"><span class="t">${c.trNow}<small>${fmt(c.trNowSub,{to:c.toLang})}</small></span><span class="tog${o.trOff?' off':''}"></span></div>
    <div class="rowi"><span class="t">${c.resLang}</span><span class="v">${c.resLangV} ›</span></div></div>`;
}
function stages(c, now, withTr=true) {
  const S = [c.st1, c.st2].concat(withTr?[c.st3]:[]);
  return `<ol class="stages" data-anim="${now==='anim'?'stages':''}">${S.map((s,i)=>{ const st = now==='anim' ? (i===0?'now':'') : (i<now?'done':i===now?'now':''); return `<li class="${st}"><span class="si">${st==='done'?I.check:''}</span>${s}${st==='done'?`<small>${c.stDone}</small>`:''}</li>`; }).join('')}</ol>`;
}
function resultCards(c, o={}) {
  return `<div class="card"><span class="lab">${c.resText}</span><span class="val${o.edit?' edit':''}">${c.lit.text}${o.edit?'<span class="caret"></span>':''}</span></div>
    <div class="card"><span class="lab">${c.resTr}</span><span class="val">${c.lit.tr}</span></div>`;
}
function backOverlay(c, x, text) {
  return `<div style="position:absolute;left:12px;right:12px;top:calc(var(--sbh) + 10px);z-index:7;background:var(--tx);color:var(--bg);border-radius:14px;padding:12px 14px;font-size:calc(15px*var(--fs));line-height:1.35;box-shadow:0 12px 32px rgba(0,0,0,.25)">
    <span style="position:absolute;top:-7px;left:${x.small?14:30}px;width:14px;height:14px;background:var(--tx);transform:rotate(45deg);border-radius:2px"></span>${text}</div>`;
}

/* Android-панель: шапка записи */
const andTop = (c, t, right) => `<div class="top"><b>${t}</b><span>${right||''}</span></div>`;

/* ---------- экраны ---------- */
const ph = (n) => `«${n}»`;
const S = [];
const add = (o) => S.push(o);

/* ===== iOS: клавиатура ===== */
add({id:'K-V0', g:'ios-kb', os:'ios', t:'Голос доступен', cap:'🎤 «Диктовка» и 🔊 «Голосовое» — иконки 44×40 слева, «Улучшить» / «Перевести» справа. Названия — в VoiceOver и в подсказке при первом показе (K-V0b). Ряд букв не меняется, клавиатура не выше обычной + 50 pt.',
  r:(c,x)=>kbScreen(c,x,{},{})});
add({id:'K-V0b', g:'ios-kb', os:'ios', t:'Первый показ: подсказка', cap:'Один раз после включения голоса. Скрывается по нажатию или через 6 с.',
  r:(c,x)=>kbScreen(c,x,{},{tip:true})});
add({id:'K-V1a', g:'ios-kb', os:'ios', t:'Нет согласия', cap:'🎤/🔊 приглушены. Нажатие на них или «Открыть» ведёт в Parrlo на экран согласия (H-D0).',
  r:(c,x)=>kbScreen(c,x,{},{off:true,banner:c.kbOffConsent})});
add({id:'K-V1b', g:'ios-kb', os:'ios', t:'Нет «Полного доступа»', cap:'Без полного доступа клавиатура не может открыть приложение — кнопки нет, только путь в Настройках.',
  r:(c,x)=>kbScreen(c,x,{},{off:true,banner:c.kbOffFull,bannerBtn:false})});
add({id:'K-V1c', g:'ios-kb', os:'ios', t:'Нет токена', cap:'Сессия истекла или нет входа. «Открыть» ведёт на вход в Parrlo.',
  r:(c,x)=>kbScreen(c,x,{},{off:true,banner:c.kbOffToken})});
add({id:'K-V2', g:'ios-kb', os:'ios', t:'Диктовка готова', cap:'Пользователь вернулся «◀» из Parrlo. Чип «Вставить: <первые слова…>» + ✕. Текст передан через общую группу приложения, не через буфер обмена.',
  r:(c,x)=>kbScreen(c,x,{},{chip:'ready'})});
add({id:'K-V3', g:'ios-kb', os:'ios', t:'Вставлено', cap:'Текст в поле. «Вернуть как было» доступно 5 с (кольцо-таймер), потом чип исчезает.',
  r:(c,x)=>kbScreen(c,x,{field:c.lit.text,mark:true},{chip:'inserted'})});
add({id:'K-V4', g:'ios-kb', os:'ios', t:'Устарело', cap:'Чипа нет: результат старше 10 минут, уже вставлен, отменён ✕ или записан новый. Клавиатура выглядит как K-V0.',
  r:(c,x)=>kbScreen(c,x,{},{})});
add({id:'K-V5', g:'ios-kb', os:'ios', t:'Голосовое отправлено', cap:'После «Поделиться» (H-G4) и возврата в чат. Подтверждение 4 с, затем обычный вид.',
  r:(c,x)=>kbScreen(c,x,{sentAudio:true},{chip:'sent'})});

/* ===== iOS: хост, диктовка ===== */
add({id:'H-D0', g:'ios-d', os:'ios', t:'Согласие на голос', cap:'Один раз, до первого запроса микрофона. Две равные кнопки в конце текста. Anthropic и ElevenLabs — США (SCC); c4 (Soniox, удаление ≤ 30 мин) — окончательно после DPA Soniox (Мурат). Формулировки — через RG.',
  r:(c,x)=>host(c,x,{title:'',body:`<h1 class="h1">${c.cTitle}</h1><p class="p">${c.cLead}</p>
    <ul class="list"><li><span class="dot">${I.mic}</span><div><b>${c.c1t}</b><span>${c.c1}</span></div></li>
    <li><span class="dot">${I.text}</span><div><b>${c.c2t}</b><span>${c.c2}</span></div></li>
    <li><span class="dot">${I.voice}</span><div><b>${c.c3t}</b><span>${c.c3}</span></div></li>
    <li><span class="dot">${I.shield}</span><div><span style="color:var(--tx)">${c.c4}</span></div></li>
    <li><span class="dot">${I.gear}</span><div><span>${c.c5}</span></div></li></ul>
    <span class="lnk">${c.cPolicy} ›</span><div class="eqbtn">${btn(c.cLater,'eq')}${btn(c.cAllow,'eq')}</div><span class="small" style="text-align:center">${c.cNext}</span>`})});
add({id:'H-D0b', g:'ios-d', os:'ios', t:'Системный запрос микрофона', cap:'Сразу после «Разрешить». Текст — строка NSMicrophoneUsageDescription.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,body:settingsGroup(c,x),foot:`<div style="display:flex;justify-content:center"><span class="recbtn">${I.mic}</span></div>`,
    overlay:`<div class="scrim"></div><div class="alert"><div class="at"><b>${c.micT}</b><p>${c.micB}</p></div><div class="ab"><span>${c.micDeny}</span><span>${c.micAllow}</span></div></div>`})});
add({id:'H-D1', g:'ios-d', os:'ios', t:'Микрофон запрещён', cap:'«Открыть Настройки» — системная страница Parrlo Translate. «Не сейчас» оставляет на экране, текстом можно писать как обычно.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--sf);color:var(--sec);box-shadow:none">${I.micOff}</span><h2 class="h2">${c.deniedT}</h2><p class="p">${c.deniedB}</p>`,
    foot:`${btn(c.openSettings)}${btn(c.notNow,'ghost')}`})});
add({id:'H-D2', g:'ios-d', os:'ios', t:'Готов к записи', cap:'Язык речи — авто или выбор; язык результата; «Сразу перевести». Большая кнопка внизу, под большим пальцем.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,body:`${settingsGroup(c,x)}<div style="flex:1"></div>`,
    foot:`<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 4px"><span class="recbtn" role="button" aria-label="${A11Y(c.tapRec)}">${I.mic}</span><b class="f17">${c.tapRec}</b><span class="small">${c.limitNote}</span></div>`})});
add({id:'H-D3', g:'ios-d', os:'ios', t:'Запись', cap:'Живой уровень голоса, таймер и полоса до лимита 2:00. «Стоп» — красная, «Отмена» — без сохранения. Анимация: столбики волны.', anim:true,
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="f15 b6"><span class="rdot"></span>${c.recording}</span><span class="timer" data-tick="42">0:42<small>${c.of} 2:00</small></span><div class="wave">${waveBars(x.small?22:28)}</div><div class="pbar"><i style="width:35%"></i></div>`,
    foot:`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="btn sec" style="flex:1">${c.cancel}</span><span class="recbtn stop" role="button" aria-label="${A11Y(c.stop)}"><i></i></span><span style="flex:1"></span></div>`})});
add({id:'H-D3b', g:'ios-d', os:'ios', t:'Запись: осталось 15 с', cap:'С 1:45 — предупреждение и жёлтая полоса, лёгкая вибрация. В 2:00 запись останавливается сама и идёт в обработку.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="f15 b6"><span class="rdot"></span>${c.recording}</span><span class="timer">1:45<small>${c.of} 2:00</small></span><div class="wave">${waveBars(x.small?22:28,7)}</div><div class="pbar w"><i style="width:87.5%"></i></div>${msg('warn',I.clock,c.left15,'')}`,
    foot:`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="btn sec" style="flex:1">${c.cancel}</span><span class="recbtn stop"><i></i></span><span style="flex:1"></span></div>`})});
add({id:'H-D4', g:'ios-d', os:'ios', t:'Тишина', cap:'Если 4 с уровень около нуля — подсказка. Запись продолжается; «Стоп» доступен.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="f15 b6"><span class="rdot"></span>${c.recording}</span><span class="timer">0:06<small>${c.of} 2:00</small></span><div class="wave flat">${waveBars(x.small?22:28)}</div>${msg('warn',I.ear,c.silenceT,c.silenceB)}`,
    foot:`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span class="btn sec" style="flex:1">${c.cancel}</span><span class="recbtn stop"><i></i></span><span style="flex:1"></span></div>`})});
add({id:'H-D5', g:'ios-d', os:'ios', t:'Обработка (анимация)', cap:'Честные этапы по событиям сервера, без процентов и фальшивой полосы. Этап «Переводим» — только если включено «Сразу перевести».', anim:true,
  r:(c,x)=>host(c,x,{title:c.dTitle,center:true,body:`${MASCOT('think',x.theme)}<h2 class="h2">${c.procT}</h2>${stages(c,'anim')}<span class="small">${c.procNote}</span>`,foot:btn(c.cancel,'ghost')})});
add({id:'H-D5a', g:'ios-d', os:'ios', t:'Обработка: этап 1', cap:'Распознаём речь (Soniox).',
  r:(c,x)=>host(c,x,{title:c.dTitle,center:true,body:`${MASCOT('think',x.theme)}<h2 class="h2">${c.procT}</h2>${stages(c,0)}<span class="small">${c.procNote}</span>`,foot:btn(c.cancel,'ghost')})});
add({id:'H-D5b', g:'ios-d', os:'ios', t:'Обработка: этап 2', cap:'Делаем текст (литературная правка).',
  r:(c,x)=>host(c,x,{title:c.dTitle,center:true,body:`${MASCOT('think',x.theme)}<h2 class="h2">${c.procT}</h2>${stages(c,1)}<span class="small">${c.procNote}</span>`,foot:btn(c.cancel,'ghost')})});
add({id:'H-D5c', g:'ios-d', os:'ios', t:'Обработка: этап 3', cap:'Переводим. Без перевода список из двух этапов.',
  r:(c,x)=>host(c,x,{title:c.dTitle,center:true,body:`${MASCOT('think',x.theme)}<h2 class="h2">${c.procT}</h2>${stages(c,2)}<span class="small">${c.procNote}</span>`,foot:btn(c.cancel,'ghost')})});
add({id:'H-D6', g:'ios-d', os:'ios', t:'Результат', cap:'Текст и перевод. «Изменить» — правка на месте, «Записать заново». Главная — «Готово, вернуться в чат»; под ней — подсказка про системную «◀», она подсвечена.',
  r:(c,x)=>host(c,x,{title:c.resT,close:'',hl:true,body:`${resultCards(c)}<div style="display:flex;gap:8px;flex-wrap:wrap">${btn(c.edit,'sec',I.edit)}${btn(c.again,'sec',I.redo)}</div>`,
    foot:`${btn(c.doneBack)}<span class="small" style="text-align:center">${fmt(c.backHint,{chat:c.chat})}</span>`})});
add({id:'H-D6b', g:'ios-d', os:'ios', t:'После «Готово»', cap:'iOS не даёт приложению вернуть в чат само. По «Готово» показываем подсказку со стрелкой на «◀ <чат>»; результат уже сохранён для клавиатуры (K-V2).',
  r:(c,x)=>host(c,x,{title:c.resT,hl:true,body:`${resultCards(c)}`,foot:`${btn(c.doneBack)}`,
    overlay:backOverlay(c,x,fmt(c.backHint,{chat:c.chat}))})});
add({id:'H-D6c', g:'ios-d', os:'ios', t:'Изменить', cap:'Правка текста на месте, клавиатура системная или Parrlo. Перевод пересчитывается после правки.',
  r:(c,x)=>host(c,x,{title:c.edit,close:c.done,body:`<div class="card"><span class="lab">${c.resText}</span><span class="val edit">${c.lit.text}<span class="caret"></span></span></div>`,foot:''})});
const errScreen = (id, t, cap, kind, ic, T, B, foot) => add({id, g:'ios-d', os:'ios', t, cap,
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--${kind==='err'?'errbg':'warnbg'});color:var(--${kind==='err'?'err':'warn'});box-shadow:none">${ic}</span><h2 class="h2">${T(c)}</h2><p class="p">${B(c,x)}</p>`,foot:foot(c)})});
errScreen('H-D7a','Ошибка: нет сети','Запись лежит на устройстве до повтора или отмены.','warn',I.wifiOff,c=>c.eNetT,c=>c.eNetB,c=>`${btn(c.retry)}${btn(c.again,'ghost')}`);
errScreen('H-D7b','Ошибка: лимит 429','Время сброса из заголовка Retry-After / поля reset_at, в местном времени.','warn',I.clock,c=>c.e429T,(c,x)=>fmt(c.e429B,{time:'18:40',left:LEFT[x.lang]}),c=>`${btn(c.typeInstead,'sec')}`);
errScreen('H-D7c','Ошибка: 503','Сервер или Soniox недоступны. Повтор не раньше чем через 30 с.','err',I.alert,c=>c.e503T,c=>c.e503B,c=>`${btn(c.retry)}${btn(c.cancel,'ghost')}`);
errScreen('H-D7f','Занято (.busy)','Общий пул голоса на сегодня занят (429 kbd_usd_day / kbd_usd_month / stt_cap_minute) — не личный лимит (H-D7b). Без цифр и времени сброса.','warn',I.clock,c=>c.busyT,c=>c.busyB,c=>`${btn(c.retry)}${btn(c.typeInstead,'ghost')}`);
errScreen('H-D7d','Ошибка: не распознано','Пустой результат распознавания. Ссылка на язык речи — если выбран не тот.','warn',I.ear,c=>c.eNrT,c=>c.eNrB,c=>`${btn(c.again)}${btn(c.speechLang+' ›','ghost')}`);
errScreen('H-D7e','Ошибка: запись < 1 с','На сервер не отправляем.','warn',I.info,c=>c.eShortT,c=>c.eShortB,c=>`${btn(c.again)}`);
add({id:'H-D8', g:'ios-d', os:'ios', t:'Прерывание: звонок', cap:'Звонок, Siri или уход в фон останавливают запись. Сохранённое не теряется: «Продолжить» дописывает, «Готово» отправляет в обработку.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--sf);color:var(--pri);box-shadow:none">${I.phone}</span><h2 class="h2">${c.intT}</h2><p class="p">${c.intCall} ${fmt(c.intSaved,{sec:'0:37'})}</p>`,
    foot:`${btn(c.done)}${btn(c.cont,'sec',I.mic)}`})});
add({id:'H-D8b', g:'ios-d', os:'ios', t:'Прерывание: фон / Siri', cap:'Тот же экран, другая причина. Для Siri — текст intSiri.',
  r:(c,x)=>host(c,x,{title:c.dTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--sf);color:var(--pri);box-shadow:none">${I.pause}</span><h2 class="h2">${c.intT}</h2><p class="p">${c.intBg} ${fmt(c.intSaved,{sec:'1:12'})}</p>`,
    foot:`${btn(c.done)}${btn(c.cont,'sec',I.mic)}`})});

/* ===== iOS: хост, голосовое ===== */
add({id:'H-G0', g:'ios-g', os:'ios', t:'Вход из 🔊', cap:'Клавиатура передаёт текст из поля ввода (до курсора). Если согласия нет — сначала H-D0.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,body:`<h1 class="h1">${c.gTitle}</h1><div class="card"><span class="lab">${c.gFrom}</span><span class="val">${c.lit.text}</span></div><p class="p">${c.gFromSub}</p>`,foot:btn(c.gNext)})});
add({id:'H-G0b', g:'ios-g', os:'ios', t:'Вход из 🔊: поле пустое', cap:'Предлагаем надиктовать — дальше обычная диктовка (H-D2), результат сразу идёт в H-G1.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--sf);color:var(--pri);box-shadow:none">${I.voice}</span><h2 class="h2">${c.gEmptyT}</h2><p class="p">${c.gEmptyB}</p>`,foot:btn(c.gDictate,'',I.mic)})});
add({id:'H-G1', g:'ios-g', os:'ios', t:'Текст для озвучки', cap:'Выбор: мой литературный текст или перевод; текст редактируется. Голос — «Мужской / Женский», стандартный, без клона. Лимит 600 символов на запрос.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,body:`<span class="small b6">${c.gWhich}</span><div class="seg"><span>${c.gMine}</span><span class="on">${c.gTr}</span></div>
    <div class="card"><span class="lab"><span>${c.gTr}</span><span style="text-transform:none;letter-spacing:0;font-weight:500">${c.lit.tr.length} / 600</span></span><span class="val edit">${c.lit.tr}<span class="caret"></span></span></div><span class="small">${c.gEditHint}</span>
    <span class="small b6">${c.gVoice}</span><div class="seg"><span class="on">${c.female}</span><span>${c.male}</span></div><span class="small">${c.gVoiceNote}</span>`,foot:btn(c.gSpeak,'',I.voice)})});
add({id:'H-G2', g:'ios-g', os:'ios', t:'Готовим голосовое', cap:'Один этап, без процентов. Анимация: попугай + волна.', anim:true,
  r:(c,x)=>host(c,x,{title:c.gTitle,center:true,body:`${MASCOT('speak',x.theme)}<h2 class="h2">${c.gPrep}</h2><div class="wave small" style="max-width:180px">${waveBars(16,2)}</div><span class="small">${c.gPrepSub}</span>`,foot:btn(c.cancel,'ghost')})});
add({id:'H-G3', g:'ios-g', os:'ios', t:'Плеер', cap:'Прослушать перед отправкой. «Переозвучить» — снова H-G1 с тем же текстом. «Поделиться» — системный лист iOS с файлом .m4a.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.done,body:`<h1 class="h1">${c.gReady}</h1><div class="player"><span class="pp">${I.play}</span><span class="wv">${staticWave(x.small?34:44,12)}</span><span class="tm">0:02 / 0:06</span></div>
    <div class="card"><span class="lab">${c.gTr} · ${c.female}</span><span class="val">${c.lit.tr}</span></div>`,foot:`${btn(c.share,'',I.share)}${btn(c.reVoice,'sec',I.redo)}`})});
add({id:'H-G4', g:'ios-g', os:'ios', t:'«Поделиться»', cap:'Системный лист: пользователь выбирает свой чат. Значки приложений — условные.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.done,body:`<h1 class="h1">${c.gReady}</h1><div class="player"><span class="pp">${I.play}</span><span class="wv">${staticWave(30,0,12)}</span><span class="tm">0:06</span></div>`,
    overlay:`<div class="scrim"></div><div class="sheet"><div class="grab"></div><div class="sh"><span class="fi">${I.file}</span><div><b class="f15">Parrlo · ${c.gTitle}</b><div class="small">m4a · 0:06</div></div></div>
      <div class="apps"><div class="on"><i></i>${c.chat}</div><div><i></i>Mail</div><div><i></i>…</div><div><i></i>…</div></div><div class="acts"><div>${c.gShareSheet}</div><div>…</div></div></div>`})});
add({id:'H-G4b', g:'ios-g', os:'ios', t:'Вернитесь в чат', cap:'После успешного «Поделиться». Подсветка «◀ <чат>»; в клавиатуре — K-V5.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.done,hl:true,center:true,body:`<span class="recbtn">${I.check}</span><h2 class="h2">${c.gShareT}</h2><p class="p">${fmt(c.gShareB,{chat:c.chat})}</p>`,foot:''})});
add({id:'H-G5a', g:'ios-g', os:'ios', t:'Текст слишком длинный', cap:'Счётчик красный, кнопка неактивна. Порог 600 символов на запрос (parrlo-back, 13.11).',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,body:`${msg('err',I.alert,c.gLongT,fmt(c.gLongB,{max:600,n:720}))}<div class="card"><span class="lab"><span>${c.gMine}</span><span style="color:var(--err);text-transform:none;letter-spacing:0">720 / 600</span></span><span class="val">${c.sumLong}</span></div>`,
    foot:`<span class="btn" style="background:var(--dis);color:var(--distx)">${c.gSpeak}</span>`})});
add({id:'H-G5b', g:'ios-g', os:'ios', t:'Ошибка: нет сети', cap:'Текст сохранён, повтор.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--warnbg);color:var(--warn);box-shadow:none">${I.wifiOff}</span><h2 class="h2">${c.eNetT}</h2><p class="p">${c.gNetB}</p>`,foot:btn(c.retry)})});
add({id:'H-G5c', g:'ios-g', os:'ios', t:'Ошибка: лимит 429', cap:'Время сброса — местное.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--warnbg);color:var(--warn);box-shadow:none">${I.clock}</span><h2 class="h2">${c.e429T}</h2><p class="p">${fmt(c.gE429B,{time:'18:40',left:LEFT[x.lang]})}</p>`,foot:btn(c.done,'sec')})});
add({id:'H-G5d', g:'ios-g', os:'ios', t:'Ошибка: 503', cap:'ElevenLabs или сервер недоступны.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--errbg);color:var(--err);box-shadow:none">${I.alert}</span><h2 class="h2">${c.gE503T}</h2><p class="p">${c.gE503B}</p>`,foot:btn(c.retry)})});
add({id:'H-G5e', g:'ios-g', os:'ios', t:'Занято (.busy)', cap:'Общий пул озвучки занят (429 kbd_usd_*/stt_cap_minute). Текст сохранён, «Повторить». Без цифр.',
  r:(c,x)=>host(c,x,{title:c.gTitle,close:c.cancel,center:true,body:`<span class="recbtn" style="background:var(--warnbg);color:var(--warn);box-shadow:none">${I.clock}</span><h2 class="h2">${c.busyT}</h2><p class="p">${c.gBusyB}</p>`,foot:btn(c.retry)})});

/* ===== Android v2 (заказ parrlo-keyboard 14.11) =====
   Панель голоса занимает место букв и не выше их (--kbody). Ряд действий с чипом «ES ⇄» виден всегда.
   При самом крупном шрифте содержимое панели прокручивается, кнопки закреплены внизу. */
const xBtn = (c) => `<span class="px" role="button" aria-label="${A11Y(c.closeA11y)}">${I.x}</span>`;
const pan = (body, acts) => { let note=''; acts=(acts||'').replace(/<span class="anote">[\s\S]*?<\/span>/,m=>{note=m;return ''}); return `<div class="sc">${body}</div>${note}${acts?`<div class="acts">${acts}</div>`:''}`; };
const sp = (t, cls='', ic='') => `<span class="${cls}" role="button">${ic}${t}</span>`;
const spA = (t, a, cls='', ic='') => `<span class="${cls}" role="button" aria-label="${A11Y(a)}">${ic}${t}</span>`;
const andRec = (c,x,o={}) => pan(`${andTop(c,`<span class="rdot"></span>${c.recording}`,`<span class="b7" style="color:var(--tx);font-variant-numeric:tabular-nums">${o.t||'0:42'}</span> ${c.of} 2:00`)}
  <div class="mid">${o.msg?'':`<div class="wave${o.flat?' flat':''}">${waveBars(x.small?24:30,o.seed||3)}</div>`}${o.msg||''}<div class="pbar${o.w?' w':''}"><i style="width:${o.p||35}%"></i></div></div>`,
  `${sp(c.cancel)}${sp(c.stop,'err','<span style="width:12px;height:12px;border-radius:3px;background:currentColor;display:block"></span>')}`);
const P = (c,x,body,acts,o={}) => kbScreen(c,x,o.m||{},{act:o.act||'mic',panel:pan(body,acts)});
const ln = (kind, ic, t, b) => msg(kind, ic, t, b||'');
const LANGS = {ru:'Español', es:'Русский', en:'Español'};

/* ---- A-K1 / A-V0 ---- */
add({id:'A-K1', g:'and-k', os:'and', t:'Клавиатура целиком', cap:'Ряд действий: чип языка собеседника «ES ⇄» (тап — выбор языка, ⇄ — поменять местами), «Улучшить», «Перевести», 🎤 «Диктовка», 🔊 «Голосовое» (подписи — в TalkBack и подсказке по долгому нажатию). При самом крупном шрифте «Улучшить»/«Перевести» — только значки. Буквы ru/es/en, язык на пробеле.',
  r:(c,x)=>kbScreen(c,x,{field:c.lit.text},{})});
add({id:'A-V0', g:'and', os:'and', t:'Голос доступен', cap:'Клавиатура пишет голос сама (RECORD_AUDIO у клавиатуры), в Parrlo не переключаемся. 🎤 и 🔊 — активный цвет.',
  r:(c,x)=>kbScreen(c,x,{},{})});

/* ---- A-V1 недоступен ---- */
add({id:'A-V1', g:'and', os:'and', t:'Голос недоступен: приглушено', cap:'🎤 и 🔊 приглушены (42%), но нажимаются. Тап → строка с причиной (A-V1a…e). Буквы не прячем.',
  r:(c,x)=>kbScreen(c,x,{},{off:true})});
[['A-V1a','нет 16+',I.lock,'r16T','r16B',1],['A-V1b','нет согласия',I.shield,'rConsT','rConsB',1],['A-V1c','нет микрофона',I.micOff,'rMicT','rMicB',1],
 ['A-V1d','503 keyboard_unavailable',I.alert,'rKbT','rKbB',0],['A-V1e','повторный 401',I.lock,'r401T','r401B',1]].forEach(([id,why,ic,T,B,open])=>
  add({id, g:'and', os:'and', t:`Недоступен: ${why}`, cap: open ? '«Открыть Parrlo» → нужный экран Parrlo (возраст / согласие A-V1f / вход). После него — обратно в чат, голос включён.' : 'Без кнопки «Открыть»: чинить пользователю нечего. Строка скрывается крестиком или при наборе.',
    r:(c,x)=>kbScreen(c,x,{},{off:true,banner:c[B],banT:c[T],bannerBtn:open?c.openParrlo:false})}));
add({id:'A-V1f', g:'and', os:'and', t:'Раскрытие и согласие (Parrlo)', cap:'Экран Parrlo (Activity), вход из A-V1b/c. Две равные кнопки «Не сейчас» / «Разрешить» — в конце текста, после всех пунктов и политики (без навязывания выбора). c4 (Soniox, удаление ≤ 30 мин) — окончательно после DPA Soniox (Мурат). Тексты — через RG.',
  r:(c,x)=>host(c,x,{nav:true,title:c.cTitle,body:`<p class="p">${c.cLead}</p>
    <div class="grp"><div class="rowi"><span class="t">${c.c1t}<small>${c.c1}</small></span></div><div class="rowi"><span class="t">${c.c2t}<small>${c.c2}</small></span></div><div class="rowi"><span class="t">${c.c3t}<small>${c.c3}</small></span></div></div>
    <p class="small">${c.c4} ${c.c5}</p><span class="small lnk">${c.cPolicy}</span><div class="eqbtn">${btn(c.cLater,'eq')}${btn(c.cAllow,'eq')}</div><span class="small" style="text-align:center">${c.cNext.replace('iOS','Android')}</span>`})});
add({id:'A-V1g', g:'and', os:'and', t:'Системный запрос микрофона', cap:'Системный диалог Android 11+ (текст системный, наш — только имя «Parrlo»). «Не разрешать» дважды → A-V1c ведёт в настройки Android.',
  r:(c,x)=>host(c,x,{nav:true,title:c.cTitle,body:`<p class="p">${c.cLead}</p>`,overlay:`<div class="sysdim"><div class="sysdlg"><span class="si">${I.mic}</span><b>${c.aMicAsk}</b><span>${c.aMicWhile}</span><span>${c.aMicOnce}</span><span>${c.aMicNo}</span></div></div>`})});

/* ---- A-V2 запись ---- */
add({id:'A-V2', g:'and', os:'and', t:'Запись', cap:'Панель вместо букв, не выше их — чат не прыгает. Волна — уровень микрофона. Таймер «0:42 из 2:00», полоса — доля лимита.', anim:true,
  r:(c,x)=>kbScreen(c,x,{},{act:'mic',panel:andRec(c,x)})});
add({id:'A-V2b', g:'and', os:'and', t:'Запись: осталось 15 с', cap:'С 1:45 — янтарная полоса и строка. В 2:00 запись останавливается сама → A-V4.',
  r:(c,x)=>kbScreen(c,x,{},{act:'mic',panel:andRec(c,x,{t:'1:45',p:87.5,w:true,msg:ln('warn',I.clock,c.left15),seed:7})})});
add({id:'A-V2c', g:'and', os:'and', t:'Android не дал микрофон', cap:'AudioRecord не стартовал (звонок, другое приложение, фокус). «Записать в приложении» открывает диктовку в Parrlo, текст вернётся в клавиатуру.',
  r:(c,x)=>P(c,x,`<div class="mid">${ln('warn',I.micOff,c.aMicBusyT,c.aMicBusyB)}</div>`,`${sp(c.cancel,'s')}${spA(c.recInApp,c.recInAppA11y,'pri')}`)});

/* ---- A-V3 / A-V4 ---- */
add({id:'A-V3', g:'and', os:'and', t:'Тишина', cap:'Через 5 с без голоса. Запись продолжается; строка уходит, как только появится голос.',
  r:(c,x)=>kbScreen(c,x,{},{act:'mic',panel:andRec(c,x,{t:'0:06',p:5,flat:true,msg:ln('warn',I.ear,c.aSilence)})})});
add({id:'A-V4', g:'and', os:'and', t:'Обработка', cap:'Честные этапы «Распознаём → Делаем текст → Переводим» по ответам сервера, без фальшивой полосы. «Переводим» — только если перевод включён.', anim:true,
  r:(c,x)=>P(c,x,`${andTop(c,c.procT,'')}<div class="mid" style="align-items:stretch">${stages(c,'anim').replace('class="stages"','class="stages" style="--fs:var(--kfs);gap:8px"')}</div>`,sp(c.cancel))});

/* ---- A-V5 результат ---- */
const prevBox = (c, tr) => `<div class="prev two">${xBtn(c)}<span class="o">${c.lit.text}</span>${tr?`<span class="t"><small>${c.resTr}</small>${c.lit.tr}</span>`:''}</div>`;
add({id:'A-V5', g:'and', os:'and', t:'Результат диктовки', cap:'Превью: текст — 2 строки, перевод — 3 строки (длиннее — многоточие, полный текст в TalkBack). «Вставить» — перевод, «Без перевода» — исходный текст (в TalkBack — «Вставить без перевода»), ↻ — заново, ✕ — закрыть без вставки.',
  r:(c,x)=>P(c,x,prevBox(c,true),`<span class="ic1" role="button" aria-label="${A11Y(c.againShort)}">${I.redo}</span>${spA(c.insNoTrS,c.insNoTr)}${spA(c.insert,c.insertTrA11y,'pri')}`)});
add({id:'A-V5b', g:'and', os:'and', t:'Результат без перевода', cap:'Перевод выключен (или язык речи = язык собеседника): одна кнопка «Вставить».',
  r:(c,x)=>P(c,x,prevBox(c,false),`${sp(c.againShort,'',I.redo)}${sp(c.insert,'pri')}`)});

/* ---- A-V6 голосовое ---- */
const gPrev = (c, n, over) => `<div class="prev">${xBtn(c)}<span class="clamp3">${over?c.sumLong:c.lit.tr}</span><span class="cnt${over?' lim':''}">${over?c.gLongT+' · ':''}${fmt(c.gCount,{n,max:600})}</span></div>`;
const gSeg = (c) => `<div class="seg sm"><span>${c.gLit}</span><span class="on">${c.gTr}</span></div>`;
const gSex = (c) => `<span class="sx" role="radiogroup" aria-label="${A11Y(c.gVoice)}"><span class="on" role="radio" aria-checked="true">${c.female}</span><span role="radio" aria-checked="false">${c.male}</span></span>`;
add({id:'A-V6a', g:'and', os:'and', t:'Голосовое: текст', cap:'Из поля ввода: «Литературно» (исправленный текст) или «Перевод». Голос «Женский / Мужской» (стандартный, не ваш). Счётчик до 600 знаков. При самом крупном шрифте выбор голоса уходит в прокручиваемую часть, «Озвучить» — на всю ширину.',
  r:(c,x)=>P(c,x,`${gSeg(c)}${gPrev(c,84)}<div class="sxrow">${gSex(c)}</div>`,`${gSex(c)}${sp(c.gSpeak,'pri',I.voice)}`,{act:'voice',m:{field:c.lit.text}})});
add({id:'A-V6d', g:'and', os:'and', t:'Голосовое: больше 600', cap:'Счётчик красный с причиной, «Озвучить» неактивна. Текст правят в поле чата — счётчик обновляется сразу.',
  r:(c,x)=>P(c,x,`${gSeg(c)}${gPrev(c,612,true)}<div class="sxrow">${gSex(c)}</div>`,`${gSex(c)}${sp(c.gSpeak,'pri dis',I.voice)}`,{act:'voice',m:{field:c.sumLong}})});
add({id:'A-V6b', g:'and', os:'and', t:'Голосовое: готовим', cap:'Один этап, без полосы. «Отмена» возвращает к A-V6a.', anim:true,
  r:(c,x)=>P(c,x,`${andTop(c,c.gPrep,'')}<div class="mid"><div class="wave small" style="max-width:180px">${waveBars(16,2)}</div><span class="small">${c.gPrepSub}</span></div>`,sp(c.cancel),{act:'voice',m:{field:c.lit.text}})});
add({id:'A-V6c', g:'and', os:'and', t:'Голосовое готово', cap:'Плеер play/pause и длительность. «Отправить»: аудио в поле чата (commitContent), если чат принимает; иначе системный «Поделиться». Само не отправляется.',
  r:(c,x)=>P(c,x,`${andTop(c,c.gReady,xBtn(c))}<div class="player"><span class="pp" role="button" aria-label="Play">${I.play}</span><span class="wv">${staticWave(x.small?28:34,10)}</span><span class="tm">0:06</span></div>`,`<span class="anote">${c.gReadyNote}</span>${sp(c.reVoice,'',I.redo)}${sp(c.aSend,'pri',I.send)}`,{act:'voice',m:{field:c.lit.text}})});
add({id:'A-V6e', g:'and', os:'and', t:'Голосовое в поле', cap:'После «Отправить»: аудио в поле ввода чата, отправляет сам человек. Панель закрылась, вернулись буквы.',
  r:(c,x)=>kbScreen(c,x,{field:`<span class="au0">${I.play}<i></i>0:06</span>`},{chip:'sent2',chipT:c.aVoiceIns,chipS:c.aVoiceInsSub})});

/* ---- A-V7 ошибки ---- */
[['A-V7a','нет сети',I.wifiOff,'eNetT','eNetB','retry'],
 ['A-V7b','429 лимит дня',I.clock,'e429T','e429B','type'],
 ['A-V7c','429 busy',I.clock,'busyT','busyB','retry'],
 ['A-V7d','503 stt_unavailable',I.alert,'e503T','e503B','retry'],
 ['A-V7f','422',I.ear,'e422T','e422B','again'],
 ['A-V7g','короче 1 с',I.clock,'eShortT','eShortB','again'],
 ['A-V7h','413',I.alert,'e413T','e413B','again'],
 ['A-V7i','502 / 504',I.wifiOff,'e502T','e502B','retry']].forEach(([id,why,ic,T,B,act])=>
  add({id, g:'and', os:'and', t:`Ошибка: ${why}`, cap: act==='retry' ? 'Запись сохранена — «Повторить» шлёт её же.' : act==='type' ? 'Время сброса — местное. Буквы — одним тапом.' : 'Запись не сохраняем: нужна новая.',
    r:(c,x)=>P(c,x,`<div class="mid">${ln('warn',ic,c[T],fmt(c[B],{time:'18:40',left:LEFT[x.lang]}))}</div>`,
      act==='retry'?`${sp(c.cancel)}${sp(c.retry,'pri')}`:act==='type'?sp(c.typeInstead,'pri'):`${sp(c.cancel)}${sp(c.againShort,'pri',I.mic)}`)}));
add({id:'A-V7e', g:'and', os:'and', t:'Ошибка: 503 voice_disabled / no_credit', cap:'Кнопки 🎤 и 🔊 скрыты, строка — один раз за сессию. Причину (кредиты, выключатель) не раскрываем.',
  r:(c,x)=>kbScreen(c,x,{},{noVoice:true,banner:c.eVoiceOffB,banT:c.eVoiceOffT,bannerBtn:false})});

/* ---- A-V8 прерывание ---- */
add({id:'A-V8', g:'and', os:'and', t:'Прерывание', cap:'Звонок, потеря аудиофокуса или клавиатуру скрыли — запись остановлена и сохранена. В той же панели: «Удалить», «Продолжить», «Готово» (→ A-V4).',
  r:(c,x)=>P(c,x,`<div class="mid">${ln('info',I.phone,c.intT,c.intCall+' '+fmt(c.intSaved,{sec:'0:37'}))}</div>`,`<span class="ic1" role="button" aria-label="${A11Y(c.del2)}">${I.trash}</span>${spA(c.contS,c.cont,'',I.mic)}${sp(c.done,'pri')}`)});

/* ---- A-K2 настройки ---- */
const AR = (t, v, cls='') => `<div class="rowi ar ${cls}"><span class="t">${t}</span>${v}</div>`;
const tg = (on) => `<span class="tog${on?'':' off'}"></span>`;
const k2 = (c, x, o={}) => `${sb(c,x)}<div class="nv k2nv"><span class="bk">${I.chevL.replace('<svg','<svg style="width:24px;height:24px"')}</span><span class="tt">${c.aSettings}</span></div>
  <div class="body">${o.body}</div>${hm()}`;
const k2Status = (c, ok) => `<div class="grp">${AR(`${c.k2Status}<small>${ok?`${c.k2On} · ${c.k2Sel}`:c.k2OnNo}</small>`, ok?`<span class="v" style="color:var(--pri)">${I.check.replace('<svg','<svg style="width:20px;height:20px"')}</span>`:`<span class="btn pri k2b">${c.k2Turn}</span>`, ok?'tg':'st')}</div>`;
const k2Head = (t) => `<span class="small b6" style="padding:0 4px;text-transform:uppercase;letter-spacing:.04em">${t}</span>`;
const V = (t) => `<span class="v">${t}<span class="chv"> ›</span></span>`;
add({id:'A-K2', g:'and-k', os:'and', t:'Настройки клавиатуры', cap:'Activity. Статус «включена / выбрана», язык собеседника, «О вас» (форма в переводе, решение 30), согласия текст/голос, 16+, политика, «Удалить данные» (→ подтверждение). При крупном шрифте значение — под заголовком (как в Material). Длинный экран прокручивается: см. A-K2b.',
  r:(c,x)=>k2(c,x,{body:`${k2Status(c,true)}
    <div class="grp">${AR(c.sPartner, V(LANGS[x.lang]))}</div>
    ${k2Head(c.k2About)}<div class="grp">${AR(`${c.k2Form}<small>${c.k2FormSub}</small>`, V(c.k2FormN))}</div>
    ${k2Head(c.k2Cons)}<div class="grp">${AR(`${c.k2ConsText}<small>${c.k2ConsTextSub}</small>`, tg(true),'tg')}${AR(`${c.k2ConsVoice}<small>${c.k2ConsVoiceSub}</small>`, tg(true),'tg')}</div>`})});
add({id:'A-K2b', g:'and-k', os:'and', t:'Настройки: низ и «не включена»', cap:'Если клавиатура не включена или не выбрана — кнопка ведёт в системные настройки ввода. Внизу: возраст, политика, удаление данных (красным).',
  r:(c,x)=>k2(c,x,{body:`${k2Status(c,false)}
    <div class="grp">${AR(c.k2Age, `<span class="v">${c.k2AgeV}</span>`)}${AR(`<span class="lnk">${c.sPolicy}</span>`, V(''),'tg')}</div>
    <div class="grp">${AR(`<span style="color:var(--err)">${c.k2Del}</span><small>${c.k2DelSub}</small>`, `<span class="v" style="color:var(--err)">${I.trash.replace('<svg','<svg style="width:20px;height:20px"')}</span>`,'tg')}</div>`})});

window.SCREENS = S;
window.UTIL = {fmt, MARK};
})();
