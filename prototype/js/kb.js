/* Parrlo Translate prototype · ParrloKeyboard (Keyboard/*.swift, KeyboardCopy.swift, KeyboardFullAccessView.swift @ 5c0c39d0)
   Third-party chat is a neutral scheme (no logos, no brand colours). */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,L,esc,btn,goBtn,I,nav,tg,li_} = PP;
const S = () => PP.S; const T = PP.T; const CP = window.COPY;
const K = (k) => PP.C(CP.KB['keyboard.'+k]);

/* ---------- keyboard hub ---------- */
R['kb'] = () => { const s=S(); const tokenOk = tokenState()==='ok';
  const step = (n, done, t, sub, go, a) => `<button class="step ${done?'done':''}" ${go?`data-go="${go}"`:PP.attr(a)}><span class="n">${done?I.check:n}</span><span style="flex:1"><b>${esc(t)}</b><br><span class="sec sm">${esc(sub)}</span></span>${I.chev}</button>`;
  return `${nav(L('Клавиатура','Teclado','Keyboard'), '#/', L('Старт','Inicio','Start'))}<div class="scroll">
  <div class="center" style="margin:8px 0 14px">${PP.parrot()}<h1 class="t">ParrloKeyboard</h1><p class="sec">${esc(L('Переводит прямо в любом чате: напишите по-русски — вставьте по-испански.','Traduce en cualquier chat: escribe en español e inserta en ruso.','Translates right in any chat: type in your language, insert in theirs.'))}</p></div>
  ${step(1, s.kb.added, L('Добавьте клавиатуру','Añade el teclado','Add the Keyboard'), L('Настройки → Основные → Клавиатура → Клавиатуры → Новая клавиатура → Parrlo','Ajustes > General > Teclado > Teclados > Añadir teclado > Parrlo','Settings > General > Keyboard > Keyboards > Add New Keyboard > Parrlo'), '#/kb/ios/settings')}
  ${step(2, s.kb.added && s.kb.full, L('Разрешите полный доступ','Permite el acceso total','Allow Full Access'), K('nofull.short'), '#/kb/full')}
  ${step(3, s.kb.added && s.kb.full && s.kb.linked!==false && tokenOk, K('token.missing'), K('token.missing.detail'), null, 'kbOpenApp')}
  ${step(4, false, L('Попробуйте в чате','Pruébalo en un chat','Try It in a Chat'), L('Нейтральный мессенджер-схема с клавиатурой Parrlo','Mensajería neutra de ejemplo con el teclado Parrlo','A neutral sample messenger with the Parrlo keyboard'), '#/kb/chat')}
  <p class="ter xs mt">${esc(PP.C(CP.KB['keyboard.privacy']))}</p></div>`; };
A.kbOpenApp = () => { PP.A.openApp(); PP.toast(L('Parrlo открыт — клавиатура подключится к переводу','Parrlo abierto: el teclado se conectará a la traducción','Parrlo opened — the keyboard will connect to translation')); return false; };
R['kb/full'] = () => `${nav('', '#/kb', L('Клавиатура','Teclado','Keyboard'))}${PP.kbAccessBody()}<div class="foot">${goBtn(K('full.button'),'#/kb/ios/parrlo')}</div>`;

/* ---------- simulated iOS Settings ---------- */
const iosNav = (title, back, backLabel) => `<div class="nav"><button class="back" data-go="${back}">${I.back}<span>${esc(backLabel)}</span></button><div class="ttl">${esc(title)}</div></div>`;
const row = (t, go, val, a) => `<button class="li" ${go?`data-go="${go}"`:PP.attr(a)}><span class="tx"><b>${esc(t)}</b></span>${val?`<span class="val">${esc(val)}</span>`:''}${I.chev}</button>`;
const IOS = () => ({
  settings: L('Настройки','Ajustes','Settings'), general: L('Основные','General','General'), keyboard: L('Клавиатура','Teclado','Keyboard'), keyboards: L('Клавиатуры','Teclados','Keyboards'), add: L('Новая клавиатура','Añadir teclado','Add New Keyboard') });
