gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- cursor ---------- */
const cursor = document.getElementById('cursor');
if(!reduceMotion){
  window.addEventListener('pointermove', e=>{
    gsap.to(cursor,{x:e.clientX,y:e.clientY,duration:0.15,ease:'power2.out'});
  });
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));
    el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'));
  });
}

/* ---------- scroll progress ---------- */
const progress = document.getElementById('progress');
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const pct = (h.scrollTop)/(h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
});

/* ---------- theme toggle ---------- */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
function setTheme(t){
  root.setAttribute('data-theme', t);
  document.getElementById('introWord') && (document.getElementById('intro').style.background = t==='light' ? '#0b0b0b' : '#0b0b0b');
}
themeToggle.addEventListener('click', ()=>{
  const cur = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  setTheme(cur);
});

/* ---------- intro sequence ---------- */
const word = "DASARI VAMSI KRISHNA";
const introWord = document.getElementById('introWord');
word.split(' ').forEach((w,i)=>{
  w.split('').forEach(ch=>{
    const span = document.createElement('span');
    span.textContent = ch;
    introWord.appendChild(span);
  });
  if(i < word.split(' ').length -1){
    const space = document.createElement('span');
    space.innerHTML='&nbsp;';
    introWord.appendChild(space);
  }
});

const tl = gsap.timeline({defaults:{ease:'power4.out'}});
if(reduceMotion){
  gsap.set('#intro',{display:'none'});
} else {
  tl.to('#introWord span', {y:'0%', duration:0.7, stagger:0.02})
    .to('#introBarFill', {width:'100%', duration:0.5}, "-=0.2")
    .to('#intro', {yPercent:-100, duration:0.9, ease:'power4.inOut'}, "+=0.15")
    .set('#intro',{display:'none'});
}

/* ---------- hero name reveal ---------- */
gsap.to('.hero-name .line span', {
  y:'0%', duration:1, stagger:0.08, ease:'power4.out',
  delay: reduceMotion ? 0 : 2.0
});
gsap.fromTo('.hero-role, .hero-cta, .eyebrow, .scroll-cue',
  {opacity:0, y:16},
  {opacity:1, y:0, duration:0.9, stagger:0.12, ease:'power3.out', delay: reduceMotion ? 0 : 2.3}
);

/* ---------- scroll reveals ---------- */
gsap.utils.toArray('.reveal').forEach(el=>{
  gsap.to(el, {
    opacity:1, y:0, duration:0.9, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 88%' }
  });
});

/* ---------- active nav link ---------- */
const navLinks = document.querySelectorAll('[data-nav]');
const sections = ['hero','about','skills','projects','work','contact'].map(id=>document.getElementById(id));
sections.forEach((sec,i)=>{
  ScrollTrigger.create({
    trigger:sec, start:'top 50%', end:'bottom 50%',
    onEnter:()=>setActive(i), onEnterBack:()=>setActive(i)
  });
});
function setActive(i){
  navLinks.forEach(l=>l.classList.remove('active'));
  navLinks[i] && navLinks[i].classList.add('active');
}
