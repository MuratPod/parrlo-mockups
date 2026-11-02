/* Parrlo Translate prototype · «Мой голос» (Chats/MyVoice.swift, MyVoiceTexts.swift, MyVoiceConsentCopy.swift @ 5c0c39d0) */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,L,esc,btn,goBtn,I,nav,tg,li_} = PP;
const S = () => PP.S; const T = PP.T; const CP = window.COPY;
const MV = (k) => PP.C(CP.MV[k]);
const MIN=25, TARGET=30, MAX=40;
const mvBack = () => T.mvBack || '#/app/settings';
const isReconsent = () => S().voice.exists && S().demo.reconsent;

ENTER['app/myvoice'] = () => { PP.ensureApp(); location.replace('#/app/myvoice/'+(S().voice.exists?'manage':'consent')); };
R['app/myvoice'] = () => '';
ENTER['app/myvoice/:id'] = (r, prev) => {
  PP.ensureApp(); const st=r.split('/').pop();
  if (st==='consent'){ if (!prev || !prev.startsWith('app/myvoice')) T.mvNote = T.mvNote || null; T.mvChecks={bio:false,adult:false,own:false}; T.mvConsent=false; }
  if (st==='record' && !T.mvConsent){ location.replace('#/app/myvoice/consent'); return; }
  if (st==='review' && !T.mvSample){ location.replace('#/app/myvoice/'+(T.mvConsent?'record':'consent')); return; }
  if (st==='manage'){ if (!S().voice.exists){ location.replace('#/app/myvoice/consent'); return; } if (S().demo.reconsent && !T.mvRefused){ location.replace('#/app/myvoice/consent'); return; } }
  if (st==='ready' && !S().voice.exists){ location.replace('#/app/myvoice/consent'); return; }
  if (st==='sending'){ runSend(); }
};
LEAVE['app/myvoice/:id'] = (from, to) => {
  if (from==='app/myvoice/record' && T.mvRec && T.mvRec.on){ abortUnfinished(); }
  stopReviewPlay();
};
R['app/myvoice/:id'] = (st) => ({consent, record, review, sending, ready, manage}[st]||PP.R.notfound)();

/* consent v5 */
function consent(){
  const re = isReconsent(); const c=T.mvChecks||{};
  const box = (k, text, sub) => `<button class="check ${c[k]?'on':''}" ${PP.attr('mvCheck',k)} role="checkbox" aria-checked="${!!c[k]}"><span class="bx">${c[k]?I.check:''}</span><span><span>${esc(text)}</span>${sub?`<br><span class="ter xs">${esc(sub)}</span>`:''}</span></button>`;
  const all = c.bio && c.adult && c.own;
  return `${nav(MV('title'), mvBack(), L('Назад','Atrás','Back'))}<div class="scroll legal">
  ${T.mvNote?`<div class="note err">${esc(T.mvNote)}</div>`:''}${re?`<div class="note">${esc(MV('reconsentNote'))}</div>`:''}
  <p style="font-size:17px;color:var(--text)">${esc(re?MV('reconsentShort'):MV('short'))}</p>
  <h2 class="t">${esc(MV('dataHeading'))}</h2>
  ${['collect',re?'reconsentWhy':'why','basis','controller','recipients','transfer','only','label'].map(k=>`<p>• ${esc(MV(k))}</p>`).join('')}
  <h2 class="t">${esc(MV('storageHeading'))}</h2><p>${esc(MV('storageSample')+' '+MV('storageTerm')+' '+MV('storageDeletion'))}</p>
  <div style="border-top:1px solid var(--line);margin-top:8px">${box('bio', MV('check1'))}${box('adult', MV('check2'), MV('adultDeclaration'))}${box('own', MV('checkOwnVoice'))}</div>
  <p class="sec sm">${esc(MV('footer'))} <button class="lnk" ${PP.attr('legal','privacy')}>${esc(MV('privacyLink'))}</button></p>
  <p class="ter xs">${esc(L('Версия согласия','Versión del consentimiento','Consent version'))}: v5 · 2026-11-01-v5</p></div>
  <div class="foot">${btn(MV('button'),'mvContinue',undefined,'pri',all?'':'disabled')}${re?btn(PP.C(CP.MV.refuseButton),'mvRefuse',undefined,'ghost'):''}</div>`;
}
A.mvCheck = (k) => { T.mvChecks[k]=!T.mvChecks[k]; };
A.mvContinue = () => { const c=T.mvChecks; if (!(c.bio&&c.adult&&c.own)){ PP.toast(PP.C(['Отметьте обязательные пункты, чтобы продолжить.','Marca las casillas obligatorias para continuar.','Select the required boxes to continue.'])); return; }
  if (isReconsent()){ // POST /v1/voice/consent without re-recording (simulated)
    if (S().demo.offline){ T.mvNote = L('Нет подключения к интернету. Проверьте сеть и попробуйте снова.','No hay conexión a internet. Comprueba la red e inténtalo de nuevo.','No internet connection. Check your connection and try again.'); return; }
    S().demo.reconsent=false; S().voice.consentVer='v5'; T.mvRefused=false; T.mvNote=null; PP.toast(L('Согласие сохранено','Consentimiento guardado','Consent saved')); PP.go('#/app/myvoice/manage'); return false; }
  T.mvConsent=true; T.mvNote=null; PP.go('#/app/myvoice/record'); return false; };
