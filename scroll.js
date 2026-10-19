/* ===== Boot + elección de bando ===== */
const retroBoot = document.querySelector('#retro-boot');
let heroStarted = false;
let side = localStorage.getItem('jgt-side') === 'security' ? 'security' : 'hacker';
const theme = {};
const closeBoot = () => {
    if (retroBoot.classList.contains('is-closed')) return;
    retroBoot.classList.add('is-closed');
    startHero();
};
function applySide(s) {
    side = s;
    document.body.dataset.side = s;
    localStorage.setItem('jgt-side', s);
    const css = getComputedStyle(document.body);
    ['acid-rgb', 'orange-rgb', 'bg-rgb'].forEach((k) => { theme[k] = css.getPropertyValue(`--${k}`).trim(); });
    sizeRain();
}
const chooseSide = (s) => {
    applySide(s);
    document.body.classList.add('glitch-burst');
    setTimeout(() => document.body.classList.remove('glitch-burst'), 400);
    closeBoot();
};
document.querySelectorAll('.side-btn').forEach((b) => b.addEventListener('click', () => chooseSide(b.dataset.side)));
document.querySelector('#side-switch').addEventListener('click', () => {
    retroBoot.classList.add('is-reopen');
    retroBoot.classList.remove('is-closed');
    retroBoot.querySelector(`.side-btn[data-side="${side}"]`).focus();
});
addEventListener('keydown', (e) => {
    if (retroBoot.classList.contains('is-closed')) return;
    const k = e.key.toLowerCase();
    if (k === 'h') chooseSide('hacker');
    else if (k === 's') chooseSide('security');
    else if (k === 'enter' && !document.activeElement.classList.contains('side-btn')) chooseSide(side);
});

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
    const text = side === 'security' ? el.dataset.s : el.dataset.h;
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
    if (side === 'security' && Math.random() < 0.7) return;
    const visible = glitchTitles.filter((e) => e.offsetParent);
    if (visible.length) glitchNow(visible[Math.floor(Math.random() * visible.length)]);
}, 3500);
setInterval(() => {
    if (side !== 'hacker' || Math.random() < 0.5) return;
    document.body.classList.add('glitch-burst');
    setTimeout(() => document.body.classList.remove('glitch-burst'), 400);
}, 11000);
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
const rainSets = { hacker: '01JGT<>/{}$#', security: '0123456789ABCDEF' };
let rainTick = 0;
let drops = [];
const sizeRain = () => {
    rain.width = innerWidth; rain.height = innerHeight;
    drops = Array(Math.ceil(innerWidth / 18)).fill(0).map(() => Math.random() * innerHeight / 18);
};
sizeRain();
addEventListener('resize', sizeRain);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
        if (side === 'security' && (rainTick++ % 2)) return;
        rctx.fillStyle = `rgba(${theme['bg-rgb']},.12)`;
        rctx.fillRect(0, 0, rain.width, rain.height);
        rctx.fillStyle = `rgb(${theme['acid-rgb']})`;
        rctx.font = '14px "Courier New", monospace';
        drops.forEach((y, i) => {
            const set = rainSets[side];
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

/* ===== Osciloscopio (reacciona a la música) ===== */
const scope = document.querySelector('#scope'), sctx = scope.getContext('2d'), ampEl = document.querySelector('#scope-amp');
let scopeT = 0, scopeVisible = true, timeData;
new IntersectionObserver(([e]) => { scopeVisible = e.isIntersecting; }).observe(scope);
const sizeScope = () => { scope.width = scope.clientWidth; scope.height = scope.clientHeight; };
sizeScope();
addEventListener('resize', sizeScope);
const drawScope = () => {
    requestAnimationFrame(drawScope);
    if (!scopeVisible) return;
    const w = scope.width, h = scope.height;
    sctx.clearRect(0, 0, w, h);
    const live = analyser && !audio.paused;
    if (live) {
        if (!timeData || timeData.length !== analyser.fftSize) timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);
    }
    let peak = 0;
    sctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
        let v;
        if (live) v = (timeData[Math.floor((x / w) * (timeData.length - 1))] - 128) / 128;
        else v = Math.sin(x * 0.02 + scopeT) * 0.25 + Math.sin(x * 0.055 - scopeT * 1.7) * 0.1;
        peak = Math.max(peak, Math.abs(v));
        const y = h / 2 + v * h * 0.45;
        x === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
    }
    sctx.strokeStyle = `rgb(${theme['acid-rgb']})`;
    sctx.lineWidth = 2;
    sctx.shadowColor = `rgb(${theme['acid-rgb']})`;
    sctx.shadowBlur = 12;
    sctx.stroke();
    // eco naranja desfasado
    sctx.beginPath();
    for (let x = 0; x <= w; x += 6) sctx.lineTo(x, h / 2 + Math.sin(x * 0.02 + scopeT * 0.6) * 4 * (1 + peak * 4));
    sctx.strokeStyle = `rgba(${theme['orange-rgb']},.55)`;
    sctx.lineWidth = 1;
    sctx.shadowBlur = 0;
    sctx.stroke();
    scopeT += 0.05;
    ampEl.textContent = String(Math.round(peak * 99)).padStart(2, '0');
};

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
    musicStatus.textContent = 'LISTA';
};
const updateShake = (t) => {
    document.body.classList.remove('screen-shake-medium', 'screen-shake-soft');
    if (t >= 200 && t < 220) document.body.classList.add('screen-shake-soft');
    else if (t >= 68 && t < 147) document.body.classList.add('screen-shake-medium');
};
const syncTime = () => {
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    progress.value = d ? (audio.currentTime / d) * 100 : 0;
    trackTime.textContent = `${fmt(audio.currentTime)} / ${fmt(d)}`;
    updateShake(audio.currentTime);
};
const setUI = (playing) => {
    playButton.textContent = playing ? '||' : '▶';
    playButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
};
const vizLoop = () => {
    if (!analyser || audio.paused) return;
    analyser.getByteFrequencyData(frequencyData);
    const hi = frequencyData.slice(Math.floor(frequencyData.length * 0.45));
    const level = Math.min(1, hi.reduce((a, b) => a + b, 0) / hi.length / 105);
    document.body.style.setProperty('--music-level', level.toFixed(2));
    document.body.style.setProperty('--music-glow', `${Math.round(8 + level * 24)}px`);
    waveBars.forEach((bar, i) => {
        const idx = Math.min(frequencyData.length - 1, Math.floor((i / waveBars.length) * frequencyData.length));
        bar.style.setProperty('--wave-height', `${Math.max(4, Math.round(4 + (frequencyData[idx] / 255) * 22))}px`);
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
    document.body.classList.add('is-playing');
    cancelAnimationFrame(vizFrame);
    vizLoop();
};
const stopViz = () => {
    document.body.classList.remove('is-playing');
    cancelAnimationFrame(vizFrame);
    document.body.style.setProperty('--music-level', '0');
    document.body.style.setProperty('--music-glow', '8px');
};
const play = () => audio.play().then(() => {
    setUI(true);
    musicStatus.textContent = 'REPRODUCIENDO';
    startViz();
}).catch(() => { musicStatus.textContent = audio.error ? 'AUDIO NO DISPONIBLE' : 'PULSA PLAY'; });

// Los navegadores bloquean el audio hasta la primera interacción: arranca con ella.
const firstInteraction = () => { if (audio.paused && !audio.error) play(); };
['keydown', 'pointerdown'].forEach((ev) => document.addEventListener(ev, firstInteraction, { once: true }));

playButton.addEventListener('click', () => {
    if (audio.paused) play();
    else { audio.pause(); setUI(false); musicStatus.textContent = 'PAUSADA'; }
});
document.querySelector('#previous-track').addEventListener('click', () => { loadTrack((currentTrack + tracks.length - 1) % tracks.length); play(); });
document.querySelector('#next-track').addEventListener('click', () => { loadTrack((currentTrack + 1) % tracks.length); play(); });
trackButtons.forEach((b) => b.addEventListener('click', () => { loadTrack(Number(b.dataset.track)); play(); }));
progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration; });
['timeupdate', 'loadedmetadata', 'durationchange'].forEach((ev) => audio.addEventListener(ev, syncTime));
audio.addEventListener('ended', () => { loadTrack((currentTrack + 1) % tracks.length); play(); });
audio.addEventListener('pause', stopViz);
audio.addEventListener('error', () => { musicStatus.textContent = 'AUDIO NO DISPONIBLE'; trackTime.textContent = '00:00 / 00:00'; });

applySide(side);
loadTrack(0);
play();
drawScope();
