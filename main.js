/**
 * Mohammed Ashraf – Portfolio
 * main.js – All interactivity & data rendering
 *
 * Features:
 * - JSON data loading
 * - AR/EN language toggle (RTL/LTR)
 * - Dark/Light theme toggle
 * - Typed.js-style role animation (vanilla)
 * - Animated particle canvas background
 * - Scroll animations (Intersection Observer)
 * - Scroll-to-top button
 * - Skill bar animations
 * - Portfolio filtering & modal
 * - Stats counter animation
 * - Active nav link on scroll
 * - Contact form validation
 * - Mobile menu
 */

'use strict';

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let DATA = null;
let LANG = 'en'; // 'en' | 'ar'
let THEME = 'dark'; // 'dark' | 'light'
let currentFilter = 'all';
let typedInterval = null;

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initTheme();
  initCanvas();
  renderAll();
  initTyped();
  initScrollReveal();
  initNavbar();
  initMobileMenu();
  initScrollTop();
  initModal();
  initContactForm();
  initPortfolioFilter();
  initThemeToggle();
  initLangToggle();
  initStatCounters();
});

/* ══════════════════════════════════════════════════════
   DATA LOADING
══════════════════════════════════════════════════════ */
async function loadData() {
  try {
    const res = await fetch('data/portfolio.json');
    if (!res.ok) throw new Error('Network response was not ok');
    DATA = await res.json();
  } catch (e) {
    console.warn('Could not load portfolio.json, using fallback data.', e);
    DATA = getFallbackData();
  }
}

/* ══════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('ma-theme');
  THEME = saved || 'dark';
  applyTheme(THEME);
}

function applyTheme(t) {
  THEME = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ma-theme', t);
  const iconDark = document.querySelector('.theme-icon-dark');
  const iconLight = document.querySelector('.theme-icon-light');
  if (iconDark) iconDark.hidden = (t === 'light');
  if (iconLight) iconLight.hidden = (t === 'dark');
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => applyTheme(THEME === 'dark' ? 'light' : 'dark'));
}

/* ══════════════════════════════════════════════════════
   LANGUAGE
══════════════════════════════════════════════════════ */
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    LANG = LANG === 'en' ? 'ar' : 'en';
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('ma-lang', LANG);
    applyLang();
    renderAll(); // re-render dynamic content
    // Restart typed animation
    stopTyped();
    setTimeout(initTyped, 200);
  });

  // Restore saved
  const saved = localStorage.getItem('ma-lang');
  if (saved && saved !== LANG) {
    LANG = saved;
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    applyLang();
  }
}

function applyLang() {
  // Toggle button label
  const btn = document.getElementById('langToggle');
  if (btn) {
    const enSpan = btn.querySelector('.lang-en');
    const arSpan = btn.querySelector('.lang-ar');
    if (enSpan) enSpan.hidden = (LANG === 'ar');
    if (arSpan) arSpan.hidden = (LANG === 'en');
  }
  // Update all elements with data-en / data-ar
  document.querySelectorAll('[data-en]').forEach(el => {
    const val = el.getAttribute(`data-${LANG}`);
    if (val !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    }
  });
}

/* ══════════════════════════════════════════════════════
   RENDER ALL
══════════════════════════════════════════════════════ */
function renderAll() {
  if (!DATA) return;
  renderHero();
  renderAbout();
  renderSkills();
  renderServices();
  renderPortfolio();
  renderContact();
  renderFooter();
  applyLang();
}

