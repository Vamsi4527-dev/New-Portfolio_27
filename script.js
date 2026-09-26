// Global GSAP and ScrollTrigger Availability Check
var hasGSAP = typeof gsap !== 'undefined';
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
var hasScrollTrigger = typeof ScrollTrigger !== 'undefined' && !isTouchDevice;

if (hasGSAP && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- mobile hamburger menu ---------- */
var mobileToggle = document.getElementById('mobileMenuToggle');
var mobileOverlay = document.getElementById('mobileMenuOverlay');
var mobileLinks = document.querySelectorAll('[data-mobile-nav]');

function closeMobileMenu() {
  if (!mobileToggle || !mobileOverlay) return;
  mobileToggle.classList.remove('active');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.setAttribute('aria-label', 'Open menu');
  mobileOverlay.classList.remove('active');
  mobileOverlay.setAttribute('aria-hidden', 'true');
  if (window.lenis) window.lenis.start();
}

if (mobileToggle && mobileOverlay) {
  mobileToggle.addEventListener('click', function() {
    var isActive = mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', String(isActive));
    mobileToggle.setAttribute('aria-label', isActive ? 'Close menu' : 'Open menu');
    mobileOverlay.classList.toggle('active', isActive);
    mobileOverlay.setAttribute('aria-hidden', String(!isActive));
    if (window.lenis) isActive ? window.lenis.stop() : window.lenis.start();
  });

  for (var menuIndex = 0; menuIndex < mobileLinks.length; menuIndex++) {
    mobileLinks[menuIndex].addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeMobileMenu();
  });
}

/* ---------- lenis smooth scroll ---------- */
if (hasGSAP && hasScrollTrigger && prefersReducedMotion === false && window.Lenis) {
  try {
    var lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1.5, touchMultiplier: 2 });
    lenis.on('scroll', function() { ScrollTrigger.update(); });
    gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('Lenis scroll initialization skipped:', e);
  }
}

/* ---------- cursor ---------- */
var cursor = document.getElementById('cursor');
var cursorRing = document.getElementById('cursorRing');

if (prefersReducedMotion === false && isTouchDevice === false && cursor && cursorRing) {
  // Move cursor with mouse
  window.addEventListener('pointermove', function(event) {
    if (hasGSAP) {
      gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.06, ease: 'power2.out' });
      gsap.to(cursorRing, { x: event.clientX, y: event.clientY, duration: 0.2, ease: 'power3.out' });
    } else {
      cursor.style.transform = 'translate(' + (event.clientX - 8) + 'px, ' + (event.clientY - 8) + 'px)';
      cursorRing.style.transform = 'translate(' + (event.clientX - 20) + 'px, ' + (event.clientY - 20) + 'px)';
    }
  });

  // Add hover effect to links and buttons
  var hoverElements = document.querySelectorAll('a, button, [data-mobile-nav]');
  for (var i = 0; i < hoverElements.length; i++) {
    hoverElements[i].addEventListener('mouseenter', function() {
      cursor.classList.add('hover'); cursorRing.classList.add('hover');
    });
    hoverElements[i].addEventListener('mouseleave', function() {
      cursor.classList.remove('hover'); cursorRing.classList.remove('hover');
    });
  }
}

/* ---------- magnetic buttons ---------- */
if (hasGSAP && prefersReducedMotion === false && isTouchDevice === false) {
  var magneticElements = document.querySelectorAll('.btn, .theme-toggle, .socials a, .brand-mark, .mobile-menu-toggle');
  
  for (var i = 0; i < magneticElements.length; i++) {
    (function(el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      
      el.addEventListener('mousemove', function(event) {
        var rect = this.getBoundingClientRect(); 
        var distanceX = event.clientX - (rect.left + rect.width / 2);
        var distanceY = event.clientY - (rect.top + rect.height / 2);
        xTo(distanceX * 0.35);
        yTo(distanceY * 0.35);
      });
      
      el.addEventListener('mouseleave', function() {
        xTo(0); yTo(0);
      });
    })(magneticElements[i]);
  }
}

