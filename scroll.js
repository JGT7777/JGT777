const revealItems = document.querySelectorAll('.reveal');
const retroBoot = document.querySelector('#retro-boot');

window.setTimeout(() => {
    retroBoot.classList.add('is-closed');
}, 1900);

window.addEventListener('keydown', () => {
    retroBoot.classList.add('is-closed');
}, { once: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
    });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

const tracks = [
    {
        source: 'music/jgt-radio.mp3',
        label: 'If The Sun Burns Out Tonight (feat. Oli Sykes & Courtney LaPlante).mp3'
    }
];

const audio = new Audio();
audio.preload = 'metadata';
audio.autoplay = true;
const playButton = document.querySelector('#play-track');
const previousButton = document.querySelector('#previous-track');
const nextButton = document.querySelector('#next-track');
const progress = document.querySelector('#music-progress');
const trackName = document.querySelector('#track-name');
const trackTime = document.querySelector('#track-time');
const musicStatus = document.querySelector('#music-status');
const trackButtons = document.querySelectorAll('.track');
const waveBars = document.querySelectorAll('#music-wave span');
let currentTrack = 0;
let audioContext;
let analyser;
let frequencyData;
let visualizerFrame;

const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
};

const loadTrack = (trackIndex) => {
    currentTrack = trackIndex;
    audio.src = tracks[currentTrack].source;
    trackName.textContent = tracks[currentTrack].label;
    trackButtons.forEach((button, index) => button.classList.toggle('active', index === currentTrack));
    progress.value = 0;
    trackTime.textContent = '00:00 / 00:00';
    musicStatus.textContent = 'LISTA';
};

const syncTrackTime = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    progress.value = duration ? (audio.currentTime / duration) * 100 : 0;
    trackTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
    updateScreenShake(audio.currentTime);
};

const updateScreenShake = (currentTime) => {
    document.body.classList.remove('screen-shake-medium', 'screen-shake-soft');
    if (currentTime >= 200 && currentTime < 220) {
        document.body.classList.add('screen-shake-soft');
    } else if (currentTime >= 68 && currentTime < 147) {
        document.body.classList.add('screen-shake-medium');
    }
};

const playTrack = () => {
    audio.play().then(() => {
        playButton.textContent = '||';
        playButton.setAttribute('aria-label', 'Pausar música');
        musicStatus.textContent = 'REPRODUCIENDO';
        startVisualizer();
    }).catch(() => {
        musicStatus.textContent = audio.error ? 'AUDIO NO DISPONIBLE' : 'PULSA PLAY';
    });
};

const updateVisualizer = () => {
    if (!analyser || audio.paused) return;
    analyser.getByteFrequencyData(frequencyData);
    const bassRange = frequencyData.slice(0, Math.floor(frequencyData.length * 0.22));
    const highToneStart = Math.floor(frequencyData.length * 0.45);
    const highToneRange = frequencyData.slice(highToneStart);
    const bass = bassRange.reduce((total, value) => total + value, 0) / bassRange.length;
    const average = highToneRange.reduce((total, value) => total + value, 0) / highToneRange.length;
    const level = Math.min(1, average / 105);
    document.body.style.setProperty('--music-level', level.toFixed(2));
    document.body.style.setProperty('--music-glow', `${Math.round(8 + level * 24)}px`);
    waveBars.forEach((bar, index) => {
        const frequencyIndex = Math.min(frequencyData.length - 1, Math.floor((index / waveBars.length) * frequencyData.length));
        const tone = frequencyData[frequencyIndex] / 255;
        bar.style.setProperty('--wave-height', `${Math.max(4, Math.round(4 + tone * 22))}px`);
    });
    visualizerFrame = requestAnimationFrame(updateVisualizer);
};

const startVisualizer = () => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        const audioSource = audioContext.createMediaElementSource(audio);
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }
    audioContext.resume().catch(() => {});
    document.body.classList.add('is-playing');
    cancelAnimationFrame(visualizerFrame);
    updateVisualizer();
};

const stopVisualizer = () => {
    document.body.classList.remove('is-playing');
    cancelAnimationFrame(visualizerFrame);
    document.body.style.setProperty('--music-level', '0');
    document.body.style.setProperty('--music-glow', '8px');
};

playButton.addEventListener('click', () => {
    if (audio.paused) playTrack();
    else {
        audio.pause();
        stopVisualizer();
        playButton.textContent = '▶';
        playButton.setAttribute('aria-label', 'Reproducir música');
        musicStatus.textContent = 'PAUSADA';
    }
});

previousButton.addEventListener('click', () => loadTrack((currentTrack + tracks.length - 1) % tracks.length));
nextButton.addEventListener('click', () => loadTrack((currentTrack + 1) % tracks.length));
trackButtons.forEach((button) => button.addEventListener('click', () => loadTrack(Number(button.dataset.track))));
progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
});
audio.addEventListener('timeupdate', () => {
    syncTrackTime();
});
audio.addEventListener('loadedmetadata', syncTrackTime);
audio.addEventListener('durationchange', syncTrackTime);
audio.addEventListener('ended', () => {
    loadTrack((currentTrack + 1) % tracks.length);
    playTrack();
});
audio.addEventListener('pause', stopVisualizer);
audio.addEventListener('error', () => {
    musicStatus.textContent = 'AUDIO NO DISPONIBLE';
    trackTime.textContent = '00:00 / 00:00';
});

loadTrack(0);
playTrack();
