
document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const loader = document.getElementById('loader');
    
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-text">0%</div>
    `;
    
    
    continueBtn.parentNode.insertBefore(progressContainer, continueBtn);
    
    
    continueBtn.style.opacity = '0';
    continueBtn.style.pointerEvents = 'none';
    continueBtn.style.transform = 'translateY(20px)';
    
    
    const filesToLoad = [
        'wallpaper.jpg',
        'track1.png',
        'track2.png',
        'track3.jpg',
        'track4.jpg',
        'track5.jpg'
    ];
    
    let loadedCount = 0;
    const totalFiles = filesToLoad.length;
    
    
    function updateProgress() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalFiles) * 100);
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
            
            
            if (loadedCount === totalFiles) {
                
                loader.style.background = `url('wallpaper.jpg') no-repeat center center`;
                loader.style.backgroundSize = 'cover';
                loader.style.transition = 'background 0.5s ease';
                
                
                setTimeout(() => {
                    progressContainer.style.opacity = '0';
                    progressContainer.style.transform = 'translateY(-10px)';
                    progressContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    
                    setTimeout(() => {
                        progressContainer.remove();
                        
                        
                        continueBtn.style.opacity = '1';
                        continueBtn.style.transform = 'translateY(0)';
                        continueBtn.style.pointerEvents = 'auto';
                        continueBtn.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                    }, 500);
                }, 500);
            }
        }
    }
    
    
    filesToLoad.forEach(file => {
        const img = new Image();
        img.src = file;
        
        img.onload = updateProgress;
        img.onerror = () => {
            console.warn(`Не удалось загрузить: ${file}`);
            updateProgress(); 
        };
    });
});


const audio = document.getElementById('audio');
const tracks = document.querySelectorAll('.track');
const loader = document.getElementById('loader');
const page = document.querySelector('.page');
const continueBtn = document.getElementById('continueBtn');
const volume = document.querySelector('.volume');
const volBar = document.querySelector('.vol-bar');
const volFill = document.querySelector('.vol-fill');


audio.volume = 0.33;
volFill.style.width = '33%';

let currentTrack = null;
let isSeeking = false;
let autoPlayAttempted = false;


function format(t) {
    if (isNaN(t) || t === Infinity) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}


function showControls(track) {
    const controls = track.querySelector('.controls');
    const playBtn = track.querySelector('.play');
    const dur = track.querySelector('.dur');
    
    controls.classList.remove('hidden');
    playBtn.textContent = '⏸';
    
    
    if (audio.src && audio.src.includes(track.dataset.src) && !isNaN(audio.duration)) {
        dur.textContent = format(audio.duration);
    }
}


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


function playTrack(track) {
    const src = track.dataset.src;
    const playBtn = track.querySelector('.play');
    
    
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
    
    
    if (currentTrack && currentTrack !== track) {
        audio.pause();
        hideControls(currentTrack);
    }
    
    
    currentTrack = track;
    
    
    if (!audio.src || !audio.src.includes(src)) {
        audio.src = src;
        
        
        showControls(track);
        
        
        audio.onloadedmetadata = () => {
            const dur = track.querySelector('.dur');
            dur.textContent = format(audio.duration);
        };
        
        audio.load();
    }
    
    
    audio.play().then(() => {
        playBtn.textContent = '⏸';
    }).catch(error => {
        console.log('Ошибка воспроизведения:', error);
        
        playBtn.textContent = '▶';
    });
}


function updateProgress() {
    if (!currentTrack || audio.paused || isSeeking) return;
    
    const fill = currentTrack.querySelector('.fill');
    const cur = currentTrack.querySelector('.cur');
    const dur = currentTrack.querySelector('.dur');
    
    if (!isNaN(audio.duration) && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        fill.style.width = `${percent}%`;
        cur.textContent = format(audio.currentTime);
        
        
        dur.textContent = format(audio.duration);
    }
}


tracks.forEach(track => {
    const playBtn = track.querySelector('.play');
    
    
    playBtn.onclick = (e) => {
        e.stopPropagation();
        playTrack(track);
    };
    
    
    track.onclick = (e) => {
        if (e.target === playBtn || e.target.closest('.bar') || e.target.closest('.controls')) return;
        playTrack(track);
    };
    
    
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


continueBtn.onclick = () => {
    
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    loader.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        loader.style.display = 'none';
        page.classList.remove('hidden');
        volume.classList.remove('hidden');
        
        
        document.body.style.background = `url('wallpaper.jpg') no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        
        
        if (tracks[4] && !autoPlayAttempted) {
            autoPlayAttempted = true;
            
            
            const autoplayTrack = tracks[4];
            const autoplaySrc = autoplayTrack.dataset.src;
            
            
            currentTrack = autoplayTrack;
            
            
            showControls(autoplayTrack);
            
            
            audio.src = autoplaySrc;
            audio.load();
            
            
            audio.onloadedmetadata = () => {
                const dur = autoplayTrack.querySelector('.dur');
                dur.textContent = format(audio.duration);
                
                
                audio.play().then(() => {
                    autoplayTrack.querySelector('.play').textContent = '⏸';
                    console.log('Автовоспроизведение успешно');
                }).catch(error => {
                    console.log('Автовоспроизведение заблокировано. Нажмите на трек для начала.', error);
                    
                    autoplayTrack.querySelector('.play').textContent = '▶';
                });
            };
            
            audio.onerror = () => {
                console.error('Ошибка загрузки трека для автовоспроизведения');
            };
        }
        
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
};


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


