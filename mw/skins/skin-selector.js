(function(){
  const JSON_URL = 'https://cdn.arrival.studio/mw/skins/index.json';
  const BASE     = 'https://cdn.arrival.studio/mw/skins';
  const CLICK_SND = 'https://cdn.arrival.studio/mw/site/click.mp3';

  let D=null, pI=0, sI=0, anim=false, tx=0, td=0;
  const $=id=>document.getElementById(id);

  var clickAudio = new Audio(CLICK_SND);
  clickAudio.volume = 0.4;
  clickAudio.preload = 'auto';
  function playClick(){
    clickAudio.currentTime = 0;
    clickAudio.play().catch(function(){});
  }

  async function init(){
    try {
      const r=await fetch(JSON_URL); if(!r.ok) throw 0;
      D=await r.json();
    } catch(e){
      $('mcskin-ld').querySelector('span').textContent='Failed to load skin packs';
      return;
    }
    if(D.background){
      const u=D.background.startsWith('http')?D.background:`${BASE}/${D.background}`;
      $('mcskin-bg').style.backgroundImage=`url('${u}')`;
    }
    renderBtns();
    selPack(0);
    $('mcskin-ld').classList.add('done');
  }

  function renderBtns(){
    const c=$('mcskin-btns'); c.innerHTML='';
    D.skinPacks.forEach((p,i)=>{
      const b=document.createElement('button');
      b.className='pk-btn'+(i===pI?' sel':'');
      b.textContent=p.name;
      b.onclick=()=>{playClick();selPack(i);};
      c.appendChild(b);
    });
  }

  function selPack(i){
    pI=i; sI=0;
    const btns=$('mcskin-btns').children;
    for(let j=0;btns.length>j;j++) btns[j].className='pk-btn'+(j===pI?' sel':'');
    const pk=D.skinPacks[pI];
    $('mcskin-rptitle').textContent=pk.name;
    $('mcskin-rpsub').textContent=pk.description||'';
    updPreview(); renderCar();
  }

  function updPreview(){
    const pk=D.skinPacks[pI];
    const img=$('mcskin-pvimg'), ph=$('mcskin-pvph');
    if(pk&&pk.image){
      img.src=`${BASE}/${pk.id}/${pk.image}`;
      img.alt=pk.name;
      img.style.display='block'; ph.style.display='none';
      img.oncontextmenu=function(){return false;};
      img.ondragstart=function(){return false;};
      img.onerror=()=>{img.style.display='none';ph.style.display='block';};
    } else { img.style.display='none'; ph.style.display='block'; }
  }

  function buildSlot(pk, idx, slW, mH, total){
    const sl=document.createElement('div');
    sl.className='sk';
    sl.style.width=slW+'px';
    sl.style.height=mH+'px';
    if(0>idx||idx>=total)return sl;
    const skin=pk.skins[idx];
    const img=document.createElement('img');
    img.className='si';
    img.src=`${BASE}/${pk.id}/${skin.render||skin.file}`;
    img.alt=skin.name; img.draggable=false;
    img.style.height=mH+'px'; img.style.width='auto';
    img.oncontextmenu=function(){return false;};
    img.ondragstart=function(){return false;};
    img.onerror=()=>{
      img.remove();
      const e=document.createElement('div'); e.className='si-err';
      e.style.width=(mH*0.44)+'px'; e.style.height=mH+'px';
      e.style.fontSize=(mH*0.12)+'px'; e.textContent='?';
      sl.appendChild(e);
    };
    sl.onclick=()=>{if(idx!==sI)navSkin(idx);};
    sl.appendChild(img);
    return sl;
  }

  function renderCar(){
    const tr=$('mcskin-track');
    tr.innerHTML=''; tr.classList.remove('anim'); tr.style.transform='';
    const pk=D.skinPacks[pI];
    if(!pk||!pk.skins.length) return;

    const area=$('mcskin-car');
    const aH=area.clientHeight;
    const aW=area.clientWidth;
    const mH=aH - 8;
    const sc=260>aW?1:450>aW?2:3;
    const slW=Math.max(mH*0.48, 44);
    const total=pk.skins.length;

    for(let o=-sc;sc>=o;o++){
      const idx=sI+o;
      const sl=buildSlot(pk, idx, slW, mH, total);
      if(o===0) sl.classList.add('act');
      tr.appendChild(sl);
    }
    updSkinInfo();
  }

  var navCooldown=false;
  function navSkin(tgt){
    const pk=D.skinPacks[pI];
    if(anim||navCooldown||0>tgt||tgt>=pk.skins.length||tgt===sI)return;
    anim=true;
    navCooldown=true;
    const diff=tgt-sI;
    const dir=diff>0?1:-1;
    const steps=Math.abs(diff);
    const tr=$('mcskin-track');
    const slots=tr.children;
    const gap=parseFloat(getComputedStyle(tr).gap)||0;
    const slW=slots[0]?(slots[0].offsetWidth+gap):60;

    const area=$('mcskin-car');
    const aH=area.clientHeight;
    const aW=area.clientWidth;
    const mH=aH - 8;
    const sc=260>aW?1:450>aW?2:3;
    const total=pk.skins.length;
    const newSlots=[];

    tr.classList.add('anim');
    tr.style.transform=`translateX(${-dir*steps*slW}px)`;
    setTimeout(()=>{
      tr.classList.remove('anim'); tr.style.transform='';
      sI=tgt;
      var s;
      for(s=0;steps>s;s++){
        if(dir===1){
          tr.removeChild(tr.firstChild);
          var ni=sI+sc-steps+1+s;
          var ns=buildSlot(pk, ni, Math.max(mH*0.48,44), mH, total);
          ns.classList.add('sk-enter');
          tr.appendChild(ns);
          newSlots.push(ns);
        } else {
          tr.removeChild(tr.lastChild);
          var ni2=sI-sc+steps-1-s;
          var ns2=buildSlot(pk, ni2, Math.max(mH*0.48,44), mH, total);
          ns2.classList.add('sk-enter');
          tr.insertBefore(ns2, tr.firstChild);
          newSlots.push(ns2);
        }
      }
      for(var i=0;slots.length>i;i++){
        var o=i-sc;
        slots[i].classList.toggle('act', o===0);
        var idx=sI+o;
        slots[i].onclick=(0>idx||idx>=total)?null:((function(ci){return function(){if(ci!==sI)navSkin(ci);};})(idx));
      }
      updSkinInfo();
      // Fade in new slots next frame
      requestAnimationFrame(()=>{requestAnimationFrame(()=>{
        for(var j=0;newSlots.length>j;j++) newSlots[j].classList.remove('sk-enter');
      });});
      anim=false;
      setTimeout(()=>{navCooldown=false;},120);
    },185);
  }
    },185);
  }

  function moveSK(d){
    const pk=D.skinPacks[pI];
    const n=sI+d; if(0>n||n>=pk.skins.length)return;
    navSkin(n);
  }

  function updSkinInfo(){
    const pk=D.skinPacks[pI], sk=pk.skins[sI];
    $('mcskin-siname').textContent=sk.name;
    $('mcskin-sidesc').textContent=sk.desc||'';
  }

  // Expose to global for onclick handlers
  window.mcDlSkin=async function(){
    playClick();
    const pk=D.skinPacks[pI], sk=pk.skins[sI];
    toast('Downloading '+sk.name+'...');
    try{
      const r=await fetch(`${BASE}/${pk.id}/${sk.file}`);
      if(!r.ok)throw 0;
      const b=await r.blob();
      const u=URL.createObjectURL(b);
      const a=document.createElement('a');
      a.href=u; a.download=sk.file;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(u);
    }catch(e){toast('Download failed');}
  };

  window.mcDlAll=async function(){
    playClick();
    const pk=D.skinPacks[pI];
    toast(`Zipping ${pk.skins.length} skins...`);
    try{
      const zip=new JSZip();
      const f=zip.folder(pk.name.replace(new RegExp('[^a-zA-Z0-9_ -]','g'),''));
      await Promise.all(pk.skins.map(async s=>{
        try{const r=await fetch(`${BASE}/${pk.id}/${s.file}`);if(!r.ok)throw 0;f.file(s.file,await r.blob());}catch{}
      }));
      const b=await zip.generateAsync({type:'blob'});
      const u=URL.createObjectURL(b);
      const a=document.createElement('a');
      a.href=u; a.download=`${pk.id}-skins.zip`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(u);
      toast(`Downloaded ${pk.name}!`);
    }catch(e){console.error(e);toast('Download failed');}
  };

  function toast(m){
    const t=$('mcskin-toast'); t.textContent=m; t.classList.add('show');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2000);
  }

  document.addEventListener('keydown',e=>{
    if(!D)return;
    if(e.key==='ArrowUp'){e.preventDefault();playClick();const n=pI-1;if(n>=0)selPack(n);renderBtns();}
    else if(e.key==='ArrowDown'){e.preventDefault();playClick();const n=pI+1;if(D.skinPacks.length>n)selPack(n);renderBtns();}
    else if(e.key==='ArrowLeft'){moveSK(-1);}
    else if(e.key==='ArrowRight'){moveSK(1);}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();window.mcDlSkin();}
  });

  (function(){
    const el=$('mcskin-car');
    el.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;td=0;},{passive:true});
    el.addEventListener('touchmove',e=>{td=e.touches[0].clientX-tx;},{passive:true});
    el.addEventListener('touchend',()=>{if(Math.abs(td)>30){td>0?moveSK(-1):moveSK(1);}td=0;});
  })();

  var resizeT=0;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeT);
    resizeT=setTimeout(()=>{
      if(!D)return;
      anim=false;
      renderCar();
    },150);
  });
  init();
})();