/* ── HERO ──────────────────────────────────────────── */
function renderHero() {
  const p = DATA.personal;
  // Name
  const nameEl = document.getElementById('heroName');
  if (nameEl) {
    nameEl.querySelector('.name-en').textContent = p.name.en;
    nameEl.querySelector('.name-ar').textContent = p.name.ar;
    nameEl.querySelector('.name-en').hidden = (LANG === 'ar');
    nameEl.querySelector('.name-ar').hidden = (LANG === 'en');
  }
  // Bio tagline
  const bioEl = document.getElementById('heroBio');
  if (bioEl) {
    bioEl.textContent = p.tagline[LANG];
    bioEl.setAttribute('data-en', p.tagline.en);
    bioEl.setAttribute('data-ar', p.tagline.ar);
  }
  // Avatar initials
  setText('avatarInitials', LANG === 'ar' ? 'م.ا' : 'MA');
  // Social links
  renderSocialLinks('heroSocial', 'hero');
}

/* ── ABOUT ─────────────────────────────────────────── */
function renderAbout() {
  const p = DATA.personal;
  setText('aboutName', p.name[LANG]);
  setText('aboutWorkType', p.workType[LANG]);
  setAttribute('aboutWorkType', 'data-en', p.workType.en);
  setAttribute('aboutWorkType', 'data-ar', p.workType.ar);

  const bioEl = document.getElementById('aboutBio');
  if (bioEl) bioEl.textContent = p.bio[LANG];

  setText('aboutInitials', LANG === 'ar' ? 'م.ا' : 'MA');
  setText('degreeText', p.degree[LANG]);
  setAttribute('degreeText', 'data-en', p.degree.en);
  setAttribute('degreeText', 'data-ar', p.degree.ar);

  setText('locationText', p.location[LANG]);
  setAttribute('locationText', 'data-en', p.location.en);
  setAttribute('locationText', 'data-ar', p.location.ar);

  const emailEl = document.getElementById('emailLink');
  if (emailEl) { emailEl.textContent = p.email; emailEl.href = `mailto:${p.email}`; }

  setText('availText', DATA.contact.availability[LANG]);

  // Stats
  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid) {
    const stats = p.stats;
    statsGrid.innerHTML = Object.entries(stats).map(([key, s]) => `
      <div class="stat-card reveal-up">
        <div class="stat-number" data-target="${s.value}" data-counted="false">0</div>
        <div class="stat-label" data-en="${s.label.en}" data-ar="${s.label.ar}">
          ${s.label[LANG]}
        </div>
      </div>
    `).join('');
    // Re-observe new elements
    observeReveal();
  }
}

/* ── SKILLS ────────────────────────────────────────── */
function renderSkills() {
  const grid = document.getElementById('skillsGrid');
  if (!grid || !DATA.skills) return;
  grid.innerHTML = DATA.skills.map((sk, i) => `
    <div class="skill-card reveal-up" style="transition-delay:${(i % 4) * 0.07}s">
      <div class="skill-header">
        <div class="skill-info">
          <div class="skill-icon">${sk.icon}</div>
          <span class="skill-name"
            data-en="${sk.name.en}"
            data-ar="${sk.name.ar}">${sk.name[LANG]}</span>
        </div>
        <span class="skill-level">${sk.level}%</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-level="${sk.level / 100}" style="--w:${sk.level}%"></div>
      </div>
    </div>
  `).join('');
  observeReveal();
  observeSkillBars();
}

/* ── SERVICES ───────────────────────────────────────── */
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid || !DATA.services) return;
  grid.innerHTML = DATA.services.map((sv, i) => `
    <div class="service-card reveal-up" style="transition-delay:${(i % 3) * 0.1}s">
      <div class="service-icon-wrap">${sv.icon}</div>
      <h3 class="service-title"
        data-en="${sv.title.en}"
        data-ar="${sv.title.ar}">${sv.title[LANG]}</h3>
      <p class="service-desc"
        data-en="${sv.description.en}"
        data-ar="${sv.description.ar}">${sv.description[LANG]}</p>
      <div class="service-tags">
        ${sv.tags[LANG].map(t => `<span class="tag-pill">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
  observeReveal();
}