R['kb/ios/:id'] = (id) => { const s=S(); const n=IOS(); const cnt = 3 + (s.kb.added?1:0);
  let h='';
  if (id==='settings') h = iosNav(n.settings, '#/kb', L('Клавиатура','Teclado','Keyboard'))+`<div class="scroll"><p class="ter xs">${esc(L('Имитация системных Настроек iOS','Simulación de Ajustes de iOS','Simulated iOS Settings'))}</p><div class="grp">${row(n.general,'#/kb/ios/general')}${row(L('Конфиденциальность','Privacidad','Privacy'),null,null,'iosNoop')}</div><div class="grp mt">${row('Parrlo','#/kb/ios/parrlo')}</div></div>`;
  else if (id==='general') h = iosNav(n.general, '#/kb/ios/settings', n.settings)+`<div class="scroll"><div class="grp">${row(L('Об этом устройстве','Información','About'),null,null,'iosNoop')}${row(n.keyboard,'#/kb/ios/keyboard')}${row(L('Язык и регион','Idioma y región','Language & Region'),null,null,'iosNoop')}</div></div>`;
  else if (id==='keyboard') h = iosNav(n.keyboard, '#/kb/ios/general', n.general)+`<div class="scroll"><div class="grp">${row(n.keyboards,'#/kb/ios/keyboards',String(cnt))}</div></div>`;
  else if (id==='keyboards') h = iosNav(n.keyboards, '#/kb/ios/keyboard', n.keyboard)+`<div class="scroll"><div class="grp">
     <div class="li"><span class="tx"><b>${esc(L('Русская','Ruso','Russian'))}</b></span></div><div class="li"><span class="tx"><b>${esc(L('Испанская','Español (España)','Spanish (Spain)'))}</b></span></div><div class="li"><span class="tx"><b>Emoji</b></span></div>
     ${s.kb.added?row(L('Parrlo — Parrlo','Parrlo — Parrlo','Parrlo — Parrlo'),'#/kb/ios/parrlo', s.kb.full?L('Полный доступ','Acceso total','Full Access'):''):''}</div>
     <div class="grp mt">${row(n.add+'…','#/kb/ios/add')}</div></div>`;
  else if (id==='add') h = iosNav(n.add, '#/kb/ios/keyboards', n.keyboards)+`<div class="scroll"><div class="gh">${esc(L('Клавиатуры других разработчиков','Teclados de otros desarrolladores','Third-Party Keyboards'))}</div><div class="grp"><button class="li" ${PP.attr('kbAdd')} id="add-parrlo"><span class="tile"><img src="assets/app-icon-180.png" alt="" style="width:28px;height:28px;border-radius:7px"></span><span class="tx"><b>Parrlo</b></span>${s.kb.added?I.check:''}</button></div></div>`;
  else if (id==='parrlo') h = iosNav('Parrlo', s.kb.added?'#/kb/ios/keyboards':'#/kb/ios/settings', s.kb.added?n.keyboards:n.settings)+`<div class="scroll"><div class="grp">${li_({t:'Parrlo', right:tg(s.kb.added,'kbAddTg')})}${s.kb.added?li_({t:L('Разрешить полный доступ','Permitir acceso total','Allow Full Access'), right:tg(s.kb.full,'kbFullTg')}):''}</div>
     <p class="gf">${esc(s.kb.added?L('Клавиатуры с полным доступом могут передавать данные по сети. Parrlo отправляет только текст, который вы переводите кнопкой «Перевести».','Los teclados con acceso total pueden enviar datos por la red. Parrlo solo envía el texto que traduces con «Traducir».','Keyboards with Full Access can send data over the network. Parrlo sends only the text you translate with Translate.'):L('Сначала добавьте клавиатуру Parrlo.','Primero añade el teclado Parrlo.','Add the Parrlo keyboard first.'))}</p>
     <div class="mt" style="display:flex;flex-direction:column;gap:8px">${goBtn(L('Попробовать в чате','Probar en un chat','Try in a Chat'),'#/kb/chat','pri')}${goBtn(L('К шагам клавиатуры','Volver a los pasos','Back to Keyboard Steps'),'#/kb','ghost')}</div></div>`;
  else return PP.R.notfound();
  return `<div class="ios">${h}</div>`; };