function createSakuraEffect() {
    
    let container = document.getElementById('sakura-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'sakura-container';
        document.body.appendChild(container);
    }
    
    
    const colors = [
        '#ffb6c1', '#ffc0cb', '#ffb7c5', '#ffa6c9',
        '#ff91a4', '#ffccd5', '#ffafcc', '#ffcad4'
    ];
    
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.className = 'sakura-heart';
        
        
        const size = 10 + Math.random() * 20;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        
        
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        petal.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.top = `-30px`;
        
        
        petal.style.opacity = `${0.4 + Math.random() * 0.6}`;
        const startRotation = Math.random() * 360;
        petal.style.transform = `rotate(${startRotation}deg)`;
        
        container.appendChild(petal);
        
        
        const duration = 10 + Math.random() * 15;
        const driftX = (Math.random() - 0.5) * 150;
        const endRotation = startRotation + 180 + Math.random() * 180;
        
        
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
        
        
        animation.onfinish = () => {
            if (petal.parentNode) {
                petal.remove();
            }
        };
    }
    
    
    for (let i = 0; i < 15; i++) {
        createPetal();
    }
    
    
    const intervalId = setInterval(() => {
        if (document.getElementById('sakura-container')) {
            createPetal();
        } else {
            clearInterval(intervalId);
        }
    }, 300);
    
    
    container._sakuraInterval = intervalId;
}


window.addEventListener('load', () => {
    setTimeout(() => {
        createSakuraEffect();
    }, 100);
});