A.mvRefuse = () => { T.mvRefused=true; T.mvNote=null; PP.go('#/app/myvoice/manage'); return false; };

/* recording */
const speed = () => +S().demo.speed || 1;
function secs(){ const r=T.mvRec; if (!r) return 0; return r.on ? r.acc + (Date.now()-r.t0)/1000*speed() : r.acc; }
function record(){
  const r=T.mvRec||{on:false,acc:0}; const s=secs(); const on=r.on;
  const pct = Math.min(100, s/TARGET*100);
  const text = PP.C([CP.READ.ru, CP.READ.es, CP.READ.en]);
  const cut = Math.floor(text.length * Math.min(1, s/TARGET));
  const tips = CP.TIPS[PP.lang()]||CP.TIPS.ru; const tip = tips[Math.floor(s/10)%tips.length];
  const canFinish = s>=MIN;
  const label = on ? (canFinish?L('Готово','Listo','Done'):L('Прервать','Cancelar','Cancel')) : L('Записать образец','Grabar muestra','Record Sample');
  return `${nav(MV('title'), '#/app/myvoice/consent', L('Назад','Atrás','Back'))}
  <div style="padding:0 var(--side)"><div style="display:flex;justify-content:space-between;align-items:center"><span class="timer" id="mvTimer">${esc(L(`${PP.mmss(s)} из ${PP.mmss(TARGET)}`,`${PP.mmss(s)} de ${PP.mmss(TARGET)}`,`${PP.mmss(s)} of ${PP.mmss(TARGET)}`))}</span><span class="ter xs">${esc(L('25–40 с','25–40 s','25–40 s'))}</span></div>
  <div class="prog" aria-label="${esc(L('Прогресс чтения','Progreso de lectura','Reading progress'))}"><i id="mvProg" style="width:${pct}%"></i></div>
  <div class="wave" id="mvWave">${Array.from({length:36},()=>'<i></i>').join('')}</div>
  <div class="sec sm center" id="mvTip" style="min-height:20px">${on?esc(tip):''}</div>
  ${T.mvNote?`<div class="note err">${esc(T.mvNote)}</div>`:''}</div>
  <div class="scroll"><h2 class="t" style="font-size:24px">${esc(L('Прочитайте вслух','Lee en voz alta','Read Aloud'))}</h2><p class="sec">${esc(L('Около 30 секунд. Тихая комната, телефон в 20–30\u00A0см, без наушников.','Unos 30 segundos. Un lugar tranquilo, el teléfono a 20–30\u00A0cm y sin auriculares.','About 30 seconds. A quiet room, the phone 20–30\u00A0cm away, no headphones.'))}</p>
  <div class="rtext" id="mvText"><span class="rd">${esc(text.slice(0,cut))}</span><span class="un">${esc(text.slice(cut))}</span></div>
  <p class="ter xs mt">${esc(PP.C(['Запишите только свой голос. Записывать чужой голос нельзя — даже с согласия этого человека.','Graba solo tu propia voz. No se puede grabar la voz de otra persona, ni siquiera con su consentimiento.','Record only your own voice. Recording another person’s voice isn’t allowed, even with their consent.']))}</p></div>
  <div class="foot"><button class="btn bigrec ${on&&!canFinish?'sec':'pri'}" id="mvMain" ${PP.attr('mvMain')}>${on?'':I.mic.replace('<svg','<svg width="22" height="22"')}${esc(label)}</button></div>`;
}
A.mvMain = () => { const r=T.mvRec; if (!r || !r.on){ if (S().mic==='unknown'){ A.micAsk('mv'); return; } if (S().mic==='denied'){ T.mvNote=L('Нет доступа к микрофону. Разрешите его в Настройках.','Sin acceso al micrófono. Permítelo en Ajustes.','No microphone access. Allow it in Settings.'); return; } A.mvStart(); return; }
  if (secs() < MIN){ abortUnfinished(PP.C(['Запись слишком короткая. Запишите образец ещё раз: не меньше 25 секунд (лучше около 30).','La grabación es demasiado corta. Graba la muestra otra vez: al menos 25 segundos (lo ideal, unos 30).','The recording is too short. Record the sample again: at least 25 seconds (about 30 is best).'])+' '+PP.C(['Запись никуда не отправлена.','La grabación no se ha enviado a ningún sitio.','The recording has not been sent anywhere.'])); return false; }
  finish(); return false; };
