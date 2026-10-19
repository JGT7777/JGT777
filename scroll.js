/* ===== Tema (Neón / Papel / Chicle) ===== */
const THEMES = ['neon', 'papel', 'chicle'];
const themeButtons = [...document.querySelectorAll('.themes button')];
const metaTheme = document.querySelector('#meta-theme');
function applyTheme(t) {
    if (!THEMES.includes(t)) t = 'neon';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('jgt-theme', t); } catch (e) { /* sin almacenamiento */ }
    themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === t)));
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    if (bg) metaTheme.setAttribute('content', bg);
}
themeButtons.forEach((b) => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
applyTheme(document.documentElement.dataset.theme);

/* ===== Reveal, números que suben, barra de scroll y menú ===== */
function countUp(el) {
    const target = Number(el.dataset.count), start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / 1000);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3)))).padStart(2, '0');
        if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/* ===== Certificados =====
   EDITA ESTA LISTA con tus certificados reales.
   - title: nombre del certificado   - issuer: quién lo da   - year: año
   - url: enlace al certificado (opcional, tiene que empezar por https://)
   Los que tienen example:true salen marcados como "ejemplo": bórralos o quita esa línea. */
const certificates = [
    { title: 'Nombre de tu primer certificado', issuer: 'Quién lo emitió', year: '2026', url: '', example: true },
    { title: 'Otro curso o título', issuer: 'Plataforma o academia', year: '2026', url: '', example: true },
    { title: 'Y otro más', issuer: 'Quién lo emitió', year: '2025', url: '', example: true }
];
const certGrid = document.querySelector('#cert-grid');
function renderCertificates() {
    certGrid.textContent = '';
    if (!certificates.length) {
        const p = document.createElement('p');
        p.className = 'section-note';
        p.textContent = 'Pronto habrá certificados por aquí.';
        certGrid.appendChild(p);
        return;
    }
    certificates.forEach((c) => {
        const card = document.createElement('article');
        card.className = 'cert' + (c.example ? ' is-example' : '');
        const seal = document.createElement('span');
        seal.className = 'cert-seal';
        seal.setAttribute('aria-hidden', 'true');
        seal.textContent = '✦';
        const year = document.createElement('span');
        year.className = 'cert-year';
        year.textContent = c.year || '';
        const h = document.createElement('h3');
        h.textContent = c.title;
        const issuer = document.createElement('p');
        issuer.className = 'cert-issuer';
        issuer.textContent = c.issuer || '';
        card.append(seal, year, h, issuer);
        if (c.example) {
            const tag = document.createElement('span');
            tag.className = 'cert-example';
            tag.textContent = 'ejemplo';
            card.appendChild(tag);
        } else if (c.url && c.url.startsWith('https://')) {
            const a = document.createElement('a');
            a.href = c.url;
            a.target = '_blank';
            a.rel = 'noreferrer';
            a.textContent = 'Ver certificado ↗';
            card.appendChild(a);
        }
        certGrid.appendChild(card);
    });
}
renderCertificates();

const revealObserver = new IntersectionObserver((entries, obs) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-visible');
    obs.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const scrollBar = document.querySelector('#scroll-bar');
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const navSections = navLinks.map((l) => document.querySelector(l.getAttribute('href')));
const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    let cur = 0;
    navSections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    navLinks.forEach((l, i) => l.classList.toggle('active', i === cur));
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ===== Gato oráculo ===== */
const answers = [
    'Sí. Pero primero dame de comer.',
    'Ni de broma.',
    'Pregúntamelo cuando termine de dormir.',
    'Todo apunta a que sí… y a que tires algo de la mesa.',
    'Haz un commit y vete a descansar.',
    'Eso huele a bug.',
    'Prueba a reiniciarlo.',
    'Compila a la primera. (Mentira.)',
    'Mejor no toques nada.',
    'Sí, pero con más gatos.',
    'Miau.',
    'Lo veo clarísimo: no tengo ni idea.',
    'Ahora no, estoy ocupado mirando una pared.',
    'Funciona en mi máquina.'
];
const oracleForm = document.querySelector('#oracle-form');
const oracleQ = document.querySelector('#oracle-q');
const oracleAnswer = document.querySelector('#oracle-answer');
const oracleCat = document.querySelector('#oracle-cat');
let lastAnswer = -1;
oracleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    oracleCat.classList.remove('think');
    void oracleCat.offsetWidth;
    oracleCat.classList.add('think');
    oracleAnswer.textContent = '…';
    setTimeout(() => {
        if (!oracleQ.value.trim()) {
            oracleAnswer.textContent = 'Ni una pregunta me haces. Miau.';
            return;
        }
        let i;
        do { i = Math.floor(Math.random() * answers.length); } while (i === lastAnswer);
        lastAnswer = i;
        oracleAnswer.textContent = answers[i];
    }, 550);
});

/* ===== Secreto: 5 clics rápidos en el logo ===== */
const brand = document.querySelector('#brand');
let brandClicks = 0, brandTimer;
brand.addEventListener('click', () => {
    brandClicks++;
    clearTimeout(brandTimer);
    brandTimer = setTimeout(() => { brandClicks = 0; }, 1200);
    if (brandClicks < 5) return;
    brandClicks = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 26; i++) {
        const c = document.createElement('span');
        c.className = 'rain-cat';
        c.textContent = '=^.^=';
        c.style.left = `${Math.random() * 95}vw`;
        c.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
        c.style.animationDelay = `${Math.random() * 1.2}s`;
        c.style.fontSize = `${16 + Math.random() * 18}px`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 6200);
    }
});

