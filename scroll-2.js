/* ===== Tema neón fijo ===== */
const theme = {};
const rootCss = getComputedStyle(document.documentElement);
['acid-rgb', 'orange-rgb', 'bg-rgb'].forEach((k) => { theme[k] = rootCss.getPropertyValue(`--${k}`).trim(); });
let heroStarted = false;

/* ===== Visitas globales (Abacus, gratis). Suma 1 por sesión. ===== */
const countEls = [document.querySelector('#visit-count'), document.querySelector('#visit-count-footer')];
const showVisits = (n) => countEls.forEach((el) => { el.textContent = String(n).padStart(4, '0'); });
(async () => {
    const cached = Number(localStorage.getItem('jgt-visits'));
    if (cached) showVisits(cached);
    const first = !sessionStorage.getItem('jgt-counted');
    try {
        const r = await fetch(`https://abacus.jasoncameron.dev/${first ? 'hit' : 'get'}/jgt7777-web/visitas`);
        if (!r.ok) throw new Error(r.status);
        const { value } = await r.json();
        if (first) sessionStorage.setItem('jgt-counted', '1');
        localStorage.setItem('jgt-visits', value);
        showVisits(value);
    } catch {
        if (!cached) countEls.forEach((el) => { el.textContent = 'N/D'; });
    }
})();

/* ===== Reveal, stats, scroll y nav ===== */
function countUp(el) {
    const target = Number(el.dataset.count), start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / 1200);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3)))).padStart(2, '0');
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
const revealObserver = new IntersectionObserver((entries, obs) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-visible');
    obs.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
}), { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const scrollBar = document.querySelector('#scroll-bar');
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const navSections = navLinks.map((l) => document.querySelector(l.getAttribute('href')));
addEventListener('scroll', () => {
    scrollBar.style.width = `${(scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100}%`;
    let cur = 0;
    navSections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    navLinks.forEach((l, i) => l.classList.toggle('active', i === cur));
}, { passive: true });

/* ===== Hero: texto escrito + glitch ===== */
let typeToken = 0;
function startHero() {
    heroStarted = true;
    const el = document.querySelector('#hero-typed');
    const text = el.dataset.h;
    const token = ++typeToken;
    let i = 0;
    el.textContent = '';
    el.classList.add('typing');
    (function type() {
        if (token !== typeToken) return;
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(type, 28); else el.classList.remove('typing');
    })();
    const h1 = [...document.querySelectorAll('h1.glitch')].find((e) => e.offsetParent);
    if (h1) glitchNow(h1);
}
function glitchNow(el) {
    el.classList.add('is-glitching');
    setTimeout(() => el.classList.remove('is-glitching'), 750);
}
const glitchTitles = [...document.querySelectorAll('.glitch')];
setInterval(() => {
    const visible = glitchTitles.filter((e) => e.offsetParent);
    if (visible.length) glitchNow(visible[Math.floor(Math.random() * visible.length)]);
}, 3500);
glitchTitles.forEach((el) => el.addEventListener('mouseenter', () => glitchNow(el)));

/* ===== Tilt 3D ===== */
if (matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transition = 'transform .05s';
            card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transition = ''; card.style.transform = ''; });
    });
}

/* ===== Lluvia de código ===== */
const rain = document.querySelector('#rain'), rctx = rain.getContext('2d');
const rainSet = '01JGT<>/{}$#';
let drops = [];
const sizeRain = () => {
    rain.width = innerWidth; rain.height = innerHeight;
    drops = Array(Math.ceil(innerWidth / 18)).fill(0).map(() => Math.random() * innerHeight / 18);
};
sizeRain();
addEventListener('resize', sizeRain);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
        rctx.fillStyle = `rgba(${theme['bg-rgb']},.12)`;
        rctx.fillRect(0, 0, rain.width, rain.height);
        rctx.fillStyle = `rgb(${theme['acid-rgb']})`;
        rctx.font = '14px "Courier New", monospace';
        drops.forEach((y, i) => {
            const set = rainSet;
            rctx.fillText(set[Math.floor(Math.random() * set.length)], i * 18, y * 18);
            drops[i] = y * 18 > rain.height && Math.random() > 0.975 ? 0 : y + 1;
        });
    }, 60);
}

