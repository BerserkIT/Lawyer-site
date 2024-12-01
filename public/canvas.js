const opts = {
    minRadius: 0.5,
    maxRadius: 1.5,
    colors: ["rgba(255, 255, 255, 0.5)", "rgba(252, 244, 201, 0.5)", "rgba(201, 252, 201, 0.5)", "rgba(201, 236, 252, 0.5)", "rgba(229, 201, 252, 0.5)", "rgba(252, 201, 201, 0.5)", "rgba(252, 201, 241, 0.5)", "rgba(252, 201, 201, 0.5)"],
    delay: 100,
    step: 0.05,
    trangles: 4,
    intervalRadius: 2.5,
    shootingStarSpeed: 2,
    shootingStarLength: 100,
};

// Для статичных звезд
const staticCanvas = document.querySelector("#static-stars");
const staticCtx = staticCanvas.getContext("2d");
let staticW, staticH;
const staticStars = [];
initializeCanvas(staticCanvas, (w, h) => {
    staticW = w;
    staticH = h;
    setupStaticStars();
});

// Для падающих звезд
const shootingCanvas = document.querySelector("#shooting-stars");
const shootingCtx = shootingCanvas.getContext("2d");
let shootingW, shootingH;
const shootingStars = [];
initializeCanvas(shootingCanvas, (w, h) => {
    shootingW = w;
    shootingH = h;
    setupShootingStars();
});

// Инициализация канваса
function initializeCanvas(canvas, onResize) {
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        onResize(canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);
}

// Статичные звезды
function setupStaticStars() {
    staticStars.length = 0;
    for (let i = 0; i < (staticW / 150) * (staticH / 150); i++) {
        staticStars.push(new Star(staticW, staticH));
    }
    drawStaticStars();
}

function drawStaticStars() {
    staticCtx.clearRect(0, 0, staticW, staticH);
    for (let star of staticStars) {
        star.draw(staticCtx);
    }
}

// Падающие звезды
function setupShootingStars() {
    shootingStars.length = 0;
    createShootingStar();
    animateShootingStars();
}


function createShootingStar() {
    const shootingStar = {
        x: Math.random() * shootingW,
        y: Math.random() * shootingH,
        speedX: opts.shootingStarSpeed * 10, // Высокая скорость влево
        speedY: opts.shootingStarSpeed * 5, // Скорость вниз
        radius: opts.minRadius + Math.random() * (opts.maxRadius - opts.minRadius),
        color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
        trail: [],
    };

    shootingStars.push(shootingStar);
    setTimeout(createShootingStar, 300 + Math.random() * 300); // Интервал появления звезд
}

function animateShootingStars() {
    // Очищаем весь холст
    shootingCtx.clearRect(0, 0, shootingW, shootingH);

    shootingStars.forEach((star, index) => {
        // Добавляем текущую позицию в след звезды
        star.trail.push({ x: star.x, y: star.y });
        if (star.trail.length > 10) star.trail.shift(); // Ограничиваем длину следа

        // Рисуем след
        for (let i = 0; i < star.trail.length; i++) {
            const point = star.trail[i];
            shootingCtx.beginPath();
            shootingCtx.arc(point.x, point.y, star.radius, 0, Math.PI * 2); // След остается того же радиуса
            shootingCtx.globalAlpha = i / star.trail.length; // Прозрачность уменьшается
            shootingCtx.fillStyle = star.color;
            shootingCtx.fill();
        }

        // Рассчитываем прозрачность основной звезды
        const fadeDistance = Math.min(shootingW, shootingH) * 0.1; // 10% от меньшего измерения холста
        let alpha = 1;

        if (star.x < fadeDistance) {
            alpha = star.x / fadeDistance;
        } else if (star.x > shootingW - fadeDistance) {
            alpha = (shootingW - star.x) / fadeDistance;
        }

        if (star.y < fadeDistance) {
            alpha = Math.min(alpha, star.y / fadeDistance);
        } else if (star.y > shootingH - fadeDistance) {
            alpha = Math.min(alpha, (shootingH - star.y) / fadeDistance);
        }

        shootingCtx.globalAlpha = alpha; // Устанавливаем прозрачность

        // Рисуем основную звезду (увеличенный радиус)
        shootingCtx.beginPath();
        const largerRadius = star.radius * 4; // Увеличиваем радиус основной звезды
        shootingCtx.arc(star.x, star.y, largerRadius, 0, Math.PI * 2);
        shootingCtx.fillStyle = star.color;
        shootingCtx.fill();

        // Обновляем положение звезды
        star.x -= star.speedX; // Движение влево
        star.y += star.speedY; // Движение вниз

        // Удаляем звезду, если она вышла за пределы экрана
        if (star.y - largerRadius > shootingH || star.x < -50) {
            shootingStars.splice(index, 1);
        }
    });

    // Запускаем следующий кадр анимации
    requestAnimationFrame(animateShootingStars);
}
// Класс звезды
function Star(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.color = opts.colors[Math.floor(Math.random() * opts.colors.length)];
    this.minRadius = opts.minRadius + Math.random() * (opts.maxRadius - opts.minRadius);
    this.maxRadius = this.minRadius + opts.intervalRadius;
    this.vector = Math.round(Math.random()) || -1;

    this.draw = function (ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.minRadius);
        for (let i = 0; i < 2 * opts.trangles + 1; i++) {
            const r = i % 2 === 0 ? this.minRadius : this.maxRadius;
            const a = (Math.PI * i) / opts.trangles + (45 * Math.PI) / 180;
            ctx.lineTo(this.x + r * Math.sin(a), this.y + r * Math.cos(a));
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    this.update = function () {
        this.minRadius += opts.step * this.vector;
        this.maxRadius += opts.step * this.vector;
        if (this.minRadius > opts.maxRadius || this.minRadius < opts.minRadius) {
            this.vector *= -1;
        }
    };
}