A.iosNoop = () => { PP.toast(L('В прототипе этот раздел не нужен','No hace falta en el prototipo','Not needed in the prototype')); };
A.kbAdd = () => { S().kb.added=true; PP.save(); PP.go('#/kb/ios/keyboards'); return false; };
A.kbAddTg = () => { const k=S().kb; k.added=!k.added; if (!k.added) k.full=false; };
A.kbFullTg = () => { const k=S().kb; if (k.full){ k.full=false; return; }
  PP.sysAlert({title:L('Разрешить полный доступ для клавиатур «Parrlo»?','¿Permitir acceso total a los teclados de «Parrlo»?','Allow Full Access for “Parrlo” Keyboards?'),
    msg:L('Клавиатуры с полным доступом могут передавать всё, что вы когда-либо вводили с их помощью, включая данные кредитных карт и адреса.','Los teclados con acceso total pueden transmitir todo lo que hayas escrito con ellos, incluidos números de tarjetas y direcciones.','Full access allows the developer of this keyboard to transmit anything you type, including previously typed text, credit card numbers and addresses.'),
    buttons:[{t:L('Разрешить','Permitir','Allow'),a:'kbFullYes'},{t:L('Не разрешать','No permitir','Don’t Allow'),a:'noop'}]}); };
A.kbFullYes = () => { S().kb.full=true; S().kb.linked=false; /* step 3: Parrlo must be opened once after Full Access */ };

/* ---------- state helpers ---------- */
function tokenState(){ const s=S(), d=s.demo; if (d.token && d.token!=='auto') return d.token; return s.intro && !(s.kb.full && s.kb.linked===false) ? 'ok' : 'missing'; }
PP.kbTokenState = tokenState;
function kbs(){ if (!T.kb) T.kb = {text:'', layout: PP.lang()==='es'?'es':'ru', shift:false, num:false, mode:'typing', target:null, tone:null, out:'', hint:null, err:null, sys:false, sel:false, busy:false, incoming:false}; return T.kb; }
const tgtDefault = () => { const p=S().pair; return p.theirs==='ru' ? p.mine : p.theirs; };
LEAVE['kb/chat'] = () => { clearTimeout(T.kbReplyT); };
ENTER['kb/chat'] = () => { const k=kbs(); if (!S().kb.added) k.sys=true; else if (k.sysForced!==true) k.sys=false; if (!T.kbMsgs) T.kbMsgs=[{in:true, text:'¡Hola! Soy Carmen, del piso. ¿Cuándo te viene bien ver el apartamento?'}]; };

PP.demoHooks.push((k)=>{ const kb=T.kb; if (!kb) return; kb.err=null; kb.dismissed=null; if (kb.mode==='how' && S().kb.full) kb.mode='typing'; if (kb.busy) kb.busy=false; });
/* ---------- chat with keyboard ---------- */
const LAY = {
  ru:['йцукенгшщзх','фывапролджэ','ячсмитьбю'],
  es:['qwertyuiop','asdfghjklñ','zxcvbnm'],
  en:['qwertyuiop','asdfghjkl','zxcvbnm'],
  num:['1234567890','-/:;()€&@"','.,?!\'¿¡']
};
const LNAME = {ru:'Русская', es:'Español', en:'English'};
const NEXT = {ru:'es', es:'en', en:'ru'};
function blocker(){ // persistent bar, order as in KeyboardViewController
  const s=S(), d=s.demo;
  if (!s.kb.full) return 'nofull';
  if (s.scope==='none' || s.scope===null) return 'cloudoff';
  const t=tokenState(); if (t==='missing') return 'token.missing'; if (t==='reconnect') return 'token.reconnect';
  if (d.offline) return 'offline';
  return null; }
