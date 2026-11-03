/* Parrlo Translate prototype · app screens B: conversation, share sheet, summary, no-mic */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,L,esc,btn,goBtn,I,nav,tg,li_,seg} = PP;
const S = () => PP.S; const T = PP.T; const CP = window.COPY; const lk = PP.lk;

ENTER['app/conv'] = () => { PP.ensureApp(); if (!T.conv) T.conv={started:true, turns:[], text:false}; T.conv.started=true; };
LEAVE['app/conv'] = () => { if (T.rec) stopRecTimers(); T.rec=null; PP.stopSpeak(); };
const busy = () => !!T.rec || (T.conv && T.conv.turns.some(t=>t.status==='working'));
function turnHTML(t){
  const me=t.side==='me';
  const lab = me && t.styleLab ? t.styleLab : (me?L('Вы','Tú','You'):L('Собеседник','Interlocutor','Partner'));
  let bub;
  if (t.status==='working') bub=`<div class="bub working"><span class="spark"><i></i><i></i><i></i></span></div>`;
  else if (t.status==='failed') bub=`<button class="bub failed" ${PP.attr('turnTap',t.id)} data-long="turnMenu" data-lv="${t.id}">${esc(t.err)}</button>`;
  else bub=`<button class="bub ${T.playing==='t'+t.id?'playing':''}" ${PP.attr('turnTap',t.id)} data-long="turnMenu" data-lv="${t.id}" lang="${t.outLang}">${esc(t.out)}${t.flag?`<div class="flag">⚑ ${esc(L('Неточно','Inexacto','Inaccurate'))}</div>`:''}</button>`;
  return `<div class="turn ${t.side}" data-turn="${t.id}"${t.status==='working'?'':` data-long="turnMenu" data-lv="${t.id}"`}><span class="lab">${esc(lab)}</span><span class="src" lang="${t.srcLang}">${esc(t.showRaw && t.raw ? t.raw : (t.src||t.raw))}</span>${bub}${t.note?`<span class="src" style="color:var(--warn)">${esc(t.note)}</span>`:''}</div>`;
}
R['app/conv'] = () => {
  const s=S(), c=T.conv||{turns:[]}, p=s.pair;
  const hasTurns = c.turns.length>0;
  const left = hasTurns ? `<button class="end" ${PP.attr('endConv')} ${busy()?'disabled':''}>${esc(L('Завершить','Terminar','End'))}</button>` : `<button class="ib" ${PP.attr('navMenu')} aria-label="${esc(L('История / Настройки','Historial / Ajustes','History / Settings'))}">${I.menu}</button>`;
  const head = `<div class="head">${left}<div class="pair"><button ${PP.attr('pairSheet')}>${PP.code(p.mine)} ⇄ ${PP.code(p.theirs)}</button></div><button class="ib" ${PP.attr('textMode')} aria-label="${esc(L('Текст','Texto','Text'))}" style="${c.text?'background:var(--green);color:var(--ink)':''}">${I.kbd}</button><button class="ib" ${PP.attr('moreMenu')} aria-label="${esc(L('Ещё','Más','More'))}">${I.more}</button></div>`;
  let feed;
  if (s.scope==='none' && !hasTurns){
    feed = `<div class="feed"><div class="empty"><h2 class="t" style="color:var(--text)">${esc(lk('textOffTitle'))}</h2><p>${esc(L('Пока вы не разрешите, Parrlo не отправляет на сервер ни голос, ни текст.','Hasta que lo permitas, Parrlo no envía a ningún servidor ni tu voz ni tu texto.','Until you allow it, Parrlo sends neither your voice nor your text to any server.'))}</p>${btn(lk('allow'),'openConsent')}</div></div>`;
  } else if (!hasTurns){
    feed = `<div class="feed"><div class="empty">${PP.parrot('sm')}<p class="mt">${c.text ? esc(L('Напишите фразу на любом из двух языков — Parrlo определит язык и переведёт.','Escribe una frase en cualquiera de los dos idiomas: Parrlo detecta el idioma y la traduce.','Type a phrase in either language — Parrlo detects the language and translates it.')) : esc(L(`Нажмите «${DATA.SPEAK[p.mine].speak}» и говорите. Собеседник отвечает своей кнопкой.`,`Pulsa «${DATA.SPEAK[p.mine].speak}» y habla. Tu interlocutor responde con su botón.`,`Tap “${DATA.SPEAK[p.mine].speak}” and speak. Your partner answers with their own button.`))}</p></div></div>`;
  } else feed = `<div class="feed">${c.turns.map(turnHTML).join('')}${tapTip()}</div>`;
  let dock;
  if (c.text){
    dock = `<div style="padding:0 var(--side)"><p class="ter xs" style="margin:6px 4px">${esc(L('Язык определяется сам. Подходит для сообщений из WhatsApp и писем.','El idioma se detecta solo. Sirve para mensajes de WhatsApp y correos.','The language is detected automatically. Works for WhatsApp messages and emails.'))}</p>${quota()}</div><div class="composer"><textarea id="draft" data-input="draft" placeholder="${esc(L('Введите или вставьте текст','Escribe o pega un texto','Type or paste text'))}">${esc(T.draft||'')}</textarea><button class="send" id="sendBtn" ${PP.attr('sendText')} ${(T.draft||'').trim()?'':'disabled'} aria-label="${esc(L('Перевести','Traducir','Translate'))}">${I.send}</button></div>`;
  } else {
    const rec=T.rec; const lm=DATA.SPEAK[p.mine], lt=DATA.SPEAK[p.theirs];
    const sel = c.turns.filter(t=>t.status==='done').slice(-1)[0];
    dock = `<div class="dock">${quota()}${rec?`<div class="wave" id="wave">${Array.from({length:28},()=>'<i></i>').join('')}</div><div class="center sec sm" id="recInfo">${esc(L('Слушаю…','Escuchando…','Listening…'))}</div>`:''}
      ${sel && !rec ? `<div class="speakrow"><button class="chip" ${PP.attr('speakSel',sel.id)}>${I.spk} ${esc(L('Произнести','Escuchar','Speak'))} · ${esc(s.partnerGender==='male'?L('Он','Él','He'):L('Она','Ella','She'))}</button></div>`:''}
      <div class="mics"><button class="mic me ${rec&&rec.side==='me'?'rec':''}" ${PP.attr('micTap','me')} ${rec&&rec.side!=='me'?'disabled':''} lang="${p.mine}">${I.mic}${esc(rec&&rec.side==='me'?lm.done:lm.speak)}</button>
      <button class="mic them ${rec&&rec.side==='them'?'rec':''}" ${PP.attr('micTap','them')} ${rec&&rec.side!=='them'?'disabled':''} lang="${p.theirs}">${I.mic}${esc(rec&&rec.side==='them'?lt.done:lt.speak)}</button></div></div>`;
  }
  return head + PP.banners() + feed + dock;
};
function quota(){ if (!T.quota) return ''; return `<div class="banner warn" style="margin:0 0 6px"><span class="tx"><b>${esc(L('Бесплатные облачные фразы на сегодня закончились','Hoy ya no quedan frases gratis en la nube','No Free Cloud Phrases Left Today'))}</b><br><span class="sm">${esc(L('Офлайн-перевод заработает, если выключить «Только облачный перевод» и скачать модели в разделе «Модели».','La traducción sin conexión funcionará al desactivar «Solo traducción en la nube» y descargar los modelos en «Modelos».','Offline translation will work if you turn off “Cloud translation only” and download the models in “Models”.'))}</span></span>${btn(L('Понятно','Entendido','Got It'),'quotaClose',undefined,'sec sm')}</div>`; }
A.quotaClose = () => { T.quota=false; };
function tapTip(){ const c=T.conv; if (S().tipShown || c.turns.filter(t=>t.status==='done').length<3) return '';
  return `<div class="card" style="align-self:center;text-align:center;max-width:300px"><b>${esc(L('Нажми на фразу, чтобы услышать','Toca la frase para escucharla','Tap a Phrase to Hear It'))}</b><p class="sec sm" style="margin:6px 0 10px">${esc(L('Перевод прозвучит ещё раз. Удерживайте — меню.','La traducción sonará otra vez. Mantén pulsado para el menú.','The translation plays again. Press and hold for the menu.'))}</p>${btn(L('Понятно','Entendido','Got It'),'tipOk',undefined,'sec sm')}</div>`; }
