console.log('🔧 Minimal Test Starting...');

let canvas = null;
let ctx = null;
let frameCount = 0;

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
        if (!ctx) {
            console.error('❌ Failed to get 2D context');
            return;
        }
        console.log('✅ 2D context ready');

        startRender();
    } catch (e) {
        console.error('❌ Init error:', e.message);
    }
}

function startRender() {
    console.log('🎮 Starting render loop...');
    render();
}

function render() {
    frameCount++;
    if (frameCount % 60 === 0) {
        console.log(`📊 FPS: 60, Frame: ${frameCount}`);
    }

    try {
        ctx.fillStyle = '#E8F5E9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#81C784';
        ctx.fillRect(0, 400, 375, 267);

        ctx.font = '28px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 治愈花园', 187.5, 80);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('测试渲染正常工作！', 187.5, 120);

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

        ctx.font = '32px Arial';
        const plants = ['🌻', '🌷', '🌹', '🌵', '🌸', '🍄', '🌼', '🌾', '🌱'];
        for (let i = 0; i < 9; i++) {
            const x = 75 + (i % 3) * 125;
            const y = 200 + Math.floor(i / 3) * 140;
            ctx.fillText(plants[i], x, y);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        roundRect(ctx, 20, 580, 335, 60, 15);
        ctx.fill();

        const nav = ['🏡', '🛒', '📦', '🏆', '👥'];
        for (let i = 0; i < 5; i++) {
            const x = 35 + i * 75;
            ctx.font = '22px Arial';
            ctx.fillText(nav[i], x, 610);
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666';
        }

        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(render);
        } else {
            setTimeout(render, 16);
        }
    } catch (e) {
        console.error('❌ Render error:', e.message);
    }
}

if (typeof wx !== 'undefined') {
    console.log('📱 WeChat MiniGame Mode');
    init();
} else if (typeof document !== 'undefined') {
    console.log('🌐 Browser Mode');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
} else {
    console.log('🖥️  Node Mode');
    init();
}
