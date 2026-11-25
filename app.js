(() => {
  'use strict';
  const groups=window.galleryData||[];
  const host=document.querySelector('#collections');
  const dialog=document.querySelector('#lightbox');
  let active='all',current=0,opener=null,touchX=null;
  const all=groups.flatMap(group=>group.items.map(photo=>({...photo,collection:group.title})));
  const visible=()=>active==='all'?all:all.filter(photo=>photo.section===active);
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  for(const group of groups){
    const section=make('section','collection');section.dataset.collection=group.id;section.setAttribute('aria-labelledby','title-'+group.id);
    const heading=make('div','collection-head'),titleWrap=make('div'),title=make('h3','',group.title);title.id='title-'+group.id;titleWrap.append(title,make('p','',group.subtitle));heading.append(titleWrap,make('span','collection-count',`${group.items.length} photographs`));
    const grid=make('div','photo-grid');
    for(const photo of group.items){const card=make('figure','photo-card'),button=make('button','photo-button');button.type='button';button.setAttribute('aria-label',`View ${photo.title}`);button.dataset.photo=photo.id;const img=make('img');img.src=photo.thumb;img.srcset=`${photo.thumb} 640w, ${photo.src} 1600w`;img.sizes='(max-width: 760px) 45vw, (max-width: 1600px) 30vw, 460px';img.width=photo.width;img.height=photo.height;img.loading='lazy';img.decoding='async';img.alt=photo.alt;button.append(img,make('span','view-label','View photograph'));const caption=make('figcaption');caption.append(make('span','',photo.title));const plus=make('span','','+');plus.setAttribute('aria-hidden','true');caption.append(plus);card.append(button,caption);grid.append(card);button.addEventListener('click',()=>open(photo.id,button));}
    section.append(heading,grid);host.append(section);
  }
  const filters=[...document.querySelectorAll('[data-filter]')];
  filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;filters.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});document.querySelectorAll('[data-collection]').forEach(section=>section.hidden=active!=='all'&&section.dataset.collection!==active);document.querySelector('#gallery-status').textContent=`Showing ${visible().length} photographs${active==='all'?' across all collections':` in ${button.textContent.trim()}`}.`;}));
  function render(){const items=visible(),photo=items[current];if(!photo)return;const image=document.querySelector('#viewer-photo');image.src=photo.src;image.alt=photo.alt;document.querySelector('#viewer-title').textContent=photo.title;document.querySelector('#viewer-collection').textContent=photo.collection;document.querySelector('#viewer-position').textContent=`${current+1} / ${items.length}`;const next=new Image();next.src=items[(current+1)%items.length].src;}
  function open(id,button){opener=button;current=visible().findIndex(photo=>photo.id===id);render();dialog.showModal();document.body.style.overflow='hidden';document.querySelector('#viewer-close').focus();}
  function move(direction){current=(current+direction+visible().length)%visible().length;render();}
  document.querySelector('#viewer-close').addEventListener('click',()=>dialog.close());
  document.querySelector('#viewer-prev').addEventListener('click',()=>move(-1));document.querySelector('#viewer-next').addEventListener('click',()=>move(1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}});
  dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});
  dialog.addEventListener('touchstart',event=>{touchX=event.changedTouches[0].clientX;},{passive:true});dialog.addEventListener('touchend',event=>{if(touchX===null)return;const distance=event.changedTouches[0].clientX-touchX;if(Math.abs(distance)>60)move(distance<0?1:-1);touchX=null;},{passive:true});
  document.querySelector('#year').textContent=new Date().getFullYear();
  const picker=document.querySelector('#collection-picker');
  picker.addEventListener('change',()=>document.querySelector(`[data-filter="${picker.value}"]`).click());
  filters.forEach(button=>button.addEventListener('click',()=>{picker.value=button.dataset.filter;}));
  // Discourage casual saving without disabling normal link or keyboard controls.
  document.querySelectorAll('img').forEach(image=>{image.draggable=false;});
  const isPhotograph=target=>target instanceof Element&&target.closest('img,.photo-button,.viewer-image,.hero-main,.hero-detail,.about-photo');
  document.addEventListener('contextmenu',event=>{if(isPhotograph(event.target))event.preventDefault();});
  document.addEventListener('dragstart',event=>{if(isPhotograph(event.target))event.preventDefault();});
  const rig=document.querySelector('.gallery-light-rig');
  const room=document.querySelector('.gallery-section');
  const frames=[...document.querySelectorAll('.photo-card')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  let scheduled=false,pointer=null,lastTime=0;
  const angles={left:0,right:0};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function lightGallery(){
    scheduled=false;
    const height=innerHeight,width=document.documentElement.clientWidth,bounds=room.getBoundingClientRect();
    const inGallery=bounds.top<height*.72&&bounds.bottom>height*.28&&!dialog.open;
    rig.classList.toggle('illuminated',inGallery);
    const measured=frames.filter(frame=>!frame.closest('[hidden]')).map(frame=>({frame,rect:frame.querySelector('.photo-button').getBoundingClientRect()})).filter(({rect})=>rect.bottom>0&&rect.top<height);
    const leftSource={x:24,y:height*.43},rightSource={x:width-24,y:height*.63};
    const mouse=pointer&&finePointer.matches&&!reduced.matches&&inGallery?pointer:null;
    function targetFor(side){
      if(mouse)return {x:clamp(mouse.x,45,width-45),y:clamp(mouse.y,90,height-50)};
      const source=side==='left'?leftSource:rightSource;
      let selected=null,score=Infinity;
      for(const item of measured){const {rect}=item,x=rect.left+rect.width*.5,y=clamp(source.y,rect.top+rect.height*.18,rect.bottom-rect.height*.18);const candidate=Math.abs(y-source.y)+Math.abs(x-source.x)*.28;if(candidate<score){score=candidate;selected={x,y:clamp(y,100,height-55)};}}
      return selected||{x:width*.5,y:height*.5};
    }
    const left=targetFor('left'),right=targetFor('right');
    const desired={left:clamp(Math.atan2(left.y-leftSource.y,Math.max(45,left.x-leftSource.x))*180/Math.PI,-68,68),right:clamp(Math.atan2(right.y-rightSource.y,Math.max(45,rightSource.x-right.x))*180/Math.PI,-68,68)};
    const now=performance.now(),dt=lastTime?Math.min(50,now-lastTime):16;lastTime=now;
    const ease=reduced.matches?1:1-Math.exp(-dt/100);
    for(const side of ['left','right'])angles[side]+=(desired[side]-angles[side])*ease;
    rig.style.setProperty('--left-angle',`${angles.left.toFixed(3)}deg`);
    rig.style.setProperty('--right-angle',`${angles.right.toFixed(3)}deg`);
    rig.dataset.tracking=mouse?'pointer':'scroll';
    for(const {frame,rect} of measured){
      const x=rect.left+rect.width*.5,y=rect.top+rect.height*.5;
      const scrollLevel=clamp(1-Math.abs(y-height*.5)/(height*.85),0,1);
      const distance=mouse?Math.hypot(Math.max(rect.left-mouse.x,0,mouse.x-rect.right),Math.max(rect.top-mouse.y,0,mouse.y-rect.bottom)):0;
      const level=mouse?clamp(1-distance/450,.12,1):scrollLevel;
      frame.style.setProperty('--light-level',reduced.matches?'.28':(.18+level*.67).toFixed(3));
      const edge=mouse||leftSource;
      frame.style.setProperty('--left-edge-angle',`${Math.atan2(edge.y-y,edge.x-x)*180/Math.PI+90}deg`);
      frame.style.setProperty('--right-edge-angle',`${Math.atan2(rightSource.y-y,rightSource.x-x)*180/Math.PI+90}deg`);
      frame.style.setProperty('--light-x',`${mouse?clamp((mouse.x-rect.left)/rect.width*100,0,100):20}%`);
      frame.style.setProperty('--light-y',`${mouse?clamp((mouse.y-rect.top)/rect.height*100,0,100):40}%`);
    }
    if(inGallery&&!reduced.matches&&(Math.abs(desired.left-angles.left)>.05||Math.abs(desired.right-angles.right)>.05))scheduleLights();
  }
  function scheduleLights(){if(!scheduled){scheduled=true;requestAnimationFrame(lightGallery);}}
  addEventListener('scroll',()=>{pointer=null;scheduleLights();},{passive:true});addEventListener('resize',scheduleLights);
  addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&finePointer.matches){pointer={x:event.clientX,y:event.clientY};scheduleLights();}},{passive:true});
  document.addEventListener('pointerleave',()=>{pointer=null;scheduleLights();});
  reduced.addEventListener('change',scheduleLights);
  dialog.addEventListener('close',scheduleLights);
  filters.forEach(button=>button.addEventListener('click',scheduleLights));
  document.fonts.ready.then(scheduleLights);lightGallery();
})();
