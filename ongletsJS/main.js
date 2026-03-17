
// BOOT
(function(){
  const boot=document.getElementById('boot'),pct=document.getElementById('bootPct'),lbl=document.getElementById('bootLabel');
  const msgs=['INITIALIZING SYSTEM...','LOADING ASSETS...','ANALYZING USER...','ACCESS GRANTED.'];
  const total=2600, start=performance.now();
  function tick(now){
    const p=Math.min(Math.floor(((now-start)/total)*100),100);
    pct.textContent=p+'%';
    lbl.textContent=msgs[Math.min(Math.floor(p/26),3)];
    if(p<100){ requestAnimationFrame(tick); }
    else { lbl.textContent='READY.'; setTimeout(()=>{ boot.classList.add('hide'); boot.addEventListener('animationend',()=>boot.remove(),{once:true}); },400); }
  }
  requestAnimationFrame(tick);
})();

// CURSOR
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function t(){rx+=(mx-rx)*.13;ry+=(my-ry)*.13;curR.style.left=rx+'px';curR.style.top=ry+'px';requestAnimationFrame(t);})();
document.querySelectorAll('a,button,.faq-q,.proj-card,.gallery-item,.soc-btn,.strip,.tag,.sp-box').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.width='14px';cur.style.height='14px';curR.style.width='44px';curR.style.height='44px';});
  el.addEventListener('mouseleave',()=>{cur.style.width='8px';cur.style.height='8px';curR.style.width='28px';curR.style.height='28px';});
});

// SCROLL REVEAL
const obs=new IntersectionObserver(e=>e.forEach(v=>{if(v.isIntersecting){v.target.classList.add('visible');obs.unobserve(v.target);}}),{threshold:.08});
document.querySelectorAll('.section-wrap').forEach(el=>obs.observe(el));


