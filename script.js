const audio = document.getElementById('audio');
const tracks = document.querySelectorAll('.track');
const loader = document.getElementById('loader');
const page = document.querySelector('.page');
const continueBtn = document.getElementById('continueBtn');
const volume = document.querySelector('.volume');
const volBar = document.querySelector('.vol-bar');
const volFill = document.querySelector('.vol-fill');

// Начальная громкость
audio.volume = 0.33;
volFill.style.width = '33%';

let currentTrack = null;
let isSeeking = false;

// Форматирование времени
function format(t) {
    if (isNaN(t) || t === Infinity) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Показать контролы трека
function showControls(track) {
    const controls = track.querySelector('.controls');
    const playBtn = track.querySelector('.play');
    const dur = track.querySelector('.dur');
    
    controls.classList.remove('hidden');
    playBtn.textContent = '⏸';
    
    // Установить длительность если трек уже загружен
    if (audio.src === track.dataset.src && !isNaN(audio.duration)) {
        dur.textContent = format(audio.duration);
    }
}

// Скрыть контролы трека и сбросить состояние
function hideControls(track) {
    const controls = track.querySelector('.controls');
    const playBtn = track.querySelector('.play');
    const fill = track.querySelector('.fill');
    const cur = track.querySelector('.cur');
    const dur = track.querySelector('.dur');
    
    controls.classList.add('hidden');
    playBtn.textContent = '▶';
    fill.style.width = '0%';
    cur.textContent = '0:00';
    dur.textContent = '0:00';
}

// Воспроизведение трека
function playTrack(track) {
    const src = track.dataset.src;
    const playBtn = track.querySelector('.play');
    
    // Если кликнули на тот же трек
    if (currentTrack === track) {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸';
        } else {
            audio.pause();
            playBtn.textContent = '▶';
        }
        return;
    }
    
    // Если есть другой играющий трек
    if (currentTrack && currentTrack !== track) {
        audio.pause();
        hideControls(currentTrack);
    }
    
    // Установить новый текущий трек
    currentTrack = track;
    
    // Загрузить новый трек если нужно
    if (audio.src !== src) {
        audio.src = src;
        audio.load();
        
        audio.onloadedmetadata = () => {
            const dur = track.querySelector('.dur');
            dur.textContent = format(audio.duration);
            audio.play();
            playBtn.textContent = '⏸';
        };
    } else {
        audio.play();
        playBtn.textContent = '⏸';
    }
    
    showControls(track);
}

// Обновление прогресса трека
function updateProgress() {
    if (!currentTrack || audio.paused || isSeeking) return;
    
    const fill = currentTrack.querySelector('.fill');
    const cur = currentTrack.querySelector('.cur');
    const dur = currentTrack.querySelector('.dur');
    
    if (!isNaN(audio.duration) && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        fill.style.width = `${percent}%`;
        cur.textContent = format(audio.currentTime);
        
        // Обновить длительность на случай если изменилась
        dur.textContent = format(audio.duration);
    }
}