function bar(code){ if (!code) return '';
  if (code==='nofull') return `<div class="warnbar">${I.lock}<span class="tx">${esc(K('nofull.short'))}</span><button class="sbtn g" ${PP.attr('kbHow')}>${esc(K('nofull.button'))}</button></div>`;
  if (code.startsWith('token')) return `<div class="warnbar">${I.info}<span class="tx"><b>${esc(K(code))}</b><br>${esc(K(code+'.detail'))}</span><button class="sbtn g" ${PP.attr('kbOpenParrlo')}>Parrlo</button></div>`;
  return `<div class="warnbar">${I.info}<span class="tx">${esc(K(code))}</span>${code==='failed'?`<button class="sbtn g" ${PP.attr('kbTranslate')}>${esc(L('Повторить','Reintentar','Retry'))}</button>`:''}<button class="sbtn" ${PP.attr('kbErrClose')} aria-label="${esc(L('Закрыть','Cerrar','Close'))}">${I.x}</button></div>`; }
function keyRows(k){ const rows = k.num?LAY.num:LAY[k.layout]; const up=(c)=>k.shift?c.toUpperCase():c;
  const key = (c) => `<button class="k" ${PP.attr('kbKey',c)}>${esc(up(c))}</button>`;
  return `<div class="rows ${k.layout}">
   <div class="r">${[...rows[0]].map(key).join('')}</div><div class="r">${[...rows[1]].map(key).join('')}</div>
   <div class="r"><button class="k fn" ${PP.attr('kbShift')} aria-label="${esc(L('Заглавные','Mayúsculas','Shift'))}" style="${k.shift?'background:#E8ECF1;color:#0E1116':''}">${I.shift}</button>${[...rows[2]].map(key).join('')}<button class="k fn" ${PP.attr('kbDel')} aria-label="${esc(L('Удалить','Borrar','Delete'))}">${I.del}</button></div>
   <div class="r"><button class="k fn" ${PP.attr('kbNum')}>${k.num?'АБВ':'123'}</button><button class="k fn" ${PP.attr('kbGlobe')} aria-label="${esc(L('Следующая клавиатура','Siguiente teclado','Next Keyboard'))}">${I.globe}</button><button class="k lang fn" ${PP.attr('kbLang')}>${k.layout.toUpperCase()}</button><button class="k sp" id="kbSpace" ${PP.attr('kbKey',' ')}>${esc(LNAME[k.layout])}</button><button class="k fn" ${PP.attr('kbRet')} aria-label="${esc(L('Ввод','Intro','Return'))}">${I.ret}</button></div></div>`; }
function stripHtml(k){ const s=S(); const tgt=k.target||tgtDefault(); const tone=k.tone;
  const label = k.text.trim() ? (k.sel ? K('translateSelected') : K('translate')) : K('translateCopied'); // as in KeyboardViewController.goTitleKey
  return `<div class="strip"><button class="ib" ${PP.attr('kbParrot')} aria-label="Parrlo">${PP.parrot('sm').replace('class="','style="width:30px;height:30px" class="')}</button>
   <button class="sbtn g" ${PP.attr('kbTarget')}>→ ${esc(tgt.toUpperCase())}</button>
   <button class="sbtn" ${PP.attr('kbTone')} style="${tone?'background:#24423A;color:#BFF2DC':''}">${esc(tone==='polite'?K('tone.polite'):K('tone.friend'))}</button>
   <button class="sbtn" ${PP.attr('kbInfo')} aria-label="${esc(L('Как это работает','Cómo funciona','How It Works'))}">i</button>
   <button class="tr" ${PP.attr('kbTranslate')} ${k.busy?'disabled':''}>${k.busy?'<span class="spark"><i></i><i></i><i></i></span>':esc(label)}</button></div>`; }
