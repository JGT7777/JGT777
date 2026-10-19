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

/* ===== Reveal, contadores, scroll y nav ===== */
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

/* ===== Tilt 3D, foco de neón que sigue al ratón y parallax del collage ===== */
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
    const collage = document.querySelector('#collage');
    addEventListener('pointermove', (e) => {
        document.body.style.setProperty('--mx', `${e.clientX}px`);
        document.body.style.setProperty('--my', `${e.clientY}px`);
        collage.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
        collage.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
    }, { passive: true });
}

/* ===== Selector de juegos ===== */
const games = [
    { title: 'NUMBERY', genre: 'PUZZLE', color: '#19f0ff', url: 'https://jgt7777.github.io/Number-detective/', desc: 'Detective de números: descubre el código con las pistas que te da el juego.' },
    { title: 'JUMPCAT', genre: 'PLATAFORMAS', color: '#ff2bd6', url: 'https://jgt7777.github.io/Jumpcat/', desc: 'Un gato, mucha altura y ningún paracaídas. Salta sin caer.' },
    { title: 'CAT GAMBLING', genre: 'SUERTE', color: '#ffe600', url: 'https://jgt7777.github.io/Cat-Gambling/', desc: 'Apuesta con tu gato y a ver si la suerte está de tu lado.' },
    { title: 'CAT CLICKER', genre: 'CLICKER', color: '#7cff4a', url: 'https://jgt7777.github.io/CatClicker/', desc: 'Haz clic, mejora y deja que los gatos trabajen por ti.' }
];
const selectBox = document.querySelector('#select'), crt = document.querySelector('#crt');
const items = [...document.querySelectorAll('.menu-item')], scenes = [...document.querySelectorAll('.scene')];
const startBtn = document.querySelector('#crt-start');
let selected = -1;
function selectGame(i, userAction = true) {
    if (i === selected) return;
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
    if (userAction) { crt.classList.add('is-switching'); setTimeout(() => crt.classList.remove('is-switching'), 250); }
}
items.forEach((el, i) => {
    el.addEventListener('mouseenter', () => selectGame(i));
    el.addEventListener('focus', () => selectGame(i));
    el.addEventListener('click', () => selectGame(i));
    el.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
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
    document.body.classList.add('burst');
    setTimeout(() => document.body.classList.remove('burst'), 400);
    sessionStorage.setItem('jgt-intro', '1');
    setTimeout(() => intro.remove(), 1200);
}
if (sessionStorage.getItem('jgt-intro')) {
    intro.remove();
    document.body.classList.remove('intro-lock');
} else {
    const introTimer = setTimeout(endIntro, matchMedia('(prefers-reduced-motion: reduce)').matches ? 600 : 2900);
    const skip = () => { clearTimeout(introTimer); endIntro(); };
    intro.addEventListener('click', skip);
    addEventListener('keydown', skip, { once: true });
}