// Обработчики для треков
tracks.forEach(track => {
    const playBtn = track.querySelector('.play');
    
    // Клик на кнопку воспроизведения
    playBtn.onclick = (e) => {
        e.stopPropagation();
        playTrack(track);
    };
    
    // Клик на весь трек
    track.onclick = (e) => {
        if (e.target === playBtn || e.target.closest('.bar') || e.target.closest('.controls')) return;
        playTrack(track);
    };
    
    // Перемотка по клику на таймлайн
    const bar = track.querySelector('.bar');
    bar.onmousedown = (e) => {
        if (!currentTrack || currentTrack !== track) return;
        
        isSeeking = true;
        const rect = bar.getBoundingClientRect();
        const seek = (e.clientX - rect.left) / rect.width;
        
        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = seek * audio.duration;
        }
        
        const onMouseMove = (e) => {
            const rect = bar.getBoundingClientRect();
            const seek = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            
            if (audio.duration && !isNaN(audio.duration)) {
                audio.currentTime = seek * audio.duration;
                
                const fill = track.querySelector('.fill');
                const cur = track.querySelector('.cur');
                
                fill.style.width = `${seek * 100}%`;
                cur.textContent = format(audio.currentTime);
            }
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            isSeeking = false;
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
});

// Кнопка continue
continueBtn.onclick = () => {
    loader.style.display = 'none';
    page.classList.remove('hidden');
    volume.classList.remove('hidden');
    
    // Воспроизвести 5-й трек
    playTrack(tracks[4]);
    
    // Прокрутить к верху страницы после загрузки
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Регулировка громкости
volBar.onmousedown = (e) => {
    const rect = volBar.getBoundingClientRect();
    const updateVolume = (clientX) => {
        const perc = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        audio.volume = perc;
        volFill.style.width = `${perc * 100}%`;
    };
    
    updateVolume(e.clientX);
    
    const onMouseMove = (e) => updateVolume(e.clientX);
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

// События аудио
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    if (currentTrack) {
        const playBtn = currentTrack.querySelector('.play');
        playBtn.textContent = '▶';
    }
});

audio.addEventListener('play', () => {
    if (currentTrack) {
        currentTrack.querySelector('.play').textContent = '⏸';
    }
});

audio.addEventListener('pause', () => {
    if (currentTrack) {
        currentTrack.querySelector('.play').textContent = '▶';
    }
});

// При загрузке страницы скрыть всё кроме loader
document.addEventListener('DOMContentLoaded', () => {
    // Убедимся что только loader виден
    loader.style.display = 'flex';
    page.classList.add('hidden');
    volume.classList.add('hidden');
    
    // Добавляем класс loaded для плавного появления
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Добавляем плавное появление для loader
window.addEventListener('load', () => {
    const loaderBtn = document.getElementById('continueBtn');
    loaderBtn.style.opacity = '0';
    loaderBtn.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        loaderBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        loaderBtn.style.opacity = '1';
        loaderBtn.style.transform = 'translateY(0)';
    }, 300);
});


// Эффект падающих сердечек сакуры
function createSakuraEffect() {
    // Создаем контейнер если его нет
    let container = document.getElementById('sakura-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sakura-container';
        document.body.appendChild(container);
    }
    
    // Цвета сердечек
    const colors = [
        '#ffb6c1', '#ffc0cb', '#ffb7c5', '#ffa6c9',
        '#ff91a4', '#ffccd5', '#ffafcc', '#ffcad4'
    ];
    
    // Создание одного лепестка
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'sakura-heart';
        
        // Случайный размер
        const size = 10 + Math.random() * 20;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        
        // Случайный цвет
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        petal.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        // Начальная позиция
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.top = `-30px`;
        
        // Случайные параметры
        petal.style.opacity = `${0.4 + Math.random() * 0.6}`;
        const startRotation = Math.random() * 360;
        petal.style.transform = `rotate(${startRotation}deg)`;
        
        container.appendChild(petal);
        
        // Параметры анимации
        const duration = 10 + Math.random() * 15;
        const driftX = (Math.random() - 0.5) * 150; // дрейф по X
        const endRotation = startRotation + 180 + Math.random() * 180;
        
        // Создаем анимацию с помощью Web Animations API
        const animation = petal.animate([
            {
                transform: `translate(0, 0) rotate(${startRotation}deg)`,
                opacity: parseFloat(petal.style.opacity)
            },
            {
                transform: `translate(${driftX * 0.3}px, 40vh) rotate(${startRotation + 90}deg)`,
                opacity: parseFloat(petal.style.opacity) * 0.8
            },
            {
                transform: `translate(${driftX * 0.6}px, 80vh) rotate(${startRotation + 180}deg)`,
                opacity: parseFloat(petal.style.opacity) * 0.5
            },
            {
                transform: `translate(${driftX}px, 120vh) rotate(${endRotation}deg)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Удаляем лепесток после анимации
        animation.onfinish = () => {
            if (petal.parentNode) {
                petal.remove();
            }
        };
    }
    
    // Сразу создаем первую партию лепестков
    for (let i = 0; i < 15; i++) {
        createPetal();
    }
    
    // Запускаем интервал для постоянного создания
    const intervalId = setInterval(() => {
        if (document.getElementById('sakura-container')) {
            createPetal();
        } else {
            clearInterval(intervalId);
        }
    }, 300); // новый лепесток каждые 300мс
    
    // Сохраняем ID интервала для возможной очистки
    container._sakuraInterval = intervalId;
}

// Запускаем эффект как можно раньше
window.addEventListener('load', () => {
    // Небольшая задержка для отображения loader
    setTimeout(() => {
        createSakuraEffect();
    }, 100);
});

// Также запускаем при готовности DOM (на всякий случай)
document.addEventListener('DOMContentLoaded', () => {
    // Если уже запустили через load, не запускаем повторно
    if (!document.getElementById('sakura-container')) {
        setTimeout(() => {
            createSakuraEffect();
        }, 500);
    }
});