A.mvStart = () => {
  T.mvNote=null; T.mvSample=null; T.mvRec={on:true, acc:0, t0:Date.now(), levels:[], quiet:false};
  startMic();
  T.mvIv = setInterval(tick, 100);
  PP.render();
};
async function startMic(){
  T.mvReal=null;
  if (!S().demo.realMic || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.AudioContext && !window.webkitAudioContext) return;
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    if (!T.mvRec || !T.mvRec.on){ stream.getTracks().forEach(t=>t.stop()); return; }
    const ctx = new (window.AudioContext||window.webkitAudioContext)(); const src=ctx.createMediaStreamSource(stream); const an=ctx.createAnalyser(); an.fftSize=256; src.connect(an);
    let rec=null, chunks=[]; try{ rec=new MediaRecorder(stream); rec.ondataavailable=e=>chunks.push(e.data); rec.start(); }catch(e){}
    T.mvReal={stream, ctx, an, rec, chunks, buf:new Uint8Array(an.fftSize)};
  }catch(e){ T.mvReal=null; /* graceful fallback: simulated waveform */ }
}
function stopMic(){ const m=T.mvReal; if (!m) return null; let blobP=null;
  try{ if (m.rec && m.rec.state!=='inactive'){ blobP=new Promise(res=>{ m.rec.onstop=()=>res(new Blob(m.chunks,{type:m.rec.mimeType||'audio/webm'})); }); m.rec.stop(); } }catch(e){}
  try{ m.stream.getTracks().forEach(t=>t.stop()); m.ctx.close(); }catch(e){} T.mvReal=null; return blobP; }
function level(){ const m=T.mvReal; if (!m) return 0.25+0.6*Math.abs(Math.sin(Date.now()/230))*Math.random();
  m.an.getByteTimeDomainData(m.buf); let mx=0; for (const v of m.buf) mx=Math.max(mx, Math.abs(v-128)); return mx/128; }