/* ---------- scroll progress bar ---------- */
window.addEventListener('scroll', function() {
  var html = document.documentElement;
  var progressEl = document.getElementById('progress');
  if (progressEl) {
    var percentage = (html.scrollTop / (html.scrollHeight - html.clientHeight)) * 100;
    progressEl.style.width = percentage + '%';
  }
});

/* ---------- nav scroll styling ---------- */
if (hasGSAP && hasScrollTrigger) {
  ScrollTrigger.create({
    start: 'top -10', end: 99999,
    toggleClass: { targets: 'nav', className: 'scrolled' }
  });
} else {
  window.addEventListener('scroll', function() {
    var nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 10) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  });
}

/* ---------- theme toggle ---------- */
var themeToggle = document.getElementById('themeToggle');
var rootElement = document.documentElement;

if (themeToggle) {
  themeToggle.addEventListener('click', function(event) {
    var nextTheme = rootElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    
    if (prefersReducedMotion || !document.startViewTransition) {
      rootElement.setAttribute('data-theme', nextTheme);
      return;
    }
    
    var endRadius = Math.hypot(Math.max(event.clientX, window.innerWidth - event.clientX), Math.max(event.clientY, window.innerHeight - event.clientY));
    rootElement.style.setProperty('--vt-x', event.clientX + 'px');
    rootElement.style.setProperty('--vt-y', event.clientY + 'px');
    rootElement.style.setProperty('--vt-r', endRadius + 'px');
    
    document.startViewTransition(function() {
      rootElement.setAttribute('data-theme', nextTheme);
    });
  });
}

/* ---------- ambient background parallax ---------- */
var bgField = document.getElementById('bgField');
if (bgField && !prefersReducedMotion && hasGSAP && hasScrollTrigger) {
  gsap.to(bgField, {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
  });
}

