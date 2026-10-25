/* общее: прогресс скролла -> --p (с лёгким сглаживанием), шапка, # ссылки */
(function(){
var root=document.documentElement,top=document.querySelector(".top"),pS=0,ticking=false,reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
function target(){var h=root.scrollHeight-innerHeight;return h>0?Math.min(1,Math.max(0,scrollY/h)):0}
function frame(){var t=target();pS=reduce?t:pS+(t-pS)*.09;if(Math.abs(t-pS)<.0004)pS=t;root.style.setProperty("--p",pS.toFixed(4));if(pS!==t)requestAnimationFrame(frame);else ticking=false}
function onScroll(){if(top)top.classList.toggle("sc",scrollY>12);if(!ticking){ticking=true;requestAnimationFrame(frame)}}
addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll);onScroll();
document.querySelectorAll('a[href="#"]').forEach(function(a){a.addEventListener("click",function(e){e.preventDefault()})});
window.PCON={reduce:reduce,clamp:function(v,a,b){return Math.min(b,Math.max(a,v))}};
})();

/* C2: кроссфейд свечения по сценам, лёгкий параллакс телефонов, появление блоков, печатное демо в hero, таймер мини-интерфейса записи */
(function(){
var C=PCON.clamp,reduce=PCON.reduce,fine=matchMedia("(min-width:821px)");
var scenes=[].slice.call(document.querySelectorAll(".sec[data-k]")),L={};
document.querySelectorAll(".gl").forEach(function(l){L[l.dataset.k]=l});
var ticking=false;
function upd(){ticking=false;var H=innerHeight,m=H*.5,band=H*.38,n=scenes.length;
 scenes.forEach(function(s,i){var r=s.getBoundingClientRect(),l=L[s.dataset.k];
  if(l&&n>1){var a=i===0?1:C((m-(r.top-band))/(2*band),0,1),b=i===n-1?1:1-C((m-(r.bottom-band))/(2*band),0,1),w=Math.min(a,b);w=w*w*(3-2*w);
   l.style.opacity=w.toFixed(3);l.style.visibility=w<.004?"hidden":"visible"}
  if(!reduce&&fine.matches&&r.bottom>-H&&r.top<2*H)s.style.setProperty("--sp",C((m-(r.top+r.height/2))/H,-1,1).toFixed(3))});
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
if(scenes.length>1){addEventListener("scroll",req,{passive:true});addEventListener("resize",req);upd()}
var rv=[].slice.call(document.querySelectorAll(".rv"));
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12,rootMargin:"0px 0px -6% 0px"});rv.forEach(function(e){io.observe(e)})}
else rv.forEach(function(e){e.classList.add("in")});

/* --- hero: три примера по кругу; в каждом три строки печатаются по очереди (reduced-motion: статично, первый пример) --- */
var demo=document.querySelector(".demo");
if(demo&&!reduce){
 var EX=JSON.parse(demo.getAttribute("data-ex")),TH=JSON.parse(demo.getAttribute("data-th")),ix=0;
 var rows=[].slice.call(demo.querySelectorAll(".ty")).map(function(p){return{p:p,t:p.querySelector(".tx")}});
 var run=0,vis=true;
 function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
 async function type(row,full,ms,id){row.p.classList.add("caret");for(var i=1;i<=full.length;i++){if(id!==run)return false;row.t.textContent=full.slice(0,i);await sleep(ms)}row.p.classList.remove("caret");return true}
 async function loop(){var id=++run;
  while(id===run){
   var e=EX[ix%EX.length];
   demo.setAttribute("aria-label",TH.map(function(h,k){return h+": "+e[k]}).join(" · "));
   rows.forEach(function(r){r.t.textContent="";r.p.classList.remove("caret");r.p.parentNode.style.opacity=".28"});
   demo.classList.add("on");rows[0].p.parentNode.style.opacity="1";
   if(!await type(rows[0],e[0],18,id))return; demo.classList.remove("on");await sleep(400);
   rows[1].p.parentNode.style.opacity="1";if(!await type(rows[1],e[1],11,id))return;await sleep(300);
   rows[2].p.parentNode.style.opacity="1";if(!await type(rows[2],e[2],9,id))return;
   await sleep(4800);ix++;
  }}
 rows.forEach(function(r){r.p.parentNode.style.transition="opacity .5s"});
 if("IntersectionObserver" in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!vis){vis=true;loop()}else if(!v&&vis){vis=false;run++}},{threshold:.1}).observe(demo)}
 loop();
}
/* --- мини-интерфейс записи: таймер 0:12 → 1:30, волна работает только в поле зрения --- */
var vui=document.querySelector(".vui");
if(vui){var tm=document.getElementById("vtm"),pg=document.getElementById("vpg"),sec=44,vt=null;
 function paint(){var m=Math.floor(sec/60),s=sec%60;tm.textContent=m+":"+(s<10?"0":"")+s;pg.style.width=(sec/120*100).toFixed(1)+"%"}
 paint();
 function start(){if(reduce||vt)return;vui.classList.add("on");vt=setInterval(function(){sec=sec>=90?12:sec+1;paint()},1000)}
 function stop(){vui.classList.remove("on");clearInterval(vt);vt=null}
 if("IntersectionObserver" in window&&!reduce)new IntersectionObserver(function(es){es[0].isIntersecting?start():stop()},{threshold:.2}).observe(vui);
}
})();