// T&C POPOVER
(function(){
  const hero=document.getElementById('hero'),canvas=document.getElementById('matrix'),ctx=canvas.getContext('2d');
  const fs=13; let cols,drops,running=true;
  function resize(){ canvas.width=hero.offsetWidth; canvas.height=hero.offsetHeight; cols=Math.floor(canvas.width/fs); drops=Array(cols).fill(1); }
  resize(); window.addEventListener('resize',resize);
  new IntersectionObserver(e=>{running=e[0].isIntersecting;},{threshold:0}).observe(hero);
  function draw(){
    if(!running){requestAnimationFrame(draw);return;}
    ctx.fillStyle='rgba(8,8,8,0.06)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font=`${fs}px 'IBM Plex Mono',monospace`;
    for(let i=0;i<cols;i++){
      const c=Math.random()>.5?'1':'0', x=i*fs, y=drops[i]*fs;
      if(Math.random()>.94) ctx.fillStyle='rgba(59,111,255,0.8)'; // blue head
      else if(Math.random()>.88) ctx.fillStyle='rgba(232,232,232,0.7)'; // white head
      else ctx.fillStyle=`rgba(100,100,120,${0.04+Math.random()*0.08})`;
      ctx.fillText(c,x,y);
      if(y>canvas.height&&Math.random()>.975) drops[i]=0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// DM MODAL
function openDm(e){e.preventDefault();document.getElementById('dmModal').classList.add('open');}
document.getElementById('openDmNav').addEventListener('click',openDm);
document.getElementById('closeDm').addEventListener('click',()=>document.getElementById('dmModal').classList.remove('open'));
document.getElementById('dmModal').addEventListener('click',e=>{if(e.target===document.getElementById('dmModal'))document.getElementById('dmModal').classList.remove('open');});

// DRAWING CANVAS
(function(){
  const canvas=document.getElementById('drawCanvas'),ctx=canvas.getContext('2d');
  const colorEl=document.getElementById('drawColor'),sizeEl=document.getElementById('drawSize'),sizeVal=document.getElementById('sizeVal');
  let drawing=false,history=[],redoStack=[];
  function resize(){ const s=canvas.toDataURL(); canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetWidth*.75; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); const img=new Image(); img.onload=()=>ctx.drawImage(img,0,0); img.src=s; }
  resize(); window.addEventListener('resize',resize);
  function snap(){ history.push(canvas.toDataURL()); if(history.length>40)history.shift(); redoStack=[]; }
  function pos(e){ const r=canvas.getBoundingClientRect(),t=e.touches?.[0]||e; return{x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)}; }
  canvas.addEventListener('mousedown',e=>{snap();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);});
  canvas.addEventListener('mousemove',e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle=colorEl.value;ctx.lineWidth=+sizeEl.value;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();});
  canvas.addEventListener('mouseup',()=>drawing=false);
  canvas.addEventListener('mouseleave',()=>drawing=false);
  canvas.addEventListener('touchstart',e=>{e.preventDefault();snap();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);},{passive:false});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle=colorEl.value;ctx.lineWidth=+sizeEl.value;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();},{passive:false});
  canvas.addEventListener('touchend',()=>drawing=false);
  sizeEl.addEventListener('input',()=>sizeVal.textContent=sizeEl.value+'px');
  document.getElementById('clearBtn').addEventListener('click',()=>{snap();ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);});
  document.getElementById('undoBtn').addEventListener('click',()=>{if(!history.length)return;redoStack.push(canvas.toDataURL());const img=new Image();img.onload=()=>ctx.drawImage(img,0,0);img.src=history.pop();});
  document.getElementById('redoBtn').addEventListener('click',()=>{if(!redoStack.length)return;history.push(canvas.toDataURL());const img=new Image();img.onload=()=>ctx.drawImage(img,0,0);img.src=redoStack.pop();});
  document.getElementById('sendDrawing').addEventListener('click',async()=>{
    const dataURL=canvas.toDataURL('image/png'),msg=document.getElementById('sentMsg');
    try{
      let drawings=[];
      try{const r=await window.storage.get('gallery:index',true);if(r)drawings=JSON.parse(r.value);}catch(e){}
      const id='drawing_'+Date.now();
      await window.storage.set('gallery:'+id,dataURL,true);
      drawings.push(id);
      await window.storage.set('gallery:index',JSON.stringify(drawings),true);
      msg.textContent='✓ sent! thank you ♡';msg.style.color='#5a5';
      setTimeout(()=>msg.textContent='',3000);
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);history=[];redoStack=[];
      loadGallery();
    }catch(err){msg.textContent='— could not send, try again';msg.style.color='#a55';}
  });
})();