/* ---------- particle background ---------- */
var canvas = document.getElementById('particles');
if (canvas) {
  var ctx = canvas.getContext('2d');
  var mouseX = 0;
  var mouseY = 0;
  var dots = [];
  var totalDots = 60;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('pointermove', function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  for (var i = 0; i < totalDots; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var isDark = rootElement.getAttribute('data-theme') !== 'light';
    var dotColor = isDark ? 'rgba(245,245,243,' : 'rgba(11,11,11,';
    var lineColor = isDark ? 'rgba(245,245,243,' : 'rgba(11,11,11,';
    
    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      dot.x = dot.x + dot.speedX;
      dot.y = dot.y + dot.speedY;
      
      var distToMouse = Math.sqrt((dot.x - mouseX) * (dot.x - mouseX) + (dot.y - mouseY) * (dot.y - mouseY));
      if (distToMouse < 120) {
        dot.x = dot.x + (dot.x - mouseX) * 0.02;
        dot.y = dot.y + (dot.y - mouseY) * 0.02;
      }
      
      if (dot.x < 0) { dot.x = canvas.width; }
      if (dot.x > canvas.width) { dot.x = 0; }
      if (dot.y < 0) { dot.y = canvas.height; }
      if (dot.y > canvas.height) { dot.y = 0; }
      
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = dotColor + '0.5)';
      ctx.fill();
      
      for (var j = i + 1; j < dots.length; j++) {
        var other = dots[j];
        var dist = Math.sqrt((dot.x - other.x) * (dot.x - other.x) + (dot.y - other.y) * (dot.y - other.y));
        if (dist < 140) {
          var opacity = (1 - dist / 140) * 0.15;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = lineColor + opacity + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(drawParticles);
  }

  if (!prefersReducedMotion) {
    drawParticles();
  }
}

/* ---------- intro preloader & text split ---------- */
function dismissIntro() {
  var intro = document.getElementById('intro');
  if (intro && intro.style.display !== 'none') {
    intro.style.transition = 'opacity 0.6s ease';
    intro.style.opacity = '0';
    intro.style.pointerEvents = 'none';
    setTimeout(function() { intro.style.display = 'none'; }, 600);
  }
}

var wordsArray = "DASARI VAMSI KRISHNA".split(' ');
var introWord = document.getElementById('introWord');

if (introWord) {
  introWord.innerHTML = '';
  for (var i = 0; i < wordsArray.length; i++) {
    var lettersArray = wordsArray[i].split('');
    for (var j = 0; j < lettersArray.length; j++) {
      var letterSpan = document.createElement('span');
      letterSpan.textContent = lettersArray[j];
      letterSpan.style.animationDelay = ((i * 8 + j) * 0.035) + 's';
      introWord.appendChild(letterSpan);
    }
    if (i < wordsArray.length - 1) {
      var spaceSpan = document.createElement('span');
      spaceSpan.innerHTML = '&nbsp;';
      introWord.appendChild(spaceSpan);
    }
  }
}

// The CSS intro animation is independent of external animation libraries.
setTimeout(dismissIntro, 2200);

/* ---------- Split hero display headline into interactive letter spans ---------- */
var heroDisplay = document.querySelector('.hero-display');
var heroLines = document.querySelectorAll('.hero-display-line');

heroLines.forEach(function(line) {
  var text = line.textContent.trim();
  line.innerHTML = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var span = document.createElement('span');
    span.className = 'hero-char';
    if (ch === ' ') {
      span.innerHTML = '&nbsp;';
      span.classList.add('hero-space');
    } else {
      span.textContent = ch;
    }
    line.appendChild(span);
  }
});

if (heroDisplay && !prefersReducedMotion && hasGSAP) {
  heroDisplay.addEventListener('mousemove', function(e) {
    var chars = heroDisplay.querySelectorAll('.hero-char:not(.hero-space)');
    chars.forEach(function(char) {
      var rect = char.getBoundingClientRect();
      var charX = rect.left + rect.width / 2;
      var charY = rect.top + rect.height / 2;
      var dist = Math.hypot(e.clientX - charX, e.clientY - charY);
      var maxDist = 90;
      if (dist < maxDist) {
        var factor = 1 - (dist / maxDist);
        var translateY = -14 * factor;
        var scale = 1 + 0.22 * factor;
        gsap.to(char, {
          y: translateY,
          scale: scale,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        gsap.to(char, {
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  });

  heroDisplay.addEventListener('mouseleave', function() {
    var chars = heroDisplay.querySelectorAll('.hero-char');
    gsap.to(chars, {
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  });
}

/* ---------- hero display lines — slide-up reveal ---------- */
var revealDelay = prefersReducedMotion ? 0 : 0.4;

if (hasGSAP && !prefersReducedMotion) {
  gsap.fromTo(heroLines,
    { y: 120, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.14,
      delay: revealDelay
    }
  );
} else {
  heroLines.forEach(function(line) {
    line.style.opacity = '1';
  });
}

// Supporting elements reveal
var subDelay = prefersReducedMotion ? 0 : 0.6;
if (hasGSAP) {
  gsap.fromTo('.hero-bottom, .hero-eyebrow, .scroll-cue',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: subDelay }
  );
} else {
  var heroSubEls = document.querySelectorAll('.hero-bottom, .hero-eyebrow, .scroll-cue');
  heroSubEls.forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
}

if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
  gsap.to('.hero', {
    opacity: 0.15, scale: 0.96, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ---------- section title mask reveal ---------- */
var sectionTitles = document.querySelectorAll('.sec-title');
for (var i = 0; i < sectionTitles.length; i++) {
  var wordsList = sectionTitles[i].textContent.trim().split(/\s+/);
  var newHTML = [];
  for (var j = 0; j < wordsList.length; j++) {
    newHTML.push('<span class="mask-line"><span>' + wordsList[j] + '</span></span>');
  }
  sectionTitles[i].innerHTML = newHTML.join(' ');
  
  var innerSpans = sectionTitles[i].querySelectorAll('.mask-line > span');
  if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.to(innerSpans, {
      y: '0%', duration: 0.9, stagger: 0.06, ease: 'power4.out',
      scrollTrigger: { trigger: sectionTitles[i], start: 'top 90%' }
    });
  } else {
    for (var k = 0; k < innerSpans.length; k++) {
      innerSpans[k].style.transform = 'translateY(0%)';
    }
  }
}

/* ---------- generic scroll reveals ---------- */
var revealElements = document.querySelectorAll('.reveal');
for (var i = 0; i < revealElements.length; i++) {
  var el = revealElements[i];
  var isCustom = el.classList.contains('exp-row') || el.classList.contains('proj') || 
                 el.classList.contains('cert-list') || el.classList.contains('skill-groups');
  
  if (!isCustom) {
    if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
      gsap.to(el, {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    } else {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  }
}

/* ---------- skills animations ---------- */
if (hasGSAP) {
  gsap.set('.skill-groups', { opacity: 1, y: 0 });
} else {
  var sgEl = document.querySelector('.skill-groups');
  if (sgEl) sgEl.style.opacity = '1';
}

var skillGroups = document.querySelectorAll('.skill-group');
for (var i = 0; i < skillGroups.length; i++) {
  var tiles = skillGroups[i].querySelectorAll('.tile');
  if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.fromTo(tiles, { opacity: 0, y: 18, scale: 0.9 }, { 
      opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.05,
      scrollTrigger: { trigger: skillGroups[i], start: 'top 88%' }
    });
  } else {
    for (var k = 0; k < tiles.length; k++) {
      tiles[k].style.opacity = '1';
      tiles[k].style.transform = 'none';
    }
  }
}

if (!isTouchDevice) {
  var allTiles = document.querySelectorAll('.tile');
  for (var i = 0; i < allTiles.length; i++) {
    allTiles[i].addEventListener('mousemove', function(event) {
      var rect = this.getBoundingClientRect();
      this.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100) + '%');
      this.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100) + '%');
    });
  }
}

/* ---------- skill group parallax depth ---------- */
if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
  for (var i = 0; i < skillGroups.length; i++) {
    var speed = 10 + (i * 15);
    gsap.to(skillGroups[i], {
      y: -speed, ease: 'none',
      scrollTrigger: { trigger: skillGroups[i], start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
}

/* ---------- experience rows slide-in ---------- */
var expRows = document.querySelectorAll('.exp-row');
for (var i = 0; i < expRows.length; i++) {
  if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    var startX = (i % 2 === 0) ? -50 : 50;
    gsap.fromTo(expRows[i], { opacity: 0, x: startX, y: 20 }, { 
      opacity: 1, x: 0, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: expRows[i], start: 'top 85%' }
    });
  } else {
    expRows[i].style.opacity = '1';
    expRows[i].style.transform = 'none';
  }
}

/* ---------- experience timeline scroll progress ---------- */
var timelineFill = document.getElementById('timelineFill');
var expTimeline = document.getElementById('expTimeline');

if (timelineFill && expTimeline && hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
  gsap.to(timelineFill, {
    height: '100%', ease: 'none',
    scrollTrigger: {
      trigger: expTimeline, start: 'top 80%', end: 'bottom 20%', scrub: 0.3
    }
  });
}

/* ---------- projects reveals ---------- */
var projects = document.querySelectorAll('.proj');
for (var i = 0; i < projects.length; i++) {
  var glow = document.createElement('span');
  glow.className = 'proj-glow';
  projects[i].insertBefore(glow, projects[i].firstChild);
  if (!isTouchDevice) {
    projects[i].addEventListener('mouseenter', function() {
      var preview = this.querySelector('.proj-preview-window');
      if (preview) {
        if (hasGSAP) {
          gsap.to(preview, { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          preview.style.opacity = '1';
          preview.style.transform = 'scale(1)';
        }
      }
    });

    projects[i].addEventListener('mouseleave', function() {
      var preview = this.querySelector('.proj-preview-window');
      if (preview) {
        if (hasGSAP) {
          gsap.to(preview, { opacity: 0, scale: 0.85, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          preview.style.opacity = '0';
          preview.style.transform = 'scale(0.85)';
        }
      }
    });

    projects[i].addEventListener('mousemove', function(event) {
      var rect = this.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      var glowElement = this.querySelector('.proj-glow');
      if (glowElement) {
        glowElement.style.setProperty('--mx', (x / rect.width * 100) + '%');
        glowElement.style.setProperty('--my', (y / rect.height * 100) + '%');
      }

      var preview = this.querySelector('.proj-preview-window');
      if (preview) {
        var previewH = preview.offsetHeight;
        if (hasGSAP) {
          gsap.to(preview, {
            x: x + 35,
            y: y - previewH / 2,
            duration: prefersReducedMotion ? 0 : 0.35,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        } else {
          preview.style.left = (x + 35) + 'px';
          preview.style.top = (y - previewH / 2) + 'px';
        }
      }
    });
  }
  
  if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.fromTo(projects[i], { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { 
      opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power4.inOut',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: projects[i], start: 'top 85%' }
    });
  } else {
    projects[i].style.opacity = '1';
    projects[i].style.clipPath = 'none';
  }
}

/* ---------- certifications stagger ---------- */
if (hasGSAP) {
  gsap.set('.cert-list', { opacity: 1, y: 0 });
} else {
  var clEl = document.querySelector('.cert-list');
  if (clEl) { clEl.style.opacity = '1'; clEl.style.transform = 'none'; }
}

var certRowsNodes = document.querySelectorAll('.cert-row');
if (certRowsNodes.length > 0) {
  if (hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.fromTo(certRowsNodes, { opacity: 0, y: 24 }, { 
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.cert-list', start: 'top 95%', toggleActions: 'play none none none' }
    });
  } else {
    for (var k = 0; k < certRowsNodes.length; k++) {
      certRowsNodes[k].style.opacity = '1';
      certRowsNodes[k].style.transform = 'none';
    }
  }
}

/* ---------- certifications hover/preview ---------- */
var certs = document.querySelectorAll('.cert-row');
for (var i = 0; i < certs.length; i++) {
  var glow = document.createElement('span');
  glow.className = 'cert-glow';
  certs[i].insertBefore(glow, certs[i].firstChild);

  if (!isTouchDevice) {
    certs[i].addEventListener('mouseenter', function() {
      var preview = this.querySelector('.cert-preview-window');
      if (preview) {
        if (hasGSAP) {
          gsap.to(preview, { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          preview.style.opacity = '1';
          preview.style.transform = 'scale(1)';
        }
      }
    });

    certs[i].addEventListener('mouseleave', function() {
      var preview = this.querySelector('.cert-preview-window');
      if (preview) {
        if (hasGSAP) {
          gsap.to(preview, { opacity: 0, scale: 0.85, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          preview.style.opacity = '0';
          preview.style.transform = 'scale(0.85)';
        }
      }
    });

    certs[i].addEventListener('mousemove', function(event) {
      var rect = this.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      var glowElement = this.querySelector('.cert-glow');
      if (glowElement) {
        glowElement.style.setProperty('--mx', (x / rect.width * 100) + '%');
        glowElement.style.setProperty('--my', (y / rect.height * 100) + '%');
      }

      var preview = this.querySelector('.cert-preview-window');
      if (preview) {
        if (hasGSAP) {
          gsap.to(preview, {
            x: x + 35,
            y: y - 120,
            duration: prefersReducedMotion ? 0 : 0.35,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        } else {
          preview.style.left = (x + 35) + 'px';
          preview.style.top = (y - 120) + 'px';
        }
      }
    });
  }
}

/* ---------- leetcode stats ---------- */
(function() {
  var LC_USERNAME = 'gB0getrBDb';

  var STATIC_DATA = {
    totalSolved: 178,
    streak: 12,
    totalActiveDays: 90,
    submissionCalendar: "{\"1767225600\": 7, \"1767312000\": 7, \"1767571200\": 3, \"1767744000\": 1, \"1768176000\": 3, \"1768262400\": 2, \"1769212800\": 2, \"1769385600\": 5, \"1769558400\": 6, \"1769644800\": 1, \"1769817600\": 3, \"1770768000\": 2, \"1770854400\": 1, \"1771027200\": 7, \"1771459200\": 3, \"1771632000\": 1, \"1771718400\": 1, \"1772323200\": 12, \"1772582400\": 4, \"1772755200\": 3, \"1772841600\": 2, \"1772928000\": 1, \"1775260800\": 1, \"1778112000\": 1, \"1780790400\": 2, \"1781222400\": 2, \"1782086400\": 3, \"1782777600\": 2, \"1783036800\": 4, \"1783123200\": 3, \"1783296000\": 7, \"1783382400\": 2, \"1783814400\": 3, \"1783900800\": 7, \"1783987200\": 14, \"1784073600\": 13, \"1784160000\": 9, \"1784246400\": 6, \"1784332800\": 6, \"1784419200\": 2, \"1784505600\": 8, \"1784592000\": 4, \"1784678400\": 13, \"1784764800\": 8, \"1784937600\": 2, \"1785456000\": 3, \"1785542400\": 4, \"1785628800\": 3, \"1785715200\": 3, \"1785801600\": 7, \"1785888000\": 6, \"1785974400\": 5, \"1786060800\": 2, \"1786147200\": 4, \"1786320000\": 7, \"1786406400\": 3, \"1786492800\": 3, \"1786579200\": 7, \"1786752000\": 1, \"1786924800\": 1, \"1787011200\": 3, \"1787097600\": 2, \"1787184000\": 4, \"1787270400\": 1, \"1787356800\": 3, \"1787616000\": 3, \"1756944000\": 1, \"1757030400\": 1, \"1757203200\": 1, \"1757635200\": 2, \"1757721600\": 1, \"1757894400\": 1, \"1758240000\": 4, \"1758931200\": 2, \"1759190400\": 1, \"1759276800\": 1, \"1759536000\": 1, \"1759881600\": 5, \"1760486400\": 1, \"1765324800\": 1, \"1765929600\": 1, \"1766016000\": 3, \"1766102400\": 1, \"1766275200\": 2, \"1766534400\": 1, \"1766620800\": 2, \"1766707200\": 1, \"1766880000\": 3, \"1766966400\": 3, \"1767052800\": 4}"
  };

  var lcTotal = document.getElementById('lcTotal');
  var lcStreak = document.getElementById('lcStreak');
  var lcActiveDays = document.getElementById('lcActiveDays');
  var lcStatus = document.getElementById('lcStatus');
  var lcHeatmapGrid = document.getElementById('lcHeatmapGrid');
  var lcHeatmapScroll = document.getElementById('lcHeatmapScroll');
  var lcTooltip = document.getElementById('lcTooltip');
  var lcTooltipNum = document.getElementById('lcTooltipNum');
  var lcTooltipSub = document.getElementById('lcTooltipSub');
  var lcTooltipDate = document.getElementById('lcTooltipDate');
  var lcRetryBtn = document.getElementById('lcRetryBtn');

  if (!lcHeatmapGrid) return;

  function formatDateKey(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function animateCount(el, target) {
    if (!el) return;
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function buildHeatmap(calendarStr) {
    var raw;
    try { raw = JSON.parse(calendarStr || '{}'); } catch(e) { raw = {}; }

    var dayMap = {};
    var maxCount = 1;
    var maxTs = 0;

    for (var ts in raw) {
      var nts = Number(ts);
      if (nts > maxTs) maxTs = nts;
      var d = new Date(nts * 1000);
      var key = formatDateKey(d);
      var count = raw[ts];
      dayMap[key] = (dayMap[key] || 0) + count;
      if (dayMap[key] > maxCount) maxCount = dayMap[key];
    }

    function toLevel(c) {
      if (!c || c <= 0) return 0;
      if (c <= maxCount * 0.25) return 1;
      if (c <= maxCount * 0.50) return 2;
      if (c <= maxCount * 0.75) return 3;
      return 4;
    }

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var latestSubmissionDate = maxTs > 0 ? new Date(maxTs * 1000) : today;
    var refDate = latestSubmissionDate > today ? latestSubmissionDate : today;

    var endWeek = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
    var endDow = endWeek.getDay();
    endWeek.setDate(endWeek.getDate() + (6 - endDow));

    var startWeek = new Date(endWeek.getTime());
    startWeek.setDate(startWeek.getDate() - (52 * 7) + 1);

    lcHeatmapGrid.innerHTML = '';
    var cursor = new Date(startWeek.getTime());
    var col = document.createElement('div');
    col.className = 'lc-heatmap-col';
    var dayCountInWeek = 0;

    while (cursor <= endWeek) {
      var dateKey = formatDateKey(cursor);
      var isFuture = cursor > today && cursor > latestSubmissionDate;
      var count = isFuture ? 0 : (dayMap[dateKey] || 0);
      var level = toLevel(count);

      var cell = document.createElement('div');
      cell.className = 'lc-heatmap-cell lc-l' + level;
      cell.setAttribute('data-date', dateKey);
      cell.setAttribute('data-count', count);
      cell.setAttribute('data-dow', cursor.toLocaleDateString('en-US', { weekday: 'short' }));
      cell.setAttribute('data-mday', cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      cell.setAttribute('data-year', cursor.getFullYear());

      col.appendChild(cell);
      dayCountInWeek++;

      if (dayCountInWeek === 7) {
        lcHeatmapGrid.appendChild(col);
        col = document.createElement('div');
        col.className = 'lc-heatmap-col';
        dayCountInWeek = 0;
      }

      cursor.setDate(cursor.getDate() + 1);
    }
    if (dayCountInWeek > 0) {
      lcHeatmapGrid.appendChild(col);
    }

    setTimeout(function() {
      if (lcHeatmapScroll) {
        lcHeatmapScroll.scrollLeft = lcHeatmapScroll.scrollWidth;
      }
    }, 150);

    var cells = lcHeatmapGrid.querySelectorAll('.lc-heatmap-cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].addEventListener('mouseenter', function() {
        var count = parseInt(this.getAttribute('data-count'), 10) || 0;
        var dow = this.getAttribute('data-dow') + ',';
        var mday = this.getAttribute('data-mday') + ',';
        var year = this.getAttribute('data-year');

        if (lcTooltipNum) lcTooltipNum.textContent = count;
        if (lcTooltipSub) lcTooltipSub.textContent = count === 1 ? 'submission' : 'submissions';
        if (lcTooltipDate) lcTooltipDate.innerHTML = dow + '<br>' + mday + '<br>' + year;
        if (lcTooltip) {
          lcTooltip.style.display = 'block';
          var rect = this.getBoundingClientRect();
          lcTooltip.style.left = (rect.left + rect.width / 2) + 'px';
          lcTooltip.style.top = (rect.top - 8) + 'px';
        }
      });

      cells[i].addEventListener('mouseleave', function() {
        if (lcTooltip) lcTooltip.style.display = 'none';
      });
    }
  }

  function renderStats(data, isLive) {
    if (lcTotal) animateCount(lcTotal, data.totalSolved);
    if (lcStreak) animateCount(lcStreak, data.streak);
    if (lcActiveDays) lcActiveDays.textContent = data.totalActiveDays + ' active days';
    if (lcStatus) lcStatus.textContent = isLive ? '[live]' : '[synced]';

    buildHeatmap(data.submissionCalendar);
  }

  function fetchLive() {
    if (lcRetryBtn) lcRetryBtn.classList.add('loading');
    var base = 'https://alfa-leetcode-api.onrender.com';

    function fetchWithTimeout(url, ms) {
      var ctrl = new AbortController();
      var id = setTimeout(function() { ctrl.abort(); }, ms);
      return fetch(url, { signal: ctrl.signal }).then(function(r) {
        clearTimeout(id);
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      });
    }

    Promise.all([
      fetchWithTimeout(base + '/userProfile/' + LC_USERNAME, 9000),
      fetchWithTimeout(base + '/' + LC_USERNAME + '/calendar', 9000)
    ]).then(function(res) {
      var profile = res[0];
      var cal = res[1];
      var calStr = cal.submissionCalendar || cal;
      var liveData = {
        totalSolved: profile.totalSolved || STATIC_DATA.totalSolved,
        streak: cal.streak || cal.currentStreak || STATIC_DATA.streak,
        totalActiveDays: cal.totalActiveDays || STATIC_DATA.totalActiveDays,
        submissionCalendar: typeof calStr === 'string' ? calStr : JSON.stringify(calStr)
      };
      renderStats(liveData, true);
    }).catch(function() {
      renderStats(STATIC_DATA, false);
    }).finally(function() {
      if (lcRetryBtn) lcRetryBtn.classList.remove('loading');
    });
  }

  renderStats(STATIC_DATA, false);
  fetchLive();

  if (lcRetryBtn) {
    lcRetryBtn.addEventListener('click', function() {
      fetchLive();
    });
  }
})();

/* ---------- active nav link ---------- */
var navLinks = document.querySelectorAll('[data-nav]');
var mobileNavLinks = document.querySelectorAll('[data-mobile-nav]');
var navSections = [
  { id: 'hero', navIndex: 0 },
  { id: 'about', navIndex: 1 },
  { id: 'skills', navIndex: 2 },
  { id: 'work', navIndex: 4 },
  { id: 'leetcode', navIndex: 4 },
  { id: 'projects', navIndex: 3 },
  { id: 'certs', navIndex: 3 },
  { id: 'contact', navIndex: 5 }
];

function setActive(index) {
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].classList.remove('active');
  }
  if (navLinks[index]) {
    navLinks[index].classList.add('active');
  }
  
  for (var j = 0; j < mobileNavLinks.length; j++) {
    mobileNavLinks[j].classList.remove('active');
  }
  if (mobileNavLinks[index]) {
    mobileNavLinks[index].classList.add('active');
  }
}

for (var i = 0; i < navSections.length; i++) {
  var navSection = navSections[i];
  var section = document.getElementById(navSection.id);
  if (section) {
    (function(index, triggerSection) {
      if (hasGSAP && hasScrollTrigger) {
        ScrollTrigger.create({
          trigger: triggerSection, start: 'top 50%', end: 'bottom 50%',
          onEnter: function() { setActive(index); }, 
          onEnterBack: function() { setActive(index); }
        });
      }
    })(navSection.navIndex, section);
  }
}

if (!hasGSAP || !hasScrollTrigger) {
  window.addEventListener('scroll', function() {
    var scrollPos = window.scrollY + window.innerHeight / 2;
    for (var i = 0; i < navSections.length; i++) {
      var sec = document.getElementById(navSections[i].id);
      if (sec) {
        var top = sec.offsetTop;
        var height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActive(navSections[i].navIndex);
          break;
        }
      }
    }
  });
}

/* ---------- Global ScrollTrigger Refresh & Safety Fallback ---------- */
window.addEventListener('load', function() {
  if (hasGSAP && hasScrollTrigger) {
    setTimeout(function() { ScrollTrigger.refresh(); }, 100);
  }
  
  var certList = document.querySelector('.cert-list');
  if (certList) {
    certList.style.opacity = '1';
  }
  
  var certRows = document.querySelectorAll('.cert-row');
  for (var i = 0; i < certRows.length; i++) {
    var row = certRows[i];
    if (window.getComputedStyle(row).opacity === '0') {
      row.style.opacity = '1';
      row.style.transform = 'none';
    }
  }
});
