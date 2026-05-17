import { EntityManager, Entity } from './EntityManager.js';
import { EventBus, Signal } from './EventBus.js';
import { StateMachine, State } from './StateMachine.js';
import { ResourceManager } from './ResourceManager.js';
import { ObjectPool } from './ObjectPool.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { PhysicsSystem } from './systems/PhysicsSystem.js';
import { AnimationSystem } from './systems/AnimationSystem.js';

class Engine {
    static _getNow = (() => {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return () => performance.now();
        } else if (typeof wx !== 'undefined' && typeof wx.getPerformance === 'function') {
            const perf = wx.getPerformance();
            return () => perf.now();
        } else {
            const startTime = Date.now();
            return () => Date.now() - startTime;
        }
    })();
    constructor(config) {
        this.config = config;
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        this.entityManager = new EntityManager();
        this.eventBus = new EventBus();
        this.stateMachine = new StateMachine();
        this.resourceManager = new ResourceManager();
        this.objectPool = new ObjectPool();
        this.systems = [];
        
        this._init();
    }
    
    _init() {
        this._setupCanvas();
        this._setupEventListeners();
        this._registerCoreSystems();
    }
    
    _setupCanvas() {
        console.log('🎨 Setting up canvas...');
        
        if (typeof wx !== 'undefined') {
            console.log('📱 Using wx.createCanvas()');
            this.canvas = wx.createCanvas();
        } else if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
            console.log('🌐 Using DOM canvas');
            this.canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
            if (!document.getElementById('gameCanvas') && typeof document.body !== 'undefined') {
                document.body.appendChild(this.canvas);
            }
        } else {
            console.error('❌ No canvas API available');
            return;
        }
        
        if (!this.canvas) {
            console.error('❌ Canvas creation failed');
            return;
        }
        console.log('✅ Canvas created:', this.canvas);
        
        this.canvas.width = this.config.width || 375;
        this.canvas.height = this.config.height || 667;
        console.log('📐 Canvas size:', this.canvas.width, 'x', this.canvas.height);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('❌ Failed to get 2D context');
        } else {
            console.log('✅ 2D context acquired');
        }
    }
    
    _setupEventListeners() {
        if (typeof wx !== 'undefined') {
            // 使用 eventBus 统一管理事件，避免与 Game.js 重复注册
            // wx 事件由 Game.js 统一处理
        } else if (this.canvas && typeof this.canvas.addEventListener === 'function' && typeof document !== 'undefined') {
            this.canvas.addEventListener('mousedown', (e) => this._handleInput(e, 'mousedown'));
            this.canvas.addEventListener('mousemove', (e) => this._handleInput(e, 'mousemove'));
            this.canvas.addEventListener('mouseup', (e) => this._handleInput(e, 'mouseup'));
        }
    }
    
    _handleInput(e, type) {
        const inputData = this._normalizeInput(e, type);
        this.eventBus.emit('input', { type, data: inputData });
    }
    
    _normalizeInput(e, type) {
        if (type.includes('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            return {
                x: touch.clientX,
                y: touch.clientY,
                touches: e.touches || []
            };
        } else {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                button: e.button
            };
        }
    }
    
    _registerCoreSystems() {
        this.addSystem(new RenderSystem(this));
        this.addSystem(new InputSystem(this));
        this.addSystem(new PhysicsSystem(this));
        this.addSystem(new AnimationSystem(this));
    }
    
    addSystem(system) {
        system.engine = this;
        this.systems.push(system);
        this.systems.sort((a, b) => (a.priority || 100) - (b.priority || 100));
    }
    
    start() {
        this.running = true;
        this.lastTime = this.constructor._getNow();
        this.lastFpsUpdate = this.lastTime;
        this._gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    _gameLoop() {
        if (!this.running) return;
        
        const currentTime = this.constructor._getNow();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            this.eventBus.emit('fpsUpdate', { fps: this.fps });
        }
        
        this._update(this.deltaTime);
        this._render();
        
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => this._gameLoop());
        } else if (typeof wx !== 'undefined') {
            setTimeout(() => this._gameLoop(), 16);
        } else {
            setTimeout(() => this._gameLoop(), 16);
        }
    }
    
    _update(deltaTime) {
        this.eventBus.emit('preUpdate', { deltaTime });
        
        try {
            if (this.stateMachine && this.stateMachine.update) {
                this.stateMachine.update(deltaTime);
            }
        } catch (e) {
            console.error('❌ StateMachine update error:', e.message);
        }
        
        this.entityManager.update(deltaTime);
        
        this.systems.forEach(system => {
            if (system.enabled && system.update) {
                try {
                    system.update(deltaTime);
                } catch (e) {
                    console.error(`System ${system.constructor.name} update error:`, e);
                }
            }
        });
        
        this.objectPool.cleanup();
        this.eventBus.emit('postUpdate', { deltaTime });
    }
    
    _render() {
        if (!this.ctx || !this.canvas) {
            console.error('❌ Render skipped: ctx or canvas is null');
            return;
        }
        
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.eventBus.emit('preRender', { ctx: this.ctx });
            
            let hasRendered = false;
            
            try {
                if (this.stateMachine && this.stateMachine.render) {
                    this.stateMachine.render(this.ctx);
                    hasRendered = true;
                }
            } catch (e) {
                console.error('❌ StateMachine render error:', e.message, e.stack);
            }
            
            this.systems.forEach(system => {
                if (system.enabled && system.render) {
                    try {
                        system.render(this.ctx);
                        hasRendered = true;
                    } catch (e) {
                        console.error(`System ${system.constructor.name} render error:`, e);
                    }
                }
            });
            
            if (!hasRendered) {
                console.log('🔄 No render called, showing fallback');
                this._renderFallback();
            }
            
            this.eventBus.emit('postRender', { ctx: this.ctx });
        } catch (e) {
            console.error('❌ Main render error:', e.message);
        }
    }
    
    _renderFallback() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.fillStyle = '#E8F5E9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#81C784';
        this.ctx.fillRect(0, this.canvas.height - 200, this.canvas.width, 200);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#388E3C';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌿 治愈花园', this.canvas.width / 2, 60);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('游戏引擎已启动', this.canvas.width / 2, 90);
        this.ctx.fillText('等待场景加载...', this.canvas.width / 2, 115);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const x = 30 + j * 110;
                const y = 150 + i * 130;
                this.ctx.fillStyle = '#A5D6A7';
                this.ctx.fillRect(x, y, 80, 90);
                this.ctx.strokeStyle = '#66BB6A';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, 80, 90);
                
                this.ctx.font = '28px Arial';
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🌱', x + 40, y + 55);
            }
        }
        
        console.log('📺 Rendered fallback screen');
    }
    
    createEntity() {
        return this.entityManager.createEntity();
    }
    
    destroyEntity(entityId) {
        this.entityManager.destroyEntity(entityId);
    }
    
    getEntity(entityId) {
        return this.entityManager.getEntity(entityId);
    }
    
    setState(stateName, data) {
        this.stateMachine.changeState(stateName, data);
    }
    
    loadResource(type, path, callback) {
        this.resourceManager.load(type, path, callback);
    }
    
    getPool(poolName) {
        return this.objectPool.getPool(poolName);
    }
    
    log(message, level = 'info') {
        const levels = {
            debug: '\x1b[34m[DEBUG]\x1b[0m',
            info: '\x1b[32m[INFO]\x1b[0m',
            warn: '\x1b[33m[WARN]\x1b[0m',
            error: '\x1b[31m[ERROR]\x1b[0m'
        };
        console.log(`${levels[level] || levels.info} ${message}`);
    }
    
    get stats() {
        return {
            fps: this.fps,
            entityCount: this.entityManager.entityCount,
            systemCount: this.systems.length,
            memoryUsage: this.resourceManager.memoryUsage
        };
    }
}

export { Engine };