function kbHtml(){ const k=kbs(); const s=S();
  if (k.sys) return sysKb();
  if (s.demo.under16kb) return `<div class="kb">${keyRows(k)}</div>`; // under 16: translation silently hidden
  let body;
  if (k.mode==='preview') body = `<div class="panel"><div class="ter xs">${esc(K('aiNote'))}</div><div class="pcard" id="kbOut">${esc(k.out)}</div><div class="r" style="display:flex;gap:8px">${btn(K('close'),'kbClosePanel',undefined,'sec')}${k.incoming?btn(L('Скопировать','Copiar','Copy'),'kbCopyOut',undefined,'sec'):btn(K('edit'),'kbEdit',undefined,'sec')+btn(K('insert'),'kbInsert',undefined,'pri',k.out&&k.out.trim()?'':'disabled')}</div></div>`;
  else if (k.mode==='edit') body = `<div class="panel"><div class="ter xs">${esc(K('hint.h7'))}</div><div class="pcard"><textarea id="kbEditTa" data-input="kbEditInput">${esc(k.out)}</textarea></div><div class="r" style="display:flex;gap:8px">${btn(K('close'),'kbClosePanel',undefined,'sec')}${btn(K('insert'),'kbInsert',undefined,'pri',k.out&&k.out.trim()?'':'disabled')}</div></div>`;
  else if (k.mode==='info') body = `<div class="panel"><div class="pcard" style="font-size:14px"><b>${esc(L('Как работает перевод в клавиатуре','Cómo funciona la traducción en el teclado','How Keyboard Translation Works'))}</b><p class="sec">${esc(PP.C(CP.KB['keyboard.privacy']))}</p><p class="sec">${esc(K('hint.h5').replace(/\{[^}]+\}/,(k.layout||'ru').toUpperCase()).replace(/\{[^}]+\}/,(k.target||tgtDefault()).toUpperCase()))}</p><p class="sec">${esc(K('hint.h10'))}</p></div>${btn(K('close'),'kbClosePanel',undefined,'sec')}</div>`;
  else if (k.mode==='how') body = `<div class="panel"><div class="pcard" style="font-size:15px">${esc(K('nofull.panel'))}</div><div class="r" style="display:flex;gap:8px">${btn(K('close'),'kbClosePanel',undefined,'sec')}${btn(K('full.button'),'kbGoSettings',undefined,'pri')}</div></div>`;
  else body = keyRows(k);
  const bl = blocker(); const err = k.err ? bar(k.err) : (bl && bl===k.dismissed ? '' : bar(bl));
  const hint = k.hint ? `<div class="hint" id="kbHint">${esc(k.hint)}</div>` : '';
  return `<div class="kb">${err}${stripHtml(k)}${hint}${body}</div>`; }