A.tipOk = () => { S().tipShown=true; };
A.navMenu = () => { PP.menu({items:[{t:L('История','Historial','History'),a:'goto',v:'#/app/history'},{t:L('Настройки','Ajustes','Settings'),a:'goto',v:'#/app/settings'}]}); };
A.goto = (v) => { PP.UI.menu=null; PP.go(v); return false; };
A.textMode = () => { T.conv.text=!T.conv.text; if (T.conv.text) setTimeout(()=>{const d=document.getElementById('draft'); d&&d.focus();},50); };
A.openConsent = () => { T.consentBack='#/'+PP.route(); PP.go('#/app/consent'); return false; };
A.moreMenu = () => { const s=S();
  PP.menu({items:[
    {t:L('Повторить последний перевод','Repetir la última traducción','Repeat Last Translation'),a:'repeatLast'},
    {t:L('Скопировать разговор','Copiar la conversación','Copy Conversation'),a:'copyConv'},
    T.guest ? {t:L('Гость на связи · Отключить','Invitado conectado · Desconectar','Guest Connected · Disconnect'),a:'guestOffAsk'} : {t:L('Гость по QR','Invitado por QR','Guest by QR'),a:'guestQR'},
    {t:L('Пол собеседника','Género del interlocutor','Partner Gender'),a:'genderMenu',r:s.partnerGender==='male'?L('Он','Él','He'):L('Она','Ella','She')},
    {t:L('История','Historial','History'),a:'goto',v:'#/app/history'},
    {t:L('Настройки','Ajustes','Settings'),a:'goto',v:'#/app/settings'}]}); };
