const canvas = document.getElementById('grillCanvas');
const ctx = canvas.getContext('2d');

let meats = [];
let lastMeatTime = Date.now();
let score = 0;

const MEAT_INTERVAL = 3000;
const COOK_TIME = 5000;
const BURN_TIME = 8000;
const RADIUS = 25;

function createMeat() {
    return {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        side: 0,
        cookTimeA: 0,
        cookTimeB: 0,
        isBurned: false
    };
}

function drawMeat(meat) {
    let color;
    if (meat.isBurned) {
        color = 'black';
    } else {
        let cooked = (meat.side === 0 && meat.cookTimeA >= COOK_TIME) ||
                     (meat.side === 1 && meat.cookTimeB >= COOK_TIME);
        color = cooked ? '#8B4513' : 'red';
    }

    ctx.beginPath();
    ctx.arc(meat.x, meat.y, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function update(deltaTime) {
    for (let meat of meats) {
        if (!meat.isBurned) {
            if (meat.side === 0) {
                meat.cookTimeA += deltaTime;
            } else {
                meat.cookTimeB += deltaTime;
            }
            if (meat.cookTimeA > BURN_TIME || meat.cookTimeB > BURN_TIME) {
                meat.isBurned = true;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let meat of meats) {
        drawMeat(meat);
    }

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + score, canvas.width / 2, 20);
}

function gameLoop() {
    const now = Date.now();
    const deltaTime = now - (lastFrameTime || now);
    lastFrameTime = now;

    if (now - lastMeatTime > MEAT_INTERVAL && meats.length < 5) {
        meats.push(createMeat());
        lastMeatTime = now;
    }

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let meat of meats) {
        const dx = mx - meat.x;
        const dy = my - meat.y;
        if (Math.sqrt(dx * dx + dy * dy) < RADIUS && !meat.isBurned) {
            meat.side = 1 - meat.side;
        }
    }
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = meats.length - 1; i >= 0; i--) {
        const meat = meats[i];
        const dx = mx - meat.x;
        const dy = my - meat.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < RADIUS) {
            if (!meat.isBurned &&
                meat.cookTimeA >= COOK_TIME &&
                meat.cookTimeB >= COOK_TIME) {
                score += 10;
            }
            meats.splice(i, 1);
            break;
        }
    }
});

let lastFrameTime = null;
requestAnimationFrame(gameLoop);