function sysKb(){ const k=kbs(); const s=S(); const rows = k.num?LAY.num:LAY[k.layout==='ru'?'ru':'en']; const up=(c)=>k.shift?c.toUpperCase():c;
  const key=(c)=>`<button class="k" ${PP.attr('kbKey',c)}>${esc(up(c))}</button>`;
  return `${s.kb.added?'':`<div class="warnbar" style="margin:6px;border-radius:12px;padding:8px 10px;background:#2F2A1F;color:#F7D9A3;font-size:13px;display:flex;gap:8px;align-items:center"><span style="flex:1">${esc(L('Клавиатура Parrlo ещё не добавлена','El teclado Parrlo aún no está añadido','The Parrlo keyboard isn’t added yet'))}</span><button class="btn mint" style="width:auto;height:32px;padding:0 12px;font-size:13px" data-go="#/kb/ios/settings">${esc(L('Добавить','Añadir','Add'))}</button></div>`}
  <div class="syskb"><div class="sysk-note">${esc(L('Системная клавиатура iOS','Teclado del sistema iOS','iOS System Keyboard'))}</div><div class="r">${[...rows[0]].map(key).join('')}</div><div class="r">${[...rows[1]].map(key).join('')}</div>
  <div class="r"><button class="k fn" ${PP.attr('kbShift')} aria-label="${esc(L('Заглавные','Mayúsculas','Shift'))}" style="${k.shift?'background:#E8ECF1;color:#0E1116':''}">${I.shift}</button>${[...rows[2]].map(key).join('')}<button class="k fn" ${PP.attr('kbDel')} aria-label="${esc(L('Удалить','Borrar','Delete'))}">${I.del}</button></div>
  <div class="r"><button class="k fn" ${PP.attr('kbNum')}>${k.num?'АБВ':'123'}</button><button class="k fn" ${PP.attr('kbGlobe')} aria-label="${esc(L('Следующая клавиатура','Siguiente teclado','Next Keyboard'))}">${I.globe}</button><button class="k sp" ${PP.attr('kbKey',' ')}>${esc(L('Пробел','espacio','space'))}</button><button class="k fn" style="flex:2;font-size:14px" ${PP.attr('kbRet')}>${esc(L('Ввод','intro','return'))}</button></div></div>`; }
R['kb/chat'] = () => { const k=kbs();
  return `<div class="msgr"><div class="mh"><button data-go="#/kb" style="color:#5AA9FF;display:flex;align-items:center" aria-label="${esc(L('Назад','Atrás','Back'))}">${I.back}</button><span class="av">C</span><span style="flex:1"><b>Carmen</b><br><span class="xs sec">${esc(L('Мессенджер · нейтральная схема','Mensajería · esquema neutro','Messenger · neutral scheme'))}</span></span></div>
  <div class="ml" id="kbFeed">${(T.kbMsgs||[]).map((m,i)=>m.in?`<button class="mb in" ${PP.attr('kbMsgTap',i)} data-long="kbMsgCopy" data-lv="${i}">${esc(m.text)}<span class="tm">${esc(L('удерживайте — скопировать','mantén pulsado para copiar','hold to copy'))}</span></button>`:`<div class="mb out">${esc(m.text)}<span class="tm">✓✓</span></div>`).join('')}</div>
  <div class="inp"><button class="field ${k.flash?'flash':''}" aria-label="${esc(L('Поле сообщения','Campo de mensaje','Message field'))}" ${PP.attr('kbField')} data-long="kbSelect" style="${k.sel?'background:#2B4A6B':''}">${k.text?esc(k.text):`<span class="ph">${esc(L('Сообщение','Mensaje','Message'))}</span>`}<span class="cur"></span></button><button class="sendb" ${PP.attr('kbSend')} aria-label="${esc(L('Отправить','Enviar','Send'))}" ${k.text.trim()?'':'disabled style="opacity:.45"'}>${I.send}</button></div></div>${kbHtml()}`; };

/* actions */
function flash(){ const k=kbs(); k.flash=true; clearTimeout(T.kbFlashT); T.kbFlashT=setTimeout(()=>{ k.flash=false; if (PP.route()==='kb/chat') PP.render(); }, 900); }
const firstHint = () => { const k=kbs(); if (!S().kb.hintSwipe){ k.hint=K('hint.h4'); } };
function toneHint(){ const k=kbs(); const t=k.text.toLowerCase(); if (k.tone) { k.hint=null; return; }
  if (/здравствуйте|уважаем|прошу|buenos días|estimad|usted/.test(t)) k.hint=K('hint.h8'); else if (/привет|пока|спасиб|hola|guap|tío/.test(t)) k.hint=K('hint.h9'); else if (k.hint===K('hint.h8')||k.hint===K('hint.h9')||k.hint===K('hint.h1')) k.hint=null; }