A.genderMenu = () => { PP.menu({head:L('Пол собеседника','Género del interlocutor','Partner Gender'), items:[{t:L('Он','Él','He'),a:'genderPick',v:'male',r:S().partnerGender==='male'?'✓':''},{t:L('Она','Ella','She'),a:'genderPick',v:'female',r:S().partnerGender==='female'?'✓':''}]}); };
A.genderPick = (v) => { S().partnerGender=v; PP.UI.menu=null; };
A.repeatLast = () => { PP.UI.menu=null; const t=((T.conv||{}).turns||[]).filter(t=>t.status==='done').slice(-1)[0]; if (!t){ PP.toast(L('Пока нечего повторить','Aún no hay nada que repetir','Nothing to repeat yet')); return; } PP.speak(t.out, t.outLang, 't'+t.id); return false; };
A.copyConv = () => { PP.UI.menu=null; const tx=((T.conv||{}).turns||[]).filter(t=>t.status==='done').map(t=>`${t.src}\n${t.out}`).join('\n\n'); PP.copy(tx); PP.toast(L('Разговор скопирован','Conversación copiada','Conversation copied')); };
/* Guest by QR works over the internet (WebRTC, as FiGuestSheet in code @5c0c39d0): no local-network gate, the QR is shown right away.
   Local network is needed only for a nearby/no-internet mode, which the prototype does not have. */
// r7: one connection timer per opening of the QR sheet, measured from the moment the QR is shown; a timer from an
//     earlier (closed) opening can no longer connect the guest early. With a guest already connected: no new QR.
A.guestOffAsk = () => { PP.UI.menu=null; PP.dialog({title:L('Отключить гостя?','¿Desconectar al invitado?','Disconnect the Guest?'), msg:L('Собеседник перестанет получать перевод на своём телефоне. Чтобы подключить снова, покажите новый QR.','Tu interlocutor dejará de recibir la traducción en su teléfono. Para volver a conectarlo, muestra un nuevo QR.','Your partner will stop getting the translation on their phone. To reconnect, show a new QR.'), buttons:[{t:L('Отключить','Desconectar','Disconnect'),a:'guestOff',cls:'pri'},{t:L('Отмена','Cancelar','Cancel'),a:'noop'}]}); };
const GUEST_CONNECT_MS = 6000;
A.guestQR = () => { PP.UI.menu=null; if (T.guest){ A.guestOffAsk(); return; }
  const tok = T.guestTok = (T.guestTok||0)+1; clearTimeout(T.guestT);
  PP.sheet('guest'); T.guestShownAt=Date.now(); T.guestT = PP.rt(()=>{ if (tok===T.guestTok && PP.UI.sheet && PP.UI.sheet.name==='guest'){ PP.UI.sheet=null; T.guest=true; T.guestAt=Date.now(); PP.toast(L('Гость на связи','Invitado conectado','Guest connected')); PP.render(); } }, GUEST_CONNECT_MS); };
