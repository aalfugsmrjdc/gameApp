// src/game.js

// 创建 Canvas
const canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 640;
canvas.style.display = 'block';
canvas.style.margin = '32px auto';
canvas.style.background = '#222';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// 游戏对象
const player = { x: 220, y: 600, w: 40, h: 20, speed: 6 };
const bullets = [];
const enemies = [];
const bossBullets = [];
let score = 0;
let gameOver = false;
let bossActive = false;
let boss = null;
let level = 1;
let victory = false;

// 生成敌人
function spawnEnemy() {
    const x = Math.random() * (canvas.width - 40);
    const baseSpeed = level === 1 ? 2 : 2.5;
    const speed = baseSpeed + Math.random() * 2;
    const enemy = { x, y: 20, w: 40, h: 20, speed };
    enemies.push(enemy);
    console.log('Spawned enemy:', enemy);
}

// 生成Boss
function spawnBoss() {
    bossActive = true;
    enemies.length = 0; // 清除所有敌人
    if (level === 1) {
        boss = {
            x: canvas.width / 2 - 50,
            y: 50,
            w: 100,
            h: 60,
            health: 100,
            maxHealth: 100,
            speed: 3,
            direction: 1,
            lastShot: Date.now()
        };
    } else {
        boss = {
            x: canvas.width / 2 - 60,
            y: 50,
            w: 120,
            h: 80,
            health: 150,
            maxHealth: 150,
            speed: 4,
            direction: 1,
            lastShot: Date.now()
        };
    }
    console.log(`Boss spawned for level ${level}:`, boss);
}

// 控制
let left = false, right = false, shooting = false;
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') left = true;
    if (e.key === 'ArrowRight') right = true;
    if (e.key === ' ' || e.key === 'Spacebar') shooting = true;
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft') left = false;
    if (e.key === 'ArrowRight') right = false;
    if (e.key === ' ' || e.key === 'Spacebar') shooting = false;
});
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    player.x = Math.min(Math.max(e.clientX - rect.left - player.w / 2, 0), canvas.width - player.w);
});
canvas.addEventListener('mousedown', () => shooting = true);
canvas.addEventListener('mouseup', () => shooting = false);

// 发射子弹
let lastShot = 0;
function shoot() {
    const now = Date.now();
    let minInterval = Math.max(80, 250 - Math.floor(score / 5) * 20);
    if (now - lastShot > minInterval) {
        let bulletNum = 1;
        if (score >= 10) bulletNum = 3;
        if (score >= 30) bulletNum = 5;
        let spread = 30;
        for (let i = 0; i < bulletNum; i++) {
            let offset = 0;
            if (bulletNum > 1) {
                offset = (i - (bulletNum - 1) / 2) * (spread / (bulletNum - 1));
            }
            let rad = offset * Math.PI / 180;
            let vx = Math.sin(rad) * 3;
            let vy = 8;
            bullets.push({
                x: player.x + player.w / 2 - 2,
                y: player.y,
                w: 4,
                h: 10,
                speed: vy,
                vx: vx
            });
        }
        lastShot = now;
    }
}

// Boss发射子弹
function bossShoot() {
    if (!bossActive || !boss) return;
    const now = Date.now();
    if (now - boss.lastShot > 1000) {
        const bulletSpeed = level === 1 ? 5 : 7;
        bossBullets.push({
            x: boss.x + boss.w / 2 - 2,
            y: boss.y + boss.h,
            w: 4,
            h: 10,
            speed: bulletSpeed,
            vx: 0
        });
        bossBullets.push({
            x: boss.x + boss.w / 2 - 2,
            y: boss.y + boss.h,
            w: 4,
            h: 10,
            speed: bulletSpeed,
            vx: -2
        });
        bossBullets.push({
            x: boss.x + boss.w / 2 - 2,
            y: boss.y + boss.h,
            w: 4,
            h: 10,
            speed: bulletSpeed,
            vx: 2
        });
        boss.lastShot = now;
    }
}

