let currentPin = "";
const CORRECT_PIN = "241006";

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
    }
}

function pressKey(num) {
    if (currentPin.length < 6) {
        currentPin += num;
        updateDots();
    }

    if (currentPin.length === 6) {
        if (currentPin === CORRECT_PIN) {
            // Espera exactamente 2 segundos antes de iniciar la secuencia de carga y la música
            setTimeout(() => {
                startLoadingSequence();
            }, 2000);
        } else {
            alert("Contraseña incorrecta. Inténtalo de nuevo.");
            currentPin = "";
            updateDots();
        }
    }
}

function deleteKey() {
    currentPin = currentPin.slice(0, -1);
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function startLoadingSequence() {
    // 1. Reproducir música de fondo al iniciar la carga
    const music = document.getElementById('bg-music');
    if (music) {
        music.volume = 0.6;
        music.play().catch(error => {
            console.log("Reproducción de audio bloqueada por el navegador:", error);
        });
    }

    // 2. Ir a la pantalla de carga (Desktop-2)
    goToScreen('desktop-2');

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = "0%";
        setTimeout(() => {
            progressBar.style.width = "100%";
        }, 100);
    }

    // 3. Después de 5 segundos exactos, pasar a la pantalla de la fecha (Desktop-3)
    setTimeout(() => {
        goToScreen('desktop-3');

        // 4. Después de otros 5 segundos exactos, pasar al sobre de carta (Desktop-4)
        setTimeout(() => {
            goToScreen('desktop-4');
        }, 5000);

    }, 5000);
}

function nextScreen(screenId) {
    goToScreen(screenId);
}

// --- DETECTORES DE TECLADO ---
document.addEventListener('keydown', function(event) {
    const desktop1 = document.getElementById('desktop-1');
    const desktop6 = document.getElementById('desktop-6');

    // Escribir PIN con teclado físico en Pantalla 1
    if (desktop1 && !desktop1.classList.contains('hidden')) {
        if (event.key >= '0' && event.key <= '9') {
            pressKey(event.key);
        } else if (event.key === 'Backspace') {
            deleteKey();
        }
    }

    // Pasar de la Pantalla 6 al Pastel (Desktop 7) con ENTER
    if (event.key === 'Enter') {
        if (desktop6 && !desktop6.classList.contains('hidden')) {
            goToScreen('desktop-7');
        }
    }
});

// --- LÓGICA DE LA PANTALLA 7 (PASTEL Y FUEGOS ARTIFICIALES CONTINUOS) ---
function startCakeCountdown() {
    const blowBtn = document.getElementById('blow-btn');
    const countdownText = document.getElementById('countdown-text');
    const flame = document.getElementById('flame');
    
    if (blowBtn) blowBtn.style.display = 'none';
    
    let count = 3;
    if (countdownText) countdownText.textContent = `3...`;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            if (countdownText) countdownText.textContent = `${count}...`;
        } else {
            clearInterval(timer);
            if (countdownText) countdownText.textContent = "¡FELIZ CUMPLEAÑOS! ❤️";
            if (flame) flame.classList.add('flame-off');
            
            // Iniciar fuegos artificiales que durarán hasta que termine la canción
            launchContinuousFireworks();
        }
    }, 1000);
}

function launchContinuousFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#8B1E1E', '#FF0000', '#0000FF', '#FFD700', '#FFFFFF', '#FF69B4'];

    // Función para crear explosiones de fuegos artificiales constantemente
    function addFireworkBurst() {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * (canvas.height / 2);
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: startX,
                y: startY,
                dx: (Math.random() - 0.5) * 10,
                dy: (Math.random() - 0.5) * 10,
                radius: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 80
            });
        }
    }

    // Generar nuevas explosiones cada 600 milisegundos de forma continua
    const burstInterval = setInterval(() => {
        addFireworkBurst();
    }, 600);

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                p.dy += 0.04; // Gravedad suave
                p.life--;
            } else {
                particles.splice(index, 1);
            }
        });

        // Verificar si la música sigue reproduciéndose; si se acaba la canción o se sale, se detendría, 
        // pero mientras dure la música o la página abierta, los fuegos artificiales seguirán activos.
        const music = document.getElementById('bg-music');
        if (music && music.ended) {
            clearInterval(burstInterval);
        }

        requestAnimationFrame(animate);
    }

    animate();
}