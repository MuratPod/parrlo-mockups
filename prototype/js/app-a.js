/* Parrlo Translate prototype · app screens A: TTS, age gate, onboarding, start, conversation */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,L,esc,btn,goBtn,I,nav,tg,li_,seg,paras} = PP;
const S = () => PP.S; const T = PP.T; const CP = window.COPY;
const lk = (k) => PP.C(CP.OB[k]); PP.lk = lk;

/* speech (TTS) */
PP.speak = (text, lang, key, opts={}) => {
  PP.stopSpeak();
  T.playing = key;
  const dur = Math.min(9000, 900 + String(text).length * 55);
  try {
    if ('speechSynthesis' in window && !opts.silent){
      const u = new SpeechSynthesisUtterance(text); u.lang = (DATA.LANGS[lang]||{}).tts || lang; u.rate = 1;
      const vs = speechSynthesis.getVoices().filter(v=>v.lang && v.lang.toLowerCase().startsWith(lang));
      if (vs.length) u.voice = vs[0];
      speechSynthesis.speak(u);
    }
  } catch(e){}
  T.playT = setTimeout(()=>{ T.playing=null; PP.render(); }, dur);
  if (opts.render!==false) PP.render(); else { PP.render(); }
};
PP.stopSpeak = () => { clearTimeout(T.playT); T.playing=null; try{ speechSynthesis.cancel(); }catch(e){} };

/* 1.1 Age gate */
R['app/age'] = () => `<div class="cover"><div class="center">${PP.parrot()}</div>
  <h1 class="t center">${esc(L('Вам есть 16 лет?','¿Tienes 16 años o más?','Are You 16 or Older?'))}</h1>
  <p class="sec center">${esc(L('Parrlo можно пользоваться с 16 лет. Подтвердите возраст, чтобы продолжить.','Puedes usar Parrlo a partir de los 16 años. Confirma tu edad para continuar.','You can use Parrlo from age 16. Confirm your age to continue.'))}</p>
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px">${btn(L('Мне есть 16','Tengo 16 o más','I’m 16 or Older'),'ageYes')}${btn(L('Мне меньше 16','Tengo menos de 16','I’m Under 16'),'ageNo',undefined,'sec')}</div>
  <p class="sec sm center mt">${esc(L('Подробнее — в ','Más información en las ','Learn more in the '))}<button class="lnk" ${PP.attr('legal','terms')}>${esc(L('Условиях использования','Condiciones de uso','Terms of Use'))}</button>${esc(L(' и ',' y la ',' and '))}<button class="lnk" ${PP.attr('legal','privacy')}>${esc(L('Политике конфиденциальности','Política de privacidad','Privacy Policy'))}</button>.</p></div>`;
R['app/age-refusal'] = () => `<div class="cover center">${PP.parrot()}<h1 class="t">${esc(L('Parrlo пока не для вас','Parrlo aún no es para ti','Parrlo Isn’t for You Yet'))}</h1><p class="sec">${esc(L('Извините, Parrlo доступен только с 16 лет.','Lo sentimos, Parrlo solo está disponible a partir de los 16 años.','Sorry, Parrlo is only available from age 16.'))}</p>
  <div class="row2 mt">${btn(L('Условия','Condiciones','Terms'),'legal','terms','ghost')}${btn(L('Политика','Privacidad','Privacy'),'legal','privacy','ghost')}</div></div>`;
A.ageYes = () => { S().age='ok'; PP.go('#/app/onb/welcome'); return false; };
A.ageNo = () => { S().age='under'; PP.go('#/app/age-refusal'); return false; };