// GALLERY VIEWER
let galleryDrawings=[],galIndex=0;
async function loadGallery(){
  try{
    const res=await window.storage.get('gallery:index',true);
    if(!res){showGalEmpty();return;}
    const ids=JSON.parse(res.value);
    galleryDrawings=[];
    for(const id of ids){try{const d=await window.storage.get('gallery:'+id,true);if(d)galleryDrawings.push(d.value);}catch(e){}}
    if(!galleryDrawings.length){showGalEmpty();return;}
    galIndex=galleryDrawings.length-1; renderGalCanvas(galIndex); updateGalCounter();
  }catch(e){showGalEmpty();}
}
function showGalEmpty(){document.getElementById('galEmpty').style.display='flex';document.getElementById('galCanvas').style.display='none';document.getElementById('galCounter').textContent='0 / 0';}
function renderGalCanvas(i){
  const canvas=document.getElementById('galCanvas'),ctx=canvas.getContext('2d'),empty=document.getElementById('galEmpty');
  if(!galleryDrawings[i]){showGalEmpty();return;}
  empty.style.display='none';canvas.style.display='block';
  const img=new Image();img.onload=()=>{canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;ctx.drawImage(img,0,0);};img.src=galleryDrawings[i];
}
function updateGalCounter(){document.getElementById('galCounter').textContent=galleryDrawings.length?`${galIndex+1} / ${galleryDrawings.length}`:'0 / 0';}
document.getElementById('galPrev').addEventListener('click',()=>{if(!galleryDrawings.length)return;galIndex=(galIndex-1+galleryDrawings.length)%galleryDrawings.length;renderGalCanvas(galIndex);updateGalCounter();});
document.getElementById('galNext').addEventListener('click',()=>{if(!galleryDrawings.length)return;galIndex=(galIndex+1)%galleryDrawings.length;renderGalCanvas(galIndex);updateGalCounter();});
document.getElementById('openGalModal').addEventListener('click',()=>{
  const modal=document.getElementById('galModal'),grid=document.getElementById('galModalGrid');
  modal.classList.add('open'); grid.innerHTML='';
  if(!galleryDrawings.length){grid.innerHTML='<div class="gal-modal-empty">no drawings yet — be the first! ♡</div>';return;}
  galleryDrawings.forEach((src,i)=>{
    const div=document.createElement('div');div.className='gal-thumb';
    const c=document.createElement('canvas');div.appendChild(c);grid.appendChild(div);
    const img=new Image();img.onload=()=>{c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);};img.src=src;
    div.addEventListener('click',()=>{galIndex=i;renderGalCanvas(i);updateGalCounter();modal.classList.remove('open');});
  });
});
document.getElementById('closeGalModal').addEventListener('click',()=>document.getElementById('galModal').classList.remove('open'));
document.getElementById('galModal').addEventListener('click',e=>{if(e.target===document.getElementById('galModal'))document.getElementById('galModal').classList.remove('open');});
loadGallery();
// T&C RETRO WINDOW
(function(){
  const link    = document.getElementById('tncLink');
  const win     = document.getElementById('tncWindow');
  const overlay = document.getElementById('tncOverlay');
  const closeBtn= document.getElementById('tncClose');
  const okBtn   = document.getElementById('tncOk');
  const cancelBtn=document.getElementById('tncCancel');
  const bar     = document.getElementById('tncBar');
  if(!link||!win) return;

  function openWin(e){
    e.preventDefault();
    // always reset to center
    win.style.left = '50%';
    win.style.top  = '50%';
    win.style.transform = 'translate(-50%,-50%)';
    win.classList.add('open');
    overlay.classList.add('open');
    if(bar){ bar.style.animation='none'; void bar.offsetWidth; bar.style.animation='tncLoad 1.8s steps(12) forwards'; }
  }
  function closeWin(e){
    if(e) e.stopPropagation();
    win.classList.remove('open');
    overlay.classList.remove('open');
  }

  link.addEventListener('click', openWin);
  closeBtn.addEventListener('click', closeWin);
  okBtn.addEventListener('click', closeWin);
  cancelBtn.addEventListener('click', closeWin);
  overlay.addEventListener('click', closeWin);

  // DRAG — works from anywhere on the window
  let drag=false, ox=0, oy=0;
  win.style.cursor='grab';
  const noDrag = [closeBtn, okBtn, cancelBtn];

  win.addEventListener('mousedown', e=>{
    if(noDrag.some(b=>b&&b.contains(e.target))) return;
    // Kill the centering transform first, lock to exact current position
    const r = win.getBoundingClientRect();
    win.style.transform = 'none';
    win.style.left = r.left + 'px';
    win.style.top  = r.top  + 'px';
    // NOW compute offset (after transform removed, position is stable)
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    drag = true;
    win.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e=>{
    if(!drag) return;
    const nx = Math.max(0, Math.min(e.clientX - ox, window.innerWidth  - win.offsetWidth));
    const ny = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - win.offsetHeight));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', ()=>{
    if(!drag) return;
    drag = false;
    win.style.cursor = 'grab';
  });

  // touch drag
  win.addEventListener('touchstart', e=>{
    if(noDrag.some(b=>b&&b.contains(e.target))) return;
    const t = e.touches[0];
    const r = win.getBoundingClientRect();
    win.style.transform = 'none';
    win.style.left = r.left + 'px';
    win.style.top  = r.top  + 'px';
    ox = t.clientX - r.left;
    oy = t.clientY - r.top;
    drag = true;
  },{passive:true});
  document.addEventListener('touchmove', e=>{
    if(!drag) return;
    const t = e.touches[0];
    const nx = Math.max(0, Math.min(t.clientX - ox, window.innerWidth  - win.offsetWidth));
    const ny = Math.max(0, Math.min(t.clientY - oy, window.innerHeight - win.offsetHeight));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  },{passive:true});
  document.addEventListener('touchend', ()=>{ drag = false; });
})();

