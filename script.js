(function(){
  var KEY="planner-v1", data={}, cur=new Date();
  try{var s=localStorage.getItem(KEY);if(s)data=JSON.parse(s)||{}}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
  function k(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function tasks(){return data[k(cur)]||(data[k(cur)]=[])}
  var $=function(i){return document.getElementById(i)};
  var CHECK='<svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5"/></svg>';
  function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML}
  function title(){
    var t=new Date(),y=new Date(t);y.setDate(t.getDate()-1);var n=new Date(t);n.setDate(t.getDate()+1);
    if(k(cur)===k(t))return"Сегодня";if(k(cur)===k(y))return"Вчера";if(k(cur)===k(n))return"Завтра";
    return cur.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
  }
  function render(){
    var a=tasks(),done=a.filter(function(t){return t.done}).length;
    $("title").textContent=title();
    $("date").textContent=cur.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    $("cnt").textContent=done+" из "+a.length;
    $("fill").style.width=(a.length?done/a.length*100:0)+"%";
    $("clear").hidden=!done;
    var L=$("list");
    if(!a.length){L.innerHTML='<div class="empty"><b>✨</b>На этот день задач нет</div>';return}
    var h='<div class="list">';
    a.forEach(function(t){
      h+='<div class="item'+(t.done?' done':'')+'" data-id="'+t.id+'"><button class="del" data-a="del">Удалить</button><div class="fg"><button class="chk" data-a="tog" aria-label="Отметить">'+CHECK+'</button><span class="txt">'+esc(t.text)+'</span><button class="x" data-a="del" aria-label="Удалить">×</button></div></div>';
    });
    L.innerHTML=h+'</div>';
  }
  function add(){
    var v=$("inp").value.trim();if(!v)return;
    tasks().push({id:Date.now()+Math.random().toString(36).slice(2,6),text:v,done:false});
    $("inp").value="";save();render();
  }
  function remove(id){
    var el=document.querySelector('[data-id="'+id+'"]');
    var go=function(){data[k(cur)]=tasks().filter(function(t){return t.id!==id});save();render()};
    if(el){el.classList.add("out");setTimeout(go,260)}else go();
  }
  $("addBtn").onclick=add;
  $("inp").onkeydown=function(e){if(e.key==="Enter")add()};
  $("prev").onclick=function(){cur.setDate(cur.getDate()-1);render()};
  $("next").onclick=function(){cur.setDate(cur.getDate()+1);render()};
  $("today").onclick=function(){cur=new Date();render()};
  $("clear").onclick=function(){data[k(cur)]=tasks().filter(function(t){return!t.done});save();render()};
  $("list").addEventListener("click",function(e){
    var b=e.target.closest("[data-a]");if(!b)return;
    var it=b.closest(".item"),id=it.dataset.id;
    if(b.dataset.a==="del")return remove(id);
    var t=tasks().find(function(x){return x.id===id});
    if(t){t.done=!t.done;save();render()}
  });
  // свайп влево для удаления
  var sx=0,sy=0,dx=0,fg=null,open=null,lock=null;
  var L=$("list");
  L.addEventListener("touchstart",function(e){
    var f=e.target.closest(".fg");if(!f)return;
    if(open&&open!==f){open.style.transform="";open=null}
    fg=f;sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;lock=null;
  },{passive:true});
  L.addEventListener("touchmove",function(e){
    if(!fg)return;
    var x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
    if(lock===null&&(Math.abs(x)>6||Math.abs(y)>6))lock=Math.abs(x)>Math.abs(y);
    if(!lock)return;
    var base=open===fg?-90:0;
    dx=Math.max(-140,Math.min(0,base+x));
    fg.classList.add("drag");fg.style.transform="translateX("+dx+"px)";
  },{passive:true});
  L.addEventListener("touchend",function(){
    if(!fg)return;
    fg.classList.remove("drag");
    if(lock){
      if(dx<-130){remove(fg.parentNode.dataset.id)}
      else if(dx<-45){fg.style.transform="translateX(-90px)";open=fg}
      else{fg.style.transform="";if(open===fg)open=null}
    }
    fg=null;
  });
  render();
})();
