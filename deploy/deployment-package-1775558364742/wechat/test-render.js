console.log('🌿 Test Render Script loaded');

let canvas = null;
let ctx = null;
let animationId = null;
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
    console.log('🔧 Initializing test render...');
    
    if (typeof wx !== 'undefined') {
        canvas = wx.createCanvas();
        console.log('✅ Created wx canvas');
    } else if (typeof document !== 'undefined') {
        canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
        if (!document.getElementById('gameCanvas')) {
            document.body.appendChild(canvas);
        }
        console.log('✅ Created DOM canvas');
    } else {
        console.error('❌ No canvas available');
        return;
    }
    
    canvas.width = 375;
    canvas.height = 667;
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Failed to get 2D context');
        return;
    }
    
    console.log('✅ Canvas context ready');
    startRenderLoop();
}

function startRenderLoop() {
    console.log('🎮 Starting render loop...');
    render();
}

function render() {
    frameCount++;
    const now = Date.now();
    const deltaTime = now - lastTime;
    
    if (deltaTime >= 1000) {
        console.log(`📊 FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = now;
    }
    
    try {
        ctx.fillStyle = '#E8F5E9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawTestScene();
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(render);
        } else if (typeof wx !== 'undefined') {
            animationId = setTimeout(render, 16);
        }
    } catch (e) {
        console.error('❌ Render error:', e.message);
    }
}

function drawTestScene() {
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 400, 375, 267);
    
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const x = 30 + j * 125;
            const y = 150 + i * 140;
            ctx.fillRect(x, y, 90, 100);
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, 90, 100);
        }
    }
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 治愈花园', 187.5, 60);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('测试渲染正常工作！', 187.5, 100);
    
    ctx.font = '32px Arial';
    const plants = ['🌻', '🌷', '🌹', '🌵', '🌸', '🍄', '🌼', '🌾', '🌱'];
    for (let i = 0; i < 9; i++) {
        const x = 75 + (i % 3) * 125;
        const y = 200 + Math.floor(i / 3) * 140;
        ctx.fillText(plants[i], x, y);
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    roundRect(ctx, 20, 580, 335, 60, 15);
    ctx.fill();
    
    const navIcons = ['🏡', '🛒', '📦', '🏆', '👥'];
    const navLabels = ['花园', '商店', '仓库', '成就', '好友'];
    for (let i = 0; i < 5; i++) {
        const x = 35 + i * 75;
        ctx.font = '22px Arial';
        ctx.fillText(navIcons[i], x, 610);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(navLabels[i], x - 5, 635);
        ctx.fillStyle = '#333';
    }
}

function cleanup() {
    if (animationId) {
        clearTimeout(animationId);
    }
    console.log('🧹 Cleanup done');
}

if (typeof wx !== 'undefined') {
    const options = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : {};
    console.log('🚀 Launch options:', options);
    init();
} else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

module.exports = { init, cleanup };