function tick(){
  const r=T.mvRec; if (!r || !r.on) return; const s=secs();
  const lv=level(); r.levels.push(lv); if (r.levels.length>40) r.levels.shift();
  r.quiet = !!T.mvReal && s>4 && r.levels.length===40 && Math.max(...r.levels) < 0.03;
  r.loud = !!T.mvReal && r.levels.slice(-10).filter(v=>v>0.97).length>=3;
  if (s>=MAX){ finish(); return; }
  if (PP.route()!=='app/myvoice/record') return;
  const tm=document.getElementById('mvTimer'); if (tm) tm.textContent=L(`${PP.mmss(s)} из ${PP.mmss(TARGET)}`,`${PP.mmss(s)} de ${PP.mmss(TARGET)}`,`${PP.mmss(s)} of ${PP.mmss(TARGET)}`);
  const pg=document.getElementById('mvProg'); if (pg) pg.style.width=Math.min(100,s/TARGET*100)+'%';
  const w=document.querySelectorAll('#mvWave i'); const lvs=r.levels; w.forEach((i,k)=>{ const v=lvs[lvs.length-1-((w.length-1-k)%Math.max(1,lvs.length))]||0.1; i.style.height=(4+v*30*(0.6+0.4*Math.random()))+'px'; });
  const tips = CP.TIPS[PP.lang()]||CP.TIPS.ru; const tp=document.getElementById('mvTip');
  if (tp) tp.textContent = r.quiet ? L('Слишком тихо\u00A0— поднесите телефон ближе','Demasiado bajo: acerca el\u00A0teléfono','Too quiet — bring the phone closer') : r.loud ? PP.C(['Слишком громко\u00A0— отодвиньте телефон','Demasiado alto: aleja el\u00A0teléfono','Too loud — move the phone away']) : tips[Math.floor(s/10)%tips.length];
  if (tp) tp.style.color = r.quiet||r.loud ? 'var(--warn)' : '';
  const text = PP.C([CP.READ.ru, CP.READ.es, CP.READ.en]); const cut=Math.floor(text.length*Math.min(1,s/TARGET)); const tx=document.getElementById('mvText');
  if (tx){ tx.firstChild.textContent=text.slice(0,cut); tx.lastChild.textContent=text.slice(cut); }
  const mb=document.getElementById('mvMain'); if (mb){ const can=s>=MIN; const lab=can?L('Готово','Listo','Done'):L('Прервать','Cancelar','Cancel'); if (mb.textContent!==lab){ mb.textContent=lab; mb.className='btn bigrec '+(can?'pri':'sec'); } }
}
function stopRec(){ clearInterval(T.mvIv); const r=T.mvRec; if (r && r.on){ r.acc=secs(); r.on=false; } return stopMic(); }
function finish(){ const p=stopRec(); const s=Math.min(MAX, T.mvRec.acc);
  T.mvSample={seconds:s, blob:null}; if (p) p.then(b=>{ if (T.mvSample) T.mvSample.blob=b; });
  T.mvSendErr=null; PP.go('#/app/myvoice/review'); }
function abortUnfinished(note){ stopRec(); T.mvRec=null; T.mvSample=null; const s=S(); if (!s.voice.exists){ s.voice.on=false; s.shareMyVoice=false; } T.pendingShareVoice=false; PP.save();
  T.mvNote = note || PP.C(['Текст не дочитан\u00A0— голос не записан, переключатель выключен','Texto sin terminar: la voz no se grabó y el interruptor se desactivó','Text not finished — voice not recorded, switch turned off']);
  T.mvConsent=false; if (PP.route()==='app/myvoice/record') PP.go('#/app/myvoice/consent'); }

/* review */
function review(){ const sm=T.mvSample||{seconds:0}; const err=T.mvSendErr; const blocked=T.mvVersionBlocked;
  return `${nav(MV('title'), '#/app/myvoice/consent', L('Назад','Atrás','Back'))}<div class="scroll"><div class="center" style="margin-top:20px">${PP.parrot()}</div>
  <h1 class="t center">${esc(PP.C(['Образец готов','Muestra lista','Sample Ready']))}</h1><p class="sec center">${esc(L('Длительность','Duración','Length'))}: ${PP.mmss(sm.seconds)} · ${esc(L('проверка образца пройдена','muestra comprobada','sample check passed'))}</p>
  ${err?`<div class="note err">${esc(err)}</div>`:''}
  <button class="btn ghost" ${PP.attr('mvPlay')} style="margin-top:12px">${T.mvPlaying?I.stop:I.play} ${esc(T.mvPlaying?L('Пауза','Pausa','Pause'):L('Прослушать запись','Escuchar grabación','Play Recording'))}</button>
  <p class="ter xs mt">${esc(L('Запись хранится только в памяти телефона и уходит на сервер только по кнопке «Отправить».','La grabación solo está en la memoria del teléfono y se envía únicamente al pulsar «Enviar».','The recording stays in the phone’s memory and is only sent when you tap Send.'))}</p></div>
  <div class="foot"><div class="row2">${btn(PP.C(['Перезаписать','Volver a grabar','Record Again']),'mvRerecord',undefined,'sec')}${btn(err?PP.C(['Отправить ещё раз','Enviar de nuevo','Send Again']):PP.C(['Отправить','Enviar','Send']),'mvSend',undefined,'pri',blocked?'disabled':'')}</div></div>`; }
