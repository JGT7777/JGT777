const revealItems = document.querySelectorAll('.reveal');

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
        source: 'music/If%20The%20Sun%20Burns%20Out%20Tonight%20(feat.%20Oli%20Sykes%20%26%20Courtney%20LaPlante).mp3',
        label: 'If The Sun Burns Out Tonight (feat. Oli Sykes & Courtney LaPlante).mp3'
    },
    { source: 'music/cancion-2.mp3', label: 'cancion-2.mp3' },
    { source: 'music/cancion-3.mp3', label: 'cancion-3.mp3' },
    { source: 'music/cancion-4.mp3', label: 'cancion-4.mp3' }
];

const audio = new Audio();
const playButton = document.querySelector('#play-track');
const previousButton = document.querySelector('#previous-track');
const nextButton = document.querySelector('#next-track');
const progress = document.querySelector('#music-progress');
const trackName = document.querySelector('#track-name');
const trackTime = document.querySelector('#track-time');
const musicStatus = document.querySelector('#music-status');
const trackButtons = document.querySelectorAll('.track');
let currentTrack = 0;

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

const playTrack = () => {
    audio.play().then(() => {
        playButton.textContent = '||';
        playButton.setAttribute('aria-label', 'Pausar música');
        musicStatus.textContent = 'REPRODUCIENDO';
    }).catch(() => {
        musicStatus.textContent = 'AÑADE LOS MP3';
    });
};

playButton.addEventListener('click', () => {
    if (audio.paused) playTrack();
    else {
        audio.pause();
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
    progress.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    trackTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});
audio.addEventListener('ended', () => {
    loadTrack((currentTrack + 1) % tracks.length);
    playTrack();
});

loadTrack(0);