/* 1.2 Onboarding */
const STEPS = ['welcome','about','how','mic'];
const dots = (st) => `<div class="dots">${STEPS.map(s=>`<i class="${s===st?'on':''}"></i>`).join('')}</div>`;
ENTER['app/onb/:id'] = (r) => {
  T.onb = r.split('/').pop(); if (S().age===null) S().age='ok';
  if (r==='app/onb/prep'){ T.prep={stage:0, dl:null}; PP.rt(()=>{ if(T.prep.stage<2){ T.prep.stage++; PP.render(); } }, 1400, true); }
};
function consentBody(){
  const lines = PP.C(CP.CLOUD.voiceText);
  return `<div class="scroll legal"><h1 class="t">${esc(lk('emptyTitle'))}</h1>${paras(lines)}<p><button class="lnk" ${PP.attr('legal','privacy')}>${esc(lk('emptyMore'))}</button></p><p class="ter xs">${esc(L('Версия текста согласия: ','Versión del texto: ','Consent text version: '))}2026-10-28-4</p></div>`;
}
PP.consentBody = consentBody;
R['app/onb/:id'] = (st) => {
  if (st==='welcome') return `${dots(st)}<div class="cover center"><div class="glow" style="margin:0 auto">${PP.parrot()}</div>
    <h1 class="t" style="font-size:32px">${esc(L('Скажите, как можете — прозвучите безупречно','Habla como puedas, suena impecable.','Say It However You Can — Sound Flawless'))}</h1>
    <p class="sec">${esc(L('Говорите по-русски — собеседник услышит по-испански. И наоборот.','Habla en ruso y tu interlocutor te oirá en español. Y al revés.','Speak Russian — the other person hears Spanish. And the other way round.'))}</p></div>
    <div class="foot">${btn(L('Начать','Empezar','Start'),'onbNext','about')}</div>`;
  if (st==='about'){ const g=S().gender;
    return `${dots(st)}<div class="scroll"><h1 class="t">${esc(L('Как к вам обращаться?','¿Cómo debemos tratarte?','How Should We Address You?'))}</h1>
    <p class="sec">${esc(L('Нужно для правильных окончаний: «я устал» или «я устала».','Sirve para acertar con el género en ruso: «я устал» o «я устала».','Used for correct word endings in Russian: «я устал» or «я устала».'))}</p>
    <button class="choice ${g==='male'?'on':''}" ${PP.attr('setGender','male')}><span><span class="big">${esc(L('Мужчина','Hombre','Man'))}</span><br><span class="sec">я устал</span></span></button>
    <button class="choice ${g==='female'?'on':''}" ${PP.attr('setGender','female')}><span><span class="big">${esc(L('Женщина','Mujer','Woman'))}</span><br><span class="sec">я устала</span></span></button>
    <p class="ter sm mt">${esc(L('Parrlo помогает объясниться в аптеке или у врача. Это не медицинская консультация.','Parrlo te ayuda a explicarte en la farmacia o con el médico. No es una consulta médica.','Parrlo helps you explain yourself at a pharmacy or doctor’s. It is not medical advice.'))}</p></div>
    <div class="foot">${btn(L('Дальше','Siguiente','Next'),'onbNext','how','pri',g?'':'disabled')}${btn(L('Пропустить','Omitir','Skip'),'onbNext','how','ghost')}</div>`; }
  if (st==='how') return `${dots(st)}${consentBody()}<div class="foot">${btn(lk('allow'),'consentAllow','onb')}${btn(lk('notNow'),'consentNotNow','onb','ghost')}</div>`;
  if (st==='mic') return `${dots(st)}<div class="cover center"><div style="margin:0 auto;width:88px;height:88px;border-radius:44px;background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--green)">${I.mic.replace('<svg','<svg width="40" height="40"')}</div>
    <h1 class="t">${esc(L('Разрешите микрофон','Permite el micrófono','Allow the Microphone'))}</h1><p class="sec">${esc(L('Parrlo слушает только после нажатия на кнопку. Parrlo не сохраняет запись вашего голоса на своих серверах.','Parrlo solo escucha cuando pulsas el botón. Parrlo no guarda la grabación de tu voz en sus servidores.','Parrlo only listens after you tap the button. Parrlo doesn’t keep recordings of your voice on its servers.'))}</p></div>
    <div class="foot">${btn(L('Разрешить микрофон','Permitir micrófono','Allow Microphone'),'micAsk','onb')}</div>`;
  if (st==='prep') return prepScreen();
  return PP.R.notfound();
};
A.setGender = (v) => { S().gender=v; };
A.onbNext = (v) => { PP.go('#/app/onb/'+v); return false; };
A.consentAllow = (v) => { S().scope='voiceText'; S().kb.everConnected=true; if (v==='onb') PP.go('#/app/onb/mic'); else { PP.toast(L('Перевод в облаке включён','Traducción en la nube activada','Cloud translation is on')); PP.go(T.consentBack||'#/app/main'); } return false; };
A.consentNotNow = (v) => { S().scope='none'; if (v==='onb'){ S().intro=true; T.conv={started:true,turns:[],text:true}; PP.go('#/app/conv'); } else PP.go(T.consentBack||'#/app/main'); return false; };
A.micAsk = (v) => {
  if (S().mic!=='unknown'){ A.micDone(v); return false; }
  PP.sysAlert({title:L('Приложение «Parrlo» запрашивает доступ к микрофону','«Parrlo» quiere acceder al micrófono','“Parrlo” Would Like to Access the Microphone'),
    msg:L('Parrlo слушает вашу речь, только пока вы говорите, чтобы перевести её. Куда уходит звук, написано в «Настройки → Данные и приватность».','Parrlo escucha tu voz solo mientras hablas, para traducirla. En «Ajustes → Datos y privacidad» te explicamos adónde va el audio.','Parrlo listens to your voice only while you speak, to translate it. Where the audio goes is explained in “Settings → Data & privacy”.'),
    buttons:[{t:L('Не разрешать','No permitir','Don’t Allow'),a:'micAnswer',v:'denied|'+v},{t:L('Разрешить','Permitir','Allow'),a:'micAnswer',v:'granted|'+v}]});
};
A.micAnswer = (v) => { const [ans,ctx]=v.split('|'); S().mic=ans; PP.save(); return A.micDone(ctx); };
A.micDone = (ctx) => {
  if (ctx==='onb'){ S().intro=true; S().kb.everConnected = true; PP.go('#/app/main'); return false; }
  if (ctx==='me'||ctx==='them'){ if (S().mic==='granted'){ A.micTap(ctx); return; } PP.go('#/app/nomic'); return false; }
  if (ctx==='mv'){ if (S().mic==='granted') A.mvStart(); else T.mvNote = L('Нет доступа к микрофону. Разрешите его в Настройках.','Sin acceso al micrófono. Permítelo en Ajustes.','No microphone access. Allow it in Settings.'); return; }
  if (ctx==='ext'){ if (S().mic==='granted') A.extReplyRec(); else { PP.go('#/app/nomic'); return false; } return; }
};
function prepScreen(){
  const p = T.prep||{stage:0, dl:null};
  const stages = [L('Проверяем связь с сервером — это несколько секунд.','Comprobando la conexión con el servidor. Tardará unos segundos.','Checking the connection to the server. It takes a few seconds.'), L('Проверяем перевод','Comprobando la traducción','Checking translation')];
  return `<div class="scroll"><h1 class="t">${esc(lk('prepTitle'))}</h1><p class="sec">${esc(L('Перевод идёт через наш сервер: на сервер уходят ваш голос (во время записи) и текст.','La traducción pasa por nuestro servidor: al servidor llegan tu voz (mientras hablas) y el texto.','Translation goes through our server: your voice (while recording) and text are sent to it.'))}</p>
  ${stages.map((t,i)=>`<div class="card" style="display:flex;gap:12px;align-items:center">${i<p.stage?`<span style="color:var(--green)">${I.check}</span>`:i===p.stage?'<span class="spark"><i></i><i></i><i></i></span>':'<span class="ter">○</span>'}<span>${esc(t)}</span></div>`).join('')}
  ${p.dl!==null?`<div class="card"><div>${esc(p.dl>=100?L('Скачано','Descargado','Downloaded'):L(`Скачиваем модели · ${p.dl}%`,`Descargando modelos · ${p.dl}%`,`Downloading models · ${p.dl}%`))}</div><div class="prog"><i style="width:${p.dl}%"></i></div></div>`:''}
  ${p.stage>=2?`<div class="note ok">${esc(L('Модели на месте','Modelos listos','Models ready'))}</div>`:''}</div>
  <div class="foot">${btn(L('Скачать модели · 3,9 ГБ · Wi-Fi','Descargar los modelos · 3,9 GB · Wi-Fi','Download Models · 3.9 GB · Wi-Fi'),'prepDl',undefined,'sec',p.dl!==null?'disabled':'')}${btn(L('Пока перевести текстом','Mientras, traducir texto','Translate Text for Now'),'prepText',undefined,'ghost')}</div>`;
}
A.prepDl = () => { T.prep.dl=0; PP.rt(()=>{ if (T.prep.dl<100){ T.prep.dl=Math.min(100,T.prep.dl+10); if(T.prep.dl>=100) S().offlineModels='done'; PP.render(); } }, 300, true); };
A.prepText = () => { S().intro=true; T.conv={started:true,turns:[],text:true}; PP.go('#/app/conv'); return false; };