A.mvPlay = () => { if (T.mvPlaying){ stopReviewPlay(); return; } T.mvPlaying=true; const b=T.mvSample&&T.mvSample.blob;
  if (b){ try{ T.mvAudio=new Audio(URL.createObjectURL(b)); T.mvAudio.onended=()=>{T.mvPlaying=false; PP.render();}; T.mvAudio.play().catch(()=>{}); }catch(e){} }
  T.mvPlayT=setTimeout(()=>{ T.mvPlaying=false; PP.render(); }, b?Math.min(40000,(T.mvSample.seconds||5)*1000):3500); };
function stopReviewPlay(){ T.mvPlaying=false; clearTimeout(T.mvPlayT); try{ T.mvAudio && T.mvAudio.pause(); }catch(e){} }
A.mvRerecord = () => { stopReviewPlay(); T.mvSample=null; T.mvRec=null; PP.go('#/app/myvoice/record'); return false; };
A.mvSend = () => { stopReviewPlay(); if (S().voice.exists){ PP.dialog({title:PP.C(['Заменить голос','Reemplazar la voz','Replace Voice']), msg:PP.C(['Текущий голос заменится новым.','Tu voz actual se reemplazará por la nueva.','Your current voice will be replaced with the new one.']), buttons:[{t:PP.C(['Заменить','Reemplazar','Replace']),a:'mvSendGo',cls:'pri'},{t:PP.C(['Отмена','Cancelar','Cancel']),a:'noop'}]}); return; } A.mvSendGo(); return false; };
A.mvSendGo = () => { PP.go('#/app/myvoice/sending'); return false; };

/* sending */
function sending(){ return `${nav(MV('title'), '', '')}<div class="cover center">${PP.parrot()}<h1 class="t">${esc(L('Создаём голос…','Creando la voz…','Creating Your Voice…'))}</h1><div class="prog"><i id="mvSendProg" style="width:10%"></i></div><p class="sec sm">${esc(L('Отправляем…','Enviando…','Sending…'))}</p></div>`; }
function runSend(){ let p=10; PP.rt(()=>{ p=Math.min(95,p+12); const e=document.getElementById('mvSendProg'); if(e) e.style.width=p+'%'; }, 200, true);
  PP.rt(()=>{ const d=S().demo; const err = d.offline?'net':d.mvErr;
    if (err==='net'){ T.mvSendErr=PP.C(['Не получилось связаться с\u00A0сервисом. Проверьте интернет и\u00A0попробуйте ещё раз.','No se pudo conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.','Couldn’t reach the service. Check your connection and try again.']); PP.go('#/app/myvoice/review'); return; }
    if (err==='401'){ T.mvSendErr=PP.C(['Не получилось создать голос. Попробуйте ещё раз.','No se pudo crear la voz. Inténtalo de nuevo.','Couldn’t create the voice. Please try again.']); PP.go('#/app/myvoice/review'); return; }
    if (err==='version'){ T.mvVersionBlocked=true; T.mvSendErr=PP.C(['Обновите приложение, чтобы создать голос.','Actualiza la app para crear tu voz.','Update the app to create your voice.']); PP.go('#/app/myvoice/review'); return; }
    const s=S(); s.voice.exists=true; s.voice.on=true; s.voice.consentVer='v5'; s.voice.used=0; if (T.pendingShareVoice){ s.shareMyVoice=true; T.pendingShareVoice=false; }
    T.mvSample=null; T.mvSendErr=null; PP.save(); PP.go('#/app/myvoice/ready'); }, 2200); }