// ── FLOATING STARS ──
(function(){
  const chars = ['✦','✧','★','✩','✪','⋆','·','*'];
  const total = 20;
  for(let i=0;i<total;i++){
    const s = document.createElement('div');
    s.className = 'floating-star' + (Math.random()>.5?' white':'');
    const size = Math.random()*14+8;
    s.textContent = chars[Math.floor(Math.random()*chars.length)];
    s.style.cssText = `
      left:${Math.random()*100}vw;
      bottom:-${Math.random()*20+5}vh;
      font-size:${size}px;
      animation-duration:${Math.random()*20+15}s;
      animation-delay:-${Math.random()*20}s;
    `;
    document.body.appendChild(s);
  }
})();

// MATRIX RAIN — hero only

// ── SPARKLE TRAIL ──
(function(){
  let lastSparkle=0;
  const colors=['#ffffff','#3b6fff','#8ab4ff','#c8c8c8'];
  document.addEventListener('mousemove',e=>{
    const now=Date.now();
    if(now-lastSparkle<40) return; // throttle
    lastSparkle=now;
    const s=document.createElement('div');
    s.className='sparkle';
    const size=Math.random()*5+2;
    s.style.cssText=`
      left:${e.clientX}px; top:${e.clientY}px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      opacity:${0.4+Math.random()*0.5};
    `;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),700);
  });
})();

// ── HERO FLOATING PARTICLES ──
(function(){
  const hero=document.getElementById('hero');
  if(!hero) return;
  const total=18;
  for(let i=0;i<total;i++){
    const p=document.createElement('div');
    p.className='hero-particle';
    const size=Math.random()*3+1;
    const x=Math.random()*100;
    const dur=Math.random()*18+12;
    const delay=Math.random()*-20;
    const isBlue=Math.random()>.5;
    p.style.cssText=`
      left:${x}%;bottom:0;
      width:${size}px;height:${size}px;
      background:${isBlue?'rgba(59,111,255,0.6)':'rgba(200,200,212,0.4)'};
      animation-duration:${dur}s;
      animation-delay:${delay}s;
    `;
    hero.appendChild(p);
  }
})();

// ── COMMISSION STRIPS SLIDESHOW ──
document.querySelectorAll('.strip').forEach(strip=>{
  const slides  = strip.querySelector('.strip-slides');
  const counter = strip.querySelector('.strip-counter');
  const total   = strip.querySelectorAll('.strip-slide').length;
  let idx = 0;
 
  function goTo(n){
    idx = (n + total) % total;
    slides.style.transform = `translateX(-${idx * 100}%)`;
    if(counter) counter.textContent = `${idx+1} / ${total}`;
  }
 
  strip.querySelector('.strip-prev').addEventListener('click', ()=>goTo(idx-1));
  strip.querySelector('.strip-next').addEventListener('click', ()=>goTo(idx+1));
});
 
// ── PROJECT CARD MOUSE-FOLLOW GLOW ──
document.querySelectorAll('.proj-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
  });
});