/* deep-link defaults */
PP.ensureApp = () => { const s=S(); if (s.age===null) s.age='ok'; if (!s.intro) s.intro=true; if (s.scope===null) s.scope='voiceText'; };
const ensureApp = PP.ensureApp;

/* banners */
function banners(){
  const d=S().demo; let h='';
  if (d.offline) h+=`<div class="banner warn"><span class="tx"><b>${esc(L('Нет интернета','Sin internet','No Internet'))}</b><br><span class="sm">${esc(L('Перевод через облако недоступен. Офлайн-переводчик работает без сети.','La traducción en la nube no está disponible. El traductor sin conexión funciona sin red.','Cloud translation is unavailable. The offline translator works without a network.'))}</span></span>${btn(L('Повторить','Reintentar','Retry'),'netRetry',undefined,'sec sm')}</div>`;
  if (T.guest) h+=`<div class="banner"><span class="tx"><b>${esc(L('Гость на связи','Invitado conectado','Guest Connected'))}</b><br><span class="sm sec">${esc(L('Говорит со своего телефона','Habla desde su teléfono','Speaking from their phone'))}</span></span>${btn(L('Отключить','Desconectar','Disconnect'),'guestOff',undefined,'sec sm')}</div>`;
  return h;
}
PP.banners = banners;
A.netRetry = () => { PP.toast(S().demo.offline ? L('Всё ещё нет интернета','Sigue sin haber internet','Still no internet') : L('Связь есть','Conectado','Connected')); };
A.guestOff = () => { T.guest=false; };

