const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 50,
    y: canvas.height / 2 - 20,
    width: 40,
    height: 40,
    speed: 10,
    color: 'green'
};

let obstacles = [];
let obstacleSpeed = 7; // rychlejší
let score = 0;

let minGap = player.height + 80;  // menší mezera → těžší
let maxGap = 200;                  // menší maximální mezera
let minDistance = 180;             // menší vzdálenost mezi překážkami

let gameOver = false;

function createObstacle() {
    const gap = Math.random() * (maxGap - minGap) + minGap;
    const topHeight = Math.random() * (canvas.height - gap - 40) + 20;
    const bottomHeight = canvas.height - topHeight - gap;

    // kontrola minimální vzdálenosti na ose X
    if (obstacles.length > 0) {
        const last = obstacles[obstacles.length - 1];
        if (canvas.width - last.x < minDistance) {
            return; // příliš blízko, nepřidávat
        }
    }

    obstacles.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomHeight: bottomHeight,
        width: 20,
        passed: false
    });
}

function updateGameArea() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pohyb hráče
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

    // Kreslení hráče
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Pohyb a kreslení překážek
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= obstacleSpeed;

        ctx.fillStyle = 'red';
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
        ctx.fillRect(obs.x, canvas.height - obs.bottomHeight, obs.width, obs.bottomHeight);

        // Kolize
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            (player.y < obs.topHeight || player.y + player.height > canvas.height - obs.bottomHeight)
        ) {
            endGame();
            return;
        }

        // Skóre
        if (!obs.passed && obs.x + obs.width < player.x) {
            obs.passed = true;
            score++;
        }

        // Odstranění mimo obrazovku
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }

    // Častější generování překážek
    if (Math.random() < 0.08) {
        createObstacle();
    }

    // Zvyšování obtížnosti rychleji
    obstacleSpeed = 7 + score / 5;

    // Zobrazení skóre
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Skóre: ${score}`, 10, 30);

    requestAnimationFrame(updateGameArea);
}

function endGame() {
    gameOver = true;
    setTimeout(() => {
        alert(`Konec hry! Skóre: ${score}`);
        resetGame();
    }, 100);
}

function resetGame() {
    player.y = canvas.height / 2 - 20;
    obstacles = [];
    obstacleSpeed = 7;
    score = 0;
    gameOver = false;
    keys = {};
    updateGameArea();
}

let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// Spuštění hry
updateGameArea();
