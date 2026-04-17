// --- Background Canvas Particles ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 80;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * -1 - 0.5; // Always floating upwards
        // Pastel pinks, whites, and light gold
        const colors = ['rgba(249, 213, 229, 0.7)', 'rgba(255, 255, 255, 0.6)', 'rgba(212, 175, 55, 0.5)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset to bottom if it goes off top
        if (this.y + this.size < 0) {
            this.y = canvas.height + this.size;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// --- Audio Control ---
const bgMusic = document.getElementById('bg-music');
const audioControl = document.getElementById('audio-control');
const audioIcon = document.getElementById('audio-icon');
let isPlaying = false;

// Attempt auto-play with lower volume
bgMusic.volume = 0.4;

async function startAudio() {
    if (isPlaying) return;

    // Check if audio is even loaded
    if (bgMusic.readyState === 0) {
        console.log("Audio still loading or failed to reach...");
    }

    try {
        await bgMusic.play();
        audioIcon.className = 'ph-duotone ph-pause-circle';
        audioControl.classList.add('playing');
        isPlaying = true;

        // Initialize Visualizer on first play
        // Safety: Web Audio API often fails on file:// protocol for local media
        if (window.location.protocol !== 'file:') {
            if (!audioCtx) {
                initVisualizer();
            } else if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } else {
            console.log("Visualizer skipped due to file:// protocol limitations.");
        }
    } catch (err) {
        console.log("Audio play blocked or failed", err);
        // Fallback: If it's a gesture issue, it will work on the next click anyway
    }
}

// Global listener for audio errors
bgMusic.onerror = function () {
    console.error("Audio error code:", bgMusic.error.code);
    if (bgMusic.error.code === 4) {
        alert("ملف الأغنية مش موجود في المكان الصح.. اتأكد إن ملف Makan-Fi-Albak.mp3 موجود جوه فولدر assets/images/");
    }
};

// Logic to play music only when reaching the lyrics section
const creativeSection = document.getElementById('creative');
if (creativeSection) {
    // We don't auto-start audio on scroll anymore to avoid browser blocking errors
    // but we can keep the observer for other effects if needed
}

audioControl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
        bgMusic.pause();
        audioIcon.className = 'ph-duotone ph-music-notes';
        audioControl.classList.remove('playing');
        isPlaying = false;
    } else {
        startAudio();
    }
});

// --- Audio Visualizer Logic (The Technology to sync with Melody) ---
let audioCtx, analyser, dataArray, source;

function initVisualizer() {
    if (audioCtx) return;

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();

        // This line can sometimes fail if already connected
        source = audioCtx.createMediaElementSource(bgMusic);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const bars = document.querySelectorAll('.visualizer-container .bar');

        function animate() {
            if (!isPlaying) {
                bars.forEach(bar => bar.style.height = '5px');
                requestAnimationFrame(animate);
                return;
            }

            analyser.getByteFrequencyData(dataArray);

            bars.forEach((bar, index) => {
                const val = dataArray[index] || 0;
                const height = Math.max(5, (val / 255) * 40);
                bar.style.height = height + 'px';
            });

            requestAnimationFrame(animate);
        }
        animate();
    } catch (e) {
        console.error("Visualizer failed to initialize", e);
    }
}

// Removed redundant re-assignment to keep it clean
// The startAudio function now handles everything internally

// --- Scroll Animations (Intersection Observer) ---
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// --- Live Age Counter ---
// Birthdate: August 3, 1997
const birthDate = new Date('1997-08-03T00:00:00');

function updateCounter() {
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let m = now.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        years--;
    }

    // To calculate precise days, hours, mins, secs since last birthday
    const lastBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (now < lastBirthday) {
        lastBirthday.setFullYear(now.getFullYear() - 1);
    }

    const diffTime = Math.abs(now - lastBirthday);

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffTime / 1000 / 60) % 60);
    const seconds = Math.floor((diffTime / 1000) % 60);

    document.getElementById('years').innerText = years;
    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}

setInterval(updateCounter, 1000);
updateCounter();

// --- Real Countdown to August 3, 2026 ---
const targetDate = new Date('2026-08-03T00:00:00');

function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById('birthday-countdown').innerHTML = "<h3 class='highlight-name'>كل سنة والقمر بيزيد حلاوة</h3>";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
    document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- Dynamic Music Lyrics (Synchronized) ---