// ── SHOWCASE CAROUSEL ──
(function(){
  const track = document.getElementById('scTrack');
  if(!track) return;
  const cards = Array.from(track.children);
  const container = track.parentElement;
  const dotsWrap = document.getElementById('scDots');
  let idx = 0;

  // build dots
  cards.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = 'sc-dot' + (i===0?' active':'');
    d.addEventListener('click',()=>goTo(i));
    dotsWrap.appendChild(d);
  });

  function resize(){
    const cw = cards[0].offsetWidth;
    const cm = parseInt(window.getComputedStyle(cards[0]).marginRight)*2;
    const off = container.offsetWidth/2 - cw/2;
    const tx = off - idx*(cw+cm);
    track.style.transform = `translateX(${tx}px)`;
  }

  function goTo(target){
    if(target<0||target>=cards.length) return;
    idx = target;
    const cw = cards[0].offsetWidth;
    const cm = parseInt(window.getComputedStyle(cards[0]).marginRight)*2;
    const off = container.offsetWidth/2 - cw/2;
    const tx = off - idx*(cw+cm);
    track.style.transform = `translateX(${tx}px)`;
    // update classes
    cards.forEach((c,i)=>{
      c.classList.remove('sc-active','sc-prev','sc-next');
      if(i===idx) c.classList.add('sc-active');
      else if(i===idx-1) c.classList.add('sc-prev');
      else if(i===idx+1) c.classList.add('sc-next');
    });
    // update dots
    dotsWrap.querySelectorAll('.sc-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
    // scan flash
    const active = cards[idx];
    const flash = document.createElement('div');
    flash.style.cssText='position:absolute;inset:0;background:rgba(59,111,255,0.1);z-index:10;pointer-events:none;opacity:0;transition:opacity .2s;';
    active.appendChild(flash);
    requestAnimationFrame(()=>{flash.style.opacity='0.4';setTimeout(()=>{flash.style.opacity='0';setTimeout(()=>flash.remove(),200);},100);});

    // scan bar
    document.querySelectorAll('.sc-scan').forEach(s=>s.remove());
    const scan = document.createElement('div');
    scan.className = 'sc-scan';
    active.appendChild(scan);
    setTimeout(()=>scan.remove(), 2100);
  }

  // initial
  resize();
  goTo(0);
  // also run periodic scans on active card
  setInterval(()=>{
    const active = cards[idx];
    if(!active) return;
    document.querySelectorAll('.sc-scan').forEach(s=>s.remove());
    const scan = document.createElement('div');
    scan.className = 'sc-scan';
    active.appendChild(scan);
    setTimeout(()=>scan.remove(), 2100);
  }, 7000);
  window.addEventListener('resize', ()=>{ resize(); goTo(idx); });

  document.getElementById('scPrev').addEventListener('click',()=>goTo(idx-1));
  document.getElementById('scNext').addEventListener('click',()=>goTo(idx+1));

  // drag/swipe
  let dragging=false,startX=0,startTx=0;
  track.addEventListener('mousedown',e=>{
    dragging=true; startX=e.clientX;
    const m = new DOMMatrix(window.getComputedStyle(track).transform);
    startTx=m.m41; track.style.transition='none'; track.style.cursor='grabbing';
  });
  document.addEventListener('mouseup',()=>{
    if(!dragging) return; dragging=false;
    track.style.transition='transform 0.75s cubic-bezier(0.21,0.61,0.35,1)';
    track.style.cursor='grab';
    const cw=cards[0].offsetWidth, cm=parseInt(window.getComputedStyle(cards[0]).marginRight)*2;
    const off=container.offsetWidth/2-cw/2;
    const moved = (new DOMMatrix(window.getComputedStyle(track).transform)).m41 - startTx;
    if(moved < -(cw/3.5)) goTo(Math.min(idx+1,cards.length-1));
    else if(moved > (cw/3.5)) goTo(Math.max(idx-1,0));
    else goTo(idx);
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const dx = e.clientX-startX;
    track.style.transform=`translateX(${startTx+dx}px)`;
  });
  track.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;const m=new DOMMatrix(window.getComputedStyle(track).transform);startTx=m.m41;track.style.transition='none';},{passive:true});
  track.addEventListener('touchend',e=>{
    track.style.transition='transform 0.75s cubic-bezier(0.21,0.61,0.35,1)';
    const cw=cards[0].offsetWidth;
    const moved=(new DOMMatrix(window.getComputedStyle(track).transform)).m41-startTx;
    if(moved<-(cw/3.5)) goTo(Math.min(idx+1,cards.length-1));
    else if(moved>(cw/3.5)) goTo(Math.max(idx-1,0));
    else goTo(idx);
  },{passive:true});
  track.addEventListener('touchmove',e=>{
    const dx=e.touches[0].clientX-startX;
    track.style.transform=`translateX(${startTx+dx}px)`;
  },{passive:true});
})();
