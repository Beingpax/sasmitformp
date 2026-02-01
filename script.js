/* ============================================
   SASMIT POKHREL — Campaign Website Scripts
   ============================================ */

// ---- Language System ----
let currentLang = 'en';

function setLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update all translatable elements
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            el.innerHTML = text;
        }
    });

    // Update document title
    if (lang === 'ne') {
        document.title = 'सस्मित पोखरेल | काठमाडौँ-५ | प्रतिनिधि सभा';
    } else {
        document.title = 'Sasmit Pokharel | Kathmandu-5 | House of Representatives';
    }

    // Store preference
    localStorage.setItem('preferredLang', lang);
}

// ---- Navigation ----
const nav = document.getElementById('mainNav');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

// Scroll handler for nav
function handleScroll() {
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Mobile menu toggle
menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    // Animate hamburger
    const spans = menuBtn.querySelectorAll('span');
    if (menuOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ---- Animated Number Counter ----
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        if (counter.dataset.animated) return;

        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            if (target > 1000) {
                counter.textContent = current.toLocaleString();
            } else {
                counter.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.dataset.animated = 'true';
            }
        }

        requestAnimationFrame(update);
    });
}

// ---- Scroll Reveal (disabled) ----
function initScrollReveal() {
    // No reveal animations
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

// ---- Bell Sound & Interaction ----
function playBellSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.4, now);
    master.connect(ctx.destination);

    // Bell partials — real bells have inharmonic overtones
    const partials = [
        { freq: 440,   gain: 0.45, decay: 2.2 },  // fundamental (hum)
        { freq: 880,   gain: 0.35, decay: 1.8 },  // prime
        { freq: 1318,  gain: 0.20, decay: 1.2 },  // minor third partial
        { freq: 1860,  gain: 0.15, decay: 0.9 },  // fifth partial
        { freq: 2640,  gain: 0.08, decay: 0.5 },  // octave nominal
        { freq: 3520,  gain: 0.04, decay: 0.3 },  // high shimmer
    ];

    partials.forEach(p => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, now);
        // Slight pitch drop for natural feel
        osc.frequency.exponentialRampToValueAtTime(p.freq * 0.998, now + p.decay);
        // Sharp attack, smooth exponential decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(p.gain, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, now + p.decay);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + p.decay + 0.1);
    });

    // Strike transient — short noise burst for the metallic "ding"
    const bufferSize = ctx.sampleRate * 0.03;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    noiseFilter.Q.setValueAtTime(1.5, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    setTimeout(() => ctx.close(), 3000);
}

function initBellInteraction() {
    // Make every bell on the page clickable and ring
    const allBells = document.querySelectorAll('.bell-large, .support-bell-giant, .appeal-bell, .bell-icon, .whoami-tag--bell, .vision-divider span');
    allBells.forEach(bell => {
        bell.style.cursor = 'pointer';
        bell.style.display = 'inline-block';
        bell.style.transformOrigin = 'top center';
        bell.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            playBellSound();
            bell.classList.add('ringing');
            bell.addEventListener('animationend', () => {
                bell.classList.remove('ringing');
            }, { once: true });
        });
    });
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    // Check for stored language preference
    const stored = localStorage.getItem('preferredLang');
    if (stored) {
        setLang(stored);
    }

    initScrollReveal();
    initBellInteraction();

    // Add initial nav state
    handleScroll();
});
