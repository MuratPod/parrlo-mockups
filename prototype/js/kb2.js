/* Parrlo prototype · NEW concept «Клавиатура 2 — контекстный помощник» (#/kb2/…).
   Not a translator: messy dictation → polished text in the tone of a specific contact, using that chat's history.
   Everything is demo data; no network. The messenger is a neutral dark scheme (name as plain text, no logo, no brand colours). */
(function(){
const {R,A,SHEETS,ENTER,L,esc,btn,goBtn,I,nav,li_} = PP;
const S = () => PP.S; const T = PP.T;
const now = () => { const d=new Date(); return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); };

/* ---------- demo data ---------- */
const CONTACTS = {
  luis:{id:'luis', name:'Луис', role:'директор', you:'ты', tone:'деловой', note:'пиши деловито', count:1240, av:'Л'},
  ana:{id:'ana', name:'Ана', role:'коллега', you:'ты', tone:'дружеский', note:'можно с юмором', count:860, av:'А'},
  mama:{id:'mama', name:'Мама', role:'семья', you:'ты', tone:'тёплый', note:'без рабочих подробностей', count:3410, av:'М'}};
const MESSY = 'э-э скажи ему что по поставке я узнал они переносят на четверг и надо решить про скидку ну короче я за десять процентов';
const MESSY2 = 'ну скажи что семь ок но оплата пусть будет две недели а не месяц';
const OUT = {
  luis:{base:'Луис, по поставке: поставщик переносит на четверг. По скидке предлагаю остановиться на 10%. Согласен?',
        short:'Поставка — в четверг. Скидка 10%. Ок?',
        soft:'Луис, привет! Поставщик, к сожалению, перенёс поставку на четверг. По скидке я бы предложил 10% — как тебе?',
        alt:'Луис, коротко по двум вопросам: поставка сдвигается на четверг, а по скидке моё предложение — 10%. Подтвердишь?'},
  ana:{base:'Ань, привет! Поставку перенесли на четверг, а по скидке я за 10%. Что думаешь?',
       short:'Поставка в четверг, скидка — 10%. Ок?',
       soft:'Аня, привет! Тут небольшой сдвиг: поставка теперь в четверг. По скидке мне кажется честным 10%. Как тебе?',
       alt:'Ань, новости: поставщик переносит на четверг. И я бы остановился на скидке 10% — ты как?'},
  mama:{base:'Мам, привет! По работе небольшие новости: поставку перенесли на четверг, со скидкой тоже решаем. Всё хорошо!',
        short:'Мам, у меня всё ок: поставка в четверг 🙂',
        soft:'Мамочка, привет! Всё хорошо, просто на работе поставку перенесли на четверг. Не волнуйся 🙂',
        alt:'Мам, у меня всё нормально: поставка в четверг, со скидкой разберёмся. Целую!'},
  luisReply:{base:'Луис, 7% подходит. По оплате прошу 14 дней вместо 30 — так нам проще с бюджетом. Договорились?',
             short:'7% — ок. Оплата — 14 дней. Договорились?',
             soft:'Луис, спасибо! 7% нас устраивает. По оплате, если можно, давай 14 дней вместо 30 — нам так удобнее. Подойдёт?',
             alt:'Луис, принимаем 7%. Единственная просьба — оплата за 14 дней, а не за 30. Согласен?'}};
const LUIS_REPLY = 'Четверг ок. Но 10% много — давай 7%, и оплата в течение 30 дней.';
const HISTORY = [{id:'h1', in:true, t:'Привет! Что с поставкой? И по скидке надо решить до пятницы.', tm:'9:12'}];

function st(){ const s=S(); if (!s.kb2) s.kb2={imported:false, contacts:JSON.parse(JSON.stringify(CONTACTS))}; return s.kb2; }
function k2(){ if (!T.k2) T.k2={contact:'luis', guessed:true, text:'', messy:'', out:null, variant:'base', busy:false, dict:false, reply:false, replyUsed:false, msgs:HISTORY.slice(), voiceSrc:null}; return T.k2; }
const C = (id) => st().contacts[id||k2().contact];
const folderOf = (id) => ({luis:'Луиса', ana:'Аны', mama:'Мамы'})[id];

/* ---------- hub ---------- */
R['kb2'] = () => { const s=st();
  return `${nav('Клавиатура 2', '#/', 'Старт')}<div class="scroll k2hub">
  <div class="center" style="margin:6px 0 10px">${PP.parrot()}<h1 class="t">Контекстный помощник</h1>
  <p class="sec">Не переводчик, а помощник прямо в клавиатуре: надиктуйте как получится — Parrlo перепишет аккуратно, в тоне конкретного собеседника и с учётом вашей переписки.</p></div>
  <div class="k2tag">Концепт · демо-данные · сеть не используется</div>
  <button class="step" data-go="#/kb2/agent" id="k2-step-agent"><span class="n">✨</span><span style="flex:1"><b>Помощник в клавиатуре · новое</b><br><span class="sec sm">Кнопка Parrlo → мини-диалог: письмо Луису или план для себя. В чат — только по «Вставить»</span></span>${I.chev}</button>
  <button class="step ${s.imported?'done':''}" data-go="#/kb2/wa/luis" id="k2-step-setup"><span class="n">${s.imported?I.check:'1'}</span><span style="flex:1"><b>Подключить переписку (один раз)</b><br><span class="sec sm">Мессенджер → чат → «Экспорт чата» → «Без медиа» → Parrlo</span></span>${I.chev}</button>
  <button class="step" data-go="#/kb2/chat" id="k2-step-daily"><span class="n">2</span><span style="flex:1"><b>Каждый день: чат с Луисом</b><br><span class="sec sm">Диктовка → «Parrlo ✨» → готовый текст, короче / мягче / ещё вариант</span></span>${I.chev}</button>
  <button class="step" data-go="#/kb2/app/contacts" id="k2-step-folders"><span class="n">3</span><span style="flex:1"><b>Папки контактов</b><br><span class="sec sm">Луис, Ана, Мама — роль, «ты / вы», тон, заметка</span></span>${I.chev}</button>
  <p class="ter xs mt">Переписка хранится в папке контакта на телефоне. В демо все тексты заготовлены заранее.</p></div>`; };

/* ---------- A. setup: messenger export ---------- */
const msgrHead = (back, right='') => `<div class="mh"><button class="back" data-go="${back}" style="color:#7FB4FF;display:flex;align-items:center" aria-label="Назад">${I.back}</button><span class="av">Л</span><span style="flex:1"><b>Луис</b><br><span class="xs sec">WhatsApp · схема</span></span>${right}</div>`;
R['kb2/wa/luis'] = () => `<div class="msgr k2m">${msgrHead('#/kb2', `<button class="ib" ${PP.attr('k2ChatMenu')} aria-label="Меню чата" id="k2-chat-menu">⋯</button>`)}
  <div class="ml"><div class="schema">Мессенджер нарисован нейтральной схемой. Откройте меню чата ⋯, чтобы экспортировать переписку.</div>
  ${k2().msgs.map(msgHtml).join('')}</div>
  <div class="inp"><span class="field"><span class="ph">Сообщение</span></span><button class="sendb" data-go="#/kb2/chat" aria-label="Открыть клавиатуру Parrlo">${I.kbd}</button></div></div>`;
A.k2ChatMenu = () => { PP.menu({head:'Луис', items:[{t:'Экспорт чата',a:'k2Export'},{t:'Поиск',a:'k2Toast',v:'Поиск по чату — в демо не нужен'},{t:'Обои',a:'k2Toast',v:'Обои — в демо не нужны'}]}); };
A.k2Toast = (m) => { PP.UI.menu=null; PP.toast(m); };
A.k2Export = () => { PP.sheet('k2export'); };
SHEETS.k2export = () => `<h3>Экспорт чата</h3><p class="sec sm">Добавление медиафайлов увеличит размер архива. Для Parrlo нужен только текст.</p>
  <div class="mt" style="display:flex;flex-direction:column;gap:8px">${btn('Без медиа','k2ExportGo','text')}${btn('Прикрепить медиа','k2ExportGo','media','sec')}${btn('Отмена','closeSheet',undefined,'ghost')}</div>`;
A.k2ExportGo = (v) => { PP.UI.sheet=null; T.k2media = v==='media'; PP.go('#/kb2/share'); return false; };
R['kb2/share'] = () => `<div style="flex:1;display:flex;flex-direction:column;min-height:0;opacity:.4;pointer-events:none" aria-hidden="true">${R['kb2/wa/luis']().replace(/data-(a|go|long)=/g,'data-x-$1=')}</div><div class="scrim" style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>
  <div class="sheet share" style="position:absolute"><div class="grab"></div><h3>Чат WhatsApp с Луисом.zip</h3>
  <div class="prev"><span class="fi">${I.file}</span><span style="flex:1;font-size:14px">_chat.txt · 1240 сообщений${T.k2media?' · медиа не нужны Parrlo — возьмём только текст':''}</span></div>
  <div class="apps"><button class="app" ${PP.attr('k2Import')} id="k2-share-parrlo"><span class="ic"><img src="assets/app-icon-180.png" alt=""></span>Parrlo</button>
   <button class="app" ${PP.attr('k2Toast','Передано в «Почту»')}><span class="ic">${I.mail}</span>Почта</button>
   <button class="app" ${PP.attr('k2Toast','Сохранено в «Файлы»')}><span class="ic">${I.folder}</span>Файлы</button></div>
  <div class="mt">${goBtn('Отмена','#/kb2/wa/luis','ghost')}</div></div>`;
A.k2Import = () => { T.k2imp = JSON.parse(JSON.stringify(st().contacts.luis)); PP.go('#/kb2/app/import'); return false; };

/* import + contact card editor */
function cardEditor(c, saveA, saveLabel){ const seg=(items,val,a)=>PP.seg(items.map(x=>[x,x]),val,a);
  return `<div class="card k2card"><div style="display:flex;align-items:center;gap:12px"><span class="k2av">${esc(c.av)}</span><span><b style="font-size:17px" id="k2CardHead">${esc(c.name)} · ${esc(c.role)} · на ${esc(c.you)} · ${c.count} сообщений</b><br><span class="sec sm">тон: ${esc(c.tone)}${c.note?` · «${esc(c.note)}»`:''}</span></span></div></div>
  <div class="gh">Роль</div><input class="k2in" id="k2Role" value="${esc(c.role)}" aria-label="Роль">
  <div class="gh">Обращение</div>${seg(['ты','вы'], c.you, 'k2You')}
  <div class="gh">Тон</div>${seg(['деловой','дружеский','тёплый'], c.tone, 'k2Tone')}
  <div class="gh">Заметка для Parrlo</div><textarea class="k2in" id="k2Note" rows="2" aria-label="Заметка">${esc(c.note)}</textarea>
  <div class="foot">${btn(saveLabel, saveA)}</div>`; }
const editing = () => PP.route()==='kb2/app/import' ? T.k2imp : st().contacts[PP.route().split('/').pop()];
A.k2You = (v) => { const c=editing(); if (c) { readInputs(c); c.you=v; } };
A.k2Tone = (v) => { const c=editing(); if (c) { readInputs(c); c.tone=v; } };
function readInputs(c){ const r=document.getElementById('k2Role'), n=document.getElementById('k2Note'); if (r) c.role=r.value.trim()||c.role; if (n) c.note=n.value.trim(); }
ENTER['kb2/app/import'] = () => { if (!T.k2imp) T.k2imp = JSON.parse(JSON.stringify(st().contacts.luis)); };
R['kb2/app/import'] = () => { const c=T.k2imp||st().contacts.luis;
  return `${nav('Импорт переписки', '#/kb2/share', 'Назад')}<div class="scroll"><p class="sec sm">Parrlo прочитал переписку и составил карточку собеседника. Проверьте и поправьте, если нужно.</p>${cardEditor(c,'k2ImportSave','Сохранить в папку Луиса')}
  <div class="gh">Папки контактов в Parrlo</div>${folderList()}</div>`; };
A.k2ImportSave = () => { const c=T.k2imp; readInputs(c); st().contacts.luis=c; st().imported=true; PP.save(); PP.toast('Папка Луиса готова · 1240 сообщений'); PP.go('#/kb2/app/contacts'); return false; };
function folderList(){ const cs=st().contacts; return `<div class="grp">${['luis','ana','mama'].map(id=>li_({t:`${cs[id].name} · ${cs[id].role}`, s:`на ${cs[id].you} · ${cs[id].tone} · ${cs[id].count} сообщений`, tile:`<span class="k2av sm">${esc(cs[id].av)}</span>`, go:'#/kb2/app/contact/'+id})).join('')}</div>`; }
R['kb2/app/contacts'] = () => `${nav('Папки контактов', '#/kb2', 'Клавиатура 2')}<div class="scroll"><p class="sec sm">Для каждого собеседника — своя папка: переписка, роль, обращение и тон.</p>${folderList()}
  <div class="foot">${goBtn('Открыть чат с Луисом','#/kb2/chat')}</div></div>`;
R['kb2/app/contact/:id'] = (id) => { const c=st().contacts[id]; if (!c) return R.notfound();
  return `${nav(c.name, '#/kb2/app/contacts', 'Папки')}<div class="scroll">${cardEditor(c,'k2CardSave','Сохранить')}</div>`; };
A.k2CardSave = () => { const id=PP.route().split('/').pop(); const c=st().contacts[id]; readInputs(c); PP.save(); PP.toast(`Сохранено в папку ${folderOf(id)}`); PP.go('#/kb2/app/contacts'); return false; };

/* ---------- B/C. daily chat + keyboard ---------- */
function msgHtml(m){ if (m.voice) return `<div class="mb out voice k2voice"><span class="pl">${I.play}</span><span class="vw">${Array.from({length:22},(_,i)=>`<i style="height:${5+((i*7)%15)}px"></i>`).join('')}</span><span class="xs sec">0:0${m.sec||7}</span><span class="tm">${esc(m.tm)}</span></div>`;
  return m.in ? `<button class="mb in" data-long="k2Msg" data-lv="${m.id}" ${PP.attr('k2MsgTap',m.id)}>${esc(m.t)}<span class="tm">${esc(m.tm)}${m.important?' · удерживайте':''}</span></button>` : `<div class="mb out">${esc(m.t)}<span class="tm">${esc(m.tm)} ✓✓</span></div>`; }
A.k2MsgTap = () => { PP.toast('Удерживайте сообщение, чтобы скопировать'); };
A.k2Msg = (id) => { const m=k2().msgs.find(x=>x.id===id); if (!m) return; PP.menu({head:'Сообщение Луиса', items:[{t:'Скопировать',a:'k2Copy',v:id},{t:'Переслать…',a:'k2Toast',v:'Пересылка — в демо не нужна'}]}); };
A.k2Copy = (id) => { PP.UI.menu=null; const k=k2(); const m=k.msgs.find(x=>x.id===id); PP.copy(m.t); if (m.important){ k.reply=true; k.replyUsed=false; PP.toast('Скопировано · Parrlo учтёт ответ Луиса'); } else PP.toast('Скопировано'); };
const KEYS = ['йцукенгшщзх','фывапролджэ','ячсмитьбю'];
function kb2Html(){ const k=k2(); const cs=st().contacts;
  const row = `<div class="k2contacts" role="group" aria-label="Собеседник">${['luis','ana','mama'].map(id=>`<button class="k2c ${k.contact===id?'on':''}" ${PP.attr('k2Contact',id)}>${esc(cs[id].name)}${k.contact===id&&k.guessed?'<small>угадано</small>':''}</button>`).join('')}</div>`;
  const chips = k.out!==null ? `<div class="k2chips">${k.reply&&k.contact==='luis'?`<span class="k2chip info" id="k2ReplyChip">Учтён ответ Луиса</span>`:''}
    ${[['short','Короче'],['soft','Мягче'],['alt','Ещё вариант']].map(([v,t])=>`<button class="k2chip ${k.variant===v?'on':''}" ${PP.attr('k2Var',v)}>${t}</button>`).join('')}
    <button class="k2chip" ${PP.attr('k2Undo')}>Отменить</button><button class="k2chip" ${PP.attr('k2Voice')}>🔊 Моим голосом</button></div>`
    : (k.reply&&k.contact==='luis' ? `<div class="k2chips"><span class="k2chip info" id="k2ReplyChip">Учтён ответ Луиса</span><button class="k2chip" ${PP.attr('k2ReplyOff')}>Не учитывать</button></div>` : '');
  const keys = KEYS.map(r=>`<div class="r">${[...r].map(c=>`<button class="k" ${PP.attr('k2Key',c)}>${c}</button>`).join('')}</div>`).join('');
  const can = !!k.text.trim() && !k.busy && !k.dict;
  return `<div class="k2kb">${row}${chips}
   <div class="k2go"><button class="k2parrlo ${can?'lit':''}" ${PP.attr('k2Go')} ${can?'':'disabled'} id="k2Go">${k.busy?'<span class="spark"><i></i><i></i><i></i></span> Пишу…':'Parrlo ✨'}</button></div>
   <div class="rows">${keys}<div class="r"><button class="k fn" ${PP.attr('k2Key',' ')} style="flex:5">пробел</button><button class="k fn" ${PP.attr('k2Bs')} aria-label="Стереть">⌫</button></div></div>
   <div class="k2sys"><span class="xs ter">${k.dict?'Диктовка…':'Системная строка iOS'}</span><button class="k2mic ${k.dict?'rec':''}" ${PP.attr('k2Mic')} aria-label="Диктовка" id="k2Mic">${I.mic}</button></div></div>`; }
ENTER['kb2/chat'] = () => { k2(); };
R['kb2/chat'] = () => { const k=k2();
  setTimeout(()=>{ const f=document.getElementById('k2Feed'); if (f) f.scrollTop=f.scrollHeight; }, 0);
  return `<div class="msgr k2m">${msgrHead('#/kb2', `<button class="ib" data-go="#/kb2/app/contact/${k.contact}" aria-label="Папка контакта" id="k2-folder">${I.folder}</button>`)}
  <div class="ml" id="k2Feed">${k.msgs.map(msgHtml).join('')}</div>
  <div class="inp"><span class="field ${k.dict?'k2dict':''}" id="k2Field">${k.text?esc(k.text):`<span class="ph">${k.dict?'Говорите…':'Сообщение'}</span>`}</span><button class="sendb" ${PP.attr('k2Send')} ${k.text.trim()&&!k.busy?'':'disabled'} aria-label="Отправить" id="k2Send">${I.send||'↑'}</button></div>
  ${kb2Html()}</div>`; };
A.k2Contact = (id) => { const k=k2(); if (k.contact===id) { PP.toast(`Уже выбран: ${C(id).name}`); return; } k.contact=id; k.guessed=false; if (k.out!==null) k.text=pick(); };
A.k2Key = (c) => { const k=k2(); k.text+=c; k.out=null; };
A.k2Bs = () => { const k=k2(); if (!k.text){ PP.toast('Поле уже пустое'); return; } k.text=k.text.slice(0,-1); k.out=null; };
A.k2Mic = () => { const k=k2(); if (k.dict) return; k.dict=true; k.text=''; k.out=null; const full = k.reply && k.contact==='luis' ? MESSY2 : MESSY; const words=full.split(' '); let i=0;
  const step = () => { if (PP.route()!=='kb2/chat') return; i++; k.text=words.slice(0,i).join(' '); if (i>=words.length){ k.dict=false; k.messy=full; } PP.render(); if (i<words.length) PP.rt(step, 1400/words.length); };
  PP.rt(step, 250); };
function pick(){ const k=k2(); const set = k.contact==='luis' && k.reply ? OUT.luisReply : OUT[k.contact]; return set[k.variant]||set.base; }
A.k2Go = () => { const k=k2(); if (!k.text.trim() || k.busy) return; if (k.out===null) k.messy=k.text; k.busy=true; k.variant='base';
  PP.rt(()=>{ k.busy=false; k.out=pick(); k.text=k.out; if (k.reply) k.replyUsed=true; PP.render(); }, 1300); };
A.k2Var = (v) => { const k=k2(); if (k.variant===v && v!=='alt'){ PP.toast('Этот вариант уже выбран'); return; } k.variant = (v==='alt' && k.variant==='alt') ? 'base' : v; k.out=pick(); k.text=k.out; };
A.k2Undo = () => { const k=k2(); k.text=k.messy||''; k.out=null; k.variant='base'; PP.toast('Вернул ваш текст'); };
A.k2ReplyOff = () => { k2().reply=false; };
A.k2Send = () => { const k=k2(); if (!k.text.trim()) return; const id=k.contact; k.msgs.push({id:'o'+Date.now(), in:false, t:k.text, tm:now()}); const answered = k.reply; k.text=''; k.out=null; k.messy=''; k.variant='base'; if (answered){ k.reply=false; }
  PP.toast(`Сохранено в папку ${folderOf(id)}`);
  if (id==='luis' && !k.msgs.some(m=>m.important)) PP.rt(()=>{ k.msgs.push({id:'r1', in:true, t:LUIS_REPLY, tm:now(), important:true}); if (PP.route()==='kb2/chat'){ PP.render(); const f=document.getElementById('k2Feed'); if (f) f.scrollTop=f.scrollHeight; } }, 1500);
  PP.render(); const f=document.getElementById('k2Feed'); if (f) f.scrollTop=f.scrollHeight; return false; };

/* ---------- D. «Моим голосом» in the Parrlo app ---------- */
A.k2Voice = () => { const k=k2(); T.k2voice={text:k.text, prog:0, playing:false, contact:k.contact}; PP.go('#/kb2/app/voice'); return false; };
R['kb2/app/voice'] = () => { const v=T.k2voice; if (!v) return `${nav('Моим голосом','#/kb2/chat','Чат')}<div class="cover center"><p class="sec">Сначала подготовьте текст в клавиатуре.</p>${goBtn('К чату','#/kb2/chat')}</div>`;
  return `${nav('Моим голосом', '#/kb2/chat', 'Чат')}<div class="scroll"><div class="center" style="margin:6px 0 10px">${PP.parrot()}</div>
  <div class="card"><p style="margin:0 0 12px">${esc(v.text)}</p>
   <div class="k2player"><button class="k2play" ${PP.attr('k2Play')} aria-label="${v.playing?'Пауза':'Прослушать'}" id="k2Play">${v.playing?I.stop:I.play}</button><span class="k2bar"><i id="k2Prog" style="width:${v.prog}%"></i></span><span class="xs sec" id="k2Time">0:0${Math.round(v.prog/100*7)} / 0:07</span></div>
   <p class="xs ter" style="margin:10px 0 0">Голос синтезирован ИИ · «Мой голос» · демо без звука</p></div>
  <div class="foot">${btn('Поделиться…','k2VoiceShare')}${goBtn('Назад к чату','#/kb2/chat','ghost')}</div></div>`; };
A.k2Play = () => { const v=T.k2voice; if (v.playing){ v.playing=false; return; } v.playing=true; if (v.prog>=100) v.prog=0;
  const tick=()=>{ if (!v.playing || PP.route()!=='kb2/app/voice') return; v.prog=Math.min(100, v.prog+5); const p=document.getElementById('k2Prog'), t=document.getElementById('k2Time'); if (p) p.style.width=v.prog+'%'; if (t) t.textContent=`0:0${Math.round(v.prog/100*7)} / 0:07`;
    if (v.prog>=100){ v.playing=false; PP.render(); return; } PP.rt(tick, 150); }; PP.rt(tick, 150); };
A.k2VoiceShare = () => { PP.sheet('k2vshare'); };
SHEETS.k2vshare = () => `<h3>Поделиться аудио</h3><div class="prev"><span class="fi">${I.file}</span><span style="flex:1;font-size:14px">Parrlo — моим голосом.m4a · 0:07</span></div>
  <div class="apps"><button class="app" ${PP.attr('k2PickWa')} id="k2-share-wa"><span class="ic k2wa">W</span>WhatsApp</button><button class="app" ${PP.attr('k2Toast','Сохранено в «Файлы»')}><span class="ic">${I.folder}</span>Файлы</button></div>
  <div class="mt">${btn('Отмена','closeSheet',undefined,'ghost')}</div>`;
A.k2PickWa = () => { PP.sheet('k2vpick'); };
SHEETS.k2vpick = () => `<h3>WhatsApp · кому</h3>${['luis','ana','mama'].map(id=>`<button class="li k2pick" ${PP.attr('k2VoiceSend',id)}><span class="k2av sm">${esc(st().contacts[id].av)}</span><span class="tx"><b>${esc(st().contacts[id].name)}</b></span></button>`).join('')}
  <p class="xs sec" id="k2AudioNote">Уйдёт аудиофайлом, а не голосовым сообщением мессенджера.</p><div class="mt">${btn('Отмена','closeSheet',undefined,'ghost')}</div>`;
A.k2VoiceSend = (id) => { PP.UI.sheet=null; const k=k2(); if (id==='luis'){ k.msgs.push({id:'v'+Date.now(), voice:true, sec:7, tm:now()}); k.text=''; k.out=null; PP.toast('Аудиофайл отправлен Луису'); PP.go('#/kb2/chat'); return false; }
  PP.toast(`Аудиофайл отправлен: ${C(id).name}`); };
})();