A.kbKey = (c) => { const k=kbs(); k.err=null; k.sel=false; k.text += (k.shift?c.toUpperCase():c); if (k.shift) k.shift=false; if (k.text.length>2000) k.hint=K('hint.h11'); else toneHint(); };
A.kbDel = () => { const k=kbs(); if (!k.text){ k.hint=K('hint.h3'); flash(); return; } k.sel ? k.text='' : k.text=k.text.slice(0,-1); k.sel=false; toneHint(); };
A.kbShift = () => { kbs().shift=!kbs().shift; };
A.kbNum = () => { kbs().num=!kbs().num; };
A.kbRet = () => { const k=kbs(); if (!k.text){ k.hint=K('hint.h1'); flash(); return; } k.text += '\n'; };
A.kbLang = () => { const k=kbs(); k.layout=NEXT[k.layout]; k.num=false; S().kb.hintSwipe=true; if (k.hint===K('hint.h4')) k.hint=null; };
A.kbGlobe = () => { const k=kbs(); if (!S().kb.added){ PP.toast(L('Других клавиатур нет — добавьте Parrlo в Настройках','No hay otros teclados: añade Parrlo en Ajustes','No other keyboards — add Parrlo in Settings')); return; } k.sys=!k.sys; k.sysForced=k.sys; if (!k.sys) firstHint(); };
A.kbField = () => { const k=kbs(); if (!k.text){ flash(); k.sel=false; k.hint = k.hint===K('hint.h1') ? K('hint.h2') : K('hint.h1'); } else { k.sel=!k.sel; } };
A.kbSelect = () => { const k=kbs(); if (k.text) { k.sel=!k.sel; } else PP.toast(L('Нечего выделить','No hay nada que seleccionar','Nothing to select')); };
A.kbMsgTap = (i) => { const k=kbs(); if (k.sys || S().demo.under16kb || k.hint===K('hint.h2')) PP.toast(L('Удерживайте сообщение, чтобы скопировать','Mantén pulsado el mensaje para copiarlo','Press and hold the message to copy it')); k.hint=K('hint.h2'); };
A.kbMsgCopy = (i) => { const m=(T.kbMsgs||[])[+i]; if (!m) return; T.kbCopied=m.text; PP.copy(m.text); kbs().text===''; PP.toast(L('Скопировано','Copiado','Copied')); };
A.kbSend = () => { const k=kbs(); const t=k.text.trim(); if (!t) return; T.kbMsgs.push({in:false, text:t}); k.text=''; k.sel=false; k.hint=null;
  clearTimeout(T.kbReplyT); T.kbReplyT=setTimeout(()=>{ const rep=['¡Perfecto! ¿Te va bien mañana a las seis?','Vale, te mando la dirección por aquí.','Gracias, nos vemos pronto.']; T.kbMsgs.push({in:true, text:rep[(T.kbMsgs.length>>1)%rep.length]}); if (PP.route()==='kb/chat'){ PP.render(); const f=document.getElementById('kbFeed'); if(f) f.scrollTop=f.scrollHeight; } }, 1400); };
