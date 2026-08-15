// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Check if user prefers reduced motion or uses a touch device
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ---------- lenis smooth scroll ---------- */
if (prefersReducedMotion === false && isTouchDevice === false && window.Lenis) {
  var lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1.5, touchMultiplier: 2 });
  lenis.on('scroll', function() { ScrollTrigger.update(); });
  gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ---------- cursor ---------- */
var cursor = document.getElementById('cursor');
var cursorRing = document.getElementById('cursorRing');

if (prefersReducedMotion === false && isTouchDevice === false) {
  // Move cursor with mouse
  window.addEventListener('pointermove', function(event) {
    gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.15, ease: 'power2.out' });
    gsap.to(cursorRing, { x: event.clientX, y: event.clientY, duration: 0.45, ease: 'power3.out' });
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
if (prefersReducedMotion === false && isTouchDevice === false) {
  var magneticElements = document.querySelectorAll('.btn, .theme-toggle, .socials a, .brand-mark, .mobile-menu-toggle');
  
  for (var i = 0; i < magneticElements.length; i++) {
    // Setup fast GSAP animations for x and y
    var xTo = gsap.quickTo(magneticElements[i], 'x', { duration: 0.5, ease: 'power3.out' });
    var yTo = gsap.quickTo(magneticElements[i], 'y', { duration: 0.5, ease: 'power3.out' });
    
    magneticElements[i].addEventListener('mousemove', function(event) {
      var rect = this.getBoundingClientRect(); 
      var distanceX = event.clientX - (rect.left + rect.width / 2);
      var distanceY = event.clientY - (rect.top + rect.height / 2);
      xTo(distanceX * 0.35); // 0.35 is the magnetic strength
      yTo(distanceY * 0.35);
    });
    
    magneticElements[i].addEventListener('mouseleave', function() {
      xTo(0); yTo(0);
    });
  }
}

/* ---------- scroll progress bar ---------- */
window.addEventListener('scroll', function() {
  var html = document.documentElement;
  var percentage = (html.scrollTop / (html.scrollHeight - html.clientHeight)) * 100;
  document.getElementById('progress').style.width = percentage + '%';
});

/* ---------- nav scroll styling ---------- */
ScrollTrigger.create({
  start: 'top -10', end: 99999,
  toggleClass: { targets: 'nav', className: 'scrolled' }
});

/* ---------- theme toggle ---------- */
var themeToggle = document.getElementById('themeToggle');
var rootElement = document.documentElement;

themeToggle.addEventListener('click', function(event) {
  var nextTheme = rootElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  
  // Change theme immediately if transitions aren't supported
  if (prefersReducedMotion || !document.startViewTransition) {
    rootElement.setAttribute('data-theme', nextTheme);
    return;
  }
  
  // Calculate ripple animation size
  var endRadius = Math.hypot(Math.max(event.clientX, window.innerWidth - event.clientX), Math.max(event.clientY, window.innerHeight - event.clientY));
  rootElement.style.setProperty('--vt-x', event.clientX + 'px');
  rootElement.style.setProperty('--vt-y', event.clientY + 'px');
  rootElement.style.setProperty('--vt-r', endRadius + 'px');
  
  document.startViewTransition(function() {
    rootElement.setAttribute('data-theme', nextTheme);
  });
});

/* ---------- ambient background parallax ---------- */
var bgField = document.getElementById('bgField');
if (bgField && !prefersReducedMotion) {
  gsap.to(bgField, {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.6 }
  });
}

/* ---------- particle background ---------- */
var canvas = document.getElementById('particles');
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

