/**
 * 治愈花园 - 交互脚本
 * 实现手绘治愈风游戏界面的交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化游戏
    initGame();
    
    // 显示加载动画
    simulateLoading();
});

// ========== 游戏状态 ==========
const gameState = {
    level: 7,
    exp: 65,
    expToNextLevel: 100,
    coins: 1245,
    gems: 42,
    unlockedPlots: 12,
    totalPlots: 24,
    growingPlants: 8,
    weather: 'sunny',
    season: 'spring',
    time: '14:30'
};

// 植物数据
const plants = [
    { id: 'sunflower', name: '向日葵', emoji: '🌻', growthTime: 10, price: 5, color: '#FFD700', type: 'common' },
    { id: 'tulip', name: '郁金香', emoji: '🌷', growthTime: 20, price: 10, color: '#FF69B4', type: 'common' },
    { id: 'rose', name: '玫瑰', emoji: '🌹', growthTime: 30, price: 25, color: '#E53935', type: 'common' },
    { id: 'daisy', name: '小雏菊', emoji: '🌼', growthTime: 15, price: 15, color: '#FFFFFF', type: 'rare', unlockLevel: 3 },
    { id: 'lavender', name: '薰衣草', emoji: '💜', growthTime: 40, price: 50, color: '#9C27B0', type: 'rare', unlockLevel: 5 },
    { id: 'cherry', name: '樱花', emoji: '🌸', growthTime: 60, price: 100, color: '#F8BBD0', type: 'epic', unlockLevel: 8 },
    { id: 'clover', name: '四叶草', emoji: '🍀', growthTime: 90, price: 200, color: '#4CAF50', type: 'legendary', unlockLevel: 12 }
];

// 地块状态
const plots = [];

// ========== 初始化函数 ==========
function initGame() {
    console.log('治愈花园 v2.0 初始化...');
    
    // 更新UI状态
    updateGameStats();
    
    // 生成花园网格
    generateGardenGrid();
    
    // 绑定事件
    bindEvents();
    
    // 初始化种子商店
    initSeedShop();
    
    // 启动游戏循环
    startGameLoop();
    
    console.log('游戏初始化完成');
}

// 模拟加载过程
function simulateLoading() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-flower">🌱</div>
        <div class="loading-text">治愈花园</div>
        <div class="loading-progress">
            <div class="loading-progress-bar" id="loadingBar"></div>
        </div>
    `;
    document.body.appendChild(loadingIndicator);
    
    let progress = 0;
    const loadingBar = document.getElementById('loadingBar');
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // 加载完成
            setTimeout(() => {
                loadingIndicator.classList.add('hidden');
                setTimeout(() => {
                    loadingIndicator.remove();
                    showNotification('欢迎来到治愈花园！');
                }, 500);
            }, 500);
        }
        loadingBar.style.width = `${progress}%`;
    }, 100);
}

// 更新游戏统计信息
function updateGameStats() {
    // 更新等级和经验
    document.querySelector('.level-badge').textContent = `Lv.${gameState.level}`;
    document.querySelector('.exp-fill').style.width = `${(gameState.exp / gameState.expToNextLevel) * 100}%`;
    document.querySelector('.exp-text').textContent = `${gameState.exp}/${gameState.expToNextLevel}`;
    
    // 更新资源
    document.querySelector('.coin-amount').textContent = gameState.coins.toLocaleString();
    document.querySelector('.gem-amount').textContent = gameState.gems;
    
    // 更新地块统计
    document.querySelector('.plot-count').textContent = `已解锁: ${gameState.unlockedPlots}/${gameState.totalPlots} 地块`;
    document.querySelector('.plant-count').textContent = `正在生长: ${gameState.growingPlants} 株`;
    
    // 更新时间和季节
    document.querySelector('.time-text').textContent = `午后 ${gameState.time}`;
    document.querySelector('.season-text').textContent = gameState.season === 'spring' ? '春' : 
                                                       gameState.season === 'summer' ? '夏' :
                                                       gameState.season === 'autumn' ? '秋' : '冬';
}

// 生成花园网格
function generateGardenGrid() {
    const grid = document.querySelector('.garden-grid');
    grid.innerHTML = '';
    
    const totalPlots = 24; // 4行 x 6列
    for (let i = 0; i < totalPlots; i++) {
        const plot = document.createElement('div');
        plot.className = 'plot';
        plot.dataset.plotId = i;
        
        // 随机确定地块状态
        const isLocked = i >= gameState.unlockedPlots;
        const hasPlant = i < gameState.growingPlants && !isLocked;
        
        if (isLocked) {
            plot.classList.add('locked');
            plot.innerHTML = '<div class="plot-content">🔒</div>';
        } else if (hasPlant) {
            // 随机分配一种植物
            const plantIndex = Math.floor(Math.random() * Math.min(3, plants.length));
            const plant = plants[plantIndex];
            
            // 随机生长进度
            const growthProgress = Math.random() * 100;
            const isReady = growthProgress >= 100;
            
            plot.dataset.plantId = plant.id;
            plot.dataset.growthProgress = growthProgress;
            
            plot.innerHTML = `
                <div class="plot-content">${plant.emoji}</div>
                <div class="plot-growth" style="height: ${Math.min(growthProgress, 100)}%"></div>
                ${isReady ? '<div class="plot-ready-indicator">✨</div>' : ''}
            `;
            
            plot.style.borderColor = plant.color;
            
            // 存储地块状态
            plots[i] = {
                id: i,
                plant: plant,
                growthProgress: growthProgress,
                isReady: isReady,
                isLocked: false
            };
        } else {
            // 空地块
            plot.innerHTML = '<div class="plot-content">🌱</div>';
            plot.dataset.isEmpty = 'true';
            
            plots[i] = {
                id: i,
                plant: null,
                growthProgress: 0,
                isReady: false,
                isLocked: false,
                isEmpty: true
            };
        }
        
        grid.appendChild(plot);
    }
}

// 初始化种子商店
function initSeedShop() {
    const seedGrid = document.querySelector('.seed-grid');
    seedGrid.innerHTML = '';
    
    // 显示普通种子
    const commonPlants = plants.filter(p => p.type === 'common');
    
    commonPlants.forEach(plant => {
        const seedCard = document.createElement('div');
        seedCard.className = 'seed-card';
        seedCard.dataset.plantId = plant.id;
        
        seedCard.innerHTML = `
            <div class="seed-icon">${plant.emoji}</div>
            <div class="seed-name">${plant.name}</div>
            <div class="seed-price coin">
                <i class="fas fa-coins"></i> ${plant.price}
            </div>
            <button class="buy-btn" data-plant-id="${plant.id}">
                购买
            </button>
        `;
        
        seedGrid.appendChild(seedCard);
    });
}

// 绑定事件
function bindEvents() {
    // 地块点击事件
    document.querySelectorAll('.plot').forEach(plot => {
        plot.addEventListener('click', handlePlotClick);
    });
    
    // 功能按钮点击事件
    document.querySelectorAll('.func-btn').forEach(btn => {
        btn.addEventListener('click', handleFunctionButtonClick);
    });
    
    // 操作按钮点击事件
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionButtonClick);
    });
    
    // 种子商店相关事件
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', handleCategoryTabClick);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', handleBuySeedClick);
    });
    
    // 模态窗口关闭按钮
    document.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    
    // 网格展开按钮
    document.querySelector('.grid-action-btn').addEventListener('click', toggleGridExpand);
    
    // 快速操作按钮
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickButtonClick);
    });
    
    // 点击模态窗口外部关闭
    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// ========== 事件处理函数 ==========
function handlePlotClick(e) {
    const plot = e.currentTarget;
    const plotId = parseInt(plot.dataset.plotId);
    const plotData = plots[plotId];
    
    if (!plotData) return;
    
    // 播放点击音效
    playSound('click');
    
    if (plotData.isLocked) {
        showNotification('地块尚未解锁！');
        return;
    }
    
    if (plotData.isEmpty) {
        // 空地块 - 打开种子商店
        showNotification('点击种子按钮选择植物种植');
        openSeedShop();
    } else if (plotData.isReady) {
        // 植物已成熟 - 收获
        harvestPlant(plotId, plotData);
    } else {
        // 生长中 - 显示详情
        showPlantDetail(plotId, plotData);
    }
    
    // 添加点击反馈动画
    plot.style.transform = 'scale(0.95)';
    setTimeout(() => {
        plot.style.transform = 'scale(1)';
    }, 150);
}

function handleFunctionButtonClick(e) {
    const btn = e.currentTarget;
    const btnType = btn.classList.contains('seed-shop') ? 'seed' :
                   btn.classList.contains('album') ? 'album' :
                   btn.classList.contains('decorate') ? 'decorate' :
                   btn.classList.contains('backpack') ? 'backpack' : 'friends';
    
    playSound('click');
    
    switch(btnType) {
        case 'seed':
            openSeedShop();
            break;
        case 'album':
            showNotification('植物图鉴功能开发中...');
            break;
        case 'decorate':
            showNotification('花园装饰功能开发中...');
            break;
        case 'backpack':
            showNotification('背包功能开发中...');
            break;
        case 'friends':
            showNotification('好友花园功能开发中...');
            break;
    }
    
    // 按钮动画
    btn.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-6px)';
    }, 300);
}

function handleActionButtonClick(e) {
    const btn = e.currentTarget;
    const action = btn.classList.contains('harvest-all') ? 'harvest' :
                  btn.classList.contains('water-all') ? 'water' : 'clean';
    
    playSound('click');
    
    switch(action) {
        case 'harvest':
            harvestAllReadyPlants();
            break;
        case 'water':
            waterAllPlants();
            break;
        case 'clean':
            cleanAllWitheredPlants();
            break;
    }
    
    // 按钮动画
    btn.style.transform = 'translateY(-4px)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-2px)';
    }, 200);
}

function handleCategoryTabClick(e) {
    const tab = e.currentTarget;
    const category = tab.dataset.category;
    
    // 移除所有标签的active类
    document.querySelectorAll('.category-tab').forEach(t => {
        t.classList.remove('active');
    });
    
    // 激活当前标签
    tab.classList.add('active');
    
    // 根据分类筛选种子
    const filteredPlants = plants.filter(p => {
        if (category === 'common') return p.type === 'common';
        if (category === 'rare') return p.type === 'rare';
        if (category === 'epic') return p.type === 'epic';
        if (category === 'legendary') return p.type === 'legendary';
        return true;
    });
    
    // 更新种子网格
    const seedGrid = document.querySelector('.seed-grid');
    seedGrid.innerHTML = '';
    
    filteredPlants.forEach(plant => {
        const seedCard = document.createElement('div');
        seedCard.className = 'seed-card';
        seedCard.dataset.plantId = plant.id;
        
        const currencyIcon = plant.price < 50 ? 'fa-coins' : 'fa-gem';
        const currencyClass = plant.price < 50 ? 'coin' : 'gem';
        
        seedCard.innerHTML = `
            <div class="seed-icon">${plant.emoji}</div>
            <div class="seed-name">${plant.name}</div>
            <div class="seed-price ${currencyClass}">
                <i class="fas ${currencyIcon}"></i> ${plant.price}
            </div>
            <button class="buy-btn" data-plant-id="${plant.id}">
                ${gameState.coins >= plant.price ? '购买' : '金币不足'}
            </button>
        `;
        
        seedGrid.appendChild(seedCard);
    });
    
    // 重新绑定购买按钮事件
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', handleBuySeedClick);
    });
    
    playSound('click');
}

function handleBuySeedClick(e) {
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const plantId = btn.dataset.plantId;
    const plant = plants.find(p => p.id === plantId);
    
    if (!plant) return;
    
    if (gameState.coins < plant.price) {
        showNotification('金币不足！');
        playSound('error');
        return;
    }
    
    // 扣除金币
    gameState.coins -= plant.price;
    updateGameStats();
    
    // 显示购买成功
    showNotification(`购买 ${plant.name} 种子成功！`);
    playSound('purchase');
    
    // 按钮反馈
    btn.textContent = '已购买';
    btn.disabled = true;
    btn.style.background = '#81c784';
    btn.style.color = 'white';
    
    // 找到第一个空地块并种植
    const emptyPlotIndex = plots.findIndex(p => p && p.isEmpty && !p.isLocked);
    if (emptyPlotIndex !== -1) {
        setTimeout(() => {
            plantSeed(emptyPlotIndex, plant);
        }, 500);
    }
}

function handleQuickButtonClick(e) {
    const btn = e.currentTarget;
    const action = btn.classList.contains('daily-checkin') ? 'checkin' :
                  btn.classList.contains('settings') ? 'settings' : 'share';
    
    playSound('click');
    
    switch(action) {
        case 'checkin':
            showNotification('每日签到功能开发中...');
            break;
        case 'settings':
            showNotification('游戏设置功能开发中...');
            break;
        case 'share':
            showNotification('分享功能开发中...');
            break;
    }
    
    // 旋转动画
    btn.style.transform = 'rotate(90deg) scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg) scale(1.1)';
    }, 300);
}

// ========== 游戏功能函数 ==========
function openSeedShop() {
    const modal = document.getElementById('seedShopModal');
    modal.classList.add('active');
    playSound('modalOpen');
}

function closeModal() {
    const modal = document.getElementById('seedShopModal');
    modal.classList.remove('active');
    playSound('modalClose');
}

function toggleGridExpand() {
    const grid = document.querySelector('.garden-grid');
    const btn = document.querySelector('.grid-action-btn');
    
    if (grid.classList.contains('expanded')) {
        grid.classList.remove('expanded');
        grid.style.maxHeight = '300px';
        btn.innerHTML = '<i class="fas fa-expand-alt"></i> 展开';
    } else {
        grid.classList.add('expanded');
        grid.style.maxHeight = '500px';
        btn.innerHTML = '<i class="fas fa-compress-alt"></i> 收起';
    }
    
    playSound('click');
}

function plantSeed(plotIndex, plant) {
    const plot = plots[plotIndex];
    if (!plot || !plot.isEmpty) return;
    
    // 更新地块状态
    plot.plant = plant;
    plot.isEmpty = false;
    plot.growthProgress = 0;
    plot.isReady = false;
    plot.plantedTime = Date.now();
    
    // 更新UI
    const plotElement = document.querySelector(`.plot[data-plot-id="${plotIndex}"]`);
    if (plotElement) {
        plotElement.dataset.isEmpty = 'false';
        plotElement.dataset.plantId = plant.id;
        plotElement.innerHTML = `
            <div class="plot-content">${plant.emoji}</div>
            <div class="plot-growth" style="height: 0%"></div>
        `;
        plotElement.style.borderColor = plant.color;
    }
    
    gameState.growingPlants++;
    updateGameStats();
    
    showNotification(`成功种植 ${plant.name}！`);
    playSound('plant');
}

function harvestPlant(plotIndex, plotData) {
    if (!plotData.isReady) return;
    
    const plant = plotData.plant;
    const reward = Math.floor(plant.price * 1.5); // 收获奖励为价格的1.5倍
    
    // 更新游戏状态
    gameState.coins += reward;
    gameState.growingPlants--;
    gameState.exp += 5;
    
    if (gameState.exp >= gameState.expToNextLevel) {
        levelUp();
    }
    
    // 重置地块
    plots[plotIndex] = {
        id: plotIndex,
        plant: null,
        growthProgress: 0,
        isReady: false,
        isLocked: false,
        isEmpty: true
    };
    
    // 更新UI
    const plotElement = document.querySelector(`.plot[data-plot-id="${plotIndex}"]`);
    if (plotElement) {
        plotElement.dataset.plantId = '';
        plotElement.dataset.isEmpty = 'true';
        plotElement.innerHTML = '<div class="plot-content">🌱</div>';
        plotElement.style.borderColor = '';
        
        // 收获动画
        createCoinAnimation(plotElement, reward);
    }
    
    updateGameStats();
    showNotification(`收获 ${plant.name}！获得 ${reward} 金币`);
    playSound('harvest');
}

function harvestAllReadyPlants() {
    const readyPlots = plots.filter(p => p && p.isReady && !p.isLocked);
    
    if (readyPlots.length === 0) {
        showNotification('没有可以收获的植物！');
        playSound('error');
        return;
    }
    
    let totalReward = 0;
    readyPlots.forEach(plotData => {
        const reward = Math.floor(plotData.plant.price * 1.5);
        totalReward += reward;
        harvestPlant(plotData.id, plotData);
    });
    
    // 延迟显示总奖励
    setTimeout(() => {
        showNotification(`一键收获完成！总计获得 ${totalReward} 金币`);
    }, 500);
    
    playSound('harvestAll');
}

function waterAllPlants() {
    const growingPlots = plots.filter(p => p && p.plant && !p.isReady && !p.isLocked);
    
    if (growingPlots.length === 0) {
        showNotification('没有需要浇水的植物！');
        playSound('error');
        return;
    }
    
    growingPlots.forEach(plotData => {
        // 加速生长
        plotData.growthProgress += 20;
        if (plotData.growthProgress > 100) {
            plotData.growthProgress = 100;
            plotData.isReady = true;
        }
        
        // 更新UI
        const plotElement = document.querySelector(`.plot[data-plot-id="${plotData.id}"]`);
        if (plotElement) {
            const growthBar = plotElement.querySelector('.plot-growth');
            if (growthBar) {
                growthBar.style.height = `${plotData.growthProgress}%`;
            }
            
            if (plotData.isReady) {
                plotElement.innerHTML += '<div class="plot-ready-indicator">✨</div>';
            }
            
            // 浇水动画
            createWaterAnimation(plotElement);
        }
    });
    
    showNotification(`为 ${growingPlots.length} 株植物浇水，加速生长！`);
    playSound('water');
}

function cleanAllWitheredPlants() {
    // 这里模拟枯萎植物
    const witheredPlots = plots.filter(p => p && p.plant && p.isReady && !p.isLocked).slice(0, 2);
    
    if (witheredPlots.length === 0) {
        showNotification('没有需要清理的枯萎植物！');
        playSound('error');
        return;
    }
    
    witheredPlots.forEach(plotData => {
        plots[plotData.id] = {
            id: plotData.id,
            plant: null,
            growthProgress: 0,
            isReady: false,
            isLocked: false,
            isEmpty: true
        };
        
        const plotElement = document.querySelector(`.plot[data-plot-id="${plotData.id}"]`);
        if (plotElement) {
            plotElement.innerHTML = '<div class="plot-content">🌱</div>';
            plotElement.style.borderColor = '';
            
            // 清理动画
            createCleanAnimation(plotElement);
        }
        
        gameState.growingPlants--;
    });
    
    updateGameStats();
    showNotification(`清理了 ${witheredPlots.length} 株枯萎植物！`);
    playSound('clean');
}

function levelUp() {
    gameState.level++;
    gameState.exp = gameState.exp - gameState.expToNextLevel;
    gameState.expToNextLevel = Math.floor(gameState.expToNextLevel * 1.5);
    gameState.unlockedPlots = Math.min(gameState.unlockedPlots + 2, gameState.totalPlots);
    
    // 解锁新植物提示
    const newPlants = plants.filter(p => p.unlockLevel === gameState.level);
    
    showNotification(`恭喜升级到 Lv.${gameState.level}！解锁${newPlants.length}种新植物`);
    playSound('levelUp');
    
    // 重新生成网格以显示新解锁的地块
    setTimeout(() => {
        generateGardenGrid();
        updateGameStats();
    }, 1000);
}

function showPlantDetail(plotIndex, plotData) {
    const plant = plotData.plant;
    const growthPercent = Math.floor(plotData.growthProgress);
    const timeRemaining = Math.floor((100 - growthPercent) * plant.growthTime / 100);
    
    showNotification(`${plant.name} 生长中... ${growthPercent}% (${timeRemaining}秒后成熟)`);
}

// ========== 动画效果函数 ==========
function createCoinAnimation(sourceElement, amount) {
    const coins = 5;
    for (let i = 0; i < coins; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.innerHTML = '🪙';
        coin.style.cssText = `
            position: absolute;
            font-size: 1.2rem;
            z-index: 1000;
            pointer-events: none;
            left: ${sourceElement.offsetLeft + sourceElement.offsetWidth / 2}px;
            top: ${sourceElement.offsetTop + sourceElement.offsetHeight / 2}px;
        `;
        
        document.body.appendChild(coin);
        
        // 随机飞向顶部金币显示区域
        const targetX = Math.random() * 100 + 50;
        const targetY = 50;
        
        anime({
            targets: coin,
            translateX: targetX,
            translateY: -targetY,
            scale: [1, 1.2, 0.5],
            opacity: [1, 1, 0],
            duration: 800 + i * 100,
            easing: 'easeOutQuad',
            complete: () => coin.remove()
        });
    }
}

function createWaterAnimation(targetElement) {
    const water = document.createElement('div');
    water.className = 'water-animation';
    water.innerHTML = '💧';
    water.style.cssText = `
        position: absolute;
        font-size: 1.5rem;
        z-index: 1000;
        pointer-events: none;
        left: ${targetElement.offsetLeft + targetElement.offsetWidth / 2}px;
        top: ${targetElement.offsetTop}px;
        opacity: 0;
    `;
    
    document.body.appendChild(water);
    
    anime({
        targets: water,
        translateY: targetElement.offsetHeight,
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
        duration: 800,
        easing: 'easeOutQuad',
        complete: () => water.remove()
    });
}

function createCleanAnimation(targetElement) {
    const broom = document.createElement('div');
    broom.className = 'clean-animation';
    broom.innerHTML = '🧹';
    broom.style.cssText = `
        position: absolute;
        font-size: 2rem;
        z-index: 1000;
        pointer-events: none;
        left: ${targetElement.offsetLeft + targetElement.offsetWidth / 2}px;
        top: ${targetElement.offsetTop + targetElement.offsetHeight / 2}px;
    `;
    
    document.body.appendChild(broom);
    
    anime({
        targets: broom,
        rotate: [0, 180],
        scale: [1, 1.5, 0],
        opacity: [1, 1, 0],
        duration: 600,
        easing: 'easeOutQuad',
        complete: () => broom.remove()
    });
}

// ========== 工具函数 ==========
function showNotification(message) {
    const toast = document.querySelector('.notification-toast');
    const toastText = toast.querySelector('.toast-text');
    
    toastText.textContent = message;
    
    // 重置动画
    toast.style.animation = 'none';
    void toast.offsetWidth; // 触发重排
    toast.style.animation = 'toast-slide 5s ease-in-out';
}

function playSound(soundType) {
    // 实际游戏中会使用音频API，这里仅模拟
    console.log(`播放音效: ${soundType}`);
    
    // 可以在这里添加真实的音频播放代码
    // 例如：const audio = new Audio(`sounds/${soundType}.mp3`);
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('音频播放失败:', e));
}

function startGameLoop() {
    // 游戏主循环 - 更新植物生长
    setInterval(() => {
        plots.forEach((plot, index) => {
            if (plot && plot.plant && !plot.isReady && !plot.isLocked) {
                // 生长进度增加
                plot.growthProgress += 0.5; // 每2秒增加1%
                
                if (plot.growthProgress >= 100) {
                    plot.growthProgress = 100;
                    plot.isReady = true;
                    
                    // 更新UI
                    const plotElement = document.querySelector(`.plot[data-plot-id="${index}"]`);
                    if (plotElement) {
                        const growthBar = plotElement.querySelector('.plot-growth');
                        if (growthBar) {
                            growthBar.style.height = '100%';
                        }
                        
                        // 添加成熟指示器
                        if (!plotElement.querySelector('.plot-ready-indicator')) {
                            plotElement.innerHTML += '<div class="plot-ready-indicator">✨</div>';
                        }
                        
                        // 成熟通知
                        if (plot.growthProgress === 100) {
                            showNotification(`${plot.plant.name} 已成熟，可以收获了！`);
                        }
                    }
                } else {
                    // 更新生长条
                    const plotElement = document.querySelector(`.plot[data-plot-id="${index}"]`);
                    if (plotElement) {
                        const growthBar = plotElement.querySelector('.plot-growth');
                        if (growthBar) {
                            growthBar.style.height = `${plot.growthProgress}%`;
                        }
                    }
                }
            }
        });
    }, 2000); // 每2秒更新一次
    
    // 天气和时间变化
    setInterval(() => {
        // 随机天气变化
        const weathers = ['sunny', 'cloudy', 'rainy'];
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        
        // 每10分钟有20%几率改变天气
        if (Math.random() < 0.2) {
            gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
            
            const weatherIcon = document.querySelector('.weather-icon');
            if (weatherIcon) {
                weatherIcon.className = gameState.weather === 'sunny' ? 'fas fa-sun' :
                                      gameState.weather === 'cloudy' ? 'fas fa-cloud' : 'fas fa-cloud-rain';
                weatherIcon.style.color = gameState.weather === 'sunny' ? '#ffb74d' :
                                         gameState.weather === 'cloudy' ? '#90a4ae' : '#4fc3f7';
            }
        }
        
        // 每30分钟有10%几率改变季节（简化版）
        if (Math.random() < 0.1) {
            const currentSeasonIndex = seasons.indexOf(gameState.season);
            gameState.season = seasons[(currentSeasonIndex + 1) % seasons.length];
            
            const seasonText = document.querySelector('.season-text');
            if (seasonText) {
                seasonText.textContent = gameState.season === 'spring' ? '春' :
                                       gameState.season === 'summer' ? '夏' :
                                       gameState.season === 'autumn' ? '秋' : '冬';
            }
        }
    }, 600000); // 每10分钟检查一次
}

// ========== 导出到全局 ==========
window.GameManager = {
    gameState,
    plants,
    plots,
    updateGameStats,
    generateGardenGrid,
    openSeedShop,
    closeModal,
    showNotification
};

console.log('治愈花园交互脚本加载完成！');