A.localNet = (v) => { S().localNet=v; }; // permission choice only; never blocks the QR guest
A.guestSettings = () => { PP.go('#/ios/parrlo-app'); return false; };
function qrSVG(){ let h='<svg viewBox="0 0 29 29" width="160" height="160" shape-rendering="crispEdges"><rect width="29" height="29" fill="#fff"/>'; let x=7;
  for (let i=0;i<29;i++) for (let j=0;j<29;j++){ x=(x*1103515245+12345)&0x7fffffff; const f=(a,b)=>i>=a&&i<a+7&&j>=b&&j<b+7; const inF=f(0,0)||f(0,22)||f(22,0);
    const on = inF ? ((i%22===0||i%22===6||j%22===0||j%22===6)||(i%22>=2&&i%22<=4&&j%22>=2&&j%22<=4)) : (x>>8)%2===0; if (on) h+=`<rect x="${j}" y="${i}" width="1" height="1" fill="#0E1116"/>`; }
  return h+'</svg>'; }
SHEETS.guest = () => { const p=S().pair; const link=`parrlo://guest/demo42?pair=${p.mine}-${p.theirs}`;
  return `<h3>${esc(L('Гость по QR','Invitado por QR','Guest by QR'))}</h3><div class="sb center"><div class="qr">${qrSVG()}</div><p class="sec sm">${esc(L('Собеседник наводит камеру на код и говорит со своего телефона.','Tu interlocutor escanea el código y habla desde su teléfono.','Your partner scans the code and talks from their own phone.'))}</p><p class="xs ter" style="word-break:break-all">${esc(link)}</p><p class="sec"><span class="spark"><i></i><i></i><i></i></span> ${esc(L('Ждём гостя…','Esperando al invitado…','Waiting for the guest…'))}</p></div>
  <div class="mt" style="display:flex;flex-direction:column;gap:8px">${btn(L('Скопировать ссылку','Copiar enlace','Copy Link'),'copyText',link,'sec')}${btn(L('Закрыть','Cerrar','Close'),'closeSheet',undefined,'ghost')}</div>`; };