/* ===== Selector de juegos ===== */
const games = [
    { title: 'NUMBERY', genre: 'PUZZLE', color: '#8dff3f', url: 'https://jgt7777.github.io/Number-detective/', desc: 'Detective de números: descubre el código con las pistas que te da el juego.' },
    { title: 'JUMPCAT', genre: 'PLATAFORMAS', color: '#ff5c35', url: 'https://jgt7777.github.io/Jumpcat/', desc: 'Un gato, mucha altura y ningún paracaídas. Salta sin caer.' },
    { title: 'CAT GAMBLING', genre: 'SUERTE', color: '#ffd23f', url: 'https://jgt7777.github.io/Cat-Gambling/', desc: 'Apuesta con tu gato y a ver si la suerte está de tu lado.' },
    { title: 'CAT CLICKER', genre: 'CLICKER', color: '#3fd5ff', url: 'https://jgt7777.github.io/CatClicker/', desc: 'Haz clic, mejora y deja que los gatos trabajen por ti.' }
];
const selectBox = document.querySelector('#select'), crt = document.querySelector('#crt');
const items = [...document.querySelectorAll('.menu-item')], scenes = [...document.querySelectorAll('.scene')];
const startBtn = document.querySelector('#crt-start');
const numGrid = document.querySelector('#num-grid'), reels = document.querySelector('.reels'), orb = document.querySelector('.orb');
const clickCount = document.querySelector('#click-count');
for (let i = 0; i < 32; i++) numGrid.appendChild(document.createElement('span'));
let timers = [], selected = -1, clicks = 0;

const sceneRunners = [
    () => { // Numbery: números que cambian y se iluminan
        const cells = [...numGrid.children];
        const tick = () => cells.forEach((c) => { c.textContent = Math.floor(Math.random() * 10); c.classList.toggle('hot', Math.random() < 0.12); });
        tick();
        return [setInterval(tick, 220)];
    },
    () => [], // JumpCat: solo CSS
    () => { // Cat Gambling: tragaperras
        const symbols = ['7', '$', '♥', '◆'], spans = [...reels.children];
        const spin = () => {
            reels.classList.remove('win');
            const iv = setInterval(() => spans.forEach((s) => { s.textContent = symbols[Math.floor(Math.random() * symbols.length)]; }), 70);
            setTimeout(() => { clearInterval(iv); spans.forEach((s) => { s.textContent = '7'; }); reels.classList.add('win'); }, 1300);
        };
        spin();
        return [setInterval(spin, 3200)];
    },
    () => { // Cat Clicker: contador que sube
        const click = () => {
            clicks += Math.ceil(Math.random() * 3);
            clickCount.textContent = clicks;
            orb.classList.add('hit');
            setTimeout(() => orb.classList.remove('hit'), 80);
            const p = document.createElement('span');
            p.className = 'plus';
            p.textContent = '+1';
            p.style.left = `${46 + Math.random() * 8}%`;
            p.style.top = '30%';
            scenes[3].appendChild(p);
            setTimeout(() => p.remove(), 800);
        };
        return [setInterval(click, 380)];
    }
];

function selectGame(i, userAction = true) {
    if (i === selected) return;
    timers.forEach(clearInterval);
    const g = games[i];
    selected = i;
    selectBox.style.setProperty('--c', g.color);
    items.forEach((el, n) => el.classList.toggle('is-selected', n === i));
    scenes.forEach((el, n) => el.classList.toggle('is-on', n === i));
    document.querySelector('#crt-title').textContent = g.title;
    document.querySelector('#crt-genre').textContent = g.genre;
    document.querySelector('#crt-desc').textContent = g.desc;
    startBtn.href = g.url;
    startBtn.setAttribute('aria-label', `Jugar a ${g.title}`);
    if (userAction) { crt.classList.add('is-switching'); setTimeout(() => crt.classList.remove('is-switching'), 300); }
    timers = sceneRunners[i]();
}
items.forEach((el, i) => {
    el.addEventListener('mouseenter', () => selectGame(i));
    el.addEventListener('focus', () => selectGame(i));
    el.addEventListener('click', () => selectGame(i));
    el.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const next = (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        items[next].focus();
    });
});
selectGame(0, false);

/* ===== Intro ===== */
const intro = document.querySelector('#intro');
let introDone = false;
function endIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add('is-leaving');
    document.body.classList.remove('intro-lock');
    document.body.classList.add('glitch-burst');
    setTimeout(() => document.body.classList.remove('glitch-burst'), 400);
    sessionStorage.setItem('jgt-intro', '1');
    startHero();
    setTimeout(() => intro.remove(), 1200);
}
if (sessionStorage.getItem('jgt-intro')) {
    intro.remove();
    document.body.classList.remove('intro-lock');
    startHero();
} else {
    const introTimer = setTimeout(endIntro, matchMedia('(prefers-reduced-motion: reduce)').matches ? 600 : 2900);
    const skip = () => { clearTimeout(introTimer); endIntro(); };
    intro.addEventListener('click', skip);
    addEventListener('keydown', skip, { once: true });
}