/* 2.1 Start screen */
ENTER['app/main'] = () => { ensureApp(); };
function hintCard(){
  const s=S(); if (s.hintDismissed || s.sharedOnce) return '';
  return `<div class="hintcard" id="bridge-hint">${PP.parrot('xs')}<span class="tx">${esc(PP.C(CP.SL.l5Hint))}</span><button class="ib" style="width:30px;height:30px" ${PP.attr('hintClose')} aria-label="${esc(L('Закрыть','Cerrar','Close'))}">${I.x}</button></div>`;
}
A.hintClose = () => { S().hintDismissed=true; };
R['app/main'] = () => {
  const s=S(), p=s.pair; const n=s.history.length;
  return `<div class="head"><button class="chip" data-go="#/app/history">${I.hist.replace('<svg','<svg width="18" height="18"')} ${esc(L('История','Historial','History'))}${n?` · ${n}`:''}</button><div style="flex:1"></div><button class="ib" data-go="#/app/settings" aria-label="${esc(L('Настройки','Ajustes','Settings'))}">${I.gear}</button></div>
  ${hintCard()}${banners()}
  <div class="start"><div style="text-align:center;margin-top:6px"><span class="glow" style="display:inline-block">${PP.parrot()}</span></div>
    <h1 class="t center" style="font-size:30px;margin-top:10px">${esc(L('Переводчик','Traductor','Translator'))}</h1>
    <p class="sec center">${esc(L('Скажите, как можете, — прозвучите безупречно. Говорите по очереди: переведу и произнесу вслух.','Habla como puedas, suena impecable. Habla por turnos: traduzco y lo digo en voz alta.','Say it however you can — sound flawless. Take turns: I translate and speak it aloud.'))}</p>
    <div class="pairbtns"><button class="pb" ${PP.attr('langSheet','mine')}><small>${esc(L('Сейчас у вас','Ahora, el tuyo','Yours now'))}</small><b>${esc(PP.langNative(p.mine))}</b></button>
      <button class="ib swap" ${PP.attr('swapPair')} aria-label="swap">${I.swap}</button>
      <button class="pb" ${PP.attr('langSheet','theirs')}><small>${esc(L('Сейчас у собеседника','Ahora, del interlocutor','Partner’s now'))}</small><b>${esc(PP.langNative(p.theirs))}</b></button></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span class="sec sm" style="flex:1">${esc(L('Собеседник','Interlocutor','Partner'))}</span>${seg([['male',L('Он','Él','He')],['female',L('Она','Ella','She')]], s.partnerGender, 'setPartnerGender')}</div>
    <div style="flex:1"></div>
    <div class="foot" style="padding-left:0;padding-right:0">${btn(L('Начать разговор','Empezar conversación','Start Conversation'),'startConv')}</div>
  </div>`;
};
A.startConv = () => { T.conv={started:true, turns:[], text:false}; PP.go('#/app/conv'); return false; };
A.setPartnerGender = (v) => { S().partnerGender=v; };
A.swapPair = () => { const p=S().pair; [p.mine,p.theirs]=[p.theirs,p.mine]; PP.toast(L('Языки поменялись местами','Los idiomas se han intercambiado','Languages swapped')); };

