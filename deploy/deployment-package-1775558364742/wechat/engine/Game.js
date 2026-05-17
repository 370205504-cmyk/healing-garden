import { Engine } from './Engine.js';
import { TransformComponent, RenderComponent, PhysicsComponent, ColliderComponent, ClickableComponent, PlantComponent, UIComponent } from './components/index.js';
import { crypto, antiCheat, logger } from '../security/index.js';
import { profiler, frameRateMonitor } from '../perf/index.js';

class HealingGardenGame {
    constructor() {
        this.engine = null;
        this.gameData = null;
        this.weather = 'sunny';
        this.selectedSeed = null;
        this.selectedItem = null;
        this.plots = [];
        this.securityEnabled = true;
        this.performanceMonitoring = true;
        this.gameState = 'menu';
        
        this._itemsData = {
            water_boost: { name: '超级水壶', emoji: '💧', price: 15, description: '立即浇水', effect: 'water' },
            growth_potion: { name: '生长药水', emoji: '🧪', price: 30, description: '加速50%', effect: 'speed' },
            fertilizer: { name: '肥料', emoji: '🌿', price: 20, description: '产量+20%', effect: 'yield' },
            lucky_charm: { name: '幸运符', emoji: '🍀', price: 50, description: '稀有+15%', effect: 'luck' },
            auto_harvest: { name: '收割机', emoji: '🤖', price: 100, description: '自动收获', effect: 'auto' },
            extra_slot: { name: '扩展卡', emoji: '📦', price: 80, description: '解锁槽位', effect: 'slot' }
        };

        this._init();
    }

    async _init() {
        this.engine = new Engine({ width: 375, height: 667, debug: true, targetFPS: 60 });

        await this._loadGameData();
        this._setupEventListeners();
        this._registerStates();
        this._createMainMenu();
        this.engine.start();
    }

    async _loadGameData() {
        this.gameData = {
            player: { coins: 500, diamonds: 30, hearts: 10, level: 3, exp: 45, gardenName: '秘密花园', day: 7 },
            inventory: {
                sunflower: 15, tulip: 10, rose: 6, cactus: 8, cherry: 4, mushroom: 10,
                lavender: 5, sunflower_gold: 2, bamboo: 8, lotus: 2, clover: 1, hydrangea: 5
            },
            items: { water_boost: 8, growth_potion: 5, fertilizer: 6, lucky_charm: 3, auto_harvest: 2, extra_slot: 3 },
            achievements: [
                { id: 'first_plant', name: '初次种植', unlocked: true, claimed: true, reward: 10 },
                { id: 'first_harvest', name: '初次收获', unlocked: true, claimed: true, reward: 20 },
                { id: 'plant_master', name: '种植大师', unlocked: false, claimed: false, reward: 100, progress: 12, target: 50 },
                { id: 'harvest_master', name: '收获大师', unlocked: false, claimed: false, reward: 150, progress: 8, target: 30 },
                { id: 'level_10', name: '花园升级', unlocked: false, claimed: false, reward: 300, progress: 3, target: 10 }
            ],
            dailyRewardClaimed: false
        };

        if (typeof wx !== 'undefined') {
            try {
                const saved = wx.getStorageSync('healingGardenData');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (this.securityEnabled) {
                        const validation = antiCheat.validateAll(parsed);
                        if (!validation.valid) {
                            logger.warn('Data validation failed', validation);
                            this._showToast('检测到数据异常，已重置');
                        } else {
                            Object.assign(this.gameData.player, parsed);
                            logger.info('Game data loaded');
                        }
                    } else {
                        Object.assign(this.gameData.player, parsed);
                    }
                }
            } catch (e) {
                logger.error('Loading failed', { error: e.message });
            }
        }