/* ── PORTFOLIO ──────────────────────────────────────── */
function renderPortfolio(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  if (!grid || !DATA.portfolio) return;
  grid.innerHTML = DATA.portfolio.map((proj, i) => {
    const hidden = filter !== 'all' && proj.category !== filter ? 'hidden' : '';
    return `
      <div class="project-card ${hidden} reveal-up"
        data-category="${proj.category}"
        data-id="${proj.id}"
        style="transition-delay:${(i % 3) * 0.08}s"
        role="button"
        tabindex="0"
        aria-label="${proj.title[LANG]}">
        <div class="project-img-wrap">
          <img src="${proj.image}" alt="${proj.title[LANG]}" loading="lazy" />
          <div class="project-overlay">
            <span class="project-overlay-btn" data-en="View Project" data-ar="عرض المشروع">
              ${LANG === 'ar' ? 'عرض المشروع' : 'View Project'}
            </span>
          </div>
          ${proj.featured ? `<span class="project-featured-badge" data-en="Featured" data-ar="مميز">${LANG === 'ar' ? 'مميز' : 'Featured'}</span>` : ''}
        </div>
        <div class="project-body">
          <p class="project-category">${proj.category.toUpperCase()}</p>
          <h3 class="project-title"
            data-en="${proj.title.en}"
            data-ar="${proj.title.ar}">${proj.title[LANG]}</h3>
          <div class="project-tags">
            ${proj.tags[LANG].map(t => `<span class="tag-pill">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Click handlers for modal
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(parseInt(card.dataset.id)); });
  });

  observeReveal();
}

/* ── CONTACT ────────────────────────────────────────── */
function renderContact() {
  const c = DATA.contact;
  const emailEl = document.getElementById('contactEmail');
  if (emailEl) { emailEl.textContent = c.email; emailEl.href = `mailto:${c.email}`; }
  const phoneEl = document.getElementById('contactPhone');
  if (phoneEl) phoneEl.textContent = c.phone;
  const locEl = document.getElementById('contactLocation');
  if (locEl) {
    locEl.textContent = c.location[LANG];
    locEl.setAttribute('data-en', c.location.en);
    locEl.setAttribute('data-ar', c.location.ar);
  }
  renderSocialLinks('contactSocial', 'pill');
}

/* ── FOOTER ─────────────────────────────────────────── */
function renderFooter() {
  renderSocialLinks('footerSocial', 'footer');
}

