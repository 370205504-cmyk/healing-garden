import { HealingGardenGame } from './engine/index.js';

let game = null;

async function initGame() {
    try {
        const canUseDOM = typeof window !== 'undefined' && 
                          typeof document !== 'undefined' && 
                          typeof document.getElementById === 'function';
        
        if (canUseDOM) {
            setTimeout(() => {
                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
            }, 1500);
        }
        
        console.log('🔧 Creating game instance...');
        game = new HealingGardenGame();
        
        if (game && game.stats) {
            console.log('🌿 Healing Garden Game initialized!');
        } else if (game) {
            console.log('🌿 Healing Garden Game initialized!');
        }
    } catch (e) {
        console.error('❌ Game initialization failed:', e.message);
    }
}

if (typeof window !== 'undefined' && 
    typeof document !== 'undefined' && 
    typeof document.addEventListener === 'function') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
} else if (typeof wx !== 'undefined') {
    const options = wx.getLaunchOptionsSync ? wx.getLaunchOptionsSync() : {};
    console.log('🌿 Launching in WeChat MiniGame:', options);
    initGame();
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGame, HealingGardenGame };
}
