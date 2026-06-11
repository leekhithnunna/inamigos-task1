/**
 * InAmigos Foundation — Shared Script v3.0
 * Covers: preloader · navbar · mobile menu · dropdown · active link
 *         scroll reveal · animated counters · back-to-top · contact form
 *         newsletter · smooth scroll · team modal · cert card tilt
 */
'use strict';

/* ─── THROTTLE ──────────────────────────────────────────────── */
function throttle(fn, ms = 100) {
  let last = 0;
  return (...a) => {
    const n = Date.now();
    if (n - last >= ms) { last = n; fn(...a); }
  };
}

/* ─── PRELOADER ─────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  setTimeout(() => {
    pl.classList.add('hide');
    pl.addEventListener('transitionend', () => pl.remove(), { once: true });
  }, 1200);
});

/* ─── NAVBAR SCROLL CLASS ───────────────────────────────────── */
const navbar = document.querySelector('.navbar');
const onScroll = throttle(() => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, 80);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── MOBILE MENU ───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

function setMenu(open) {
  if (!hamburger || !navLinks) return;
  hamburger.classList.toggle('open', open);
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });
}

// Close when clicking outside
document.addEventListener('click', e => {
  if (navbar && !navbar.contains(e.target) && navLinks?.classList.contains('open')) {
    setMenu(false);
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    setMenu(false);
    hamburger?.focus();
  }
});

// Close menu on nav link click (mobile)
document.querySelectorAll('.nav-links > li > a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth < 1025) setMenu(false);
  });
});

/* ─── PROJECT DROPDOWN TOGGLE (mobile) ─────────────────────── */
document.querySelectorAll('.nav-dropdown').forEach(drop => {
  const btn = drop.querySelector('.nav-drop-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    if (window.innerWidth < 1025) {
      e.stopPropagation();
      const isOpen = drop.classList.contains('open');
      // Close all others
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-drop-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        drop.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    }
  });
});