/* ── SOCIAL LINKS ───────────────────────────────────── */
function renderSocialLinks(containerId, style) {
  const container = document.getElementById(containerId);
  if (!container || !DATA.social) return;

  const iconMap = {
    behance:  'fa-brands fa-behance',
    dribbble: 'fa-brands fa-dribbble',
    linkedin: 'fa-brands fa-linkedin-in',
    instagram:'fa-brands fa-instagram',
    github:   'fa-brands fa-github',
    twitter:  'fa-brands fa-x-twitter',
    youtube:  'fa-brands fa-youtube',
  };

  if (style === 'hero') {
    container.innerHTML = DATA.social.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">
        <i class="${iconMap[s.icon] || 'fa-solid fa-link'}"></i>
      </a>
    `).join('');
  } else if (style === 'pill') {
    container.innerHTML = DATA.social.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-pill">
        <i class="${iconMap[s.icon] || 'fa-solid fa-link'}"></i>
        <span>${s.label}</span>
      </a>
    `).join('');
  } else if (style === 'footer') {
    container.innerHTML = DATA.social.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">
        <i class="${iconMap[s.icon] || 'fa-solid fa-link'}"></i>
      </a>
    `).join('');
  }
}

/* ══════════════════════════════════════════════════════
   TYPED ANIMATION (vanilla)
══════════════════════════════════════════════════════ */
function initTyped() {
  const el = document.getElementById('typedText');
  if (!el || !DATA) return;
  const roles = DATA.roles[LANG];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pausing = false;

  function tick() {
    const current = roles[roleIdx];
    if (pausing) return;

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        pausing = true;
        setTimeout(() => { pausing = false; deleting = true; }, 1800);
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
  }

  typedInterval = setInterval(tick, 80);
}

function stopTyped() {
  if (typedInterval) { clearInterval(typedInterval); typedInterval = null; }
  const el = document.getElementById('typedText');
  if (el) el.textContent = '';
}

/* ══════════════════════════════════════════════════════
   PARTICLE CANVAS BACKGROUND
══════════════════════════════════════════════════════ */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const COUNT = 55;
  const GREEN = '122, 179, 0';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.4 + 0.08,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${GREEN},${0.08 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GREEN},${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();

  window.addEventListener('resize', () => { resize(); makeParticles(); });
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL – Intersection Observer
══════════════════════════════════════════════════════ */
let revealObserver = null;

function observeReveal() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}

function initScrollReveal() { observeReveal(); }

/* ══════════════════════════════════════════════════════
   SKILL BAR ANIMATIONS
══════════════════════════════════════════════════════ */
function observeSkillBars() {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const level = parseFloat(fill.dataset.level);
        fill.style.transform = `scaleX(${level})`;
        fill.classList.add('animated');
        barObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-bar-fill').forEach(el => barObserver.observe(el));
}

/* ══════════════════════════════════════════════════════
   STAT COUNTERS
══════════════════════════════════════════════════════ */
function initStatCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.dataset.counted === 'false') {
        entry.target.dataset.counted = 'true';
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.target);
  const dur = 1800;
  const step = 16;
  let current = 0;
  const increment = target / (dur / step);

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current) + '+';
  }, step);
}

/* ══════════════════════════════════════════════════════
   NAVBAR – Scroll + Active link
══════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    // Scrolled class
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    // Active link
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
    // Scroll-top button
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
  });

  // Close on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ══════════════════════════════════════════════════════
   SCROLL TO TOP
══════════════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════════════
   PORTFOLIO FILTER
══════════════════════════════════════════════════════ */
function initPortfolioFilter() {
  const filtersEl = document.getElementById('portfolioFilters');
  if (!filtersEl) return;

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentFilter = btn.dataset.filter;
    filterCards(currentFilter);
  });
}

function filterCards(filter) {
  document.querySelectorAll('.project-card').forEach(card => {
    if (filter === 'all' || card.dataset.category === filter) {
      card.classList.remove('hidden');
      // Restart reveal for filtered-in cards
      card.classList.remove('revealed');
      setTimeout(() => card.classList.add('revealed'), 50);
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function openModal(id) {
  if (!DATA) return;
  const proj = DATA.portfolio.find(p => p.id === id);
  if (!proj) return;

  const overlay = document.getElementById('modalOverlay');
  const imgEl   = document.getElementById('modalImg');
  const tagsEl  = document.getElementById('modalTags');
  const titleEl = document.getElementById('modalTitle');
  const descEl  = document.getElementById('modalDesc');
  const yearEl  = document.getElementById('modalYear');

  if (imgEl)   { imgEl.src = proj.image; imgEl.alt = proj.title[LANG]; }
  if (titleEl)  titleEl.textContent = proj.title[LANG];
  if (descEl)   descEl.textContent  = proj.description[LANG];
  if (yearEl)   yearEl.textContent  = proj.year;
  if (tagsEl)   tagsEl.innerHTML    = proj.tags[LANG].map(t => `<span class="tag-pill">${t}</span>`).join('');

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  // Trigger animation
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.hidden = true;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = document.getElementById('formSubmit');
    const status = document.getElementById('formStatus');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
    }

    // Simulate form submission (replace with real backend)
    setTimeout(() => {
      if (status) {
        const msg = LANG === 'ar'
          ? '✓ تم إرسال رسالتك! سأرد عليك قريباً.'
          : '✓ Message sent! I\'ll get back to you soon.';
        status.textContent = msg;
        status.className = 'form-status success';
      }
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane"></i><span data-en="Send Message" data-ar="إرسال الرسالة">${LANG === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span>`;
      }
      setTimeout(() => { if (status) { status.textContent = ''; status.className = 'form-status'; } }, 5000);
    }, 1500);
  });
}