const messagesList = [
    { time: 0, text: `<span class="lyric-verse">جهزتي نفسك؟ الأغنية بتبدأ... ✨</span>` },
    { time: 13.5, text: `<span class="lyric-verse">الدّنيا حلوة الدّيل اتظبط <br> بس بادجت أوّل week اتضرب <br> واحدة بس هي اللّي في قلبي <br> بس على موبايلي فيه بالعبط <br> <i class="ph-duotone ph-money" style="color: var(--gold); font-size: 2rem;"></i></span>` },
    { time: 30.0, text: `<span class="lyric-verse">بس يا ولا قلّة أدب <br> ديت معاها في وسط البلد <br> أرجوك ماتزاولنيش دلوقتي <br> ابعتلي رسالة مسجّلة <br> <i class="ph-duotone ph-chat-teardrop-text" style="color: var(--dark-pink); font-size: 2rem;"></i></span>` },
    { time: 43.5, text: `<span class="lyric-verse">إنتي بتحلوي مع الزّمن <br> الدّلوعة المبجّلة <br> مافيش صور مركّبة <br> اسألها مين هاتقولك أنا <br> <i class="ph-duotone ph-star" style="color: var(--gold); font-size: 2rem;"></i></span>` },
    { time: 55.5, text: `<span class="lyric-verse">أدّيني فرصة وأنا أبهرك <br> ثقي فيّا وأنا انقلك <br> إنتي تميلي وأنا أسندك <br> بغنّيلك كلّ اللّيريكس <br> <i class="ph-duotone ph-music-notes" style="color: var(--dark-pink); font-size: 2rem;"></i></span>` },
    { time: 106.5, text: `<span class="lyric-verse chorus-style">أنا أصلي بشوف مكان في قلبك <br> أقول دا ممكن يلمّنا <br> وبتيجي على بالي بالسّاعات <br> بس ساعات بتردّد إنّي أرنّلك <br> <i class="ph-duotone ph-heart" style="color: #ff4d6d; font-size: 2.5rem;"></i></span>` },
    { time: 129.5, text: `<span class="lyric-verse">بحبّك أكتر ما بحبّ نفسي <br> بحبّك أكتر ما بحبّ ميسي <br> بحبّك أوي لمّا بتتنفّسي <br> وأحبّك أكتر لمّا تتنرفزي <br> <i class="ph-duotone ph-crown" style="color: var(--gold); font-size: 2rem;"></i></span>` },
    { time: 142.0, text: `<span class="lyric-verse">هحميكي بيبي أنا أمن مركزي <br> حلاوة وشّك دا سرّ هندسي <br> دايماً شاكّة فيّا بتتطقّسي <br> عارفة إنّ أنا عيل حورتجي <br> <i class="ph-duotone ph-shield-check" style="color: var(--dark-pink); font-size: 2rem;"></i></span>` },
    { time: 154.5, text: `<span class="lyric-verse">مدير الأمن جه الغردقة <br> جهّز نفسك فيه شقلبة <br> مارو في جلامبو عمّو دهب <br> أكلة سمك في المنتزه <br> <i class="ph-duotone ph-beach-ball" style="color: var(--gold); font-size: 2rem;"></i></span>` },
    { time: 166.5, text: `<span class="lyric-verse">قولت الحاجات خلّيك قدّها <br> قعدتك حلوة زيّ العسل <br> بس بيبي على رأي المثل <br> <i class="ph-duotone ph-cookie" style="color: var(--dark-pink); font-size: 2rem;"></i></span>` },
    { time: 178.5, text: `<span class="lyric-verse chorus-style">أنا أصلي بشوف مكان في قلبك <br> أقول دا ممكن يلمّنا <br> وبتيجي على بالي بالسّاعات <br> بس ساعات بتردّد إنّي أرنّلك <br> <i class="ph-duotone ph-heart" style="color: #ff4d6d; font-size: 2.5rem;"></i></span>` },
    { time: 204.0, text: `<span class="lyric-verse">حياتي سادة من غيرك ملهاش لزوم <br> بفتكرك حتّى لو بشوفك كلّ يوم <br> باينة إنّي في بالك ليه دايماً مكسوف تقول <br> ليه بقى.. خلّيك واضح <br> <i class="ph-duotone ph-sun" style="color: var(--gold); font-size: 2rem;"></i></span>` },
    { time: 226.5, text: `<span class="lyric-verse">خلّيكي جنبي ماتمشيش <br> بيروت بلّيل ومناقيش <br> لعب عيال مابتعلبيش <br> بحبّك أكتر م الميكس <br> <i class="ph-duotone ph-moon-stars" style="color: var(--dark-pink); font-size: 2rem;"></i></span>` }
];

const dynamicMessageEl = document.getElementById('dynamic-message');

let currentMessageIndex = 0;

