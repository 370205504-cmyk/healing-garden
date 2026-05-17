console.log('🔧 Debug Test Starting...');

let canvas = null;
let ctx = null;
let gameState = 'menu';
let frameCount = 0;
let lastTime = Date.now();

function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, Math.min(width, height) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function init() {
    try {
        if (typeof wx !== 'undefined') {
            canvas = wx.createCanvas();
            console.log('✅ wx.createCanvas() success');
        } else if (typeof document !== 'undefined') {
            canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
            if (!document.getElementById('gameCanvas')) {
                document.body.appendChild(canvas);
            }
            console.log('✅ DOM canvas success');
        } else {
            console.error('❌ No canvas available');
            return;
        }

        canvas.width = 375;
        canvas.height = 667;
        ctx = canvas.getContext('2d');
        console.log('✅ Canvas size: ' + canvas.width + ' x ' + canvas.height);

        setupEventListeners();
        gameLoop();
    } catch (e) {
        console.error('❌ Initialization failed:', e.message, e.stack);
    }
}

function setupEventListeners() {
    if (typeof wx !== 'undefined') {
        wx.onTouchStart((e) => handleClick(e.touches[0] || e.changedTouches[0]));
        console.log('✅ Registered wx touch events');
    } else if (canvas.addEventListener) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            handleClick({ clientX: e.clientX - rect.left, clientY: e.clientY - rect.top });
        });
        console.log('✅ Registered DOM click events');
    }
}

function handleClick(touch) {
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    console.log(`👆 Click at: (${x}, ${y})`);

    if (gameState === 'menu') {
        if (x > 87 && x < 287 && y > 220 && y < 280) {
            console.log('🎮 Start Game clicked!');
            startGame();
        } else if (x > 87 && x < 287 && y > 300 && y < 360) {
            console.log('🛒 Shop clicked!');
            showToast('🛒 商店功能开发中...');
        } else if (x > 87 && x < 287 && y > 380 && y < 440) {
            console.log('🏆 Achievements clicked!');
            showToast('🏆 成就功能开发中...');
        }
    }
}

function startGame() {
    gameState = 'playing';
    console.log('🎮 Entering playing state');
    showToast('🌿 欢迎来到治愈花园！');
}

function showToast(msg) {
    console.log('💬 Toast:', msg);
}

function renderMenu() {
    const gradient = ctx.createLinearGradient(0, 0, 0, 667);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F7FA');
    gradient.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 375, 667);

    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 500, 375, 167);

    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#388E3C';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 治愈花园', 187.5, 120);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('放松心情，种植你的秘密花园', 187.5, 160);

    drawButton(250, '🎮 开始游戏', '#4CAF50');
    drawButton(330, '🛒 商店', '#2196F3');
    drawButton(410, '🏆 成就', '#FF9800');

    ctx.font = '24px Arial';
    const flowers = ['🌻', '🌷', '🌹', '🌵', '🌸', '🍄', '🌼', '🌿'];
    flowers.forEach((emoji, i) => {
        ctx.fillText(emoji, 20 + (i % 4) * 88, 530 + Math.floor(i / 4) * 40);
    });
}

function drawButton(y, text, color) {
    ctx.fillStyle = color;
    roundRect(ctx, 87, y, 200, 50, 25);
    ctx.fill();

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(text, 187.5, y + 35);
}

function renderPlaying() {
    const gradient = ctx.createLinearGradient(0, 0, 0, 667);
    gradient.addColorStop(0, '#B3E5FC');
    gradient.addColorStop(0.6, '#E8F5E9');
    gradient.addColorStop(1, '#C8E6C9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 375, 667);

    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 游戏进行中...', 187.5, 333);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText('点击底部返回菜单', 187.5, 380);

    ctx.fillStyle = '#388E3C';
    roundRect(ctx, 100, 550, 175, 45, 22);
    ctx.fill();
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('🏠 返回菜单', 187.5, 580);
}

function gameLoop() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === 'menu') {
            renderMenu();
        } else if (gameState === 'playing') {
            renderPlaying();
        }

        frameCount++;
        if (Date.now() - lastTime >= 1000) {
            console.log(`📊 FPS: ${frameCount}`);
            frameCount = 0;
            lastTime = Date.now();
        }
    } catch (e) {
        console.error('❌ Game loop error:', e.message, e.stack);
    }

    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(gameLoop);
    } else if (typeof wx !== 'undefined') {
        setTimeout(gameLoop, 16);
    } else {
        setTimeout(gameLoop, 16);
    }
}

if (typeof wx !== 'undefined') {
    const options = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : {};
    console.log('🌿 Launching in WeChat MiniGame:', options);
    init();
} else if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