// Track mouse position for particle interaction
window.addEventListener('pointermove', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Create dots with random positions and speeds
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
  
  // Check current theme for dot color
  var isDark = rootElement.getAttribute('data-theme') !== 'light';
  var dotColor = isDark ? 'rgba(245,245,243,' : 'rgba(11,11,11,';
  var lineColor = isDark ? 'rgba(245,245,243,' : 'rgba(11,11,11,';
  
  for (var i = 0; i < dots.length; i++) {
    var dot = dots[i];
    
    // Move dots
    dot.x = dot.x + dot.speedX;
    dot.y = dot.y + dot.speedY;
    
    // Push dots away from mouse
    var distToMouse = Math.sqrt((dot.x - mouseX) * (dot.x - mouseX) + (dot.y - mouseY) * (dot.y - mouseY));
    if (distToMouse < 120) {
      dot.x = dot.x + (dot.x - mouseX) * 0.02;
      dot.y = dot.y + (dot.y - mouseY) * 0.02;
    }
    
    // Wrap around edges
    if (dot.x < 0) { dot.x = canvas.width; }
    if (dot.x > canvas.width) { dot.x = 0; }
    if (dot.y < 0) { dot.y = canvas.height; }
    if (dot.y > canvas.height) { dot.y = 0; }
    
    // Draw dot
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fillStyle = dotColor + '0.5)';
    ctx.fill();
    
    // Draw lines between nearby dots
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

/* ---------- intro text split ---------- */
var wordsArray = "DASARI VAMSI KRISHNA".split(' ');
var introWord = document.getElementById('introWord');

for (var i = 0; i < wordsArray.length; i++) {
  var lettersArray = wordsArray[i].split('');
  // Add each letter as a span
  for (var j = 0; j < lettersArray.length; j++) {
    var letterSpan = document.createElement('span');
    letterSpan.textContent = lettersArray[j];
    introWord.appendChild(letterSpan);
  }
  // Add space between words
  if (i < wordsArray.length - 1) {
    var spaceSpan = document.createElement('span');
    spaceSpan.innerHTML = '&nbsp;';
    introWord.appendChild(spaceSpan);
  }
}

// Intro Animation
var timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
if (prefersReducedMotion) {
  document.getElementById('intro').style.display = 'none';
} else {
  timeline.to('#introWord span', { y: '0%', duration: 0.7, stagger: 0.02 })
          .to('#introBarFill', { width: '100%', duration: 0.5 }, "-=0.2")
          .to('#intro', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, "+=0.15")
          .set('#intro', { display: 'none' });
}

/* ---------- hero name kinetic setup & animations ---------- */
var heroLine1Text = "DASARI VAMSI";
var heroLine2Text = "KRISHNA";
var heroLine1 = document.getElementById('heroLine1');
var heroLine2 = document.getElementById('heroLine2');

function buildHeroText(element, text) {
  if (!element) return;
  for (var i = 0; i < text.length; i++) {
    // Outer box container for mouse displacement
    var charBox = document.createElement('span');
    charBox.className = 'hero-char-box';
    
    // Inner span for reveal and breathing animation
    var charSpan = document.createElement('span');
    charSpan.className = 'hero-char';
    if (text[i] === ' ') {
      charSpan.innerHTML = '&nbsp;';
    } else {
      charSpan.textContent = text[i];
    }
    
    charBox.appendChild(charSpan);
    element.appendChild(charBox);
  }
}

buildHeroText(heroLine1, heroLine1Text);
buildHeroText(heroLine2, heroLine2Text);

// Staggered Kinetic Entrance Reveal
var revealDelay = prefersReducedMotion ? 0 : 2.0;
gsap.fromTo('.hero-char', 
  { opacity: 0, x: 12, y: 22, scale: 0.96 },
  { 
    opacity: 1, x: 0, y: 0, scale: 1, 
    duration: 1.4, 
    ease: 'power3.out', 
    stagger: 0.03,
    delay: revealDelay,
    onComplete: function() {
      if (prefersReducedMotion === false) {
        // Continuous organic floating/breathing micro-motion
        gsap.to('.hero-char', {
          y: '-4px',
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          stagger: {
            each: 0.06,
            from: 'random'
          }
        });
      }
    }
  }
);

// Staggered reveal for supporting subheadings
var subDelay = prefersReducedMotion ? 0 : 2.3;
gsap.fromTo('.hero-role, .hero-cta, .eyebrow, .scroll-cue',
  { opacity: 0, y: 16 },
  { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: subDelay }
);

// Elegant hover displacement tracking for individual characters
if (prefersReducedMotion === false && isTouchDevice === false) {
  window.addEventListener('pointermove', function(event) {
    var boxes = document.querySelectorAll('.hero-char-box');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var rect = box.getBoundingClientRect();
      var boxCenterX = rect.left + rect.width / 2;
      var boxCenterY = rect.top + rect.height / 2;
      
      var diffX = event.clientX - boxCenterX;
      var diffY = event.clientY - boxCenterY;
      var distance = Math.sqrt(diffX * diffX + diffY * diffY);
      
      // Affect letters within 140px range
      if (distance < 140) {
        var force = (140 - distance) / 140;
        var moveX = (diffX / distance) * -8 * force;
        var moveY = (diffY / distance) * -6 * force;
        gsap.to(box, { x: moveX, y: moveY, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      } else {
        // Smoothly settle back to default coordinates
        gsap.to(box, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      }
    }
  });
}

if (!prefersReducedMotion) {
  gsap.to('.hero', {
    opacity: 0.15, scale: 0.96, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ---------- section title mask reveal ---------- */
var sectionTitles = document.querySelectorAll('.sec-title');
for (var i = 0; i < sectionTitles.length; i++) {
  // Wrap words in spans
  var wordsList = sectionTitles[i].textContent.trim().split(/\s+/);
  var newHTML = [];
  for (var j = 0; j < wordsList.length; j++) {
    newHTML.push('<span class="mask-line"><span>' + wordsList[j] + '</span></span>');
  }
  sectionTitles[i].innerHTML = newHTML.join(' ');
  
  // Animate the spans
  var innerSpans = sectionTitles[i].querySelectorAll('.mask-line > span');
  if (prefersReducedMotion) {
    gsap.set(innerSpans, { y: '0%' });
  } else {
    gsap.to(innerSpans, {
      y: '0%', duration: 0.9, stagger: 0.06, ease: 'power4.out',
      scrollTrigger: { trigger: sectionTitles[i], start: 'top 90%' }
    });
  }
}

/* ---------- generic scroll reveals ---------- */
var revealElements = document.querySelectorAll('.reveal');
for (var i = 0; i < revealElements.length; i++) {
  var el = revealElements[i];
  var isCustom = el.classList.contains('exp-row') || el.classList.contains('proj') || 
                 el.classList.contains('cert-list') || el.classList.contains('skill-groups');
  
  if (!isCustom) {
    if (prefersReducedMotion) { 
      gsap.set(el, { opacity: 1, y: 0, scale: 1 }); 
    } else {
      gsap.to(el, {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    }
  }
}

/* ---------- skills animations ---------- */
gsap.set('.skill-groups', { opacity: 1, y: 0 });
var skillGroups = document.querySelectorAll('.skill-group');

for (var i = 0; i < skillGroups.length; i++) {
  var tiles = skillGroups[i].querySelectorAll('.tile');
  if (prefersReducedMotion) { 
    gsap.set(tiles, { opacity: 1, y: 0, scale: 1 }); 
  } else {
    gsap.fromTo(tiles, { opacity: 0, y: 18, scale: 0.9 }, { 
      opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.05,
      scrollTrigger: { trigger: skillGroups[i], start: 'top 88%' }
    });
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
if (!prefersReducedMotion) {
  for (var i = 0; i < skillGroups.length; i++) {
    // Each group moves at a slightly different speed
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
  if (prefersReducedMotion) { 
    gsap.set(expRows[i], { opacity: 1, x: 0, y: 0 }); 
  } else {
    // Alternate direction: left for even, right for odd
    var startX = (i % 2 === 0) ? -50 : 50;
    gsap.fromTo(expRows[i], { opacity: 0, x: startX, y: 20 }, { 
      opacity: 1, x: 0, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: expRows[i], start: 'top 85%' }
    });
  }
}

/* ---------- experience timeline scroll progress ---------- */
var timelineFill = document.getElementById('timelineFill');
var expTimeline = document.getElementById('expTimeline');

if (timelineFill && expTimeline && !prefersReducedMotion) {
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
        gsap.to(preview, { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    projects[i].addEventListener('mouseleave', function() {
      var preview = this.querySelector('.proj-preview-window');
      if (preview) {
        gsap.to(preview, { opacity: 0, scale: 0.85, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
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
        gsap.to(preview, {
          x: x + 35,
          y: y - previewH / 2,
          duration: prefersReducedMotion ? 0 : 0.35,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  }
  
  if (prefersReducedMotion) { 
    gsap.set(projects[i], { opacity: 1, clearProps: 'clipPath' }); 
  } else {
    gsap.fromTo(projects[i], { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { 
      opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power4.inOut',
      clearProps: 'clipPath',
      scrollTrigger: { trigger: projects[i], start: 'top 85%' }
    });
  }
}

/* ---------- certifications stagger ---------- */
gsap.set('.cert-list', { opacity: 1, y: 0 });
var certRowsNodes = document.querySelectorAll('.cert-row');
if (certRowsNodes.length > 0) {
  if (prefersReducedMotion) { 
    gsap.set(certRowsNodes, { opacity: 1, y: 0 }); 
  } else {
    gsap.fromTo(certRowsNodes, { opacity: 0, y: 24 }, { 
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.cert-list', start: 'top 85%' }
    });
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
        gsap.to(preview, { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    certs[i].addEventListener('mouseleave', function() {
      var preview = this.querySelector('.cert-preview-window');
      if (preview) {
        gsap.to(preview, { opacity: 0, scale: 0.85, duration: prefersReducedMotion ? 0 : 0.4, ease: 'power2.out', overwrite: 'auto' });
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
        gsap.to(preview, {
          x: x + 35,
          y: y - 120, // Centered vertically for 240px container height
          duration: prefersReducedMotion ? 0 : 0.35,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }
    });
  }
}

/* ---------- active nav link ---------- */
var navLinks = document.querySelectorAll('[data-nav]');
var mobileNavLinks = document.querySelectorAll('[data-mobile-nav]');
var sectionIds = ['hero', 'about', 'skills', 'projects', 'work', 'contact'];

function setActive(index) {
  // Update desktop navigation links
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].classList.remove('active');
  }
  if (navLinks[index]) {
    navLinks[index].classList.add('active');
  }
  
  // Update mobile navigation links
  for (var j = 0; j < mobileNavLinks.length; j++) {
    mobileNavLinks[j].classList.remove('active');
  }
  if (mobileNavLinks[index]) {
    mobileNavLinks[index].classList.add('active');
  }
}

for (var i = 0; i < sectionIds.length; i++) {
  var section = document.getElementById(sectionIds[i]);
  if (section) {
    (function(index) {
      ScrollTrigger.create({
        trigger: section, start: 'top 50%', end: 'bottom 50%',
        onEnter: function() { setActive(index); }, 
        onEnterBack: function() { setActive(index); }
      });
    })(i);
  }
}

/* ---------- mobile hamburger menu toggle ---------- */
var mobileToggle = document.getElementById('mobileMenuToggle');
var mobileOverlay = document.getElementById('mobileMenuOverlay');
var mobileLinks = document.querySelectorAll('[data-mobile-nav]');

if (mobileToggle && mobileOverlay) {
  mobileToggle.addEventListener('click', function() {
    var isActive = mobileToggle.classList.contains('active');
    
    if (isActive === true) {
      mobileToggle.classList.remove('active');
      mobileOverlay.classList.remove('active');
      // Resume Lenis smooth scroll if it exists
      if (window.lenis) { window.lenis.start(); }
    } else {
      mobileToggle.classList.add('active');
      mobileOverlay.classList.add('active');
      // Pause Lenis smooth scroll if it exists
      if (window.lenis) { window.lenis.stop(); }
    }
  });

  // Close menu and resume scrolling when any navigation link is clicked
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', function() {
      mobileToggle.classList.remove('active');
      mobileOverlay.classList.remove('active');
      if (window.lenis) { window.lenis.start(); }
    });
  }
}

/* ---------- figure particle formation (contact section) ---------- */
(function() {
  var figureCanvas = document.getElementById('figureCanvas');
  var fallbackImg = document.getElementById('figureFallbackImg');
  if (!figureCanvas) { return; }

  // Reduced motion: just show the static photo, skip the whole particle system
  if (prefersReducedMotion) {
    figureCanvas.style.display = 'none';
    if (fallbackImg) { fallbackImg.style.display = 'block'; }
    return;
  }

  var fctx = figureCanvas.getContext('2d');
  var img = new Image();
  var particles = [];
  var released = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var rafId = null;

  function sizeCanvas() {
    var rect = figureCanvas.getBoundingClientRect();
    figureCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    figureCanvas.height = Math.max(1, Math.round(rect.height * dpr));
  }

  function buildParticles() {
    var off = document.createElement('canvas');
    off.width = figureCanvas.width;
    off.height = figureCanvas.height;
    var octx = off.getContext('2d');
    octx.drawImage(img, 0, 0, off.width, off.height);

    var data;
    try {
      data = octx.getImageData(0, 0, off.width, off.height).data;
    } catch (e) {
      return;
    }

    var targetCount = isTouchDevice ? 2200 : 4500;
    var step = Math.max(2, Math.round(Math.sqrt((off.width * off.height * 0.5) / targetCount)));

    var newParticles = [];
    for (var y = 0; y < off.height; y += step) {
      for (var x = 0; x < off.width; x += step) {
        var idx = (y * off.width + x) * 4;
        var alpha = data[idx + 3];
        if (alpha > 80) {
          newParticles.push({
            tx: x, ty: y,
            x: x, y: y,
            color: 'rgba(' + data[idx] + ',' + data[idx + 1] + ',' + data[idx + 2] + ',' + (alpha / 255) + ')',
            size: (Math.random() * 1.1 + 0.9) * dpr,
            ease: 0.045 + Math.random() * 0.05
          });
        }
      }
    }
    particles = newParticles;
  }

  function scatterParticles() {
    var w = figureCanvas.width, h = figureCanvas.height;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var angle = Math.random() * Math.PI * 2;
      var dist = w * 0.9 + Math.random() * w * 1.6;
      p.x = p.tx + Math.cos(angle) * dist;
      p.y = p.ty + Math.sin(angle) * dist * 0.6 - h * 0.2;
    }
  }

  function snapToTarget() {
    for (var i = 0; i < particles.length; i++) {
      particles[i].x = particles[i].tx;
      particles[i].y = particles[i].ty;
    }
  }

  function drawFrame() {
    fctx.clearRect(0, 0, figureCanvas.width, figureCanvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (released) {
        p.x += (p.tx - p.x) * p.ease;
        p.y += (p.ty - p.y) * p.ease;
      }
      fctx.fillStyle = p.color;
      fctx.beginPath();
      fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fctx.fill();
    }
    rafId = requestAnimationFrame(drawFrame);
  }

  img.onload = function() {
    sizeCanvas();
    buildParticles();
    scatterParticles();
    if (!rafId) { drawFrame(); }

    ScrollTrigger.create({
      trigger: '#figureStage',
      start: 'top 82%',
      once: true,
      onEnter: function() { released = true; }
    });
  };
  img.onerror = function() {
    figureCanvas.style.display = 'none';
    if (fallbackImg) { fallbackImg.style.display = 'block'; }
  };
  img.src = 'portrait-figure.png';

  window.addEventListener('resize', function() {
    clearTimeout(window.__figureResizeT);
    window.__figureResizeT = setTimeout(function() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeCanvas();
      buildParticles();
      if (released) { snapToTarget(); } else { scatterParticles(); }
    }, 200);
  });
})();