function validateForm(form) {
  let valid = true;
  const rules = [
    { id: 'formName',    errId: 'nameError',    en: 'Name is required.',    ar: 'الاسم مطلوب.' },
    { id: 'formEmail',   errId: 'emailError',   en: 'Valid email required.', ar: 'البريد الإلكتروني مطلوب.' },
    { id: 'formSubject', errId: 'subjectError', en: 'Subject is required.',  ar: 'الموضوع مطلوب.' },
    { id: 'formMessage', errId: 'messageError', en: 'Message is required.',  ar: 'الرسالة مطلوبة.' },
  ];

  rules.forEach(r => {
    const input = document.getElementById(r.id);
    const errEl = document.getElementById(r.errId);
    if (!input) return;
    const isEmpty = !input.value.trim();
    const isEmailInvalid = r.id === 'formEmail' && input.value && !/^\S+@\S+\.\S+$/.test(input.value);
    if (isEmpty || isEmailInvalid) {
      input.classList.add('error');
      if (errEl) errEl.textContent = LANG === 'ar' ? r.ar : r.en;
      valid = false;
    } else {
      input.classList.remove('error');
      if (errEl) errEl.textContent = '';
    }
  });
  return valid;
}

/* ══════════════════════════════════════════════════════
   DOM HELPERS
══════════════════════════════════════════════════════ */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setAttribute(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}

