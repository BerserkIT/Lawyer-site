const opts = {
    minRadius: 0.2,
    maxRadius: 1,
    colors: [
        "rgba(255, 255, 255, 0.5)",
        "rgba(252, 244, 201, 0.5)",
        "rgba(201, 252, 201, 0.5)",
        "rgba(201, 236, 252, 0.5)",
        "rgba(229, 201, 252, 0.5)",
        "rgba(252, 201, 201, 0.5)",
        "rgba(252, 201, 241, 0.5)",
        "rgba(252, 201, 201, 0.5)"
    ],
    delay: 10,
    step: 0.1,
    trangles: 4,
    intervalRadius: 1,
    shootingStarSpeed: 0.5,
    shootingStarLength: 100
};

let staticAnimationFrame, shootingAnimationFrame;

// Для статичных звезд
const staticCanvas = document.querySelector("#static-stars");
const staticCtx = staticCanvas.getContext("2d");
let staticW, staticH;
const staticStars = [];

// Для падающих звезд
const shootingCanvas = document.querySelector("#shooting-stars");
const shootingCtx = shootingCanvas.getContext("2d");
let shootingW, shootingH;
const shootingStars = [];

// Инициализация канваса
function initializeCanvas(canvas, onResize) {
    function resize() {
        cancelAnimationFrame(staticAnimationFrame);
        cancelAnimationFrame(shootingAnimationFrame);

        sizeCanvas(canvas);
        onResize(canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();
}

function sizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Статичные звезды
function setupStaticStars() {
    staticStars.length = 0;
    for (let i = 0; i < Math.ceil((staticW * staticH) / 50000); i++) {
        staticStars.push(new Star(staticW, staticH));
    }
    drawStaticStars();
}

function drawStaticStars() {
    staticCtx.clearRect(0, 0, staticW, staticH);
    for (let star of staticStars) {
        star.draw(staticCtx);
        star.update();
    }
    staticAnimationFrame = requestAnimationFrame(drawStaticStars);
}

// Падающие звезды
function setupShootingStars() {
    shootingStars.length = 0;
    for (let i = 0; i < Math.ceil((shootingW * shootingH) / 100000); i++) {
        createShootingStar();
    }
    drawShootingStars();
}

function createShootingStar() {
    const shootingStar = {
        x: Math.random() * shootingW,
        y: Math.random() * shootingH,
        speedX: opts.shootingStarSpeed * 10,
        speedY: opts.shootingStarSpeed * 4,
        radius: opts.minRadius + Math.random() * (opts.maxRadius - opts.minRadius),
        color: opts.colors[Math.floor(Math.random() * opts.colors.length)],
        trail: []
    };

    shootingStars.push(shootingStar);
}

function drawShootingStars() {
    shootingCtx.clearRect(0, 0, shootingW, shootingH);

    shootingStars.forEach((star, index) => {
        star.trail.push({ x: star.x, y: star.y });
        if (star.trail.length > 10) star.trail.shift();

        for (let i = 0; i < star.trail.length; i++) {
            const point = star.trail[i];
            shootingCtx.beginPath();
            shootingCtx.arc(point.x, point.y, star.radius, 0, Math.PI * 2);
            shootingCtx.globalAlpha = i / star.trail.length;
            shootingCtx.fillStyle = star.color;
            shootingCtx.fill();
        }

        shootingCtx.globalAlpha = 1;
        shootingCtx.beginPath();
        const largerRadius = star.radius * 4;
        shootingCtx.arc(star.x, star.y, largerRadius, 0, Math.PI * 2);
        shootingCtx.fillStyle = star.color;
        shootingCtx.fill();

        star.x -= star.speedX;
        star.y += star.speedY;

        if (star.y - largerRadius > shootingH || star.x < -50) {
            shootingStars.splice(index, 1);
            createShootingStar();
        }
    });

    shootingAnimationFrame = requestAnimationFrame(drawShootingStars);
}

// Класс звезды
function Star(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.color = opts.colors[Math.floor(Math.random() * opts.colors.length)];
    this.minRadius = opts.minRadius + Math.random() * (opts.maxRadius - opts.minRadius);
    this.maxRadius = this.minRadius + opts.intervalRadius;
    this.vector = Math.round(Math.random()) || -1;
    this.colorChangeRate = Math.random() * 0.02 + 0.01;
    this.currentColorIndex = Math.floor(Math.random() * opts.colors.length);

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
        // Update radius for pulsation
        this.minRadius += opts.step * this.vector;
        this.maxRadius += opts.step * this.vector;
        if (this.minRadius > opts.maxRadius || this.minRadius < opts.minRadius) {
            this.vector *= -1;
        }

        // Update color for gradient effect
        this.currentColorIndex = (this.currentColorIndex + this.colorChangeRate) % opts.colors.length;
        const nextColorIndex = Math.floor(this.currentColorIndex + 1) % opts.colors.length;
        const mixRatio = this.currentColorIndex % 1;

        const currentColor = parseColor(opts.colors[Math.floor(this.currentColorIndex)]);
        const nextColor = parseColor(opts.colors[nextColorIndex]);

        this.color = `rgba(${Math.round(currentColor[0] * (1 - mixRatio) + nextColor[0] * mixRatio)},
                          ${Math.round(currentColor[1] * (1 - mixRatio) + nextColor[1] * mixRatio)},
                          ${Math.round(currentColor[2] * (1 - mixRatio) + nextColor[2] * mixRatio)},
                          ${currentColor[3] * (1 - mixRatio) + nextColor[3] * mixRatio})`;
    };
}

function parseColor(color) {
    const match = color.match(/rgba?\((\d+), (\d+), (\d+),? ?(\d*\.?\d+)?\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4] || 1)] : [0, 0, 0, 1];
}

initializeCanvas(staticCanvas, (w, h) => {
    staticW = w;
    staticH = h;
    setupStaticStars();
});

initializeCanvas(shootingCanvas, (w, h) => {
    shootingW = w;
    shootingH = h;
    setupShootingStars();
});