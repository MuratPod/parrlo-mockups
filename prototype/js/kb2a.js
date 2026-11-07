/* Parrlo prototype · kb2 «Помощник в клавиатуре» (#/kb2/agent).
   A personal assistant inside the keyboard area — NOT a translator and not a second system keyboard.
   Normal letters type into the host test field; the separate Parrlo key opens a compact mini-dialog whose
   letters edit ONLY an internal draft. Only «Вставить» moves the explicitly selected result into the test field.
   Local fixture demo: no AI, no server, no microphone, no search/booking, no real chats, no network. */
(function(){
const {R,A,SHEETS,ENTER,LEAVE,esc,I} = PP;
const T = PP.T;
const now = () => { const d=new Date(); return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); };

/* ---------- fixtures ---------- */
const SCEN = {
  lunch:'Напиши Луису, что мы встречаемся сегодня на обед и предлагаю забронировать ресторан',
  desk:'Помоги спокойно разобрать рабочий стол. Не знаю, с чего начать'};
const VLABEL = {base:'основной', soft:'мягче', short:'короче', alt:'другой вариант', detail:'с вопросом о деталях'};
const LUNCH = {
  base:{ru:'Луис, давай сегодня встретимся за обедом. Предлагаю забронировать столик в ресторане. Как тебе?',
        es:'Luis, ¿quedamos hoy para comer? Propongo reservar una mesa en un restaurante. ¿Qué te parece?'},
  soft:{ru:'Луис, привет! Может, пообедаем сегодня вместе? Я бы предложил заранее забронировать столик в ресторане — как ты на это смотришь?',
        es:'¡Hola, Luis! ¿Te apetece que comamos juntos hoy? Yo propondría reservar mesa en un restaurante con antelación. ¿Qué te parece?'},
  short:{ru:'Луис, сегодня обедаем вместе? Предлагаю забронировать столик.',
         es:'Luis, ¿comemos juntos hoy? Propongo reservar mesa.'},
  alt:{ru:'Луис, предлагаю сегодня встретиться за обедом. Давай забронируем столик в ресторане, чтобы не искать место в последний момент. Что скажешь?',
       es:'Luis, te propongo que quedemos hoy para comer. Reservemos una mesa en un restaurante para no buscar sitio a última hora. ¿Qué dices?'},
  detail:{ru:'Луис, давай сегодня встретимся за обедом. Предлагаю забронировать столик в ресторане — подскажи, во сколько и где тебе удобнее?',
          es:'Luis, ¿quedamos hoy para comer? Propongo reservar una mesa en un restaurante. ¿A qué hora y dónde te viene mejor?'}};
const PLANS = {
  p10:{title:'План для себя · 10 минут', steps:['Выбросите мусор: обёртки, чеки, пустые стаканы.','Сложите все бумаги в одну стопку — разбирать пока не нужно.','Уберите со стола одну вещь, которая там точно лишняя.','Протрите освободившийся угол.'], note:'Хватит и этого. Если покажется много — скажите, упрощу.'},
  p30:{title:'План для себя · полчаса', steps:['Мусор и посуду — сразу со стола (5 мин).','Бумаги — в одну стопку, затем в три кучки: «нужно», «в архив», «выбросить» (15 мин).','Провода и мелочи — в одну коробку (5 мин).','На столе оставьте только то, что нужно сегодня (5 мин).'], note:'Делайте по порядку и не торопитесь. Если тяжело — скажите, упрощу.'},
  simple:{title:'Упрощённый план · 2 шага', steps:['Выбросите мусор.','Сложите бумаги в одну стопку.'], note:'На сегодня всё. Остальное — в другой день, это нормально.'},
  first:{title:'Только первый шаг', steps:['Найдите на столе мусор и выбросите его. Больше ничего не нужно.'], note:'Получилось — уже хорошо. Дальше можно не продолжать.'}};
const DEMO_HINT = 'Это демо с заготовленными ответами, без сети. Свободные запросы здесь не обрабатываются — выберите один из демо-сценариев.';
const FIELDS = {chat:{label:'Тестовый чат', sub:'тест · не мессенджер'}, note:{label:'Тестовая заметка', sub:'другое поле · тест'}};
const NEXT = {ok:'обычный ответ', error:'ошибка', offline:'нет сети', consent:'нет согласия', late:'поздний ответ'};

function st(){ if (!T.k2a) T.k2a = {mode:'app', field:'chat', fieldVer:0, texts:{chat:'', note:''},
  chat:[{id:'c1', in:true, t:'Привет! Как день?', tm:'12:05'}],
  draft:'', cur:0, feed:[], step:'idle', pending:null, seq:0, sel:null, demoNext:'ok', notice:null, lastReq:null, stepBefore:'idle', insLock:0, lastRu:null, s2plan:null};
  return T.k2a; }
const nid = () => 'i'+(++st().seq);

/* ---------- step → actions: one primary, a few secondary, the rest in «Ещё» ---------- */
function actions(){ const k=st(); const P=(t,a,v,dis)=>({t,a,v,dis});
  switch(k.step){
    case 'wait': return {p:P('Отменить','k2aCancel'), s:[]};
    case 's1clarify': return {p:P('Да, без деталей','k2aSay','Без деталей'), s:[P('Добавить деталь','k2aSay','Добавить деталь')]};
    case 's1detail': return {p:P('Спросить, когда и где ему удобно','k2aSay','Спросить Луиса, когда и где удобно'), s:[P('Без деталей','k2aSay','Без деталей')]};
    case 's1result': return {p: k.sel ? P('Вставить','k2aInsert') : P('Вставить','noop',undefined,true),
      s:[P('Мягче','k2aSay','Мягче'),P('Короче','k2aSay','Короче'),P('Другой вариант','k2aSay','Другой вариант')],
      m:[{t:'Добавить деталь',a:'k2aSay',v:'Добавить деталь'},{t:'Перевести на испанский',a:'k2aSay',v:'Перевести на испанский'}]};
    case 's1done': return {p:P('К полю приложения','k2aMode','app'),
      s:[P('Мягче','k2aSay','Мягче'),P('Короче','k2aSay','Короче'),P('Другой вариант','k2aSay','Другой вариант')],
      m:[{t:'Добавить деталь',a:'k2aSay',v:'Добавить деталь'},{t:'Перевести на испанский',a:'k2aSay',v:'Перевести на испанский'}]};
    case 's2ask': return {p:P('10 минут','k2aSay','10 минут'), s:[P('Полчаса','k2aSay','Полчаса'),P('Не знаю','k2aSay','Не знаю')]};
    case 's2plan': return {p:P('Проще','k2aSay','Проще, это слишком много'), s:[P('Только первый шаг','k2aSay','Только первый шаг')]};
    case 's2simple': return {p:P('Только первый шаг','k2aSay','Только первый шаг'), s:[P('Полный план','k2aSay','Полчаса')]};
    case 'consent': return {p:P('Разрешить (демо)','k2aConsent'), s:[P('Не сейчас','k2aBack')]};
    case 'err': return {p:P('Повторить','k2aRetry'), s:[P('Не сейчас','k2aBack')]};
    default: return {p:null, s:[P('Сценарий: Луис, обед','k2aScen','lunch'),P('Сценарий: рабочий стол','k2aScen','desk')]};
  } }

/* ---------- intent: only fixture phrases are understood; everything else gets an honest demo hint ---------- */
function intent(text, step){ const t=text.toLowerCase();
  if (/луис/.test(t) && /обед|ресторан/.test(t)) return 's1start';
  if (/стол/.test(t) && /разобр|убр|начать|порядок/.test(t)) return 's2start';
  if (/^s1/.test(step)){
    if (/без детал/.test(t)) return step==='s1result'||step==='s1done' ? 'hint' : 's1base';
    if (/когда и где|во сколько|удобн/.test(t)) return 's1detailRes';
    if (/детал/.test(t)) return 's1detailAsk';
    if (/мягч/.test(t) && k_hasRu()) return 's1soft';
    if (/коро[тч]/.test(t) && k_hasRu()) return 's1short';
    if (/друг|иначе|ещё вариант/.test(t) && k_hasRu()) return 's1alt';
    if (/испан|перев/.test(t) && k_hasRu()) return 's1es'; }
  if (/^s2/.test(step)){
    if (step==='s2ask' && /10|десят|мало|не знаю/.test(t)) return 's2p10';
    if (/полчас|30|полный/.test(t)) return 's2p30';
    if (/перв/.test(t)) return 's2first';
    if (/прощ|много|сложн|устал|меньше|не могу|тяжел/.test(t)) return 's2simple'; }
  return 'hint'; }
const k_hasRu = () => !!st().lastRu;

/* apply a fixture answer (only when the answer is still the current one) */
function apply(kind){ const k=st(); const bot=(t)=>k.feed.push({k:'bot', id:nid(), t}); const res=(lang,v)=>{ const it={k:'res', id:nid(), lang, v, t:LUNCH[v][lang]}; k.feed.push(it); if (lang==='ru') k.lastRu=v; k.step='s1result'; return it; };
  const plan=(p)=>{ k.feed.push(Object.assign({k:'plan', id:nid(), key:p}, PLANS[p])); k.s2plan=p; };
  switch(kind){
    case 's1start': k.lastRu=null; k.sel=null; bot('Понял: сообщение Луису — встреча сегодня за обедом и предложение забронировать ресторан. Время и название ресторана вы не назвали, поэтому я их не добавляю и ничего не бронирую. Так и оставить?'); k.step='s1clarify'; break;
    case 's1base': bot('Готово. Нажмите на вариант, чтобы выбрать его для вставки.'); res('ru','base'); break;
    case 's1detailAsk': bot('Какую деталь добавить? Конкретное время или ресторан я не выдумываю — могу попросить Луиса предложить удобное время и место.'); k.step='s1detail'; break;
    case 's1detailRes': bot('Добавил вопрос о времени и месте — без выдуманных деталей.'); res('ru','detail'); break;
    case 's1soft': bot('Мягче:'); res('ru','soft'); break;
    case 's1short': bot('Короче:'); res('ru','short'); break;
    case 's1alt': { const v = k.lastRu==='alt' ? 'base' : 'alt'; bot(v==='alt'?'Другой вариант:':'Вернул основной вариант:'); res('ru',v); break; }
    case 's1es': bot('Перевод на испанский того же варианта. Выберите, какой язык вставить: русский или испанский.'); res('es', k.lastRu||'base'); break;
    case 's2start': bot('Давайте спокойно и по шагам. Сколько времени у вас есть прямо сейчас?'); k.step='s2ask'; break;
    case 's2p10': bot('Хорошо, начнём с малого. Это план для вас — отправлять его никуда не нужно.'); plan('p10'); k.step='s2plan'; break;
    case 's2p30': bot('Тогда так. Это план для вас — отправлять его никуда не нужно.'); plan('p30'); k.step='s2plan'; break;
    case 's2simple': bot('Упростил. Сделайте только это:'); plan('simple'); k.step='s2simple'; break;
    case 's2first': bot('Хорошо, только один шаг:'); plan('first'); k.step='s2simple'; break;
    default: k.feed.push({k:'hint', id:nid(), t:DEMO_HINT}); k.step = k.stepBefore; }
}

/* ---------- send a request to the (fixture) assistant ---------- */
function send(text){ const k=st(); PP.UI.menu=null; text=text.trim(); if (!text) return;
  if (k.pending){ PP.toast('Parrlo ещё отвечает — подождите или отмените'); return; } // double-tap guard
  k.notice=null; k.stepBefore = k.step==='wait'||k.step==='err'||k.step==='consent' ? k.stepBefore : k.step;
  k.feed.push({k:'me', id:nid(), t:text});
  const mode = PP.S.demo.offline ? 'offline' : k.demoNext; k.demoNext='ok';
  k.lastReq = text;
  if (mode==='offline'){ fail('offline', text); return; }
  if (mode==='consent'){ k.feed.push({k:'err', id:nid(), t:'Нет согласия: помощнику нужно ваше разрешение обрабатывать запросы. Черновик сохранён. В демо данные никуда не уходят.'}); k.step='consent'; restoreDraft(text); return; }
  const id = ++k.seq; const kind = intent(text, k.stepBefore);
  k.pending = {id, late: mode==='late', slow:false}; k.step='wait';
  if (mode==='late') PP.rt(()=>{ if (k.pending && k.pending.id===id){ k.pending.slow=true; PP.render(); } }, 1600);
  PP.rt(()=>{ const cur = k.pending && k.pending.id===id;
    if (!cur){ k.feed.push({k:'stale', id:nid(), t:'Пришёл поздний ответ на отменённый запрос — он не применён и ничего не вставляет.'}); if (PP.route()==='kb2/agent') PP.render(); return; }
    k.pending=null;
    if (mode==='error'){ fail('error', text); }
    else apply(kind);
    if (PP.route()==='kb2/agent') PP.render(); }, mode==='late' ? 4200 : 1100);
}
function restoreDraft(text){ const k=st(); if (!k.draft.trim()){ k.draft=text; k.cur=text.length; } }
function fail(kind, text){ const k=st(); k.pending=null;
  k.feed.push({k:'err', id:nid(), t: kind==='offline' ? 'Нет сети. Черновик сохранён — повторите, когда связь вернётся.' : 'Не получилось ответить. Черновик сохранён — можно повторить.'});
  k.step='err'; restoreDraft(text); }

/* ---------- actions ---------- */
A.k2aMode = (m) => { const k=st(); if (k.mode===m || Date.now()<k.insLock) return false; k.mode=m; }; // guard: a double tap on «Вставить» must not also hit the next primary // never touches the app field or the draft
A.k2aKey = (c) => { const k=st();
  if (k.mode==='parrlo'){ k.draft = k.draft.slice(0,k.cur)+c+k.draft.slice(k.cur); k.cur+=c.length; }
  else k.texts[k.field] += c; };
A.k2aBs = () => { const k=st();
  if (k.mode==='parrlo'){ if (!k.cur){ PP.toast('Слева от курсора пусто'); return; } k.draft = k.draft.slice(0,k.cur-1)+k.draft.slice(k.cur); k.cur--; }
  else { const t=k.texts[k.field]; if (!t){ PP.toast('Поле уже пустое'); return; } k.texts[k.field]=t.slice(0,-1); } };
A.k2aCur = (d) => { const k=st(); k.cur = Math.max(0, Math.min(k.draft.length, k.cur + (+d))); };
A.k2aAsk = () => { const k=st(); if (!k.draft.trim() || k.pending) return; const t=k.draft; k.draft=''; k.cur=0; send(t); };
A.k2aSay = (t) => { send(t); };
A.k2aScen = (v) => { const k=st(); PP.UI.sheet=null; PP.UI.menu=null; k.draft=SCEN[v]; k.cur=k.draft.length; if (k.mode!=='parrlo') k.mode='parrlo'; PP.toast('Запрос в черновике Parrlo — нажмите «Спросить»'); };
A.k2aCancel = () => { const k=st(); if (!k.pending) return; const t=k.lastReq; k.pending=null; k.step=k.stepBefore; k.feed.push({k:'bot', id:nid(), t:'Запрос отменён. Черновик сохранён.'}); restoreDraft(t); };
A.k2aRetry = () => { const k=st(); if (!k.lastReq) return; if (k.draft===k.lastReq){ k.draft=''; k.cur=0; } k.step=k.stepBefore; send(k.lastReq); };
A.k2aBack = () => { const k=st(); k.step=k.stepBefore; };
A.k2aConsent = () => { PP.toast('Согласие дано (демо)'); A.k2aRetry(); };
A.k2aSel = (id) => { const k=st(); const it=k.feed.find(x=>x.id===id); if (!it || it.k!=='res') return;
  k.sel = k.sel===id ? null : id; k.notice=null; if (k.step==='s1done') k.step='s1result'; };
A.k2aInsert = () => { const k=st(); const nowMs=Date.now(); if (nowMs < k.insLock) return false; // double-tap guard
  const it = k.feed.find(x=>x.id===k.sel); if (!it || it.selVer!==k.fieldVer){ k.sel=null; PP.toast('Сначала выберите вариант'); return; }
  k.insLock = nowMs+900; const f=k.texts[k.field];
  k.texts[k.field] = f ? f + (/\s$/.test(f)?'':' ') + it.t : it.t;   // appended at the end; nothing in the field is removed
  it.inserted = FIELDS[k.field].label; k.sel=null; k.step='s1done'; k.notice={t:'Текст в поле. Отправляете вы.', ok:true}; };
A.k2aField = () => { const k=st(); k.field = k.field==='chat' ? 'note' : 'chat'; k.fieldVer++; PP.UI.sheet=null; PP.UI.menu=null;
  const had = !!k.sel; k.sel=null;
  k.notice = {t:`Поле сменилось: теперь «${FIELDS[k.field].label}». ${had||k.step==='s1result'||k.step==='s1done'?'Выберите вариант заново, чтобы вставить сюда.':'Черновик Parrlo сохранён.'}`};
  if (k.step==='s1done') k.step='s1result'; };
A.k2aNext = (v) => { st().demoNext=v; PP.UI.sheet=null; PP.toast('Следующий ответ: '+NEXT[v]); };
A.k2aRestart = () => { const k=st(); PP.UI.menu=null; k.pending=null; k.feed=[]; k.step='idle'; k.sel=null; k.lastRu=null; k.notice=null; PP.toast('Диалог очищен. Черновик и поле не тронуты'); };
A.k2aMore = () => { const a=actions(); PP.menu({head:'Ещё', items:[...(a.m||[]),
  {t:'Демо-сценарий: Луис, обед',a:'k2aScen',v:'lunch'},{t:'Демо-сценарий: рабочий стол',a:'k2aScen',v:'desk'},
  {t:'Демо-состояния…',a:'k2aDemo'},{t:'Очистить диалог',a:'k2aRestart'}]}); };
A.k2aDemo = () => { PP.sheet('k2aDemo'); };
A.k2aGlobe = () => { PP.toast('Системная смена клавиатуры — кнопка iOS, в демо не используется'); };
A.k2aChatSend = () => { const k=st(); if (k.field!=='chat'){ return; } const t=k.texts.chat.trim(); if (!t) return; k.chat.push({id:'o'+Date.now(), in:false, t, tm:now()}); k.texts.chat=''; PP.toast('Отправили вы (тестовый чат)'); };
SHEETS.k2aDemo = () => { const k=st(); const o=(v)=>`<button class="o ${k.demoNext===v?'on':''}" ${PP.attr('k2aNext',v)}>${esc(NEXT[v])}</button>`;
  return `<h3>Демо-состояния</h3><p class="sec sm">Только для показа. Ответы заготовлены, сеть не используется.</p>
  <div class="gh">Следующий ответ Parrlo</div><div class="opts k2aopts">${Object.keys(NEXT).map(o).join('')}</div>
  <p class="xs ter">«Поздний ответ»: пока ждёте, нажмите «Отменить» — опоздавший ответ придёт, но ничего не заменит и не вставит.</p>
  <div class="gh">Поле приложения</div><div class="opts k2aopts"><button class="o" ${PP.attr('k2aField')}>Сменить тестовое поле (сейчас: ${esc(FIELDS[k.field].label)})</button></div>
  <div class="mt">${PP.btn('Готово','closeSheet',undefined,'sec')}</div>`; };

/* ---------- view ---------- */
const KEYS = ['йцукенгшщзх','фывапролджэ','ячсмитьбю'];
function feedItem(it){ const k=st();
  if (it.k==='me') return `<div class="k2a-me">${esc(it.t)}</div>`;
  if (it.k==='bot') return `<div class="k2a-bot">${esc(it.t)}</div>`;
  if (it.k==='hint') return `<div class="k2a-bot hint">${esc(it.t)}<div class="k2a-hc"><button class="k2chip" ${PP.attr('k2aScen','lunch')}>Луис, обед</button><button class="k2chip" ${PP.attr('k2aScen','desk')}>Рабочий стол</button></div></div>`;
  if (it.k==='err') return `<div class="k2a-bot err">${esc(it.t)}</div>`;
  if (it.k==='stale') return `<div class="k2a-bot stale">${esc(it.t)}</div>`;
  if (it.k==='plan') return `<div class="k2a-plan"><b>${esc(it.title)}</b><span class="k2a-for">для вас · не для отправки</span><ol>${it.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>${esc(it.note)}</p></div>`;
  if (it.k==='res'){ const on=k.sel===it.id;
    return `<button class="k2a-res ${on?'on':''}" ${PP.attr('k2aSel',it.id)} aria-pressed="${on}" data-res="${it.lang}-${it.v}"><span class="k2a-rl"><span class="k2a-radio"></span>${it.lang==='ru'?'Русский':'Испанский'} · ${VLABEL[it.v]}</span><span class="k2a-rt" lang="${it.lang}">${esc(it.t)}</span><span class="k2a-rs">${on?'Выбрано для вставки':it.inserted?`Вставлено в «${esc(it.inserted)}»`:'Нажмите, чтобы выбрать'}</span></button>`; }
  return ''; }
function keysHtml(parrlo){ const k=st();
  const rows = KEYS.map(r=>`<div class="r">${[...r].map(c=>`<button class="k" ${PP.attr('k2aKey',c)}>${c}</button>`).join('')}</div>`).join('');
  const last = parrlo
    ? `<div class="r"><button class="k fn k2a-back" ${PP.attr('k2aMode','app')} id="k2aToApp">К полю приложения</button><button class="k fn" ${PP.attr('k2aCur','-1')} aria-label="Курсор влево">←</button><button class="k fn" ${PP.attr('k2aKey',' ')} style="flex:3">пробел</button><button class="k fn" ${PP.attr('k2aCur','1')} aria-label="Курсор вправо">→</button><button class="k fn" ${PP.attr('k2aBs')} aria-label="Стереть в черновике">⌫</button></div>`
    : `<div class="r"><button class="k fn" ${PP.attr('k2aKey',',')}>,</button><button class="k fn" ${PP.attr('k2aKey',' ')} style="flex:5">пробел</button><button class="k fn" ${PP.attr('k2aKey','.')}>.</button><button class="k fn" ${PP.attr('k2aKey','?')}>?</button><button class="k fn" ${PP.attr('k2aBs')} aria-label="Стереть">⌫</button></div>`;
  return `<div class="rows">${rows}${last}</div>`; }
function panelHtml(){ const k=st(); const a=actions();
  const draft = k.draft ? `${esc(k.draft.slice(0,k.cur))}<span class="cur"></span>${esc(k.draft.slice(k.cur))}` : `<span class="cur"></span><span class="ph">Запрос для Parrlo…</span>`;
  const wait = k.step==='wait' ? `<div class="k2a-bot wait"><span class="spark"><i></i><i></i><i></i></span> ${k.pending&&k.pending.slow?'Отвечает дольше обычного… можно отменить':'Parrlo думает…'}</div>` : '';
  const intro = `<div class="k2a-bot">Я пишу только здесь. В чат ничего не попадёт, пока вы сами не выберете вариант и не нажмёте «Вставить». Переписку и контакты я не читаю.</div>`;
  const pb = a.p ? `<button class="k2a-pri" ${PP.attr(a.p.a,a.p.v)} ${a.p.dis?'disabled':''} id="k2aPrimary">${esc(a.p.t)}</button>` : '';
  const sb = a.s.map(x=>`<button class="k2chip" ${PP.attr(x.a,x.v)}>${esc(x.t)}</button>`).join('');
  const busy = !!k.pending;
  return `<div class="k2a-panel" role="region" aria-label="Мини-диалог Parrlo">
   <div class="k2a-bar"><span class="k2a-pill" id="k2aWhere">✨ Пишете Parrlo · не в чат</span>${k.demoNext!=='ok'?`<span class="k2a-next">след.: ${esc(NEXT[k.demoNext])}</span>`:''}</div>
   <div class="k2a-feed" id="k2aFeed">${intro}${k.feed.map(feedItem).join('')}${wait}</div>
   ${k.notice?`<div class="k2a-note ${k.notice.ok?'ok':''}" id="k2aNotice">${k.notice.ok?I.check:I.info} ${esc(k.notice.t)}</div>`:''}
   <div class="k2a-actw"><div class="k2a-acts">${pb}${sb}</div><button class="k2chip more" ${PP.attr('k2aMore')} aria-label="Ещё" id="k2aMore">Ещё ⋯</button></div>
   ${k.step==='s1result'&&!k.sel?'<div class="k2a-note" id="k2aPick">Нажмите на вариант (○), чтобы выбрать его для вставки</div>':''}
   <div class="k2a-ed"><span class="k2a-draft" id="k2aDraft" aria-label="Черновик запроса">${draft}</span><button class="k2a-ask ${k.draft.trim()&&!busy?'lit':''}" ${PP.attr('k2aAsk')} ${k.draft.trim()&&!busy?'':'disabled'} id="k2aAsk">Спросить</button></div>
  </div>`; }
function kbHtml(){ const k=st(); const parrlo = k.mode==='parrlo';
  const top = parrlo ? panelHtml()
    : `<div class="k2a-tool"><button class="k2a-key" ${PP.attr('k2aMode','parrlo')} id="k2aOpen" aria-label="Открыть Parrlo">✨ Parrlo</button><span class="k2a-ts xs">${k.notice&&k.notice.ok?`<b class="ok">${I.check} ${esc(k.notice.t)}</b>`:k.draft.trim()?'Черновик Parrlo сохранён':'Буквы печатают в поле приложения'}</span></div>`;
  return `<div class="k2kb k2a-kb ${parrlo?'p':''}" data-mode="${k.mode}">${top}${keysHtml(parrlo)}
   <div class="k2a-sys"><button class="k2a-globe" ${PP.attr('k2aGlobe')} aria-label="Системная смена клавиатуры (не используется)">${I.globe}</button><span class="xs ter">системная строка iOS</span></div></div>`; }

let scrollMem = {feed:null, chat:null, feedN:0, chatN:0};
R['kb2/agent'] = () => { const k=st(); const fd=FIELDS[k.field]; const ft=k.texts[k.field];
  const f=document.getElementById('k2aFeed'), c=document.getElementById('k2aChat');
  scrollMem = {feed:f?f.scrollTop:null, chat:c?c.scrollTop:null, feedN:f?f.dataset.n:null, chatN:c?c.dataset.n:null, ff:f?f.scrollHeight-f.scrollTop-f.clientHeight<8:true};
  const body = k.field==='chat'
    ? k.chat.map(m=>`<div class="mb ${m.in?'in':'out'}">${esc(m.t)}<span class="tm">${esc(m.tm)}${m.in?'':' ✓✓'}</span></div>`).join('')
    : `<div class="k2a-notepg"><b>Заметка (тест)</b><p class="sec sm">Другое поле ввода того же приложения. Нужно, чтобы показать: при смене поля вставку надо выбрать заново.</p></div>`;
  return `<div class="msgr k2m k2a">
  <div class="mh"><button class="back" data-go="#/kb2" style="color:#7FB4FF;display:flex;align-items:center" aria-label="Назад">${I.back}</button><span class="av">${k.field==='chat'?'Т':'З'}</span><span style="flex:1;min-width:0"><b>${esc(fd.label)}</b><br><span class="xs sec">${esc(fd.sub)}</span></span><button class="k2a-fsw xs" ${PP.attr('k2aField')} id="k2aFieldSw">Сменить поле</button></div>
  <div class="k2a-demo" id="k2aDemoTag">Демо · заготовленные ответы · без сети</div>
  <div class="ml" id="k2aChat" data-n="${k.chat.length}">${body}</div>
  <div class="inp"><span class="field ${k.mode==='parrlo'?'k2a-dim':''}" id="k2aField" data-field="${k.field}"><span class="k2a-flab">тестовое поле</span>${ft?esc(ft):`<span class="ph">${k.field==='chat'?'Сообщение':'Текст заметки'}</span>`}${k.mode==='app'?'<span class="cur"></span>':''}</span>${k.field==='chat'?`<button class="sendb" ${PP.attr('k2aChatSend')} ${ft.trim()?'':'disabled'} aria-label="Отправить (это делаете вы)" id="k2aSend">${I.send}</button>`:''}</div>
  ${kbHtml()}</div>`; };
PP.afterRenderHooks.push((r)=>{ if (r!=='kb2/agent') return; const k=st();
  const f=document.getElementById('k2aFeed'); if (f){ const n=String(k.feed.length)+(k.step==='wait'?'w':''); f.dataset.n=n;
    if (scrollMem.feedN!==n || scrollMem.feed===null || scrollMem.ff) f.scrollTop=f.scrollHeight; else f.scrollTop=scrollMem.feed; }
  const c=document.getElementById('k2aChat'); if (c){ if (scrollMem.chat===null || String(scrollMem.chatN)!==c.dataset.n) c.scrollTop=c.scrollHeight; else c.scrollTop=scrollMem.chat; } });
ENTER['kb2/agent'] = () => { st(); };
LEAVE['kb2/agent'] = () => { const k=st(); if (k.pending){ k.pending=null; k.step=k.stepBefore; k.feed.push({k:'bot', id:nid(), t:'Запрос прерван: вы ушли с экрана. Черновик сохранён.'}); restoreDraft(k.lastReq||''); } };
// result items remember the field version they were shown for; a field change invalidates the selection
const _sel = A.k2aSel; A.k2aSel = (id) => { _sel(id); const k=st(); const it=k.feed.find(x=>x.id===id); if (it) it.selVer=k.fieldVer; };
PP.k2a = st; // test hook (QA only)
})();