        if (this.performanceMonitoring) {
            frameRateMonitor.start();
            frameRateMonitor.setCallback('onWarning', (fps, stats) => {
                logger.warn(`Low FPS: ${fps}`, stats);
            });
        }
    }

    _setupEventListeners() {
        if (typeof wx !== 'undefined') {
            wx.onTouchStart((e) => this._handleTouch(e, 'start'));
            wx.onTouchMove((e) => this._handleTouch(e, 'move'));
            wx.onTouchEnd((e) => this._handleTouch(e, 'end'));
        }
        
        this.engine.eventBus.on('input', (data) => {
            this._handleInput(data.type, data.data);
        });
    }

    _handleTouch(e, type) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;

        const rect = this.engine.canvas.getBoundingClientRect ? this.engine.canvas.getBoundingClientRect() : { left: 0, top: 0 };
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        switch (type) {
            case 'start':
                this._handleClick(x, y);
                break;
            case 'move':
                break;
            case 'end':
                break;
        }
    }

    _handleInput(type, data) {
        if (type === 'mousedown' || type === 'touchstart') {
            this._handleClick(data.x, data.y);
        }
    }

    _handleClick(x, y) {
        console.log(`👆 Click at: (${x}, ${y})`);

        if (this.gameState === 'menu') {
            this._handleMenuClick(x, y);
        } else if (this.gameState === 'playing') {
            this._handlePlayingClick(x, y);
        }
    }

    _handleMenuClick(x, y) {
        if (x > 87 && x < 287 && y > 220 && y < 280) {
            this._startGame();
        } else if (x > 87 && x < 287 && y > 300 && y < 360) {
            this._showShop();
        } else if (x > 87 && x < 287 && y > 380 && y < 440) {
            this._showAchievements();
        }
    }

    _handlePlayingClick(x, y) {
        if (y > 580) {
            this._handleBottomNavClick(x);
            return;
        }

        if (y > 40 && y < 100) {
            this._handleTopBarClick(x, y);
            return;
        }

        if (this.selectedItem) {
            const plot = this._getPlotAtPosition(x, y);
            if (plot) {
                this._useItemOnPlot(this.selectedItem, plot);
            }
            this.selectedItem = null;
            return;
        }

        if (this.selectedSeed) {
            const plot = this._getPlotAtPosition(x, y);
            if (plot && !plot.plant) {
                this._plantSeed(plot, this.selectedSeed);
            }
            this.selectedSeed = null;
            return;
        }

        const plot = this._getPlotAtPosition(x, y);
        if (plot) {
            if (plot.readyToHarvest) {
                this._harvestPlant(plot);
            } else if (plot.plant && !plot.watered) {
                this._waterPlant(plot);
            }
            return;
        }

        this._showToast('点击格子种植或收获！');
    }

    _getPlotAtPosition(x, y) {
        const PLOT_SIZE = 100, PLOT_GAP = 15, START_X = 30, START_Y = 120;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const px = START_X + col * (PLOT_SIZE + PLOT_GAP);
                const py = START_Y + row * (PLOT_SIZE + PLOT_GAP);
                if (x > px && x < px + PLOT_SIZE && y > py && y < py + PLOT_SIZE) {
                    return this.plots[row * 3 + col];
                }
            }
        }
        return null;
    }

    _handleBottomNavClick(x) {
        if (x < 75) {
            this._showSeedSelector();
        } else if (x < 150) {
            this._showShop();
        } else if (x < 225) {
            this._showInventory();
        } else if (x < 300) {
            this._showAchievements();
        } else {
            this._showFriends();
        }
    }

    _handleTopBarClick(x, y) {
        if (x < 100) {
            this._showToast(`💰 ${this.gameData.player.coins} | 💎 ${this.gameData.player.diamonds}`);
        } else if (x > 250) {
            this._cycleWeather();
        }
    }

    _registerStates() {
        this.engine.stateMachine.addState('menu', {
            enter: () => { this.gameState = 'menu'; console.log('🎮 Entering menu state'); },
            exit: () => console.log('🎮 Exiting menu state'),
            update: (dt) => this._updateMenu(dt),
            render: (ctx) => this._renderMenu(ctx)
        });

        this.engine.stateMachine.addState('playing', {
            enter: () => { this.gameState = 'playing'; console.log('🎮 Entering playing state'); },
            exit: () => console.log('🎮 Exiting playing state'),
            update: (dt) => this._updatePlaying(dt),
            render: (ctx) => this._renderPlaying(ctx)
        });

        this.engine.stateMachine.changeState('menu');
    }

    _createMainMenu() {
        console.log('🎨 Creating main menu...');
    }

    _startGame() {
        this.engine.stateMachine.changeState('playing');
        this._createGarden();
        this._createUI();
        this._showToast('🌿 欢迎来到治愈花园！');
    }

    _createGarden() {
        const PLANTS = {
            sunflower: { name: '向日葵', emoji: '🌻', price: 10, sellPrice: 30, growthTime: 20000, stages: 4, rarity: 'common', bonus: 1 },
            tulip: { name: '郁金香', emoji: '🌷', price: 20, sellPrice: 50, growthTime: 30000, stages: 4, rarity: 'common', bonus: 1 },
            rose: { name: '玫瑰', emoji: '🌹', price: 35, sellPrice: 80, growthTime: 40000, stages: 4, rarity: 'rare', bonus: 1.2 },
            cactus: { name: '仙人掌', emoji: '🌵', price: 15, sellPrice: 40, growthTime: 25000, stages: 4, rarity: 'common', bonus: 1 },
            cherry: { name: '樱花', emoji: '🌸', price: 50, sellPrice: 120, growthTime: 55000, stages: 4, rarity: 'rare', bonus: 1.3 },
            mushroom: { name: '蘑菇', emoji: '🍄', price: 25, sellPrice: 60, growthTime: 22000, stages: 4, rarity: 'common', bonus: 1 },
            lavender: { name: '薰衣草', emoji: '💜', price: 40, sellPrice: 100, growthTime: 45000, stages: 4, rarity: 'rare', bonus: 1.3 },
            sunflower_gold: { name: '金色向日葵', emoji: '🌟', price: 80, sellPrice: 200, growthTime: 70000, stages: 5, rarity: 'legendary', bonus: 2 },
            bamboo: { name: '翠竹', emoji: '🎋', price: 30, sellPrice: 75, growthTime: 35000, stages: 4, rarity: 'common', bonus: 1.1 },
            lotus: { name: '莲花', emoji: '🪷', price: 60, sellPrice: 150, growthTime: 60000, stages: 4, rarity: 'legendary', bonus: 1.8 },
            clover: { name: '四叶草', emoji: '🍀', price: 100, sellPrice: 300, growthTime: 90000, stages: 4, rarity: 'mythic', bonus: 3 },
            hydrangea: { name: '绣球花', emoji: '💙', price: 45, sellPrice: 110, growthTime: 50000, stages: 4, rarity: 'rare', bonus: 1.4 }
        };

        this.plantsData = PLANTS;
        this.plots = [];

        const GRID_ROWS = 3, GRID_COLS = 3, PLOT_SIZE = 100, PLOT_GAP = 15, START_X = 30, START_Y = 120;

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const x = START_X + col * (PLOT_SIZE + PLOT_GAP);
                const y = START_Y + row * (PLOT_SIZE + PLOT_GAP);

                const plotEntity = this.engine.createEntity();
                plotEntity.addComponent(new TransformComponent(x + PLOT_SIZE/2, y + PLOT_SIZE/2));
                plotEntity.addComponent(RenderComponent.rect({ width: PLOT_SIZE, height: PLOT_SIZE, fillColor: '#8D6E63', strokeColor: '#5D4037', lineWidth: 3, radius: 8 }));

                const soilEntity = this.engine.createEntity();
                soilEntity.addComponent(new TransformComponent(x + PLOT_SIZE/2 + 5, y + PLOT_SIZE/2 + 5));
                soilEntity.addComponent(RenderComponent.rect({ width: PLOT_SIZE - 10, height: PLOT_SIZE - 10, fillColor: '#6D4C41', radius: 6 }));

                this.plots.push({ entity: plotEntity, row, col, plant: null, plantedAt: null, watered: false, readyToHarvest: false });
            }
        }
        console.log('🌾 Garden created with', this.plots.length, 'plots');
    }

    _createUI() {
        this._createTopBar();
        this._createBottomNav();
    }

    _createTopBar() {
        const topBar = this.engine.createEntity();
        topBar.addComponent(new TransformComponent(187.5, 40));
        topBar.addComponent(RenderComponent.rect({ width: 375, height: 80, fillColor: 'rgba(255,255,255,0.9)', radius: 15 }));

        this._coinsText = this.engine.createEntity();
        this._coinsText.addComponent(new TransformComponent(30, 35));
        this._coinsText.addComponent(RenderComponent.text({ text: `💰 ${this.gameData.player.coins}`, fontSize: 18, fillColor: '#FFD700', fontWeight: 'bold' }));

        this._diamondsText = this.engine.createEntity();
        this._diamondsText.addComponent(new TransformComponent(30, 60));
        this._diamondsText.addComponent(RenderComponent.text({ text: `💎 ${this.gameData.player.diamonds}`, fontSize: 14, fillColor: '#9C27B0' }));

        this._weatherText = this.engine.createEntity();
        this._weatherText.addComponent(new TransformComponent(320, 35));
        this._weatherText.addComponent(RenderComponent.text({ text: '☀️ 晴天', fontSize: 14, fillColor: '#666' }));

        this._dayText = this.engine.createEntity();
        this._dayText.addComponent(new TransformComponent(320, 60));
        this._dayText.addComponent(RenderComponent.text({ text: `第 ${this.gameData.player.day} 天`, fontSize: 12, fillColor: '#666' }));
    }

    _createBottomNav() {
        const navItems = [
            { icon: '🌱', label: '种子', action: () => this._showSeedSelector() },
            { icon: '🛒', label: '商店', action: () => this._showShop() },
            { icon: '📦', label: '仓库', action: () => this._showInventory() },
            { icon: '🏆', label: '成就', action: () => this._showAchievements() },
            { icon: '👥', label: '好友', action: () => this._showFriends() }
        ];

        navItems.forEach((item, index) => {
            const x = 25 + index * 75;
            const y = 615;

            const btnEntity = this.engine.createEntity();
            btnEntity.addComponent(new TransformComponent(x, y));
            btnEntity.addComponent(RenderComponent.rect({ width: 55, height: 55, fillColor: 'rgba(255,255,255,0.95)', radius: 12 }));

            const iconEntity = this.engine.createEntity();
            iconEntity.addComponent(new TransformComponent(x + 15, y + 12));
            iconEntity.addComponent(RenderComponent.text({ text: item.icon, fontSize: 24 }));

            const labelEntity = this.engine.createEntity();
            labelEntity.addComponent(new TransformComponent(x + 15, y + 42));
            labelEntity.addComponent(RenderComponent.text({ text: item.label, fontSize: 10, fillColor: '#666' }));
        });
    }

    _showSeedSelector() {
        const seeds = Object.entries(this.plantsData);
        let msg = '🌱 种子库存:\n';
        seeds.forEach(([key, plant]) => {
            const count = this.gameData.inventory[key] || 0;
            if (count > 0) {
                msg += `${plant.emoji} ${plant.name}: ${count}\n`;
            }
        });
        this._showToast(msg);

        this.selectedSeed = 'sunflower';
        this._showToast('已选择向日葵种子！点击格子种植');
    }

    _showShop() {
        this._showToast('🛒 商店功能开发中...\n\n💧 超级水壶: 15金币\n🧪 生长药水: 30金币\n🌿 肥料: 20金币');
    }

    _showInventory() {
        let msg = '📦 道具库存:\n';
        Object.entries(this._itemsData).forEach(([key, item]) => {
            const count = this.gameData.items[key] || 0;
            msg += `${item.emoji} ${item.name}: ${count}\n`;
        });
        this._showToast(msg);
    }

    _showAchievements() {
        let msg = '🏆 成就:\n';
        this.gameData.achievements.forEach(ach => {
            const status = ach.claimed ? '✅' : ach.unlocked ? '🔓' : '🔒';
            msg += `${status} ${ach.name}\n`;
        });
        this._showToast(msg);
    }

    _showFriends() {
        this._showToast('👥 好友系统开发中...');
    }

    _cycleWeather() {
        const weathers = ['sunny', 'cloudy', 'rainy', 'stormy'];
        const currentIndex = weathers.indexOf(this.weather);
        this.weather = weathers[(currentIndex + 1) % weathers.length];

        const weatherInfo = this._getWeatherInfo();
        this._showToast(`天气变化: ${weatherInfo.emoji} ${weatherInfo.name}`);
    }

    _plantSeed(plot, plantType) {
        if (this.gameData.inventory[plantType] <= 0) {
            this._showToast('种子不足！');
            return;
        }

        this.gameData.inventory[plantType]--;
        const plantData = this.plantsData[plantType];

        const plantEntity = this.engine.createEntity();
        plantEntity.addComponent(new TransformComponent(
            plot.entity.getComponent('TransformComponent').x,
            plot.entity.getComponent('TransformComponent').y
        ));
        plantEntity.addComponent(RenderComponent.emoji({ emoji: '🌱', fontSize: 20 }));
        plantEntity.addComponent(new PlantComponent(plantType, {
            growthTime: plantData.growthTime,
            maxStage: plantData.stages,
            onReadyToHarvest: () => {
                plot.readyToHarvest = true;
                plantEntity.getComponent(RenderComponent).emoji = plantData.emoji;
                plantEntity.getComponent(RenderComponent).fontSize = 36;
            }
        }));

        plot.plant = plantEntity;
        plot.plantedAt = Date.now();
        plot.readyToHarvest = false;
        plot.watered = false;

        this._showToast(`🌱 种下了 ${plantData.name}！`);
        this._saveGameData();
    }

    _waterPlant(plot) {
        plot.watered = true;
        plot.wateredAt = Date.now();

        const plantComp = plot.plant?.getComponent(PlantComponent);
        if (plantComp) plantComp.water();

        this._showToast('💧 浇水完成！');
        this._saveGameData();
    }

    _harvestPlant(plot) {
        const plantType = plot.plant?.getComponent(PlantComponent)?.plantType;
        const plantData = this.plantsData[plantType];
        const bonus = plot.watered ? 1.2 : 1;
        const reward = Math.floor((plantData?.sellPrice || 30) * bonus);

        this.gameData.player.coins += reward;
        this.gameData.player.exp += 15;

        if (this.gameData.player.exp >= this.gameData.player.level * 50) {
            this.gameData.player.level++;
            this.gameData.player.exp = 0;
            this._showToast(`🎉 升级！Lv.${this.gameData.player.level}`);
        }

        if (plot.plant) {
            this.engine.entityManager.destroyEntity(plot.plant.id);
        }
        plot.plant = null;
        plot.plantedAt = null;
        plot.readyToHarvest = false;
        plot.watered = false;

        this._showToast(`✅ 收获成功！+${reward} 金币`);
        this._saveGameData();
    }

    _useItemOnPlot(itemType, plot) {
        if (!this.gameData.items[itemType] || this.gameData.items[itemType] <= 0) {
            this._showToast('道具不足！');
            return;
        }

        this.gameData.items[itemType]--;
        const item = this._itemsData[itemType];

        switch (item.effect) {
            case 'water':
                if (plot.plant && !plot.watered) this._waterPlant(plot);
                break;
            case 'speed':
                if (plot.plant) {
                    const plantComp = plot.plant.getComponent(PlantComponent);
                    if (plantComp) plantComp.growFaster(0.5);
                }
                break;
            case 'auto':
                this.plots.forEach(p => { if (p.readyToHarvest) this._harvestPlant(p); });
                break;
        }

        this._showToast(`✅ 使用 ${item.name}！`);
        this._saveGameData();
    }

    _showToast(message) {
        if (typeof wx !== 'undefined') {
            wx.showToast({ title: message, icon: 'none', duration: 2000 });
        } else {
            console.log(message);
        }
    }

    _saveGameData() {
        if (typeof wx !== 'undefined') {
            wx.setStorageSync('healingGardenData', JSON.stringify(this.gameData.player));
        }
    }

    _getWeatherInfo() {
        const weathers = {
            sunny: { emoji: '☀️', name: '晴天', effect: 1.0 },
            cloudy: { emoji: '☁️', name: '多云', effect: 0.9 },
            rainy: { emoji: '🌧️', name: '下雨', effect: 1.2 },
            stormy: { emoji: '⛈️', name: '暴风雨', effect: 0.5 }
        };
        return weathers[this.weather];
    }

    _updateMenu(dt) {}

    _updatePlaying(dt) {
        this._updatePlants(dt);
        this._updateWeatherEffects(dt);
    }

    _updatePlants(dt) {
        this.plots.forEach(plot => {
            if (plot.plant) {
                const plantComp = plot.plant.getComponent(PlantComponent);
                if (plantComp) {
                    plantComp.update(dt);
                    if (plantComp.stage > 1) {
                        const sway = Math.sin(Date.now() * 0.002 + plot.row + plot.col) * 0.02;
                        const transform = plot.plant.getComponent(TransformComponent);
                        if (transform) transform.rotation = sway;
                    }
                }
            }
        });
    }

    _updateWeatherEffects(dt) {}

    _renderMenu(ctx) {
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

        this._drawMenuButton(ctx, 250, '🎮 开始游戏', '#4CAF50');
        this._drawMenuButton(ctx, 330, '🛒 商店', '#2196F3');
        this._drawMenuButton(ctx, 410, '🏆 成就', '#FF9800');

        ctx.font = '24px Arial';
        const flowers = ['🌻', '🌷', '🌹', '🌵', '🌸', '🍄', '🌼', '🌿'];
        flowers.forEach((emoji, i) => {
            const x = 20 + (i % 4) * 88;
            const y = 530 + Math.floor(i / 4) * 40;
            ctx.fillText(emoji, x, y);
        });
    }

    _drawMenuButton(ctx, y, text, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        this._drawRoundRect(ctx, 87, y, 200, 50, 25);
        ctx.fill();

        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(text, 187.5, y + 35);
    }

    _drawRoundRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, Math.min(width, height) / 2);
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

    _renderPlaying(ctx) {
        this._renderBackground(ctx);
        this._renderGardenGrid(ctx);
    }

    _renderBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 540);
        const colors = {
            sunny: ['#87CEEB', '#E3F2FD', '#E8F5E9'],
            cloudy: ['#9E9E9E', '#BDBDBD', '#ECEFF1'],
            rainy: ['#546E7A', '#78909C', '#B0BEC5'],
            stormy: ['#455A64', '#546E7A', '#607D8B']
        };
        const weatherColors = colors[this.weather] || colors.sunny;
        gradient.addColorStop(0, weatherColors[0]);
        gradient.addColorStop(0.6, weatherColors[1]);
        gradient.addColorStop(1, weatherColors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 375, 540);

        if (this.weather === 'sunny') {
            const sunGlow = ctx.createRadialGradient(300, 60, 0, 300, 60, 60);
            sunGlow.addColorStop(0, 'rgba(255,235,59,0.8)');
            sunGlow.addColorStop(1, 'rgba(255,235,59,0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(300, 60, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(300, 60, 35, 0, Math.PI * 2);
            ctx.fill();
        }

        const groundGradient = ctx.createLinearGradient(0, 500, 0, 667);
        groundGradient.addColorStop(0, '#9CCC65');
        groundGradient.addColorStop(0.5, '#8BC34A');
        groundGradient.addColorStop(1, '#689F38');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, 500, 375, 167);

        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        for (let i = 0; i < 30; i++) {
            const x = (i * 13 + Date.now() * 0.01) % 375;
            const y = 510 + Math.random() * 15;
            const sway = Math.sin(Date.now() * 0.0015 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(x, y + 15);
            ctx.quadraticCurveTo(x + sway, y + 8, x + sway * 1.5, y);
            ctx.stroke();
        }

        ctx.font = '20px Arial';
        const flowers = [
            { x: 20, y: 530, emoji: '🌼' },
            { x: 350, y: 525, emoji: '🌷' },
            { x: 90, y: 540, emoji: '🌸' },
            { x: 280, y: 535, emoji: '🌻' }
        ];
        flowers.forEach(flower => {
            ctx.fillText(flower.emoji, flower.x, flower.y);
        });
    }

    _renderGardenGrid(ctx) {
        const PLOT_SIZE = 100, PLOT_GAP = 15, START_X = 30, START_Y = 120;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = START_X + col * (PLOT_SIZE + PLOT_GAP);
                const y = START_Y + row * (PLOT_SIZE + PLOT_GAP);

                ctx.fillStyle = '#8D6E63';
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 3;
                ctx.beginPath();
                this._drawRoundRect(ctx, x, y, PLOT_SIZE, PLOT_SIZE, 10);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#6D4C41';
                ctx.beginPath();
                this._drawRoundRect(ctx, x + 5, y + 5, PLOT_SIZE - 10, PLOT_SIZE - 10, 6);
                ctx.fill();

                const plot = this.plots[row * 3 + col];
                if (plot) {
                    ctx.save();
                    ctx.translate(x + PLOT_SIZE/2, y + PLOT_SIZE/2);

                    if (plot.plant) {
                        const plantComp = plot.plant.getComponent(PlantComponent);
                        const renderComp = plot.plant.getComponent(RenderComponent);
                        if (renderComp) {
                            ctx.font = `${renderComp.fontSize || 28}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(renderComp.emoji || '🌱', 0, 0);

                            if (plot.readyToHarvest) {
                                ctx.strokeStyle = '#FFD700';
                                ctx.lineWidth = 3;
                                ctx.beginPath();
                                ctx.arc(0, 0, 45, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                        }
                    } else {
                        ctx.font = '24px Arial';
                        ctx.fillStyle = '#81C784';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🌱', 0, 0);
                    }

                    if (plot.plant && !plot.watered) {
                        ctx.font = '18px Arial';
                        ctx.fillStyle = '#2196F3';
                        ctx.globalAlpha = 0.7;
                        ctx.fillText('💧', 30, -30);
                        ctx.globalAlpha = 1;
                    }

                    ctx.restore();
                }
            }
        }
    }

    get stats() {
        return {
            engine: this.engine ? this.engine.stats : null,
            gameData: this.gameData,
            weather: this.weather,
            plots: this.plots.length,
            gameState: this.gameState
        };
    }
}

export { HealingGardenGame };