/* recording in conversation */
A.micTap = (side) => {
  const s=S();
  if (T.rec){ if (T.rec.side===side) finishRec(); return; }
  if (s.scope==='none'){ PP.sheet('cloudOff','voice'); return; }
  if (s.scope==='text'){ PP.sheet('cloudOff','voiceOnly'); return; }
  if (s.mic==='unknown'){ A.micAsk(side); return; }
  if (s.mic==='denied'){ PP.go('#/app/nomic'); return false; }
  PP.stopSpeak();
  T.rec={side, t0:Date.now()};
  T.recIv = setInterval(()=>{ document.querySelectorAll('#wave i').forEach((i,k)=>{ i.style.height=(6+Math.abs(Math.sin(Date.now()/180+k*0.7))*26*Math.random()+4)+'px'; }); const ri=document.getElementById('recInfo'); if (ri && T.rec) ri.textContent = L('Слушаю… ','Escuchando… ','Listening… ')+PP.mmss((Date.now()-T.rec.t0)/1000); }, 90);
  T.recTo = setTimeout(()=>{ if (T.rec) finishRec(); }, 6000);
};
function stopRecTimers(){ clearInterval(T.recIv); clearTimeout(T.recTo); }
function nextScript(side){ T.scriptI = T.scriptI||{me:0,them:0}; const ids=DATA.SCRIPT[side]; const id=ids[T.scriptI[side]%ids.length]; T.scriptI[side]++; return DATA.P.find(p=>p.id===id); }
function finishRec(){
  stopRecTimers(); const side=T.rec.side; T.rec=null;
  const s=S(), p=s.pair; const ph=nextScript(side);
  const srcLang = side==='me'?p.mine:p.theirs;
  const raw = side==='me' && srcLang==='ru' && ph.raw ? ph.raw : DATA.pickL(ph, srcLang, {gender: side==='me'?s.gender:s.partnerGender});
  addTurn(side, raw, srcLang, true);
}
let tid=1;
function addTurn(side, raw, srcLang, spoken, replaceId){
  const p=S().pair; const outLang = srcLang===p.mine ? p.theirs : p.mine;
  const t = replaceId ? T.conv.turns.find(x=>x.id===replaceId) : {id:tid++, side};
  Object.assign(t, {raw, src:raw, srcLang, outLang, status:'working', err:null, note:null, showRaw:false, spoken});
  if (!replaceId) T.conv.turns.push(t);
  PP.render(); scrollFeed();
  setTimeout(()=>completeTurn(t), 900);
}
function completeTurn(t){
  const s=S(), d=s.demo;
  const fail = (msg) => { t.status='failed'; t.err=msg; PP.save(); PP.render(); scrollFeed(); };
  if (d.offline) return fail(L('Нет интернета. Нажмите, чтобы повторить.','Sin internet. Toca para reintentar.','No internet. Tap to retry.'));
  if (d.limit){ T.quota=true; return fail(L('Лимит облачных фраз. Нажмите, чтобы повторить.','Límite de frases en la nube. Toca para reintentar.','Cloud phrase limit. Tap to retry.')); }
  if (d.failNext){ d.failNext=false; return fail(L('Не удалось перевести. Нажмите, чтобы повторить.','No se pudo traducir. Toca para reintentar.','Couldn’t translate. Tap to retry.')); }
  const me = t.side==='me'; const style = me ? s.style : 'none';
  let src = t.raw; t.styleLab=null; t.note=null;
  if (me){
    if (style==='literary' || style==='formal'){
      if (d.refine503) t.note = L('Стиль не подключился — фраза без обработки. Закройте и откройте приложение.','El estilo no se ha activado: la frase va sin procesar. Cierra y vuelve a abrir la app.','The style didn’t connect — phrase sent unprocessed. Close and reopen the app.');
      else { src = DATA.literary(t.raw, t.srcLang); t.styleLab = style==='formal'?L('Вы · официально','Tú · formal','You · Formal'):L('Вы · литературно','Tú · literario','You · Literary'); }
    } else if (style==='asSaid'){ src = DATA.literary(t.raw, t.srcLang); t.styleLab=L('Вы · как сказали','Tú · tal cual','You · As Said'); }
  }
  if (src===t.raw) src = t.raw.charAt(0).toUpperCase()+t.raw.slice(1);
  t.src = src;
  const r = DATA.translate(src, t.srcLang, t.outLang, {style: me&&style==='formal'?'formal':'', gender: me?s.gender:s.partnerGender});
  if (!r.text || !r.text.trim()){ fail(L('Не удалось перевести. Нажмите, чтобы повторить.','No se pudo traducir. Toca para reintentar.','Couldn’t translate. Tap to retry.')); return; } // as in code: empty translation → failed
  t.out = r.text; t.status='done';
  PP.render(); scrollFeed();
  if (s.autoSpeak && PP.route()==='app/conv') PP.speak(t.out, t.outLang, 't'+t.id);
}
function scrollFeed(){ const f=document.querySelector('#scr .feed'); if (f) f.scrollTop=f.scrollHeight; }
A.turnTap = (id) => { const t=T.conv.turns.find(x=>x.id==id); if (!t) return;
  if (t.status==='failed'){ t.status='working'; PP.render(); setTimeout(()=>completeTurn(t), 700); return false; }
  if (T.playing==='t'+t.id){ PP.stopSpeak(); return; }
  PP.speak(t.out, t.outLang, 't'+t.id); return false; };
A.speakSel = (id) => A.turnTap(id);
A.turnMenu = (id) => { const t=T.conv.turns.find(x=>x.id==id); if (!t) return;
  PP.menu({items:[
    {t:L('Копировать','Copiar','Copy'),a:'tCopy',v:id},{t:L('Поделиться','Compartir','Share'),a:'tShare',v:id},
    {t:t.showRaw?L('Скрыть оригинал','Ocultar original','Hide Original'):L('Оригинал','Original','Original'),a:'tRaw',v:id},
    {t:L('Исправить','Corregir','Correct'),a:'tFix',v:id},{t:t.flag?L('Снять «Неточно»','Quitar «Inexacto»','Unmark Inaccurate'):L('Неточно','Inexacto','Inaccurate'),a:'tFlag',v:id}]}); };