/* ready */
const sample = (lang) => ({es:'¡Hola! Esta es mi voz en español. ¿Qué tal suena?', en:'Hi! This is my voice in English. How does it sound?', ru:'Привет! Это мой голос на русском. Как он звучит?'})[lang];
function ready(){ return `${nav(MV('title'), '', '')}<div class="scroll"><div class="center" style="margin-top:16px"><span class="glow" style="display:inline-block">${PP.parrot()}</span></div>
  <h1 class="t center">${esc(L('Голос готов','Tu voz está lista','Your Voice Is Ready'))}</h1><p class="sec center">${esc(L('Послушайте, как он звучит на разных языках:','Escucha cómo suena en distintos idiomas:','Listen to how it sounds in different languages:'))}</p>
  ${['ru','es','en'].map(l=>`<button class="li grp" style="margin-bottom:8px;border-radius:16px" ${PP.attr('mvPreview',l)}><span class="tile">${T.playing==='pv'+l?I.stop:I.play}</span><span class="tx"><b>${esc(({ru:L('По-русски','En ruso','In Russian'),es:L('По-испански','En español','In Spanish'),en:L('По-английски','En inglés','In English')})[l])}</b><small>${esc(PP.C(CP.OB.aiVoiceLabel))}</small></span></button>`).join('')}</div>
  <div class="foot">${btn(L('Готово','Listo','Done'),'mvDone')}</div>`; }
A.mvPreview = (l) => { if (T.playing==='pv'+l){ PP.stopSpeak(); return; } PP.speak(sample(l), l, 'pv'+l); return false; };
A.mvDone = () => { PP.stopSpeak(); PP.go(T.mvBack==='#/app/settings'||!T.mvBack?'#/app/myvoice/manage':T.mvBack); return false; };

/* manage */
function manage(){ const s=S(); const silenced = T.mvRefused && s.demo.reconsent;
  const exp = new Date(Date.now()+365*864e5).toLocaleDateString(PP.lang(), {day:'numeric', month:'long', year:'numeric'});
  const now=new Date(); const reset=Math.max(1, Math.ceil((Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 1)-now)/864e5));
  return `${nav(MV('title'), mvBack(), L('Настройки','Ajustes','Settings'))}<div class="scroll">
  ${silenced?`<div class="note">${esc(PP.C(CP.MV.manageNote))}</div>${btn(PP.C(CP.MV.giveConsentButton),'mvGiveConsent',undefined,'pri')}<div style="height:12px"></div>`:''}
  <div class="grp">${li_({t:MV('title'),right:tg(s.voice.on&&!silenced,'mvOn',undefined,silenced)})}${li_({t:L('Голосовые через «Мой голос»','Audios con «Mi voz»','Voice Messages With My Voice'),right:tg(s.shareMyVoice&&!silenced,'mvShare',undefined,silenced)})}</div>
  ${silenced?'':`<button class="btn ghost mt" ${PP.attr('mvSample')}>${T.playing==='mvs'?I.stop:I.play} ${esc(L('Прослушать пример озвучки','Escuchar ejemplo de voz','Play Voice Sample'))}</button>
  <p class="gf">${esc(L(`Использовано ${s.voice.used*10}% · сброс через ${reset} дн`,`Usado: ${s.voice.used*10}% · se restablece en ${reset} d`,`Used ${s.voice.used*10}% · resets in ${reset} d`))}</p>`}
  <p class="gf">${esc(PP.C(['Ваш голос будет удалён %@, если им не пользоваться. Озвучьте сообщение своим голосом, чтобы продлить, или удалите голос сами.','Tu voz se eliminará el %@ si no la usas. Di un mensaje con tu voz para mantenerla, o elimínala tú.','Your voice will be deleted on %@ if it isn’t used. Voice a message in your voice to keep it, or delete it yourself.']).replace('%@',exp))}</p>
  <div class="grp" style="margin-top:16px">${li_({t:L('Перезаписать голос','Regrabar la voz','Re-Record Voice'),a:'mvRerecordVoice'})}${li_({t:MV('deleteVoice'),a:'mvDeleteAsk',dng:true,noChev:true})}</div></div>`; }
