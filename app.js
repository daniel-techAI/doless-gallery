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
  const rig=document.querySelector('.gallery-light-rig');
  const room=document.querySelector('.gallery-section');
  const frames=[...document.querySelectorAll('.photo-card')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled=false;
  function lightGallery(){
    scheduled=false;
    const height=innerHeight,width=innerWidth,bounds=room.getBoundingClientRect();
    const inGallery=bounds.top<height*.7&&bounds.bottom>height*.3;
    rig.classList.toggle('illuminated',inGallery);
    let nearest=null,nearestDistance=Infinity;
    for(const frame of frames){
      if(frame.closest('[hidden]'))continue;
      const rect=frame.getBoundingClientRect();
      if(rect.bottom< -120||rect.top>height+120)continue;
      const center=rect.top+rect.height*.5,distance=Math.abs(center-height*.52);
      const intensity=Math.max(0,1-distance/(height*.78));
      frame.style.setProperty('--light-level',reduced.matches?'.3':intensity.toFixed(3));
      frame.style.setProperty('--light-angle',`${Math.atan2(height*.44-center,-rect.left-rect.width*.5)*180/Math.PI+90}deg`);
      frame.style.setProperty('--float-y',`${reduced.matches?0:Math.max(-13,Math.min(13,(center-height*.5)*-.025))}px`);
      if(distance<nearestDistance){nearest=rect;nearestDistance=distance;}
    }
    if(nearest&&!reduced.matches){
      const x=nearest.left+nearest.width*.5,y=nearest.top+nearest.height*.45;
      rig.style.setProperty('--left-angle',`${Math.atan2(y-height*.43,Math.max(80,x-35))*180/Math.PI}deg`);
      rig.style.setProperty('--right-angle',`${Math.atan2(y-height*.63,Math.max(80,width-x-35))*180/Math.PI}deg`);
    }
  }
  function scheduleLights(){if(!scheduled){scheduled=true;requestAnimationFrame(lightGallery);}}
  addEventListener('scroll',scheduleLights,{passive:true});addEventListener('resize',scheduleLights);
  filters.forEach(button=>button.addEventListener('click',scheduleLights));
  document.fonts.ready.then(scheduleLights);lightGallery();
})();