/* ===== Selector de juegos ===== */
const games = [
    { title: 'Numbery', genre: 'Puzzle', color: '#8cc4ff', url: 'https://jgt7777.github.io/Number-detective/', desc: 'Detective de números: descubre el código con las pistas que te da el juego.' },
    { title: 'Jumpcat', genre: 'Plataformas', color: '#ff8f73', url: 'https://jgt7777.github.io/Jumpcat/', desc: 'Un gato, mucha altura y ningún paracaídas. Salta sin caer.' },
    { title: 'Cat Gambling', genre: 'Suerte', color: '#ffc83d', url: 'https://jgt7777.github.io/Cat-Gambling/', desc: 'Apuesta con tu gato y a ver si la suerte está de tu lado.' },
    { title: 'Cat Clicker', genre: 'Clicker', color: '#7bd9ae', url: 'https://jgt7777.github.io/CatClicker/', desc: 'Haz clic, mejora y deja que los gatos trabajen por ti.' }
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
        return [setInterval(tick, 260)];
    },
    () => [], // Jumpcat: solo CSS
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

/* ===== Reproductor ===== */
const tracks = [{ source: 'music/jgt-radio.mp3', label: 'If The Sun Burns Out Tonight (feat. Oli Sykes & Courtney LaPlante).mp3' }];
const audio = new Audio();
audio.preload = 'metadata';
const playerBox = document.querySelector('#music-player');
const playButton = document.querySelector('#play-track');
const progress = document.querySelector('#music-progress');
const trackName = document.querySelector('#track-name');
const trackTime = document.querySelector('#track-time');
const musicStatus = document.querySelector('#music-status');
const trackButtons = document.querySelectorAll('.track');
const waveBars = document.querySelectorAll('#music-wave span');
let currentTrack = 0, audioContext, analyser, frequencyData, vizFrame;
document.querySelector('#min-player').addEventListener('click', () => playerBox.classList.toggle('is-min'));

const fmt = (s) => Number.isFinite(s) ? `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '00:00';
const loadTrack = (i) => {
    currentTrack = i;
    audio.src = tracks[i].source;
    trackName.textContent = tracks[i].label;
    trackButtons.forEach((b, n) => b.classList.toggle('active', n === i));
    progress.value = 0;
    trackTime.textContent = '00:00 / 00:00';
    musicStatus.textContent = 'Lista';
};
const syncTime = () => {
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    progress.value = d ? (audio.currentTime / d) * 100 : 0;
    trackTime.textContent = `${fmt(audio.currentTime)} / ${fmt(d)}`;
};
const setUI = (playing) => {
    playButton.textContent = playing ? '||' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
};
const resetWave = () => waveBars.forEach((bar) => bar.style.setProperty('--wave-height', '4px'));
const vizLoop = () => {
    if (!analyser || audio.paused) return;
    analyser.getByteFrequencyData(frequencyData);
    waveBars.forEach((bar, i) => {
        const idx = Math.min(frequencyData.length - 1, Math.floor((i / waveBars.length) * frequencyData.length));
        bar.style.setProperty('--wave-height', `${Math.max(4, Math.round(4 + (frequencyData[idx] / 255) * 24))}px`);
    });
    vizFrame = requestAnimationFrame(vizLoop);
};
const startViz = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioContext) {
        audioContext = new AC();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        audioContext.createMediaElementSource(audio).connect(analyser);
        analyser.connect(audioContext.destination);
    }
    audioContext.resume().catch(() => {});
    cancelAnimationFrame(vizFrame);
    vizLoop();
};
const play = () => audio.play().then(() => {
    setUI(true);
    musicStatus.textContent = 'Sonando';
    startViz();
}).catch(() => { musicStatus.textContent = audio.error ? 'Audio no disponible' : 'Pulsa play'; });

playButton.addEventListener('click', () => {
    if (audio.paused) play();
    else { audio.pause(); setUI(false); musicStatus.textContent = 'Pausada'; }
});
document.querySelector('#previous-track').addEventListener('click', () => { loadTrack((currentTrack + tracks.length - 1) % tracks.length); play(); });
document.querySelector('#next-track').addEventListener('click', () => { loadTrack((currentTrack + 1) % tracks.length); play(); });
trackButtons.forEach((b) => b.addEventListener('click', () => { loadTrack(Number(b.dataset.track)); play(); }));
progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration; });
['timeupdate', 'loadedmetadata', 'durationchange'].forEach((ev) => audio.addEventListener(ev, syncTime));
audio.addEventListener('ended', () => { loadTrack((currentTrack + 1) % tracks.length); play(); });
audio.addEventListener('pause', () => { cancelAnimationFrame(vizFrame); resetWave(); });
audio.addEventListener('error', () => { musicStatus.textContent = 'Audio no disponible'; trackTime.textContent = '00:00 / 00:00'; });

loadTrack(0);