// 碰撞检测
function rectCollide(a, b) {
    return a && b &&
           a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

// 记录按钮元素
let restartBtn = null;
let exitBtn = null;

// 显示按钮
function showGameOverButtons() {
    if (restartBtn || exitBtn) return;
    restartBtn = document.createElement('button');
    restartBtn.innerText = '重新开始';
    restartBtn.style.position = 'absolute';
    restartBtn.style.left = (canvas.offsetLeft + canvas.width / 2 - 60) + 'px';
    restartBtn.style.top = (canvas.offsetTop + canvas.height / 2 + 40) + 'px';
    restartBtn.style.fontSize = '20px';
    restartBtn.style.padding = '8px 24px';
    restartBtn.style.zIndex = 1000;
    restartBtn.onclick = restartGame;
    document.body.appendChild(restartBtn);
    exitBtn = document.createElement('button');
    exitBtn.innerText = '退出游戏';
    exitBtn.style.position = 'absolute';
    exitBtn.style.left = (canvas.offsetLeft + canvas.width / 2 - 60) + 'px';
    exitBtn.style.top = (canvas.offsetTop + canvas.height / 2 + 90) + 'px';
    exitBtn.style.fontSize = '20px';
    exitBtn.style.padding = '8px 24px';
    exitBtn.style.zIndex = 1000;
    exitBtn.onclick = exitGame;
    document.body.appendChild(exitBtn);
}

// 移除按钮
function hideGameOverButtons() {
    if (restartBtn) {
        document.body.removeChild(restartBtn);
        restartBtn = null;
    }
    if (exitBtn) {
        document.body.removeChild(exitBtn);
        exitBtn = null;
    }
}

// 重新开始
function restartGame() {
    player.x = 220;
    player.y = 600;
    bullets.length = 0;
    enemies.length = 0;
    bossBullets.length = 0;
    score = 0;
    gameOver = false;
    bossActive = false;
    boss = null;
    level = 1;
    victory = false;
    hideGameOverButtons();
    console.log('Game restarted');
    for (let i = 0; i < 5; i++) {
        spawnEnemy();
    }
    gameLoop();
}

// 退出游戏
function exitGame() {
    hideGameOverButtons();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '30px Arial';
    ctx.fillText('已退出游戏', canvas.width / 2 - 80, canvas.height / 2);
}

// 游戏主循环
function update() {
    if (gameOver || victory) return;
    // 玩家移动
    if (left) player.x -= player.speed;
    if (right) player.x += player.speed;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.w));
    // 发射
    if (shooting) shoot();
    // 子弹移动
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet) continue;
        bullet.y -= bullet.speed;
        if (bullet.vx) bullet.x += bullet.vx;
        if (
            bullet.y < 0 ||
            bullet.x < -bullet.w ||
            bullet.x > canvas.width + bullet.w
        ) {
            bullets.splice(i, 1);
        }
    }
    // Boss子弹移动
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const bullet = bossBullets[i];
        if (!bullet) continue;
        bullet.y += bullet.speed;
        if (bullet.vx) bullet.x += bullet.vx;
        if (bullet.y > canvas.height) {
            bossBullets.splice(i, 1);
        }
        if (rectCollide(bullet, player)) {
            gameOver = true;
            break;
        }
    }
    // 检查是否触发Boss
    const bossScore = level === 1 ? 1000 : 2500;
    if (score >= bossScore && !bossActive) {
        spawnBoss();
    }
    if (bossActive && boss) {
        // Boss移动
        boss.x += boss.speed * boss.direction;
        if (boss.x <= 0 || boss.x + boss.w >= canvas.width) {
            boss.direction *= -1;
        }
        // Boss射击
        bossShoot();
        // 子弹和Boss碰撞
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (rectCollide(bullets[i], boss)) {
                boss.health -= 1;
                bullets.splice(i, 1);
                if (boss.health <= 0) {
                    console.log(`Boss defeated in level ${level}`);
                    bossActive = false;
                    boss = null;
                    if (level === 1) {
                        score = 500;
                        level = 2;
                        bullets.length = 0;
                        bossBullets.length = 0;
                        enemies.length = 0;
                        // 立即生成新敌人
                        for (let i = 0; i < 5; i++) {
                            spawnEnemy();
                        }
                        console.log('Transitioned to level 2 with 500 points, enemies:', enemies);
                    } else {
                        victory = true;
                        console.log('Victory achieved');
                    }
                }
            }
        }
    } else {
        // 敌人移动和判定
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy) {
                enemies.splice(i, 1);
                continue;
            }
            enemy.y += enemy.speed;
            if (rectCollide(enemy, player)) {
                gameOver = true;
                break;
            }
            if (enemy.y > canvas.height) {
                enemies.splice(i, 1);
                spawnEnemy();
            }
        }
        // 子弹和敌人碰撞
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy) continue;
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (rectCollide(enemy, bullets[j])) {
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score += 1;
                    spawnEnemy();
                    break;
                }
            }
        }
        // 保证有敌人
        if (enemies.length < 5) {
            spawnEnemy();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 玩家
    if (player) {
        ctx.fillStyle = '#09f';
        ctx.fillRect(player.x, player.y, player.w, player.h);
    }
    // 子弹
    ctx.fillStyle = '#ff0';
    bullets.forEach(b => {
        if (b) ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    // Boss子弹
    ctx.fillStyle = '#f0f';
    bossBullets.forEach(b => {
        if (b) ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    // 敌人或Boss
    if (bossActive && boss) {
        ctx.fillStyle = '#a00';
        ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        const eyeOffsetX = boss.w * 0.25;
        const eyeY = boss.y + boss.h * 0.25;
        ctx.arc(boss.x + eyeOffsetX, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.w - eyeOffsetX, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(boss.x + boss.w / 2 - 10, boss.y + boss.h * 0.75, 20, 10);
        ctx.fillStyle = '#f00';
        ctx.fillRect(boss.x, boss.y - 20, boss.w * (boss.health / boss.maxHealth), 10);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(boss.x, boss.y - 20, boss.w, 10);
    } else {
        ctx.fillStyle = level === 1 ? '#f33' : '#0f3';
        enemies.forEach(e => {
            if (e) ctx.fillRect(e.x, e.y, e.w, e.h);
        });
    }
    // 分数和关卡
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Level: ' + level, 10, 60);
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', 120, 320);
        ctx.font = '20px Arial';
        ctx.fillText('Final Score: ' + score, 170, 360);
        showGameOverButtons();
    } else if (victory) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('Victory!', 140, 320);
        ctx.font = '20px Arial';
        ctx.fillText('You Defeated the Final Boss!', 120, 360);
        showGameOverButtons();
    } else {
        hideGameOverButtons();
    }
}

function gameLoop() {
    try {
        update();
        draw();
        if (!gameOver && !victory) requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
    }
}

// 启动游戏
console.log('Starting game...');
for (let i = 0; i < 5; i++) {
    spawnEnemy();
}
gameLoop();