/* ══════════════════════════════════════════════════════
   FALLBACK DATA (if JSON fetch fails, e.g. file://)
══════════════════════════════════════════════════════ */
function getFallbackData() {
  return {
    personal: {
      name: { en: 'Mohammed Ashraf', ar: 'محمد اشرف' },
      degree: { en: "Bachelor's in Biomedical Engineering", ar: 'بكالوريوس هندسة الأجهزة الطبية' },
      workType: { en: 'Freelancer · Private Sector', ar: 'فري لانس · القطاع الخاص' },
      tagline: { en: 'Where Engineering Meets Art', ar: 'حيث تلتقي الهندسة بالفن' },
      bio: {
        en: 'A multidisciplinary creative professional with a background in Biomedical Engineering. I blend technical precision with artistic vision to craft compelling visuals and intuitive digital experiences.',
        ar: 'مصمم إبداعي متعدد التخصصات بخلفية في هندسة الأجهزة الطبية. أمزج الدقة التقنية مع الرؤية الفنية لإنشاء مرئيات جذابة وتجارب رقمية مبتكرة.'
      },
      stats: {
        projects: { value: 120, label: { en: 'Projects Completed', ar: 'مشروع مكتمل' } },
        clients:  { value: 60,  label: { en: 'Happy Clients',      ar: 'عميل سعيد' } },
        experience:{ value: 5,  label: { en: 'Years Experience',   ar: 'سنوات خبرة' } },
        awards:   { value: 12,  label: { en: 'Awards Won',         ar: 'جائزة حُصِد' } },
      },
      email: 'mohammed.ashraf@email.com',
      phone: '+966 5X XXX XXXX',
      location: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    },
    roles: {
      en: ['Graphic Designer','Storyboard Artist','Motion Graphics Designer','Web Designer','App Designer','Interior Designer','Medical Device Designer'],
      ar: ['مصمم جرافيك','رسام ستوري بورد','مصمم موشن جرافيك','مصمم ويب سايد','مصمم تطبيقات','مصمم ديكور داخلي','مصمم أجهزة طبية'],
    },
    skills: [
      { name:{en:'Graphic Design',ar:'تصميم جرافيك'}, level:95, icon:'🎨', category:'design' },
      { name:{en:'Motion Graphics',ar:'موشن جرافيك'}, level:90, icon:'🎬', category:'motion' },
      { name:{en:'Storyboarding',ar:'ستوري بورد'}, level:88, icon:'📋', category:'art' },
      { name:{en:'Web Design',ar:'تصميم مواقع'}, level:85, icon:'🌐', category:'web' },
      { name:{en:'App UI/UX Design',ar:'تصميم تطبيقات'}, level:85, icon:'📱', category:'web' },
      { name:{en:'Interior Design',ar:'تصميم داخلي'}, level:80, icon:'🏠', category:'design' },
      { name:{en:'Medical Device Design',ar:'تصميم أجهزة طبية'}, level:82, icon:'🩺', category:'engineering' },
      { name:{en:'Adobe Illustrator',ar:'أدوبي إليستريتور'}, level:92, icon:'✏️', category:'tools' },
      { name:{en:'Adobe Photoshop',ar:'أدوبي فوتوشوب'}, level:90, icon:'🖼️', category:'tools' },
      { name:{en:'After Effects',ar:'أفتر إفكتس'}, level:88, icon:'🎞️', category:'tools' },
      { name:{en:'Figma',ar:'فيغما'}, level:87, icon:'🔷', category:'tools' },
      { name:{en:'3D Modeling',ar:'نمذجة ثلاثية الأبعاد'}, level:75, icon:'🧊', category:'engineering' },
    ],
    services: [
      { icon:'🎨', title:{en:'Graphic Design',ar:'تصميم جرافيك'}, description:{en:'Brand identity, logos, posters and print materials.',ar:'هوية بصرية، شعارات، ملصقات ومطبوعات.'}, tags:{en:['Branding','Logo','Print'],ar:['هوية','شعار','مطبوعات']} },
      { icon:'🎬', title:{en:'Motion Graphics',ar:'موشن جرافيك'}, description:{en:'Animated content, explainer videos and broadcast graphics.',ar:'محتوى متحرك، فيديوهات شرح وجرافيك بث.'}, tags:{en:['Animation','Video','After Effects'],ar:['أنيميشن','فيديو','أفتر إفكتس']} },
      { icon:'📋', title:{en:'Storyboard Art',ar:'رسم ستوري بورد'}, description:{en:'Detailed storyboards for ads, films and animation.',ar:'ستوري بورد تفصيلي للإعلانات والأفلام.'}, tags:{en:['Narrative','Film','Ads'],ar:['سرد','أفلام','إعلانات']} },
      { icon:'🌐', title:{en:'Web Design',ar:'تصميم مواقع'}, description:{en:'Modern, responsive websites with excellent UX.',ar:'مواقع عصرية متجاوبة مع تجربة مستخدم ممتازة.'}, tags:{en:['UI/UX','Responsive','Figma'],ar:['واجهات','متجاوب','فيغما']} },
      { icon:'📱', title:{en:'App Design',ar:'تصميم تطبيقات'}, description:{en:'Sleek mobile app interfaces for iOS and Android.',ar:'واجهات تطبيقات موبايل أنيقة لـ iOS وأندرويد.'}, tags:{en:['iOS','Android','Prototyping'],ar:['iOS','أندرويد','نماذج أولية']} },
      { icon:'🏠', title:{en:'Interior Design',ar:'تصميم ديكور داخلي'}, description:{en:'Creative interior concepts for residential and commercial spaces.',ar:'مفاهيم تصميم داخلي للمساحات السكنية والتجارية.'}, tags:{en:['3D Render','Residential','Commercial'],ar:['تصيير','سكني','تجاري']} },
      { icon:'🩺', title:{en:'Medical Device Design',ar:'تصميم أجهزة طبية'}, description:{en:'Specialized UI for medical equipment bridging engineering and UX.',ar:'واجهات متخصصة للأجهزة الطبية تجمع الهندسة بتجربة المستخدم.'}, tags:{en:['Biomedical','UX','3D CAD'],ar:['بيوميديكال','تجربة مستخدم','CAD']} },
    ],
    portfolio: [
      { id:1, title:{en:'Brand Identity – Al Noor Clinic',ar:'هوية بصرية – عيادة النور'}, category:'graphic', tags:{en:['Branding','Logo'],ar:['هوية','شعار']}, description:{en:'Complete brand identity package.',ar:'حزمة هوية بصرية كاملة.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Brand+Identity', year:2024, featured:true },
      { id:2, title:{en:'Motion Graphics – Product Launch',ar:'موشن جرافيك – إطلاق منتج'}, category:'motion', tags:{en:['Motion','Animation'],ar:['موشن','أنيميشن']}, description:{en:'60-second animated product launch video.',ar:'فيديو أنيميشن لإطلاق منتج.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Motion+Graphics', year:2024, featured:true },
      { id:3, title:{en:'UI/UX – HealthTrack App',ar:'تصميم UI/UX – تطبيق HealthTrack'}, category:'app', tags:{en:['App','UI/UX'],ar:['تطبيق','واجهات']}, description:{en:'Health monitoring app UI.',ar:'واجهة تطبيق مراقبة صحية.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=App+Design', year:2024, featured:true },
      { id:4, title:{en:'Storyboard – TV Commercial',ar:'ستوري بورد – إعلان تلفزيوني'}, category:'storyboard', tags:{en:['Storyboard','Commercial'],ar:['ستوري بورد','إعلان']}, description:{en:'30-scene storyboard for a TV commercial.',ar:'ستوري بورد من 30 مشهداً.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Storyboard', year:2023, featured:false },
      { id:5, title:{en:'Website – Architecture Firm',ar:'موقع – شركة هندسية'}, category:'web', tags:{en:['Web','UI/UX'],ar:['ويب','واجهات']}, description:{en:'Elegant website for an architecture firm.',ar:'تصميم موقع أنيق لشركة هندسية.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Web+Design', year:2023, featured:true },
      { id:6, title:{en:'Interior Design – Luxury Office',ar:'تصميم داخلي – مكتب فاخر'}, category:'interior', tags:{en:['Interior','3D'],ar:['ديكور','ثلاثي الأبعاد']}, description:{en:'Luxury executive office interior.',ar:'تصميم مكتب تنفيذي فاخر.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Interior', year:2023, featured:false },
      { id:7, title:{en:'Medical Device UI – Vital Monitor',ar:'واجهة جهاز طبي – مراقب العلامات'}, category:'medical', tags:{en:['Medical','UX'],ar:['طبي','تجربة مستخدم']}, description:{en:'Vital signs monitoring device UI.',ar:'واجهة جهاز مراقبة العلامات الحيوية.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Medical+UI', year:2024, featured:true },
      { id:8, title:{en:'Social Media – Ramadan Campaign',ar:'حملة سوشيال ميديا – رمضان'}, category:'graphic', tags:{en:['Social Media','Campaign'],ar:['سوشيال ميديا','حملة']}, description:{en:'30-day Ramadan content package.',ar:'حزمة محتوى رمضانية لـ 30 يوم.'}, image:'https://placehold.co/600x400/2A2A2A/7AB300?text=Social+Media', year:2023, featured:false },
    ],
    contact: {
      email: 'mohammed.ashraf@email.com',
      phone: '+966 5X XXX XXXX',
      location: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      availability: { en: 'Available for freelance projects', ar: 'متاح للمشاريع المستقلة' },
    },
    social: [
      { platform:'Behance',  icon:'behance',   url:'https://behance.net/',   label:'Behance' },
      { platform:'Dribbble', icon:'dribbble',  url:'https://dribbble.com/',  label:'Dribbble' },
      { platform:'LinkedIn', icon:'linkedin',  url:'https://linkedin.com/in/', label:'LinkedIn' },
      { platform:'Instagram',icon:'instagram', url:'https://instagram.com/', label:'Instagram' },
      { platform:'GitHub',   icon:'github',    url:'https://github.com/',   label:'GitHub' },
    ],
    meta: { lastUpdated: '2024-01-01', version: '1.0.0' },
  };
}