function updateVerseUI(content) {
    if (typeof gsap !== 'undefined') {
        gsap.to(dynamicMessageEl, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            onComplete: () => {
                dynamicMessageEl.innerHTML = content;
                gsap.fromTo(dynamicMessageEl,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.5 }
                );
            }
        });
    } else {
        dynamicMessageEl.innerHTML = content;
    }
}

function changeMessage() {
    // Helper: Log current time to console so you can copy the exact second for syncing!
    console.log("Current Song Time (use this for sync):", bgMusic.currentTime);

    if (!isPlaying) {
        startAudio();
        currentMessageIndex = 0;
    } else {
        currentMessageIndex = (currentMessageIndex + 1) % messagesList.length;
    }

    // Update the message and jump the music to that point
    updateVerseUI(messagesList[currentMessageIndex].text);
    bgMusic.currentTime = messagesList[currentMessageIndex].time;
}

// Show first message on load
if (dynamicMessageEl) {
    dynamicMessageEl.innerHTML = messagesList[0].text;
}

// --- Wish Animation ---
const wishBtn = document.getElementById('wish-btn');
const wishResult = document.getElementById('wish-result');

wishBtn.addEventListener('click', () => {
    wishBtn.style.display = 'none';
    wishResult.classList.remove('hidden');

    // Trigger small confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#f48fb1', '#d4af37', '#ffffff']
        });
    }
});

// --- Surprise Modal & Confetti ---
const surpriseBtn = document.getElementById('surprise-btn');
const modal = document.getElementById('surprise-modal');
const closeModal = document.querySelector('.close-modal');
const loveTrigger = document.getElementById('love-trigger');
const partyHorn = document.getElementById('party-horn-sound');

if (loveTrigger) {
    loveTrigger.addEventListener('click', () => {
        // Play party horn sound
        if (partyHorn) {
            partyHorn.currentTime = 0;
            partyHorn.play().catch(e => console.log("Sound play failed", e));
        }

        // Trigger an extra "High Quality" confetti burst directly from the text
        if (typeof confetti === 'function') {
            const rect = loveTrigger.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { x, y },
                colors: ['#f48fb1', '#d4af37', '#ffffff', '#f8e192'],
                ticks: 200,
                gravity: 1.2,
                scalar: 1.2
            });
        }
    });
}

surpriseBtn.addEventListener('click', () => {
    modal.classList.add('show');

    // Epic confetti burst
    if (typeof confetti === 'function') {
        var duration = 3000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#f48fb1', '#d4af37', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#f48fb1', '#d4af37', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
});

closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// --- GSAP Professional Icon Animations ---
if (typeof gsap !== 'undefined') {
    // Animate Cards visually on Hover using GSAP to look highly professional
    document.querySelectorAll('.card').forEach(card => {
        const icon = card.querySelector('.card-icon');

        card.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                y: -15,
                scale: 1.25,
                rotation: 15,
                duration: 0.5,
                ease: "back.out(2)"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });
        });
    });

    // Make the Audio & Wish buttons pulse smoothly with GSAP
    gsap.to("#audio-control", {
        y: -10,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
}

// --- Password Gate Logic ---
const passwordInput = document.getElementById('password-input');
const unlockBtn = document.getElementById('unlock-btn');
const passwordGate = document.getElementById('password-gate');
const passwordError = document.getElementById('password-error');

const CORRECT_PASSWORD = "rehab1997U"; // كملة السر الافتراضية
let failedAttempts = 0;

function checkPassword() {
    if (passwordInput.value.toLowerCase() === CORRECT_PASSWORD.toLowerCase()) {
        // Correct Password - Start audio IMMEDIATELY to satisfy browser gesture requirements
        if (typeof startAudio === 'function') startAudio();

        if (typeof gsap !== 'undefined') {
            gsap.to(passwordGate, {
                opacity: 0,
                duration: 1,
                pointerEvents: "none",
                onComplete: () => {
                    passwordGate.style.display = "none";
                    document.body.style.overflow = "auto";
                }
            });
        } else {
            passwordGate.style.display = "none";
            document.body.style.overflow = "auto";
        }
    } else {
        // Wrong Password
        failedAttempts++;
        if (failedAttempts >= 4) {
            passwordError.innerText = "كلمة السر غلط قولنا ده انت بضان يجدعع";
        } else {
            passwordError.innerText = "كلمة السر غلط يا قمر، حاولي تاني! ❤️";
        }
        passwordError.classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(passwordGate, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
        }
    }
}

if (unlockBtn) {
    unlockBtn.addEventListener('click', checkPassword);
}
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
}

// Disable scrolling while locked and ensure page starts at the top
document.body.style.overflow = "hidden";
window.scrollTo(0, 0);
