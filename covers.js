/* Portadas de los juegos en la pantalla del selector.
   Si una imagen no existe, se oculta y se ve la animación de siempre. */
const gameCovers = [
    'img/numbery.png',
    'img/jumpcat.png',
    'img/cat-gambling.png',
    'img/cat-clicker.png'
];
const coverScreen = document.querySelector('.crt-screen');
const coverImg = document.createElement('img');
coverImg.className = 'cover';
coverImg.alt = '';
coverScreen.appendChild(coverImg);
coverImg.addEventListener('error', () => { coverImg.hidden = true; });
const showCover = (i) => { coverImg.hidden = false; coverImg.src = gameCovers[i]; };
document.querySelectorAll('.menu-item').forEach((el, i) => {
    ['mouseenter', 'focus', 'click'].forEach((ev) => el.addEventListener(ev, () => showCover(i)));
});
showCover(0);