const copiedIn = (l) => ({ru:L('Скопировано по-русски','Copiado en ruso','Copied in Russian'), es:L('Скопировано по-испански','Copiado en español','Copied in Spanish'), en:L('Скопировано по-английски','Copiado en inglés','Copied in English'), zh:L('Скопировано по-китайски','Copiado en chino','Copied in Chinese')})[l];
const turn = (id) => T.conv.turns.find(x=>x.id==id);
A.tCopy = (id) => { const t=turn(id); PP.UI.menu=null; PP.copy(t.out||t.src); PP.toast(copiedIn(t.outLang)); };
A.tShare = (id) => { PP.menu({head:L('Поделиться','Compartir','Share'), items:[{t:L('Текстом','Como texto','As Text'),a:'shareText',v:id},{t:L('Голосом','Con voz','As Voice'),a:'shareVoice',v:id}]}); };
A.tRaw = (id) => { const t=turn(id); t.showRaw=!t.showRaw; PP.UI.menu=null; if (!t.raw || t.raw.toLowerCase()===String(t.src).toLowerCase()) PP.toast(L('Оригинал совпадает с фразой','El original coincide con la frase','The original matches the phrase')); };
A.tFix = (id) => { const t=turn(id); PP.UI.menu=null; T.conv.text=true; T.draft=t.src; T.fixId=t.id; setTimeout(()=>{const d=document.getElementById('draft'); d&&d.focus();},50); };
A.tFlag = (id) => { const t=turn(id); PP.UI.menu=null; t.flag=!t.flag; if (t.flag) PP.toast(L('Отмечено как неточное','Marcado como inexacto','Marked as inaccurate')); };
A.shareText = (id) => { const t=turn(id); PP.UI.menu=null; PP.sheet('share', {kind:'text', text:t.out, lang:t.outLang, ctx:'conv'}); };
A.shareVoice = (id) => { const t=turn(id); PP.UI.menu=null; const s=S();
  const mine = t.side==='me' && s.shareMyVoice && s.voice.exists && s.voice.on && s.scope!=='none' && !s.demo.reconsent;
  PP.sheet('share', {kind:'voice', text:t.out, lang:t.outLang, ctx:'conv', myVoice:mine, cloudOff:s.scope==='none'}); };
A.sendText = () => {
  const s=S(); const txt=(T.draft||'').trim(); if (!txt) return;
  if (s.scope==='none'){ PP.sheet('cloudOff','text'); return; }
  const p=s.pair; const det=DATA.detect(txt); const side = det===p.theirs ? 'them' : 'me'; const srcLang = det===p.mine||det===p.theirs ? det : p.mine;
  T.draft=''; const fix=T.fixId; T.fixId=null;
  addTurn(side, txt, srcLang, false, fix||undefined); return false;
};
SHEETS.cloudOff = (kind) => {
  const voiceOnly = kind==='voiceOnly';
  const ttl = voiceOnly ? lk('voiceOffTitle') : lk('textOffTitle');
  const body = voiceOnly ? L('Чтобы переводить речь, Parrlo передаёт ваш голос во время записи на наш сервер и стороннему сервису распознавания речи, который превращает его в текст. Этот сервис обрабатывает звук на серверах в США. Запись голоса мы на своих серверах не сохраняем.','Para traducir lo que dices, Parrlo envía tu voz mientras hablas a nuestro servidor y a un servicio de reconocimiento de voz de terceros, que la convierte en texto. Ese servicio procesa el audio en servidores de EE. UU. No guardamos la grabación de tu voz en nuestros servidores.','To translate speech, Parrlo sends your voice while you record to our server and to a third-party speech-recognition service that turns it into text. This service processes audio on servers in the US. We don’t keep voice recordings on our servers.') : PP.C(CP.CLOUD.voiceText)[0];
  return `<h3>${esc(ttl)}</h3><div class="sb legal"><p>${esc(body)}</p><p><button class="lnk" ${PP.attr('legal','privacy')}>${esc(lk('emptyMore'))}</button></p></div>
  <div class="mt" style="display:flex;flex-direction:column;gap:8px">${btn(voiceOnly?lk('allowVoiceAndText'):lk('allow'),'cloudAllowSheet')}${btn(lk('notNow'),'closeSheet',undefined,'ghost')}</div>`; };
A.cloudAllowSheet = () => { S().scope='voiceText'; S().kb.everConnected=true; PP.UI.sheet=null; PP.toast(L('Перевод в облаке включён','Traducción en la nube activada','Cloud translation is on')); };

