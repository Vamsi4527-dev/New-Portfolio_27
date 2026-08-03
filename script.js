(function () {

  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun  = document.getElementById('icon-sun');

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('dvk-theme', t);
    if (t === 'dark') {
      iconMoon.classList.remove('hidden');
      iconSun.classList.add('hidden');
    } else {
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    }
  }

  const saved = localStorage.getItem('dvk-theme');
  const pref  = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (pref ? 'dark' : 'light'));

  themeBtn.addEventListener('click', () => {
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');

  ham.addEventListener('click', () => {
    menu.classList.toggle('open');
    ham.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(l =>
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      ham.classList.remove('open');
    })
  );

  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (i * 60) + 'ms';
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  reveals.forEach(el => obs.observe(el));

  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const progressBar = document.getElementById('progress-bar');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });

    if (progressBar) {
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    }
  }, { passive: true });

  const taglineEl = document.querySelector('.hero-tagline');
  if (taglineEl) {
    const roles = ['Full Stack Python Developer', 'DSA Problem Solver', 'AI & DS Student'];
    let ri = 0, ci = 0, del = false, paused = false;

    function type() {
      if (paused) return;
      const role = roles[ri];
      if (!del) {
        ci++;
        taglineEl.textContent = role.slice(0, ci);
        if (ci === role.length) {
          del = true; paused = true;
          setTimeout(() => { paused = false; }, 1400);
        }
      } else {
        ci--;
        taglineEl.textContent = role.slice(0, ci);
        if (ci === 0) {
          del = false;
          ri = (ri + 1) % roles.length;
          paused = true;
          setTimeout(() => { paused = false; }, 300);
        }
      }
      setTimeout(type, del ? 35 : 70);
    }
    setTimeout(type, 800);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a =>
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
    })
  );

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