/* ─── ACTIVE NAV LINK ───────────────────────────────────────── */
(function markActive() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ─── SCROLL REVEAL ─────────────────────────────────────────── */
const revEls = document.querySelectorAll('[data-reveal]');
if (revEls.length) {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const delay = parseInt(en.target.dataset.delay || '0', 10);
      setTimeout(() => en.target.classList.add('revealed'), delay);
      ro.unobserve(en.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  revEls.forEach(el => ro.observe(el));
}

/* ─── ANIMATED COUNTERS ─────────────────────────────────────── */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function animCount(el, target, duration = 2200) {
  const start = performance.now();
  (function step(ts) {
    const p = Math.min((ts - start) / duration, 1);
    const val = Math.floor(easeOut(p) * target);
    el.textContent = val.toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('en-IN');
  })(performance.now());
}

const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const co = new IntersectionObserver(entries => {
    entries.forEach((en, i) => {
      if (!en.isIntersecting) return;
      setTimeout(() => animCount(en.target, +en.target.dataset.count), i * 150);
      co.unobserve(en.target);
    });
  }, { threshold: 0.3 });
  counters.forEach(c => co.observe(c));
}

/* ─── BACK TO TOP ───────────────────────────────────────────── */
const btt = document.getElementById('btt');
if (btt) {
  window.addEventListener('scroll', throttle(() => {
    btt.classList.toggle('show', window.scrollY > 420);
  }, 150), { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── SMOOTH SCROLL ─────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── CONTACT FORM ──────────────────────────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  const nameEl   = document.getElementById('cf-name');
  const emailEl  = document.getElementById('cf-email');
  const msgEl    = document.getElementById('cf-msg');
  const nameErr  = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const msgErr   = document.getElementById('msgErr');
  const successEl = document.getElementById('cf-success');

  function validate(el, errEl, check) {
    const msg = check(el.value.trim());
    if (errEl) errEl.textContent = msg;
    el.classList.toggle('error', !!msg);
    el.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }

  const rules = {
    name:  v => !v ? 'Please enter your full name.' : v.length < 2 ? 'Name is too short.' : '',
    email: v => !v ? 'Please enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Please enter a valid email address.' : '',
    msg:   v => !v ? 'Please enter a message.' : v.length < 10 ? 'Message is too short (min 10 characters).' : '',
  };

  // Blur validation
  nameEl?.addEventListener('blur',  () => validate(nameEl,  nameErr,  rules.name));
  emailEl?.addEventListener('blur', () => validate(emailEl, emailErr, rules.email));
  msgEl?.addEventListener('blur',   () => validate(msgEl,   msgErr,   rules.msg));

  // Live clear on input
  [[nameEl, nameErr, rules.name], [emailEl, emailErr, rules.email], [msgEl, msgErr, rules.msg]].forEach(([el, err, rule]) => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validate(el, err, rule);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v1 = validate(nameEl,  nameErr,  rules.name);
    const v2 = validate(emailEl, emailErr, rules.email);
    const v3 = validate(msgEl,   msgErr,   rules.msg);
    if (!v1 || !v2 || !v3) {
      [nameEl, emailEl, msgEl].find(el => el?.classList.contains('error'))?.focus();
      return;
    }
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
    btn.disabled = true;
    // Simulate submission (replace with real backend endpoint if needed)
    setTimeout(() => {
      form.reset();
      [nameEl, emailEl, msgEl].forEach(el => {
        if (el) { el.classList.remove('error'); el.removeAttribute('aria-invalid'); }
      });
      btn.innerHTML = orig;
      btn.disabled = false;
      if (successEl) {
        successEl.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Thank you! Your message has been sent. We\'ll get back to you soon.';
        successEl.classList.add('show');
        setTimeout(() => successEl.classList.remove('show'), 5500);
      }
    }, 1600);
  });
}

/* ─── NEWSLETTER ────────────────────────────────────────────── */
document.querySelectorAll('.f-nl-form').forEach(f => {
  const inp = f.querySelector('input[type="email"]');
  const btn = f.querySelector('button');
  if (!inp || !btn) return;
  btn.addEventListener('click', () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
      inp.style.borderColor = '#e53935';
      inp.focus();
      return;
    }
    inp.style.borderColor = '';
    btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
    inp.value = '';
    setTimeout(() => btn.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i>', 2800);
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
});

/* ─── TEAM MODAL ────────────────────────────────────────────── */
const teamData = {
  1: {
    name:  'Govind Shukla',
    role:  'Founder & CEO',
    image: 'About/Founder and CEO.png',
    bio:   'Founder of InAmigos Foundation with a vision to unite passionate individuals and create lasting social impact through education, sustainability, community development, and empowerment initiatives across India.'
  },
  2: {
    name:  'Khush Gupta',
    role:  'Deputy Head of Core Member',
    image: 'About/Deputy Head of Core member.jpg',
    bio:   'Management enthusiast experienced in publishing, internship management, organizational leadership, communication, and team coordination within the InAmigos Foundation.'
  },
  3: {
    name:  'Iniya Radhakrishnan',
    role:  'Head of Internship Department',
    image: 'About/Head of Internship department.jpg',
    bio:   'Dedicated to creating opportunities for students and fostering growth through impactful internship programs and collaborative initiatives that transform young professionals across India.'
  },
  4: {
    name:  'Shiwani',
    role:  'Team Leader of Core Members',
    image: 'About/Head of core member.jpg',
    bio:   'Leads grassroots programs and volunteer initiatives while supporting community development and social welfare projects under InAmigos Foundation.'
  },
  5: {
    name:  'Shaik Shahira Bhanu',
    role:  'Senior Core Member',
    image: 'About/Senior Core Member.jpg',
    bio:   'Actively contributes to impactful initiatives and supports projects focused on community welfare and social development at InAmigos Foundation.'
  },
  6: {
    name:  'Madhusoodan M',
    role:  'CSR Lead',
    image: 'About/CSR lead.jpg',
    bio:   'Supports social responsibility initiatives and helps strengthen partnerships with corporates that create meaningful change through CSR collaboration with InAmigos Foundation.'
  },
  7: {
    name:  'Anam Fatima',
    role:  'HR Executive',
    image: 'About/HR executive.jpg',
    bio:   'Works closely with volunteers and interns while helping build a productive and collaborative work environment at InAmigos Foundation.'
  },
  8: {
    name:  'Gloria Fredy Carvalho',
    role:  'Junior HR Executive',
    image: 'About/Junior HR executive.jpg',
    bio:   'Supports internship operations, volunteer engagement, and organizational coordination activities at InAmigos Foundation.'
  }
};

const modal        = document.getElementById('teamModal');
const modalOverlay = document.querySelector('.team-modal-overlay');
const closeBtn     = document.querySelector('.team-modal-close');

function openModal(teamId) {
  const member = teamData[teamId];
  if (!member || !modal) return;
  const imgEl   = document.getElementById('teamModalImg');
  const titleEl = document.getElementById('teamModalTitle');
  const roleEl  = document.getElementById('teamModalRole');
  const bioEl   = document.getElementById('teamModalBio');
  if (imgEl)   { imgEl.src = member.image; imgEl.alt = member.name + ' — ' + member.role; }
  if (titleEl) titleEl.textContent = member.name;
  if (roleEl)  roleEl.textContent  = member.role;
  if (bioEl)   bioEl.textContent   = member.bio;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeBtn?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Open on team card click or Enter key
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('click', () => {
    openModal(card.getAttribute('data-team-id'));
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card.getAttribute('data-team-id'));
    }
  });
});

// Close modal
if (closeBtn)     closeBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Close on Escape — handled in main keydown listener above, also handle here for modal focus
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
});

/* ─── CERT CARD TILT (subtle) ───────────────────────────────── */
document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left)  / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)   / rect.height - 0.5) * 10;
    card.style.transform = `translateY(-8px) rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .4s ease, box-shadow .35s ease, border-color .35s ease';
    card.style.transform  = '';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .08s linear, box-shadow .08s linear, border-color .35s ease';
  });
});

/* ─── CONSOLE BRANDING ──────────────────────────────────────── */
console.log('%cInAmigos Foundation 🌿', 'color:#2E8B57;font-size:1.1rem;font-weight:bold;');
console.log('%cUniting Minds For Change', 'color:#4CAF50;font-size:.85rem;');
console.log('%cFounded 23 Sep 2020 · Mr. Govind Shukla · Chhattisgarh, India', 'color:#999;font-size:.78rem;');
