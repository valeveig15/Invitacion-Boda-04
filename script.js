(() => {
'use strict';
const invite=document.getElementById('invite');
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const modal=qs('#modal'), modalBody=qs('#modalBody');
const audio=qs('#siteAudio'), musicFab=qs('#musicFab');
const lightbox=qs('#lightbox'), lbImg=qs('#lightboxImg');
let items=[],lbIndex=0;

qsa('[data-next]').forEach(b=>b.addEventListener('click',()=>qs('#cuenta-regresiva')?.scrollIntoView({behavior:'smooth'})));

function countdown(){
  const target=new Date(invite.dataset.date).getTime();
  const diff=Math.max(0,target-Date.now());
  const vals=[['días',Math.floor(diff/86400000)],['hrs',Math.floor(diff%86400000/3600000)],['min',Math.floor(diff%3600000/60000)],['seg',Math.floor(diff%60000/1000)]];
  qsa('[data-countdown]').forEach(el=>el.innerHTML=vals.map(([l,v])=>`<div class="unit"><b>${String(v).padStart(2,'0')}</b><span>${l}</span></div>`).join(''));
}
countdown();setInterval(countdown,1000);

const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const reveal=qsa('.reveal,.animated-icon');
if(reduce||!('IntersectionObserver'in window)) reveal.forEach(x=>x.classList.add('is-visible'));
else{
  const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -7% 0px'});
  reveal.forEach(x=>io.observe(x));
}

// Botanical frame follows pointer very slightly on desktop for depth.
if(!reduce && matchMedia('(pointer:fine)').matches){
  const hero=qs('.hero'), leaves=qsa('.leaf-shadow',hero);
  hero?.addEventListener('pointermove',e=>{
    const r=hero.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    leaves.forEach((el,i)=>el.style.translate=`${x*(i?7:10)}px ${y*(i?6:9)}px`);
  });
  hero?.addEventListener('pointerleave',()=>leaves.forEach(el=>el.style.translate='0 0'));
}

function openModal(html){modalBody.innerHTML=html;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
qsa('[data-close]').forEach(b=>b.addEventListener('click',closeModal));

qsa('[data-map]').forEach(b=>b.addEventListener('click',()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.dataset.map||'')}`,'_blank','noopener')));
qs('[data-gift]')?.addEventListener('click',()=>openModal('<h2>Datos bancarios</h2><p><strong>Aquí se incorporan los datos reales de la pareja al personalizar la invitación.</strong><br>Banco, número de cuenta y/o alias.</p>'));
qs('[data-dress]')?.addEventListener('click',()=>openModal('<h2>Dress code</h2><p>Este bloque queda listo para completar con el dress code elegido por Martina y Federico.</p>'));
qs('[data-info]')?.addEventListener('click',()=>openModal('<h2>Info útil</h2><p>Acá pueden agregarse alojamiento, traslados, regreso seguro, teléfonos de remís o cualquier recomendación para los invitados.</p>'));
qs('[data-rsvp]')?.addEventListener('click',()=>{
  openModal('<h2>Confirmación de asistencia</h2><p>Martina & Federico</p><form id="rsvpForm"><input required autocomplete="name" placeholder="Nombre y apellido"><select><option>Confirmo asistencia</option><option>No podré asistir</option></select><textarea placeholder="Mensaje / requerimiento alimentario"></textarea><button class="pill pill-sage" type="submit">ENVIAR</button></form>');
  qs('#rsvpForm')?.addEventListener('submit',e=>{e.preventDefault();openModal('<h2>¡Gracias!</h2><p>Tu respuesta quedó registrada en esta demostración.</p>')});
});
qs('[data-song]')?.addEventListener('click',()=>{
  openModal('<h2>¿Qué canción no puede faltar?</h2><p>Dejanos tu sugerencia para la playlist.</p><form id="songForm"><input autocomplete="name" placeholder="Tu nombre (opcional)"><input required placeholder="Canción"><input placeholder="Artista"><button class="pill pill-beige" type="submit">ENVIAR SUGERENCIA</button></form>');
  qs('#songForm')?.addEventListener('submit',e=>{e.preventDefault();openModal('<h2>¡Anotada! ♫</h2><p>Gracias por sumar tu canción a la fiesta.</p>')});
});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(lightbox.classList.contains('open'))closeLB();else closeModal()}if(lightbox.classList.contains('open')&&e.key==='ArrowRight')stepLB(1);if(lightbox.classList.contains('open')&&e.key==='ArrowLeft')stepLB(-1)});

items=qsa('.photo');items.forEach((img,i)=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Ampliar foto');img.addEventListener('click',()=>openLB(i));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLB(i)}})});
function renderLB(){const im=items[lbIndex];if(im)lbImg.src=im.currentSrc||im.src}
function openLB(i){lbIndex=i;renderLB();lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false')}
function closeLB(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');lbImg.removeAttribute('src')}
function stepLB(n){lbIndex=(lbIndex+n+items.length)%items.length;renderLB()}
qsa('[data-lightbox-close]').forEach(b=>b.addEventListener('click',closeLB));qs('#lightboxPrev')?.addEventListener('click',()=>stepLB(-1));qs('#lightboxNext')?.addEventListener('click',()=>stepLB(1));

function updateMusic(){if(!audio||!musicFab)return;const playing=!audio.paused&&!audio.muted;musicFab.classList.toggle('is-playing',playing);musicFab.classList.toggle('is-muted',!playing);musicFab.setAttribute('aria-pressed',String(!playing));musicFab.setAttribute('aria-label',playing?'Silenciar música':'Activar música')}
async function startMusic(){if(!audio||!audio.paused)return true;try{audio.volume=.45;audio.muted=false;await audio.play();updateMusic();return true}catch(e){updateMusic();return false}}
audio?.load();startMusic();
const unlock=async()=>{if(await startMusic()){document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true)}};document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
musicFab?.addEventListener('click',async e=>{e.stopPropagation();if(audio.paused){audio.muted=false;await startMusic()}else audio.muted=!audio.muted;updateMusic()});['play','pause','volumechange','canplay'].forEach(ev=>audio?.addEventListener(ev,updateMusic));updateMusic();
})();
