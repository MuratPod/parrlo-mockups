/* Demo translation data and engine. Canned phrases (RU/ES/EN/ZH) + a light demo transformation for unknown input.
   Everything here is local demo data: no network calls. */
(function(){
const P = [
 // id, ru, es, en, zh, [esF official/usted], [raw RU speech with fillers]
 {id:'pharm', ru:'Здравствуйте! Подскажите, пожалуйста, где здесь аптека?', es:'¡Hola! ¿Me puedes decir dónde hay una farmacia por aquí?', esF:'Buenos días. ¿Me podría indicar dónde hay una farmacia por aquí?', en:'Hello! Could you tell me where the nearest pharmacy is?', zh:'你好！请问这附近哪里有药店？', raw:'ну здравствуйте эээ подскажите где тут аптека'},
 {id:'head', ru:'Мне нужно что-нибудь от головной боли, например таблетки.', es:'Necesito algo para el dolor de cabeza, por ejemplo unas pastillas.', esF:'Necesitaría algo para el dolor de cabeza, por ejemplo unas pastillas.', en:'I need something for a headache, like some tablets.', zh:'我需要一些治头痛的药，比如药片。', raw:'короче мне нужно что-то от головы типа таблетки'},
 {id:'cost', ru:'Сколько это стоит?', es:'¿Cuánto cuesta?', esF:'¿Cuánto cuesta, por favor?', en:'How much does it cost?', zh:'这个多少钱？', raw:'а сколько это стоит'},
 {id:'card', ru:'Можно оплатить картой?', es:'¿Puedo pagar con tarjeta?', esF:'¿Se puede pagar con tarjeta?', en:'Can I pay by card?', zh:'可以刷卡吗？', raw:'можно оплатить картой да'},
 {id:'thanks', ru:'Большое спасибо, вы мне очень помогли!', es:'¡Muchas gracias, me has ayudado mucho!', esF:'Muchas gracias, me ha ayudado mucho.', en:'Thank you so much, you’ve been a great help!', zh:'非常感谢，你帮了我大忙！', raw:'спасибо большое вы мне очень помогли'},
 // partner (ES speech)
 {id:'p1', es:'Claro, la farmacia está al final de la calle, a la derecha.', ru:'Конечно, аптека в конце улицы, справа.', en:'Sure, the pharmacy is at the end of the street, on the right.', zh:'当然，药店在街道尽头的右边。'},
 {id:'p2', es:'¿Tienes receta del médico?', ru:'У вас есть рецепт от врача?', en:'Do you have a doctor’s prescription?', zh:'你有医生的处方吗？'},
 {id:'p3', es:'Son doce euros con cincuenta.', ru:'С вас двенадцать евро пятьдесят.', en:'That’s twelve fifty.', zh:'一共十二欧元五十分。'},
 {id:'p4', es:'Sí, puedes pagar con tarjeta o con el móvil.', ru:'Да, можно оплатить картой или телефоном.', en:'Yes, you can pay by card or with your phone.', zh:'可以，你可以刷卡或用手机支付。'},
 {id:'p5', es:'De nada, ¡que te mejores!', ru:'Не за что, выздоравливайте!', en:'You’re welcome, get well soon!', zh:'不客气，祝你早日康复！'},
 // everyday text
 {id:'hi', ru:'Привет!', es:'¡Hola!', en:'Hi!', zh:'你好！'},
 {id:'hihow', ru:'Привет, как дела?', es:'¡Hola! ¿Qué tal?', esF:'Hola, ¿cómo está?', en:'Hi! How are you?', zh:'你好！最近怎么样？'},
 {id:'how', ru:'Как дела?', es:'¿Qué tal?', esF:'¿Cómo está?', en:'How are you?', zh:'你好吗？'},
 {id:'wc', ru:'Где туалет?', es:'¿Dónde está el baño?', esF:'Disculpe, ¿dónde está el baño?', en:'Where is the restroom?', zh:'洗手间在哪里？'},
 {id:'nospeak', ru:'Я не говорю по-испански.', es:'No hablo español.', en:'I don’t speak Spanish.', zh:'我不会说西班牙语。'},
 {id:'bill', ru:'Счёт, пожалуйста.', es:'La cuenta, por favor.', en:'The bill, please.', zh:'请结账。'},
 {id:'late', ru:'Привет! Я опоздаю минут на десять.', es:'¡Hola! Voy a llegar unos diez minutos tarde.', esF:'Hola, llegaré unos diez minutos tarde.', en:'Hi! I’ll be about ten minutes late.', zh:'嗨！我会晚到大约十分钟。'},
 {id:'meet', ru:'Встретимся у кафе на углу в восемь?', es:'¿Quedamos en la cafetería de la esquina a las ocho?', esF:'¿Nos vemos en la cafetería de la esquina a las ocho?', en:'Shall we meet at the café on the corner at eight?', zh:'八点在街角的咖啡馆见面好吗？'},
 {id:'taxi', ru:'Сколько стоит такси до аэропорта?', es:'¿Cuánto cuesta un taxi al aeropuerto?', esF:'¿Cuánto costaría un taxi al aeropuerto?', en:'How much is a taxi to the airport?', zh:'打车去机场多少钱？'},
 {id:'doc', ru:'Мне нужен врач.', es:'Necesito un médico.', en:'I need a doctor.', zh:'我需要看医生。'},
 {id:'nuts', ru:'У меня аллергия на орехи.', es:'Soy alérgico a los frutos secos.', esFem:'Soy alérgica a los frutos secos.', en:'I’m allergic to nuts.', zh:'我对坚果过敏。'},
 {id:'water', ru:'Воду без газа, пожалуйста.', es:'Agua sin gas, por favor.', en:'Still water, please.', zh:'请给我不含气的水。'},
 {id:'bus', ru:'Где ближайшая остановка автобуса?', es:'¿Dónde está la parada de autobús más cercana?', esF:'¿Me podría decir dónde está la parada de autobús más cercana?', en:'Where is the nearest bus stop?', zh:'最近的公交车站在哪里？'},
 {id:'morning', ru:'Доброе утро!', es:'¡Buenos días!', en:'Good morning!', zh:'早上好！'},
 {id:'thx', ru:'Спасибо!', es:'¡Gracias!', en:'Thank you!', zh:'谢谢！'},
 {id:'tired', ru:'Я устал.', ruFem:'Я устала.', es:'Estoy cansado.', esFem:'Estoy cansada.', en:'I’m tired.', zh:'我累了。'},
 {id:'ready', ru:'Я готов.', ruFem:'Я готова.', es:'Estoy listo.', esFem:'Estoy lista.', en:'I’m ready.', zh:'我准备好了。'},
 // messenger (bridge / keyboard chat)
 {id:'wa1', es:'¡Hola! ¿Llegas a las ocho? Te espero en la cafetería de la esquina.', ru:'Привет! Будешь к восьми? Жду тебя в кафе на углу.', en:'Hi! Will you be there by eight? I’ll wait for you at the café on the corner.', zh:'嗨！你八点能到吗？我在街角的咖啡馆等你。'},
 {id:'wa2', es:'Oye, mañana no puedo ir a la playa, tengo que trabajar. ¿Lo dejamos para el domingo?', ru:'Слушай, завтра я не смогу пойти на пляж, мне нужно работать. Перенесём на воскресенье?', en:'Hey, I can’t go to the beach tomorrow, I have to work. Shall we move it to Sunday?', zh:'嘿，我明天不能去海滩了，我得工作。我们改到星期天吧？'},
 {id:'wa3', ru:'Да, давай в воскресенье! Во сколько?', es:'¡Sí, mejor el domingo! ¿A qué hora?', esF:'Sí, el domingo me va bien. ¿A qué hora?', en:'Yes, let’s do Sunday! What time?', zh:'好的，那就星期天！几点？'},
 {id:'wa4', ru:'Отлично, до встречи!', es:'¡Genial, nos vemos!', esF:'Perfecto, hasta luego.', en:'Great, see you!', zh:'太好了，到时见！'},
];
// Bridge sources
const WA_VOICE = {es:'Oye, mañana no puedo ir a la playa, tengo que trabajar. ¿Lo dejamos para el domingo?', id:'wa2', dur:'0:12'};
const WA_TEXT = {es:'¡Hola! ¿Llegas a las ocho? Te espero en la cafetería de la esquina.', id:'wa1'};

// Scripted speech for the mic buttons (simulated recognition)
const SCRIPT = { me:['pharm','head','cost','card','thanks'], them:['p1','p2','p3','p4','p5'] };

const FILL = {ru:['ну','эээ','ээ','ммм','короче','типа','как бы','это самое','значит','в общем','блин','вот','да'], es:['eh','pues','o sea','bueno','este','vale'], en:['um','uh','like','you know','well','so']};
const QW = {ru:/^(где|когда|как|что|сколько|почему|зачем|можно|кто|куда|откуда|ли|а сколько)(?=[\s,]|$)/i, es:/^(dónde|donde|cuándo|cuando|cómo|como|qué|que|cuánto|cuanto|por qué|puedo|puedes|quién)(?=[\s,]|$)/i, en:/^(where|when|how|what|why|who|can|could|do|does|is|are|will)(?=[\s,]|$)/i};

// small word list for the demo transformation of unknown input
const G = {
 'я':['yo','I'],'ты':['tú','you'],'вы':['usted','you'],'мы':['nosotros','we'],'он':['él','he'],'она':['ella','she'],'это':['esto','this'],'да':['sí','yes'],'нет':['no','no'],
 'привет':['hola','hi'],'здравствуйте':['hola','hello'],'спасибо':['gracias','thanks'],'пожалуйста':['por favor','please'],'хорошо':['bien','good'],'плохо':['mal','bad'],
 'где':['dónde','where'],'когда':['cuándo','when'],'как':['cómo','how'],'что':['qué','what'],'почему':['por qué','why'],'сколько':['cuánto','how much'],
 'хочу':['quiero','want'],'нужно':['necesito','need'],'нужен':['necesito','need'],'нужна':['necesito','need'],'можно':['se puede','can'],'могу':['puedo','can'],'есть':['hay','there is'],
 'сегодня':['hoy','today'],'завтра':['mañana','tomorrow'],'вчера':['ayer','yesterday'],'сейчас':['ahora','now'],'утром':['por la mañana','in the morning'],'вечером':['por la tarde','in the evening'],
 'дом':['casa','house'],'домой':['a casa','home'],'работа':['trabajo','work'],'работу':['trabajo','work'],'магазин':['tienda','shop'],'кафе':['cafetería','café'],'ресторан':['restaurante','restaurant'],'пляж':['playa','beach'],'море':['mar','sea'],'город':['ciudad','city'],'улица':['calle','street'],'машина':['coche','car'],'такси':['taxi','taxi'],'поезд':['tren','train'],'аэропорт':['aeropuerto','airport'],'врач':['médico','doctor'],'аптека':['farmacia','pharmacy'],'больница':['hospital','hospital'],
 'вода':['agua','water'],'воду':['agua','water'],'кофе':['café','coffee'],'чай':['té','tea'],'хлеб':['pan','bread'],'вино':['vino','wine'],'пиво':['cerveza','beer'],'еда':['comida','food'],'обед':['comida','lunch'],'ужин':['cena','dinner'],'завтрак':['desayuno','breakfast'],
 'друг':['amigo','friend'],'подруга':['amiga','friend'],'мама':['mamá','mom'],'папа':['papá','dad'],'дети':['niños','children'],'ребёнок':['niño','child'],'собака':['perro','dog'],'кошка':['gato','cat'],
 'большой':['grande','big'],'маленький':['pequeño','small'],'новый':['nuevo','new'],'старый':['viejo','old'],'красивый':['bonito','beautiful'],'вкусно':['rico','tasty'],'дорого':['caro','expensive'],'дешево':['barato','cheap'],'рядом':['cerca','nearby'],'далеко':['lejos','far'],
 'и':['y','and'],'или':['o','or'],'но':['pero','but'],'в':['en','in'],'на':['en','on'],'с':['con','with'],'без':['sin','without'],'для':['para','for'],'к':['a','to'],'у':['en','at'],'из':['de','from'],'не':['no','not'],'очень':['muy','very'],'тоже':['también','too'],'ещё':['más','more'],'уже':['ya','already'],
 'день':['día','day'],'ночь':['noche','night'],'час':['hora','hour'],'минут':['minutos','minutes'],'время':['tiempo','time'],'деньги':['dinero','money'],'карта':['tarjeta','card'],'телефон':['teléfono','phone'],'ключ':['llave','key'],'номер':['número','number'],'билет':['billete','ticket'],
 'люблю':['me encanta','love'],'понимаю':['entiendo','understand'],'знаю':['sé','know'],'иду':['voy','go'],'еду':['voy','go'],'жду':['espero','wait'],'позвони':['llámame','call me'],'приду':['vendré','will come'],'опаздываю':['llego tarde','am late'],'устал':['cansado','tired'],
 'один':['uno','one'],'два':['dos','two'],'три':['tres','three'],'пять':['cinco','five'],'десять':['diez','ten'],'восемь':['ocho','eight'],
};
const GES = {}; const GEN = {};
for (const [ru,[es,en]] of Object.entries(G)) { if(!GES[es]) GES[es]=ru; if(!GEN[en.toLowerCase()]) GEN[en.toLowerCase()]=ru; }
Object.assign(GES,{'el':'','la':'','los':'','las':'','un':'','una':'','de':'из','que':'что','es':'это','está':'находится','estoy':'я','muy':'очень','bien':'хорошо','hola':'привет','gracias':'спасибо','mañana':'завтра','hoy':'сегодня','quiero':'хочу','vamos':'пойдём','casa':'дом','playa':'пляж','trabajo':'работа','tengo':'у меня есть','puedo':'могу','no':'не','sí':'да','y':'и','con':'с','para':'для','por':'за','favor':'пожалуйста','ahora':'сейчас','mi':'мой','tu':'твой','te':'тебя','me':'меня'});
Object.assign(GEN,{'the':'','a':'','an':'','is':'','are':'','to':'','of':'','and':'и','my':'мой','your':'твой','it':'это','we':'мы','let\'s':'давай','tomorrow':'завтра','today':'сегодня','please':'пожалуйста'});

const TR_RU = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'j',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
const TR_LAT = {a:'а',b:'б',c:'к',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'х',k:'к',l:'л',m:'м',n:'н',ñ:'нь',o:'о',p:'п',q:'к',r:'р',s:'с',t:'т',u:'у',v:'в',w:'в',x:'кс',y:'й',z:'с',á:'а',é:'е',í:'и',ó:'о',ú:'у',ü:'у'};
const norm = s => String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[¡!¿?.,;:«»"“”'’()\-—–…]/g,' ').replace(/\s+/g,' ').trim();

const IDX = [];
for (const p of P) for (const l of ['ru','es','en','zh','esF','ruFem','esFem','raw']) if (p[l]) IDX.push({k:norm(p[l]), p, l: l==='esF'||l==='esFem'?'es':l==='ruFem'||l==='raw'?'ru':l});

function detect(t){
  if (/[\u4e00-\u9fff]/.test(t)) return 'zh';
  if (/[а-яё]/i.test(t)) return 'ru';
  if (/[ñ¿¡áéíóú]/i.test(t) || /\b(el|la|los|las|que|de|y|es|por|para|con|una|hola|gracias|mañana|tengo|quiero|estoy|dónde|donde|cuánto)\b/i.test(t)) return 'es';
  return 'en';
}
function find(t){
  const k = norm(t); if(!k) return null;
  let hit = IDX.find(x=>x.k===k); if (hit) return hit;
  const w = new Set(k.split(' ')); let best=null, bs=0;
  for (const x of IDX){ const xw=x.k.split(' '); let c=0; for(const q of xw) if(w.has(q)) c++; const s=c/Math.max(xw.length,w.size); if(s>bs){bs=s;best=x;} }
  return bs>=0.6 ? best : null;
}
function pickL(p, lang, opt){
  opt=opt||{};
  if (lang==='es'){ if(opt.style==='formal' && p.esF) return p.esF; if(opt.gender==='female' && p.esFem) return p.esFem; return p.es; }
  if (lang==='ru'){ if(opt.gender==='female' && p.ruFem) return p.ruFem; return p.ru; }
  return p[lang] || p.en;
}
function cap(s){ s=s.trim(); return s ? s[0].toUpperCase()+s.slice(1) : s; }
function punct(s, lang){
  s=s.trim(); if(!s) return s; if(/[.!?。！？]$/.test(s)) return s;
  const q = QW[lang] && QW[lang].test(s);
  if (lang==='es' && q) return '¿'+s+'?';
  return s + (q?'?':'.');
}
// Literary rewrite (demo): removes fillers, fixes capitalisation and punctuation. Canned phrases use their literary form.
function literary(text, lang){
  const h = find(text);
  if (h && h.p[lang==='zh'?'zh':lang] && (h.l===lang || h.l==='ru')) return pickL(h.p, lang);
  let s = ' '+String(text).toLowerCase()+' ';
  for (const f of (FILL[lang]||[]).sort((a,b)=>b.length-a.length)) s = s.replace(new RegExp('(^|[\\s,])'+f+'(?=[\\s,])','g'),' ');
  s = s.replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').replace(/^[,\s]+/,'').trim();
  return punct(cap(s), lang);
}
function wordTr(text, from, to){
  const words = String(text).replace(/[¡!¿?.,;:«»"“”()]/g,' ').split(/\s+/).filter(Boolean);
  const out = [];
  for (let w of words){
    const lw = w.toLowerCase().replace(/ё/g,'е');
    let r;
    if (from==='ru'){ const g=G[lw]||G[w.toLowerCase()]; r = g ? (to==='es'?g[0]:g[1]) : [...lw].map(c=>TR_RU[c]??c).join(''); }
    else if (to==='ru'){ const g=(from==='es'?GES:GEN)[lw]; r = g!==undefined ? g : [...lw].map(c=>TR_LAT[c]??c).join(''); }
    else r = lw;
    if (r) out.push(r);
  }
  return out.join(' ');
}
// Main translate: returns {text, known}
function translate(text, from, to, opt){
  opt=opt||{};
  if (from===to) return {text, known:true};
  const h = find(text);
  if (h && (h.p[to] || (to==='es'&&h.p.es))) return {text: pickL(h.p, to, opt), known:true, id:h.p.id};
  if (to==='zh') return {text:'好的，我明白了。', known:false};
  if (from==='zh') return {text: to==='ru'?'Хорошо, я понял.':to==='es'?'Vale, lo he entendido.':'Okay, I understand.', known:false};
  const base = from==='ru' ? literary(text,'ru') : text;
  let t = wordTr(base, from, to);
  t = punct(cap(t), to);
  return {text:t, known:false};
}
const LANGS = {ru:{n:['Русский','Ruso','Russian'],c:'RU',tts:'ru-RU'}, es:{n:['Испанский','Español','Spanish'],c:'ES',tts:'es-ES'}, en:{n:['Английский','Inglés','English'],c:'EN',tts:'en-US'}, zh:{n:['Китайский','Chino','Chinese'],c:'ZH',tts:'zh-CN'}};
const SPEAK = {ru:{speak:'Я говорю',done:'Готово'}, es:{speak:'Yo hablo',done:'Terminar'}, en:{speak:'I speak',done:'Done'}, zh:{speak:'我说',done:'完成'}};
window.DATA = {P, SCRIPT, WA_VOICE, WA_TEXT, translate, literary, detect, find, pickL, LANGS, SPEAK, norm};
})();