/* pair & language sheets */
A.pairSheet = () => { PP.sheet('pair'); };
SHEETS.pair = () => { const s=S(), p=s.pair;
  return `<h3>${esc(L('Пара языков','Par de idiomas','Language Pair'))}</h3><div class="sb">
  <div class="grp">${li_({t:L('Вы','Tú','You'),a:'langSheet',v:'mine',val:PP.langNative(p.mine)})}${li_({t:L('Собеседник','Interlocutor','Partner'),a:'langSheet',v:'theirs',val:PP.langNative(p.theirs)})}</div>
  <div class="gh">${esc(L('Пол собеседника','Género del interlocutor','Partner Gender'))}</div>${seg([['male',L('Он','Él','He')],['female',L('Она','Ella','She')]], s.partnerGender, 'setPartnerGender')}
  <p class="gf">${esc(L('Пол собеседника нужен для окончаний в переводе. Если выбрать один язык с обеих сторон, языки поменяются местами.','El género del interlocutor sirve para las terminaciones. Si eliges el mismo idioma en ambos lados, los idiomas se intercambian.','Partner gender is used for word endings in the translation. If you pick the same language on both sides, the two languages swap.'))}</p></div>
  <div class="mt">${btn(L('Готово','Listo','Done'),'closeSheet')}</div>`; };
A.langSheet = (side) => { T.langQ=''; PP.sheet('lang', side); };
SHEETS.lang = (side) => { const s=S(); const curL=s.pair[side]; const q=(T.langQ||'').toLowerCase();
  const all=['ru','es','en','zh'].filter(c=>!q || PP.langName(c).toLowerCase().includes(q) || PP.langNative(c).toLowerCase().includes(q));
  const row = c => li_({t:PP.langName(c), s:PP.langNative(c), a:'pickLang', v:side+'|'+c, right: c===curL?`<span style="color:var(--green)">${I.check}</span>`:'<span></span>'});
  return `<h3>${esc(side==='mine'?L('Ваш язык','Tu idioma','Your Language'):L('Язык собеседника','Idioma del interlocutor','Partner’s Language'))}</h3>
  <input id="langq" placeholder="${esc(L('Поиск','Buscar','Search'))}" value="${esc(T.langQ||'')}" style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);margin-bottom:10px;outline:none" data-input="langQ">
  <div class="sb">${!q?`<div class="gh">${esc(L('Недавние','Recientes','Recent'))}</div><div class="grp">${s.recent.map(row).join('')}</div><div class="gh">${esc(L('Все языки','Todos los idiomas','All Languages'))}</div>`:''}<div class="grp">${all.map(row).join('')||`<div class="li sec">${esc(L('Ничего не найдено','Sin resultados','No results'))}</div>`}</div></div>
  <div class="mt">${btn(L('Отмена','Cancelar','Cancel'),'closeSheet',undefined,'ghost')}</div>`; };
A.pickLang = (v) => { const [side,c]=v.split('|'); const p=S().pair; const other = side==='mine'?'theirs':'mine';
  if (p[other]===c){ p[other]=p[side]; p[side]=c; PP.toast(L('Языки поменялись местами','Los idiomas se han intercambiado','Languages swapped')); } else p[side]=c;
  S().recent=[c,...S().recent.filter(x=>x!==c)].slice(0,3); PP.UI.sheet=null; };
document.addEventListener('input', e => { const k=e.target.dataset && e.target.dataset.input; if (!k) return; T[k]=e.target.value;
  if (k==='langQ'){ const pos=e.target.selectionStart; PP.renderOv(); const el=document.getElementById('langq'); if(el){ el.focus(); el.setSelectionRange(pos,pos);} }
  if (k==='histQ'){ const pos=e.target.selectionStart; PP.render(); const el=document.getElementById('histq'); if(el){ el.focus(); el.setSelectionRange(pos,pos);} }
  if (k==='draft'){ const b=document.getElementById('sendBtn'); if(b) b.disabled=!e.target.value.trim(); }
});
document.addEventListener('keydown', e => { if (e.target.id==='draft' && e.key==='Enter' && !e.shiftKey){ e.preventDefault(); PP.run('sendText'); } });
})();