/* share sheet (simulated iOS) */
SHEETS.share = (o) => {
  const fname = o.fname || (o.kind==='voice' ? ({ru:'Parrlo ИИ-голос — русский.m4a', es:'Voz IA Parrlo — español.m4a', en:'Parrlo AI voice — English.m4a', zh:'Parrlo AI voice — 中文.m4a'})[o.lang] : null);
  const cap = PP.C(CP.SL.l6Caption);
  const preview = o.kind==='voice'
    ? `<div class="prev"><span class="fi">${I.file}</span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px">${esc(fname)}</b><span class="sec xs">${esc(o.myVoice?L('Мой голос · голос синтезирован ИИ','Mi voz · voz generada por IA','My Voice · AI-generated voice'):(o.capRecipient||cap))}</span>${o.cloudOff?`<br><span class="xs" style="color:var(--warn)">${esc(lk('shareCloudVoiceOff'))}</span>`:''}</span><button class="ib" ${PP.attr('sharePlay')} aria-label="${esc(L('Прослушать','Escuchar','Play'))}">${T.playing==='share'?I.stop:I.play}</button></div>`
    : `<div class="prev"><span class="fi">Aa</span><span style="flex:1;font-size:14px">${esc(o.text)}</span></div>`;
  const apps = [['wa','WhatsApp'],['msg',L('Сообщения','Mensajes','Messages')],['mail',L('Почта','Mail','Mail')],['notes',L('Заметки','Notas','Notes')]].filter(([k])=>k!=='wa'||S().demo.waInstalled);
  return `<div class="share"><h3>${esc(L('Поделиться','Compartir','Share'))}</h3>${preview}
  <div class="apps">${apps.map(([k,n])=>`<button class="app" ${PP.attr('shareTo',k)}><span class="ic">${({wa:I.chat,msg:I.msg,mail:I.mail,notes:I.note})[k]}</span>${esc(n)}</button>`).join('')}</div>
  <div class="grp">${li_({t:L('Скопировать','Copiar','Copy'),a:'shareCopy',noChev:true})}${li_({t:L('Сохранить в Файлы','Guardar en Archivos','Save to Files'),a:'shareSave',noChev:true})}</div>
  <div class="mt">${btn(L('Отмена','Cancelar','Cancel'),'closeSheet',undefined,'ghost')}</div></div>`;
};
A.sharePlay = () => { const o=PP.UI.sheet.arg; if (T.playing==='share'){ PP.stopSpeak(); return; } PP.speak(o.text, o.lang, 'share'); return false; };
A.shareCopy = () => { const o=PP.UI.sheet.arg; PP.copy(o.text); PP.UI.sheet=null; PP.toast(L('Скопировано','Copiado','Copied')); };
A.shareSave = () => { PP.UI.sheet=null; PP.toast(L('Сохранено в Файлы','Guardado en Archivos','Saved to Files')); };
A.shareTo = (k) => { const o=PP.UI.sheet.arg; PP.UI.sheet=null; PP.stopSpeak();
  if (k==='wa' && o.ctx==='ext' && o.reply){ T.waOut = T.waOut||[]; T.waOut.push(o.kind==='voice'?{voice:true, name:o.fname, cap:o.capRecipient}:{text:o.text}); S().sharedOnce=true; PP.go('#/wa/chat'); return false; }
  const n={wa:'WhatsApp',msg:L('Сообщения','Mensajes','Messages'),mail:L('Почта','Mail','Mail'),notes:L('Заметки','Notas','Notes')}[k];
  PP.toast(L(`Передано в «${n}»`,`Enviado a «${n}»`,`Sent to “${n}”`)); };

/* end / summary */
A.endConv = () => { if (busy()) return; const c=T.conv; const s=S();
  if (s.keepHistory && c.turns.some(t=>t.status==='done')) s.history.unshift({id:'c'+Date.now(), date:Date.now(), pair:[s.pair.mine,s.pair.theirs], items:c.turns.filter(t=>t.status==='done').map(t=>[t.side,t.src,t.out])});
  PP.sheet('summary'); };
SHEETS.summary = () => `<h3>${esc(L('Разговор завершён','Conversación terminada','Conversation Ended'))}</h3><div class="sb"><p class="sec">${esc(L('Сохранено в истории на этом телефоне','Guardada en el historial de este teléfono','Saved to history on this phone'))}</p></div>
  <div style="display:flex;flex-direction:column;gap:8px">${btn(L('Скопировать всё','Copiar todo','Copy All'),'sumCopy',undefined,'sec')}${btn(L('Поделиться','Compartir','Share'),'sumShare',undefined,'sec')}${btn(L('Новый разговор','Nueva conversación','New Conversation'),'newConv')}</div>`;
