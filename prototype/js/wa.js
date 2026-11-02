/* Parrlo Translate prototype · messenger bridge + «Перевести в Parrlo» share extension (FiShareExt.swift, ShareViewController.swift, WhatsAppBridge.swift @ 5c0c39d0)
   The messenger is a neutral scheme: name as plain text only, no logos, no brand colours. */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,L,esc,btn,goBtn,I,nav,li_} = PP;
const S = () => PP.S; const T = PP.T; const CP = window.COPY; const SL = (k) => PP.C(CP.SL[k]);
const now = () => { const d=new Date(); return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); };

/* neutral messenger chat */
R['wa/chat'] = () => {
  const out = T.waOut||[];
  const bars = (n,seed) => Array.from({length:n},(_,i)=>`<i style="height:${6+((i*seed)%17)}px"></i>`).join('');
  return `<div class="msgr"><div class="mh"><button class="back" data-go="#/" style="color:#5AA9FF;display:flex;align-items:center" aria-label="${esc(L('Назад','Atrás','Back'))}">${I.back}</button><span class="av">L</span><span style="flex:1"><b>Lucía</b><br><span class="xs sec">WhatsApp · ${esc(L('схема','esquema','scheme'))}</span></span></div>
  <div class="ml">
    <div class="schema">${esc(L('Мессенджер нарисован нейтральной схемой. Удерживайте сообщение, чтобы поделиться им.','La mensajería se muestra como un esquema neutro. Mantén pulsado un mensaje para compartirlo.','The messenger is drawn as a neutral scheme. Press and hold a message to share it.'))}</div>
    <button class="mb in" ${PP.attr('waMsg','text')} data-long="waMsg" data-lv="text">${esc(DATA.WA_TEXT.es)}<span class="tm">20:41</span></button>
    <button class="mb in voice" ${PP.attr('waMsg','voice')} data-long="waMsg" data-lv="voice"><span class="pl">${T.waPlay?I.stop:I.play}</span><span class="vw">${bars(26,7)}</span><span class="xs sec">0:12</span></button>
    ${out.map(m=>m.voice?`<div class="mb out voice"><span class="pl">${I.play}</span><span style="flex:1;min-width:0"><span class="xs" style="display:block;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</span><span class="xs sec">${esc(m.cap)}</span></span><span class="tm">${now()}</span></div>`:`<div class="mb out">${esc(m.text)}<span class="tm">${now()} ✓✓</span></div>`).join('')}
  </div>
  <div class="inp"><span class="field"><span class="ph">${esc(L('Сообщение','Mensaje','Message'))}</span></span><button class="sendb" ${PP.attr('waTyping')} aria-label="${esc(L('Голосовое сообщение','Mensaje de voz','Voice message'))}">${I.mic.replace('<svg','<svg width="20" height="20"')}</button></div></div>`;
};
A.waMsg = (kind) => { PP.menu({head: kind==='voice'?L('Голосовое · 0:12','Audio · 0:12','Voice Message · 0:12'):L('Сообщение','Mensaje','Message'), items:[
  {t:L('Переслать / Поделиться…','Reenviar / Compartir…','Forward / Share…'),a:'waShare',v:kind},
  ...(kind==='voice'?[{t:T.waPlay?L('Остановить','Detener','Stop'):L('Прослушать','Escuchar','Play'),a:'waPlay'}]:[{t:L('Копировать','Copiar','Copy'),a:'waCopy'}])]}); };
A.waPlay = () => { PP.UI.menu=null; T.waPlay=!T.waPlay; if (T.waPlay){ PP.speak(DATA.WA_VOICE.es,'es','wav'); setTimeout(()=>{T.waPlay=false; if(PP.route()==='wa/chat') PP.render();}, 5000); } else PP.stopSpeak(); };
A.waCopy = () => { PP.UI.menu=null; PP.copy(DATA.WA_TEXT.es); T.kbCopied = DATA.WA_TEXT.es; PP.toast(L('Скопировано','Copiado','Copied')); };
A.waTyping = () => { PP.toast(L('Ответ из Parrlo появится здесь после «Поделиться»','La respuesta de Parrlo aparecerá aquí tras «Compartir»','Parrlo’s reply will appear here after Share')); };
A.waShare = (kind) => { PP.UI.menu=null; T.waKind=kind; PP.go('#/wa/share'); return false; };

/* system share sheet in the messenger (iOS) */
ENTER['wa/share'] = () => { if (!T.waKind) T.waKind='voice'; };
R['wa/share'] = () => { const k=T.waKind;
  return `<div style="flex:1;display:flex;flex-direction:column;min-height:0;opacity:.4;pointer-events:none" aria-hidden="true">${R['wa/chat']().replace(/data-(a|go|long)=/g,'data-x-$1=')}</div><div class="scrim" style="position:absolute;inset:0;background:rgba(0,0,0,.35)" data-go="#/wa/chat"></div>
  <div class="sheet share" style="position:absolute"><div class="grab"></div><h3>${esc(k==='voice'?L('Голосовое · аудиофайл .opus','Audio · archivo .opus','Voice Message · .opus Audio File'):L('Текст','Texto','Text'))}</h3>
  <div class="prev"><span class="fi">${k==='voice'?I.file:'Aa'}</span><span style="flex:1;font-size:14px">${esc(k==='voice'?'PTT-20261102-WA0007.opus · 0:12':DATA.WA_TEXT.es)}</span></div>
  <div class="apps"><button class="app" ${PP.attr('extOpen')} id="share-parrlo"><span class="ic"><img src="assets/app-icon-180.png" alt=""></span>${esc(SL('l7ExtensionName'))}</button>
    <button class="app" ${PP.attr('waOtherApp',L('Почта','Mail','Mail'))}><span class="ic">${I.mail}</span>${esc(L('Почта','Mail','Mail'))}</button>
    <button class="app" ${PP.attr('waOtherApp',L('Файлы','Archivos','Files'))}><span class="ic">${I.folder}</span>${esc(L('Файлы','Archivos','Files'))}</button></div>
  <div class="grp">${li_({t:L('Скопировать','Copiar','Copy'),a:'waCopy',noChev:true})}</div>
  <div class="mt">${goBtn(L('Отмена','Cancelar','Cancel'),'#/wa/chat','ghost')}</div></div>`; };
A.waOtherApp = (n) => { PP.toast(L(`Передано в «${n}»`,`Enviado a «${n}»`,`Sent to “${n}”`)); };
/* extension: checks age → consent mirror → write to inbox → open app */
A.extOpen = () => { const s=S();
  if (s.age!=='ok'){ PP.go('#/wa/ext-gate'); return false; }
  const need = T.waKind==='voice' ? s.scope==='voiceText' : (s.scope==='voiceText'||s.scope==='text');
  if (!need){ PP.go('#/wa/ext-consent'); return false; }
  PP.go('#/wa/ext-opening'); return false; };
R['wa/ext-gate'] = () => `<div class="cover center">${PP.parrot()}<h1 class="t">${esc(L('Откройте Parrlo, чтобы начать','Abre Parrlo para empezar','Open Parrlo to Get Started'))}</h1><p class="sec">${esc(L('Parrlo можно пользоваться с 16 лет. Подтвердите возраст в приложении Parrlo.','Puedes usar Parrlo a partir de los 16 años. Confirma tu edad en la app Parrlo.','You can use Parrlo from age 16. Confirm your age in the Parrlo app.'))}</p></div><div class="foot">${goBtn(L('Готово','Listo','Done'),'#/wa/chat')}</div>`;
R['wa/ext-consent'] = () => `<div class="cover center">${PP.parrot()}<h1 class="t">${esc(PP.C(['Нужно ваше разрешение','Necesitamos tu permiso','We Need Your Permission']))}</h1><p class="sec">${esc(L('Чтобы перевести это сообщение, разрешите облачный перевод в Parrlo. Файл не сохранён, ничего не отправлено.','Para traducir este mensaje, permite la traducción en la nube en Parrlo. El archivo no se ha guardado y no se ha enviado nada.','To translate this message, allow cloud translation in Parrlo. The file wasn’t saved and nothing was sent.'))}</p></div>
  <div class="foot">${btn(PP.C(['Открыть Parrlo','Abrir Parrlo','Open Parrlo']),'extToConsent')}${goBtn(L('Отмена','Cancelar','Cancel'),'#/wa/chat','ghost')}</div>`;
A.extToConsent = () => { T.consentBack='#/wa/chat'; PP.go('#/app/consent'); return false; };
ENTER['wa/ext-opening'] = () => { PP.rt(()=>{ PP.go('#/app/ext'); }, 1300); };
R['wa/ext-opening'] = () => `<div style="flex:1;display:flex;flex-direction:column;min-height:0;opacity:.4;pointer-events:none" aria-hidden="true">${R['wa/chat']().replace(/data-(a|go|long)=/g,'data-x-$1=')}</div><div class="sheet" style="position:absolute;align-items:center;text-align:center"><div class="grab"></div>${PP.parrot('sm')}<h3>${esc(PP.C(['Открываем Parrlo…','Abriendo Parrlo…','Opening Parrlo…']))}</h3><p class="sec sm"><span class="spark"><i></i><i></i><i></i></span></p>${btn(PP.C(['Открыть Parrlo','Abrir Parrlo','Open Parrlo']),'extOpenNow')}</div>`;
A.extOpenNow = () => { PP.go('#/app/ext'); return false; };

/* app: share inbox → intro sheet (once) → dialog 89 for voice (once) → translation sheet */
ENTER['app/ext'] = (r, prev) => { PP.ensureApp(); const s=S();
  const kind = T.waKind || 'voice';
  if (!T.ext || prev==='wa/ext-opening' || prev===null) T.ext = {kind, state:'gate', reply:null};
  s.sharedOnce = true; // consumeShareInbox → hasSharedOnce
  proceed();
};
LEAVE['app/ext'] = () => { PP.stopSpeak(); clearTimeout(T.extT); clearInterval(T.extRecIv); };
PP.afterRenderHooks.push((r)=>{ if (r==='app/ext' && T.ext && T.ext.state==='gate' && !PP.UI.sheet && !PP.UI.dialog){ clearTimeout(T.extGateT); T.extGateT=setTimeout(()=>{ if (PP.route()==='app/ext' && T.ext && T.ext.state==='gate' && !PP.UI.sheet && !PP.UI.dialog) proceed(); }, 60); } });
function proceed(){ const s=S(), e=T.ext;
  if (e.state!=='gate') return;
  if (!s.bridgeIntro){ PP.sheet('bridgeIntro'); return; }
  if (e.kind==='voice' && !s.voiceHint){ PP.dialog({noDismiss:true, title:PP.C(CP.OB.shareHintTitle), html:`<div style="max-height:300px;overflow:auto;font-size:14px;color:#C9D0D8;text-align:left">${CP.HINT89.map(p=>`<p>${esc(PP.C(p))}</p>`).join('')}</div>`,
     buttons:[{t:PP.C(['Отправить и перевести','Enviar y traducir','Send and Translate']),a:'hint89Go',cls:'pri'},{t:PP.C(CP.OB.shareHintCancel),a:'hint89Cancel'}]}); return; }
  start();
}
SHEETS.bridgeIntro = () => `<h3>${esc(SL('l1Title'))}</h3><div class="sb legal"><p>${esc(SL('l2Body'))}</p><p><button class="lnk" ${PP.attr('legal','privacy')}>${esc(SL('l4Link'))}</button></p></div><div class="mt">${btn(SL('l3Button'),'bridgeGotIt')}</div>`;
A.bridgeGotIt = () => { S().bridgeIntro=true; PP.UI.sheet=null; PP.save(); proceed(); };
A.hint89Go = () => { S().voiceHint=true; PP.save(); start(); };
A.hint89Cancel = () => { T.ext=null; PP.toast(L('Файл удалён, ничего не отправлено','Archivo eliminado; no se ha enviado nada','File deleted; nothing was sent')); PP.go('#/app/main'); return false; };
function start(){ const e=T.ext; e.state='working'; e.phase = e.kind==='voice'?'listen':'translate'; PP.render();
  clearTimeout(T.extT);
  T.extT = setTimeout(()=>{ if (e.kind==='voice'){ e.phase='translate'; PP.render(); } T.extT=setTimeout(done, e.kind==='voice'?900:500); }, e.kind==='voice'?1200:400); }
function done(){ const e=T.ext, s=S(), d=s.demo; if (!e) return;
  if (d.offline){ e.state='offline'; return PP.render(); }
  const forced = d.extState; if (forced && forced!=='auto' && !e.retried){ e.state=forced; return PP.render(); }
  const src = e.kind==='voice'?DATA.WA_VOICE.es:DATA.WA_TEXT.es; e.src=src; e.srcLang='es';
  const tl = s.pair.mine==='es' ? s.pair.theirs : s.pair.mine;
  e.out = DATA.translate(src,'es',tl).text; e.outLang=tl; e.state='done'; PP.render(); }
A.extRetry = () => { T.ext.retried=true; T.ext.state='gate'; start(); };
A.extPickLang = (l) => { const e=T.ext; e.src=e.kind==='voice'?DATA.WA_VOICE.es:DATA.WA_TEXT.es; e.srcLang=l; const tl = l==='ru'?'es':'ru'; e.out = l==='es' ? DATA.translate(e.src,'es',tl).text : e.src; e.outLang=tl; e.state='done'; };
A.extClose = () => { T.ext=null; PP.stopSpeak(); PP.go('#/app/main'); return false; };
A.extConsent = () => { T.consentBack='#/app/ext'; PP.go('#/app/consent'); return false; };

R['app/ext'] = () => { const e=T.ext||{kind:'voice',state:'gate'}; const s=S();
  const source = e.kind==='voice' ? PP.C(['Из WhatsApp · голосовое 0:12','De WhatsApp · audio 0:12','From WhatsApp · voice message 0:12']) : PP.C(['Из WhatsApp · текст','De WhatsApp · texto','From WhatsApp · text']);
  const head = `<div class="nav"><button class="back" ${PP.attr('extClose')}>${esc(L('Закрыть','Cerrar','Close'))}</button><div class="ttl wordmark" style="font-size:20px">parrlo</div></div>`;
  let body='';
  if (e.state==='gate') body = `<div class="empty"><span class="spark"><i></i><i></i><i></i></span></div>`;
  else if (e.state==='working') body = `<div class="card"><span class="sec sm">${esc(source)}</span><div class="bub working mt" style="display:inline-block"><span class="spark"><i></i><i></i><i></i></span></div><p class="sec sm mt">${esc(e.phase==='listen'?L('Слушаю','Escuchando','Listening'):L('Перевожу','Traduciendo','Translating'))}</p></div>`;
  else if (e.state==='offline') body = `<div class="card"><span class="sec sm">${esc(source)}</span><h2 class="t">${esc(L('Нет интернета','Sin internet','No Internet'))}</h2><p class="sec">${esc(L('Распознавание, перевод и озвучка требуют сети. Подключитесь и нажмите «Повторить».','El reconocimiento, la traducción y la voz necesitan conexión. Conéctate y pulsa «Reintentar».','Recognition, translation and voice need a connection. Connect and tap Retry.'))}</p>${btn(L('Повторить','Reintentar','Retry'),'extRetry')}</div>`;
  else if (e.state==='failed') body = `<div class="card"><span class="sec sm">${esc(source)}</span><p class="mt" style="color:var(--danger)">${esc(L('Не удалось перевести. Попробуйте ещё\u00A0раз.','No se pudo traducir. Inténtalo de\u00A0nuevo.','Couldn’t translate. Please try again.'))}</p><div style="display:flex;flex-direction:column;gap:8px">${btn(L('Повторить','Reintentar','Retry'),'extRetry')}${s.scope==='none'?btn(L('Дать согласие','Dar mi consentimiento','Give Consent'),'extConsent',undefined,'sec'):''}</div></div>`;
  else if (e.state==='tooLong') body = `<div class="card"><span class="sec sm">${esc(L('Из WhatsApp · голосовое 6:40','De WhatsApp · audio 6:40','From WhatsApp · voice message 6:40'))}</span><p class="mt">${esc(L('Голосовое длиннее 5\u00A0минут. Отправьте запись покороче.','El audio supera los 5\u00A0minutos. Envía uno más corto.','The voice message is longer than 5 minutes. Send a shorter one.'))}</p>${btn(L('Закрыть','Cerrar','Close'),'extClose',undefined,'sec')}</div>`;
  else if (e.state==='unsupported') body = `<div class="card"><span class="sec sm">${esc(source)}</span><p class="mt">${esc(L('Этот формат пока не\u00A0поддерживается.','Este formato aún no es\u00A0compatible.','This format isn’t supported yet.'))}</p>${btn(L('Закрыть','Cerrar','Close'),'extClose',undefined,'sec')}</div>`;
  else if (e.state==='pickLanguage') body = `<div class="card"><span class="sec sm">${esc(source)}</span><h2 class="t">${esc(L('На каком языке запись?','¿En qué idioma está el audio?','What Language Is the Recording In?'))}</h2><p class="sec sm">${esc(L('Язык записи','Idioma del audio','Recording language'))}</p><div style="display:flex;gap:8px;flex-wrap:wrap">${['es','ru','en'].map(l=>`<button class="chip" ${PP.attr('extPickLang',l)}>${esc(PP.langNative(l))}</button>`).join('')}</div></div>`;
  else body = doneBody(e, source);
  return head + PP.banners() + `<div class="scroll">${body}</div>` + (e.state==='done'?doneFoot(e):'');
};
function doneBody(e, source){
  const r = e.reply; const s=S();
  let h = `<div class="card"><span class="sec sm">${esc(source)}</span><p class="sec" style="margin:8px 0" lang="${e.srcLang}">${esc(e.src)}</p>
    <button class="bub ${T.playing==='ext'?'playing':''}" style="background:var(--mint);color:var(--ink);display:block;width:100%" ${PP.attr('extSpeak','in')} lang="${e.outLang}">${esc(e.out)}</button>
    <p class="ter xs" style="margin-top:6px">${esc(L('Нажмите на перевод, чтобы услышать','Toca la traducción para escucharla','Tap the translation to hear it'))}</p></div>`;
  if (r){
    h += `<div class="card"><span class="sec sm">${esc(L('Ваш ответ','Tu respuesta','Your Reply'))} · ${PP.code(r.srcLang)} → ${PP.code(r.outLang)}</span>`;
    if (r.state==='rec') h += `<div class="wave" id="extWave">${Array.from({length:28},()=>'<i></i>').join('')}</div><p class="sec sm center">${esc(L('Слушаю','Escuchando','Listening'))}</p>`;
    else if (r.state==='working') h += `<div class="bub working mt" style="display:inline-block"><span class="spark"><i></i><i></i><i></i></span></div>`;
    else if (r.state==='done') h += `<p class="sec" style="margin:8px 0">${esc(r.lit)}</p><button class="bub ${T.playing==='rep'?'playing':''}" style="background:var(--green);color:var(--ink);display:block;width:100%" ${PP.attr('extSpeak','out')}>${esc(r.out)}</button>${s.waSig?'':''}`;
    h += `</div>`;
  }
  if (T.voiceNote) h += `<div class="note">${esc(T.voiceNote)}</div>`;
  return h;
}
function doneFoot(e){ const r=e.reply; const s=S(); const txt = r&&r.state==='done' ? r.out : e.out;
  const rec = r && r.state==='rec';
  const tooLong = txt.length>2000;
  const wa = s.demo.waInstalled ? btn(PP.C(['Поделиться','Compartir','Share']),'extShare',undefined,'sec') : '';
  return `<div class="foot">${rec?btn(L('Готово','Listo','Done'),'extReplyStop'):btn(r&&r.state==='done'?L('Ответить ещё раз','Responder de nuevo','Reply Again'):L('Ответить','Responder','Reply'),'extReply')}
    <div class="row2">${btn(L('Скопировать перевод','Copiar traducción','Copy Translation'),'extCopy',undefined,'sec')}${wa}</div>
    ${btn(L('Отправить голосом','Enviar con voz','Send as Voice'),'extVoice',undefined,'ghost',tooLong?'disabled':'')}
    ${tooLong?`<p class="ter xs">${esc(PP.C(CP.SL.tooLongTemplate).replace('%@','2000'))}</p>`:''}</div>`; }
A.extSpeak = (w) => { const e=T.ext; const key = w==='in'?'ext':'rep'; if (T.playing===key){ PP.stopSpeak(); return; } if (w==='in') PP.speak(e.out, e.outLang, key); else PP.speak(e.reply.out, e.reply.outLang, key); return false; };
A.extCopy = () => { const e=T.ext; const t = e.reply&&e.reply.state==='done'?e.reply.out:e.out; PP.copy(t); PP.toast(L('Скопировано','Copiado','Copied')); };
A.extReply = () => { const s=S(); if (s.scope!=='voiceText'){ PP.sheet('cloudOff', s.scope==='text'?'voiceOnly':'voice'); return; } if (s.mic==='unknown'){ A.micAsk('ext'); return; } if (s.mic==='denied'){ PP.go('#/app/nomic'); return false; } A.extReplyRec(); };
A.extReplyRec = () => { const e=T.ext; const s=S(); const me = e.outLang; e.reply={state:'rec', srcLang:me, outLang:e.srcLang==='ru'?'es':e.srcLang};
  T.extRecIv = setInterval(()=>{ document.querySelectorAll('#extWave i').forEach(i=>{ i.style.height=(4+Math.random()*26)+'px'; }); }, 90);
  T.extT = setTimeout(()=>{ if (e.reply && e.reply.state==='rec') { A.extReplyStop(); PP.render(); } }, 4500); PP.render(); };
A.extReplyStop = () => { const e=T.ext; clearInterval(T.extRecIv); clearTimeout(T.extT); const r=e.reply; r.state='working';
  setTimeout(()=>{ const s=S(); if (s.demo.offline){ r.state=null; e.reply=null; e.state='offline'; PP.render(); return; }
    const raw = r.srcLang==='ru' ? 'ну да давай в воскресенье а во сколько' : 'yes lets do sunday what time';
    r.raw=raw; r.lit = DATA.literary(raw, r.srcLang); r.out = DATA.translate(r.lit, r.srcLang, r.outLang).text; r.state='done'; PP.render(); }, 1000); };
A.extShare = () => { const e=T.ext; const t = e.reply&&e.reply.state==='done'?e.reply.out:e.out; const isReply = !!(e.reply&&e.reply.state==='done'); PP.sheet('share',{kind:'text', text:t, lang:isReply?e.reply.outLang:e.outLang, ctx:'ext', reply:isReply}); };
A.extVoice = () => { PP.sheet('extVoice'); };
SHEETS.extVoice = () => { const e=T.ext; const r=e.reply&&e.reply.state==='done'?e.reply:null; const lang = r?r.outLang:e.outLang; const text = r?r.out:e.out;
  const fname = ({ru:'Parrlo ИИ-голос — русский.m4a', es:'Voz IA Parrlo — español.m4a', en:'Parrlo AI voice — English.m4a'})[lang]||'Parrlo AI voice.m4a';
  const limit = S().demo.limit;
  return `<h3>${esc(L('Отправить голосом','Enviar con voz','Send as Voice'))}</h3><div class="sb">
   <div class="grp"><div class="li"><span class="tile">${I.check}</span><span class="tx"><b>${esc(L('Стандартный голос','Voz estándar','Standard Voice'))}</b><small>${esc(SL('l6Caption'))}</small></span></div>
   <button class="li" style="opacity:.55" ${PP.attr('extMyVoiceSoon')}><span class="tile">${I.lock}</span><span class="tx"><b>${esc(L('Мой голос','Mi voz','My Voice'))}</b><small>${esc(L('Скоро · для голосовых в другие приложения пока только стандартный голос','Próximamente · para audios a otras apps, de momento solo la voz estándar','Coming soon · for voice messages to other apps, only the standard voice for now'))}</small></span></button></div>
   <div class="share mt"><div class="prev"><span class="fi">${I.file}</span><span style="flex:1;min-width:0"><b style="display:block;font-size:14px">${esc(fname)}</b><span class="sec xs">${esc(PP.C(CP.SL.l6Caption.map((x,i)=>x)) )}</span></span><button class="ib" ${PP.attr('extVoicePlay')}>${T.playing==='xv'?I.stop:I.play}</button></div></div>
   ${limit?`<div class="note">${esc(PP.C(CP.SL.dayLimitTemplate).replace('%@','3000'))}</div>`:''}</div>
   <div class="mt" style="display:flex;flex-direction:column;gap:8px">${btn(PP.C(['Поделиться','Compartir','Share']),'extVoiceShare',undefined,'pri',limit?'disabled':'')}${btn(L('Отмена','Cancelar','Cancel'),'closeSheet',undefined,'ghost')}</div>`; };
A.extMyVoiceSoon = () => { PP.toast(L('«Мой голос» для голосовых в другие приложения появится позже. Сейчас — стандартный голос.','«Mi voz» para audios a otras apps llegará más adelante. Ahora, la voz estándar.','My Voice for voice messages to other apps is coming later. For now, the standard voice.')); return false; };
A.extVoicePlay = () => { const e=T.ext; const r=e.reply&&e.reply.state==='done'?e.reply:null; if (T.playing==='xv'){ PP.stopSpeak(); return; } PP.speak(r?r.out:e.out, r?r.outLang:e.outLang, 'xv'); return false; };
A.extVoiceShare = () => { const e=T.ext; const r=e.reply&&e.reply.state==='done'?e.reply:null; const lang=r?r.outLang:e.outLang;
  const fname = ({ru:'Parrlo ИИ-голос — русский.m4a', es:'Voz IA Parrlo — español.m4a', en:'Parrlo AI voice — English.m4a'})[lang]||'Parrlo AI voice.m4a';
  const capRecipient = ({ru:CP.SL.l6Caption[0], es:CP.SL.l6Caption[1], en:CP.SL.l6Caption[2]})[lang];
  PP.sheet('share',{kind:'voice', text:r?r.out:e.out, lang, ctx:'ext', fname, capRecipient, reply:!!r}); };
})();