document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('sakura-container')) {
        setTimeout(() => {
            createSakuraEffect();
        }, 500);
    }
});

    const ACTIVE_USER = "user2";

    let durationMs = 0;
    let currentMs = 0;
    let lastTrackId = null;
    
    let trackStartTimestamp = 0;
    
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    function parseTrackStartTime(isoString) {
        if (!isoString) return 0;
    
        // ВАЖНО: принудительно считаем как UTC
        return Date.parse(isoString + "Z");
    }
    
    function calculateProgress(debug = false) {
        if (!trackStartTimestamp || !durationMs) return 0;
    
        const now = Date.now();
        const elapsed = now - trackStartTimestamp;
    
        const clamped = Math.min(Math.max(elapsed, 0), durationMs);
    
        if (debug) {
            console.log("=== MUSIC DEBUG ===");
            console.log("now (UTC ms):", now);
            console.log("track_start (UTC ms):", trackStartTimestamp);
            console.log("duration_ms:", durationMs);
            console.log("raw elapsed (ms):", elapsed);
            console.log("elapsed (sec):", (elapsed / 1000).toFixed(2));
            console.log("clamped (ms):", clamped);
            console.log("now ISO:", new Date(now).toISOString());
            console.log("start ISO:", new Date(trackStartTimestamp).toISOString());
            console.log("===================");
        }
    
        return clamped;
    }
    
    async function updateMusic() {
        try {
            const response = await fetch('https://slavya.space/bio/proxy.php');
            const data = await response.json();
    
            const container = document.getElementById('track-container');
            if (!container) return;
    
            const user = data?.[ACTIVE_USER];
    
            if (user && user.active) {
                container.style.display = 'block';
    
                const newTrackId = user.track_id;
    
                if (newTrackId !== lastTrackId) {
                    lastTrackId = newTrackId;
    
                    durationMs = user.duration_ms || 0;
                    trackStartTimestamp = parseTrackStartTime(user.track_started_at);
    
                    currentMs = calculateProgress(true); // DEBUG ТОЛЬКО ПРИ СМЕНЕ ТРЕКА
    
                    if (currentMs > durationMs) currentMs = durationMs;
                    if (currentMs < 0) currentMs = 0;
                }
    
                document.getElementById('track-title').textContent = user.title || '';
                document.getElementById('track-artist').textContent = user.artist || '';
                document.getElementById('total-time').textContent = user.duration || '';
    
            } else {
                container.style.display = 'none';
                lastTrackId = null;
                currentMs = 0;
                trackStartTimestamp = 0;
            }
    
        } catch (e) {
            console.error('Ошибка музыки:', e);
        }
    }
    
    setInterval(() => {
        const container = document.getElementById('track-container');
    
        if (container && container.style.display !== 'none' && durationMs > 0) {
            currentMs = calculateProgress();
    
            if (currentMs > durationMs) currentMs = durationMs;
            if (currentMs < 0) currentMs = 0;
    
            const percent = (currentMs / durationMs) * 100;
    
            const progressBar = document.getElementById('progress-bar');
            const currentTime = document.getElementById('current-time');
    
            if (progressBar) {
                progressBar.style.width = Math.min(percent, 100) + '%';
            }
    
            if (currentTime) {
                currentTime.textContent = formatTime(currentMs);
            }
        }
    }, 1000);
    
    updateMusic();
    setInterval(updateMusic, 5000);

(function () {
    const container = document.getElementById("animated-name");
    if (!container) return;

    const text = container.textContent.trim();
    if (!text) return;

    container.textContent = "";

    const spans = [];
    for (const char of text) {
        const span = document.createElement("span");
        span.textContent = char;
        container.appendChild(span);
        spans.push(span);
    }

    const style = getComputedStyle(container);

    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(v => {
            const h = v.toString(16);
            return h.length === 1 ? "0" + h : h;
        }).join("");
    }

    function interpolate(c1, c2, t) {
        const a = hexToRgb(c1);
        const b = hexToRgb(c2);
        return rgbToHex(
            Math.round(a.r + (b.r - a.r) * t),
            Math.round(a.g + (b.g - a.g) * t),
            Math.round(a.b + (b.b - a.b) * t)
        );
    }

    const colorsRaw = style.getPropertyValue('--gradient-colors').trim();
    let baseColors = colorsRaw ? colorsRaw.split(',').map(c => c.trim()).filter(Boolean) : ["#ffb6c1", "#fff0d6"];

    const steps = Math.max(spans.length * 2, 30);
    const palette = [];
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const seg = t * (baseColors.length - 1);
        const i0 = Math.floor(seg);
        const i1 = Math.min(i0 + 1, baseColors.length - 1);
        const localT = seg - i0;
        palette.push(interpolate(baseColors[i0], baseColors[i1], localT));
    }

    let offset = 0;
    const speed = 0.6; 

    function update() {
        offset = (offset + speed) % palette.length;

        for (let i = 0; i < spans.length; i++) {
            
            const pos = (i * 1.2 + offset) % palette.length;

            const i0 = Math.floor(pos);
            const i1 = (i0 + 1) % palette.length;
            const t = pos - i0;

            const color = interpolate(palette[i0], palette[i1], t);
            spans[i].style.color = color;
        }
    }

    update();
    setInterval(update, 40); 
})();