A.sumCopy = () => { const tx=((T.conv||{}).turns||[]).filter(t=>t.status==='done').map(t=>`${t.src}\n${t.out}`).join('\n\n'); PP.copy(tx); PP.toast(L('Скопировано','Copiado','Copied')); };
A.sumShare = () => { const tx=((T.conv||{}).turns||[]).filter(t=>t.status==='done').map(t=>`${t.src}\n${t.out}`).join('\n\n'); T.afterShare='summary'; PP.sheet('share',{kind:'text', text:tx, lang:S().pair.theirs, ctx:'conv'}); };
A.newConv = () => { PP.UI.sheet=null; T.conv={started:false, turns:[], text:false}; T.scriptI={me:0,them:0}; PP.go('#/app/main'); return false; };
PP.onSheetClose = (n) => {
  if (n==='summary' && PP.route()==='app/conv'){ T.conv={started:false,turns:[],text:false}; PP.go('#/app/main'); }
  if (n==='bridgeIntro'){ T.ext=null; PP.toast(L('Файл удалён, ничего не отправлено','Archivo eliminado; no se ha enviado nada','File deleted; nothing was sent')); PP.go('#/app/main'); }
  if (n==='share'){ PP.stopSpeak(); if (T.afterShare==='summary'){ T.afterShare=null; PP.sheet('summary'); } }
};

/* No mic */
R['app/nomic'] = () => `${nav('', '#/app/conv', L('Назад','Atrás','Back'))}<div class="cover center"><div style="margin:0 auto;width:88px;height:88px;border-radius:44px;background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--danger)">${I.mic.replace('<svg','<svg width="40" height="40"')}</div>
  <h1 class="t">${esc(L('Нет доступа к микрофону','Sin acceso al micrófono','No Microphone Access'))}</h1><p class="sec">${esc(L('Разрешите микрофон: Настройки iPhone → Parrlo → Микрофон.','Permite el micrófono: Ajustes del iPhone → Parrlo → Micrófono.','Allow the microphone: iPhone Settings → Parrlo → Microphone.'))}</p></div>
  <div class="foot">${goBtn(L('Открыть Настройки','Abrir Ajustes','Open Settings'),'#/ios/parrlo-app')}${btn(L('Ввести текст','Escribir texto','Type Text'),'noMicText',undefined,'ghost')}</div>`;
A.noMicText = () => { if (!T.conv) T.conv={started:true,turns:[],text:true}; T.conv.text=true; PP.go('#/app/conv'); return false; };
R['ios/parrlo-app'] = () => { const s=S(); return `<div class="ios">${nav('Parrlo', S().mic==='granted'?'#/app/conv':'#/app/nomic', 'Parrlo')}<div class="scroll"><div class="gh">${esc(L('Разрешить доступ приложению Parrlo','Permitir acceso a Parrlo','Allow Parrlo to Access'))}</div>
  <div class="grp">${li_({t:L('Микрофон','Micrófono','Microphone'),right:tg(s.mic==='granted','iosMic')})}${li_({t:L('Распознавание речи','Reconocimiento de voz','Speech Recognition'),right:tg(s.speech!=='denied','iosSpeech')})}${li_({t:L('Локальная сеть','Red local','Local Network'),right:tg(s.localNet==='granted','iosNet')})}${li_({t:L('Клавиатуры','Teclados','Keyboards'),go:'#/kb/ios/parrlo'})}</div>
  <p class="gf">${esc(L('Это имитация системных Настроек iPhone. «‹ Parrlo» вверху возвращает в приложение.','Esto imita los Ajustes del iPhone. «‹ Parrlo» arriba vuelve a la app.','This mimics iPhone Settings. “‹ Parrlo” at the top returns to the app.'))}</p></div></div>`; };
A.iosMic = () => { const s=S(); s.mic = s.mic==='granted'?'denied':'granted'; if (s.mic==='granted') PP.toast(L('Микрофон разрешён — вернитесь в Parrlo','Micrófono permitido: vuelve a Parrlo','Microphone allowed — go back to Parrlo')); };
A.iosSpeech = () => { const s=S(); s.speech = s.speech==='denied'?'granted':'denied'; };
A.iosNet = () => { const s=S(); s.localNet = s.localNet==='granted'?'denied':'granted'; };
})();