A.kbTarget = () => { const k=kbs(); const cur=k.target||tgtDefault(); k.target = cur==='es'?'en':'es'; };
A.kbTone = () => { const k=kbs(); k.tone = k.tone===null?'friend':k.tone==='friend'?'polite':null; toneHint(); };
A.kbInfo = () => { const k=kbs(); k.mode = k.mode==='info'?'typing':'info'; };
A.kbParrot = () => { const k=kbs(); const tgt=k.target||tgtDefault(); k.hint = K('hint.h5').replace(/\{[^}]+\}/,(k.text?DATA.detect(k.text):k.layout).toUpperCase()).replace(/\{[^}]+\}/,tgt.toUpperCase()); };
A.kbHow = () => { kbs().mode='how'; };
A.kbGoSettings = () => { kbs().mode='typing'; PP.go('#/kb/ios/parrlo'); return false; };
A.kbOpenParrlo = () => { PP.A.openApp(); return false; };
A.kbErrClose = () => { const k=kbs(); k.dismissed = k.err || blocker(); k.err=null; };
A.kbClosePanel = () => { const k=kbs(); k.mode='typing'; k.incoming=false; };
A.kbEdit = () => { kbs().mode='edit'; };
A.kbCopyOut = () => { PP.copy(kbs().out); PP.toast(L('Скопировано','Copiado','Copied')); };
A.kbInsert = () => { const k=kbs(); const ta=document.getElementById('kbEditTa'); if (ta) k.out=ta.value; if (!k.out || !k.out.trim()) return false; k.text=k.out; k.mode='typing'; k.sel=false; k.hint=K('hint.h12'); };
A.kbEditInput = (v) => { kbs().out=v; const b=document.querySelector('.kb [data-a=kbInsert]'); if (b) b.disabled=!v.trim(); return false; };
A.kbTranslate = () => { const k=kbs(); const s=S(), d=s.demo; k.hint=null; k.dismissed=null;
  const useCopied = !k.text.trim() && !!T.kbCopied; const src = useCopied ? T.kbCopied : k.text.trim();
  if (!src){ k.hint=K('hint.h3'); return; }
  if (src.length>2000){ k.hint=K('hint.h11'); return; }
  const b=blocker(); if (b){ const was = k.err===b || (!k.err && k.dismissed!==b); k.err=b; if (b==='nofull') k.mode='how'; else if (was) PP.toast(K(b)); return; }
  if (d.limit){ if (k.err==='limit') PP.toast(K('limit')); k.err='limit'; return; }
  if (d.unavailable){ if (k.err==='unavailable') PP.toast(K('unavailable')); k.err='unavailable'; return; }
  k.busy=true; k.err=null; PP.render();
  setTimeout(()=>{ k.busy=false; if (d.failNext){ d.failNext=false; k.err='failed'; PP.save(); if (PP.route()==='kb/chat') PP.render(); return; }
    const from = DATA.detect(src); let to = useCopied ? (s.pair.mine==='es'?'ru':s.pair.mine) : (k.target||tgtDefault()); if (to===from) to = from==='ru'?'es':'ru';
    const r = DATA.translate(src, from, to, {style: k.tone==='polite'?'formal':'none', gender: s.gender});
    if (!r.text || !r.text.trim()){ k.err='failed'; k.mode='typing'; if (PP.route()==='kb/chat') PP.render(); return; } // as in code: no translation → notice .failed, no preview
    k.out=r.text; k.incoming=useCopied; k.mode='preview'; k.hint=K('hint.h6'); if (PP.route()==='kb/chat') PP.render(); }, 700); };

/* space-bar swipe changes language (h4) */
let sx=null;
document.addEventListener('pointerdown', e => { const sp=e.target.closest('#kbSpace'); sx = sp ? e.clientX : null; });
document.addEventListener('pointerup', e => { if (sx===null) return; const dx=e.clientX-sx; sx=null; if (Math.abs(dx)>40){ PP.T.kbSwiped=Date.now(); A.kbLang(); PP.render(); } });
document.addEventListener('click', e => { if (PP.T.kbSwiped && Date.now()-PP.T.kbSwiped<400 && e.target.closest('#kbSpace')){ e.stopPropagation(); e.preventDefault(); } }, true);
/* physical keyboard typing on desktop */
document.addEventListener('keydown', e => { if (PP.route()!=='kb/chat') return; const k=kbs(); if (k.mode!=='typing' || e.target.closest('input,textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key==='Backspace'){ A.kbDel(); } else if (e.key==='Enter'){ A.kbSend(); } else if (e.key.length===1){ k.text+=e.key; k.err=null; toneHint(); } else return;
  e.preventDefault(); PP.save(); PP.render(); });
/* QA r5: an edited translation that became empty cannot be inserted */
document.addEventListener('input', e => { if (!e.target || e.target.id!=='kbEditTa') return; const k=kbs(); k.out=e.target.value; const b=document.querySelector('.kb [data-a=kbInsert]'); if (b) b.disabled=!e.target.value.trim(); });
})();