A.mvOn = () => { const v=S().voice; v.on=!v.on; };
A.mvShare = () => { S().shareMyVoice=!S().shareMyVoice; };
A.mvSample = () => { if (T.playing==='mvs'){ PP.stopSpeak(); return; } const s=S(); if (s.demo.offline){ PP.toast(PP.C(['Сейчас озвучка своим голосом недоступна. Попробуйте позже.','Ahora mismo la locución con tu voz no está disponible. Inténtalo más tarde.','Playback in your voice isn’t available right now. Please try again later.'])); return; }
  if (s.voice.used>=10){ PP.toast(L('Лимит озвучки своим голосом на этот месяц исчерпан.','Has agotado el límite de locución con tu voz de este mes.','You’ve used up this month’s limit for playback in your voice.')); return; }
  s.voice.used++; const l = PP.lang()==='es'?'es':'ru'; PP.speak(PP.C(['Привет! Это пример озвучки голосового сообщения.','¡Hola! Este es un ejemplo de voz de un mensaje de audio.','Hi! This is a sample voice message.']), PP.lang()==='en'?'ru':l, 'mvs'); return false; };
A.mvGiveConsent = () => { T.mvRefused=false; PP.go('#/app/myvoice/consent'); return false; };
A.mvRerecordVoice = () => { T.mvRerecord=true; S().demo.reconsent=false; PP.go('#/app/myvoice/consent'); return false; };
A.mvDeleteAsk = () => { PP.dialog({title:L('Удалить голос?','¿Eliminar la voz?','Delete Voice?'), msg:L('Мы удалим ваш голосовой профиль у себя и отправим ElevenLabs запрос на удаление. Это также отзыв согласия на «Мой голос». Перевод продолжит работать. Озвучка вернётся к стандартному голосу. Копии, которые вы уже отправили или сохранили, останутся у получателей и на вашем устройстве.','Eliminaremos tu perfil de voz de nuestros sistemas y enviaremos a ElevenLabs la orden de eliminarlo. También retiras así tu consentimiento para «Mi voz». La traducción seguirá funcionando. La locución volverá a la voz estándar. Las copias que ya hayas enviado o guardado se quedarán con quien las recibió y en tu dispositivo.','We’ll delete your voice profile from our systems and send ElevenLabs a deletion request. This also withdraws your consent for My Voice. Translation keeps working. Playback returns to the standard voice. Copies you have already sent or saved stay with the recipients and on your device.'),
  buttons:[{t:MV('deleteVoice'),a:'mvDelete',cls:'dng'},{t:L('Отмена','Cancelar','Cancel'),a:'noop'}]}); };
A.mvDelete = () => { const s=S(); if (s.demo.offline){ T.mvDelFail=(T.mvDelFail||0)+1; PP.dialog({title:PP.C(['Не удалось удалить голос. Повторите.','No se pudo eliminar la voz. Inténtalo de nuevo.','Couldn’t delete the voice. Try again.']), msg:PP.C(['Не удалось удалить голос. Проверьте интернет и попробуйте ещё раз.','No se ha podido eliminar tu voz. Comprueba tu conexión e inténtalo de nuevo.','Couldn\'t delete your voice. Check your connection and try again.'])+(T.mvDelFail>=2?'\n\n'+PP.C(['Если не получается, напишите на hello@parrlo.com с темой «Удалить мой голос».','Si sigue sin funcionar, escríbenos a hello@parrlo.com con el asunto «Eliminar mi voz».','If it still doesn\'t work, email us at hello@parrlo.com with the subject "Delete my voice".']):''), buttons:[{t:L('Повторить','Reintentar','Try Again'),a:'mvDelete',cls:'pri'},{t:L('Отмена','Cancelar','Cancel'),a:'noop'}]}); return; }
  T.mvDelFail=0; s.voice={exists:false,on:false,used:0,consentVer:null}; s.shareMyVoice=false; PP.toast(MV('afterDelete')); PP.go('#/app/settings'); return false; };
})();
