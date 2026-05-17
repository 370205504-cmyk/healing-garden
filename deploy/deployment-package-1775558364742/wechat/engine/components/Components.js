class TransformComponent {
    constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.pivotX = 0;
        this.pivotY = 0;
        this.parent = null;
        this.children = [];
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setRotation(rotation) {
        this.rotation = rotation;
    }
    
    setScale(scaleX, scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY || scaleX;
    }
    
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    rotate(dr) {
        this.rotation += dr;
    }
    
    get worldX() {
        let x = this.x;
        let parent = this.parent;
        while (parent) {
            x += parent.x;
            parent = parent.parent;
        }
        return x;
    }
    
    get worldY() {
        let y = this.y;
        let parent = this.parent;
        while (parent) {
            y += parent.y;
            parent = parent.parent;
        }
        return y;
    }
    
    onAdd() {}
    onRemove() {}
    update() {}
}

class RenderComponent {
    constructor(type, config = {}) {
        this.type = type;
        this.visible = true;
        this.alpha = 1;
        this.zIndex = 0;
        
        for (const key of Object.keys(config)) {
            this[key] = config[key];
        }
    }
    
    onAdd() {}
    onRemove() {}
    update() {}
    render(ctx) {}
    
    static rect(config) {
        return new RenderComponent('rect', {
            width: config.width || 100,
            height: config.height || 100,
            fillColor: config.fillColor || '#ffffff',
            strokeColor: config.strokeColor || null,
            lineWidth: config.lineWidth || 1,
            radius: config.radius || 0,
            ...config
        });
    }
    
    static circle(config) {
        return new RenderComponent('circle', {
            radius: config.radius || 50,
            fillColor: config.fillColor || '#ffffff',
            strokeColor: config.strokeColor || null,
            lineWidth: config.lineWidth || 1,
            ...config
        });
    }
    
    static text(config) {
        return new RenderComponent('text', {
            text: config.text || '',
            fontSize: config.fontSize || 16,
            fontFamily: config.fontFamily || 'Arial',
            fillColor: config.fillColor || '#000000',
            strokeColor: config.strokeColor || null,
            textAlign: config.textAlign || 'left',
            textBaseline: config.textBaseline || 'top',
            ...config
        });
    }
    
    static image(config) {
        return new RenderComponent('image', {
            image: config.image || null,
            width: config.width || null,
            height: config.height || null,
            ...config
        });
    }
    
    static emoji(config) {
        return new RenderComponent('emoji', {
            emoji: config.emoji || '🌱',
            fontSize: config.fontSize || 24,
            ...config
        });
    }
    
    static sprite(config) {
        return new RenderComponent('sprite', {
            spriteSheet: config.spriteSheet || null,
            frames: config.frames || [],
            currentFrame: config.currentFrame || 0,
            width: config.width || null,
            height: config.height || null,
            ...config
        });
    }
    
    static custom(renderFn) {
        const comp = new RenderComponent('custom');
        comp.render = renderFn;
        return comp;
    }
}

class PhysicsComponent {
    constructor(config = {}) {
        this.enabled = true;
        this.velocity = { x: 0, y: 0 };
        this.angularVelocity = 0;
        this.mass = config.mass || 1;
        this.gravityScale = config.gravityScale || 1;
        this.friction = config.friction || 0;
        this.angularDamping = config.angularDamping || 0;
        this.bounce = config.bounce || 0;
        this.maxSpeed = config.maxSpeed || null;
        this.isStatic = config.isStatic || false;
        
        this.onMove = config.onMove || null;
        this.onCollision = config.onCollision || null;
    }
    
    addForce(force) {
        this.velocity.x += force.x / this.mass;
        this.velocity.y += force.y / this.mass;
    }
    
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }
    
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.angularVelocity = 0;
    }
    
    update() {}
    onAdd() {}
    onRemove() {}
}

class ColliderComponent {
    constructor(type, config = {}) {
        this.type = type;
        this.enabled = true;
        this.layer = config.layer || 'default';
        this.isTrigger = config.isTrigger || false;
        
        if (type === 'circle') {
            this.radius = config.radius || 20;
        } else if (type === 'rect') {
            this.width = config.width || 100;
            this.height = config.height || 100;
        }
        
        this.onCollision = config.onCollision || null;
    }
    
    static circle(config) {
        return new ColliderComponent('circle', config);
    }
    
    static rect(config) {
        return new ColliderComponent('rect', config);
    }
    
    update() {}
    onAdd() {}
    onRemove() {}
}

class ClickableComponent {
    constructor(config = {}) {
        this.enabled = true;
        this.width = config.width || 100;
        this.height = config.height || 100;
        this.onClick = config.onClick || null;
        this.onHover = config.onHover || null;
        this.onPress = config.onPress || null;
        this.onRelease = config.onRelease || null;
        
        this.hovered = false;
        this.pressed = false;
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
    
    update() {}
    onAdd() {}
    onRemove() {}
}

class ParticleComponent {
    constructor(config = {}) {
        this.life = config.life || 1;
        this.maxLife = config.maxLife || 1;
        this.speed = config.speed || 1;
        this.angle = config.angle || 0;
        this.size = config.size || 10;
        this.startSize = config.size || 10;
        this.endSize = config.endSize || 0;
        this.color = config.color || '#ffffff';
        this.endColor = config.endColor || 'transparent';
        this.gravity = config.gravity || 0;
        this.drag = config.drag || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.rotation = config.rotation || 0;
        
        this.onUpdate = config.onUpdate || null;
        this.onDeath = config.onDeath || null;
    }
    
    update(deltaTime) {
        this.life -= deltaTime * this.speed;
        
        if (this.gravity !== 0) {
            this.angle += this.gravity * deltaTime;
        }
        
        if (this.drag !== 0) {
            this.speed *= (1 - this.drag * deltaTime);
        }
        
        this.rotation += this.rotationSpeed * deltaTime;
        
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
        
        if (this.life <= 0 && this.onDeath) {
            this.onDeath();
        }
    }
    
    get isDead() {
        return this.life <= 0;
    }
    
    get progress() {
        return 1 - (this.life / this.maxLife);
    }
    
    onAdd() {}
    onRemove() {}
}

class PlantComponent {
    constructor(plantType, config = {}) {
        this.plantType = plantType;
        this.stage = 0;
        this.maxStage = config.maxStage || 4;
        this.growthTime = config.growthTime || 30000;
        this.plantedAt = config.plantedAt || Date.now();
        this.watered = false;
        this.wateredAt = null;
        this.readyToHarvest = false;
        this.health = 100;
        
        this.onStageChange = config.onStageChange || null;
        this.onReadyToHarvest = config.onReadyToHarvest || null;
        this.onHarvest = config.onHarvest || null;
    }
    
    water() {
        this.watered = true;
        this.wateredAt = Date.now();
    }
    
    update(deltaTime) {
        if (this.readyToHarvest) return;
        
        const waterBonus = this.watered ? 1.2 : 1.0;
        const elapsed = Date.now() - this.plantedAt;
        const progress = (elapsed / this.growthTime) * waterBonus;
        const newStage = Math.floor(progress * this.maxStage);
        
        if (newStage > this.stage) {
            this.stage = newStage;
            if (this.onStageChange) {
                this.onStageChange(this.stage);
            }
        }
        
        if (progress >= 1) {
            this.readyToHarvest = true;
            if (this.onReadyToHarvest) {
                this.onReadyToHarvest();
            }
        }
        
        if (this.watered && Date.now() - this.wateredAt > 10000) {
            this.watered = false;
        }
    }
    
    harvest() {
        if (this.onHarvest) {
            this.onHarvest();
        }
    }
    
    get growthProgress() {
        if (this.readyToHarvest) return 1;
        return (Date.now() - this.plantedAt) / this.growthTime;
    }
    
    onAdd() {}
    onRemove() {}
}

class UIComponent {
    constructor(config = {}) {
        this.enabled = true;
        this.visible = true;
        this.alpha = 1;
        this.priority = config.priority || 0;
        
        this.onShow = config.onShow || null;
        this.onHide = config.onHide || null;
        this.onUpdate = config.onUpdate || null;
    }
    
    show() {
        this.visible = true;
        if (this.onShow) {
            this.onShow();
        }
    }
    
    hide() {
        this.visible = false;
        if (this.onHide) {
            this.onHide();
        }
    }
    
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    update() {
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
    
    onAdd() {}
    onRemove() {}
}

class DataComponent {
    constructor(data = {}) {
        this.data = { ...data };
    }
    
    get(key, defaultValue = null) {
        return this.data[key] !== undefined ? this.data[key] : defaultValue;
    }
    
    set(key, value) {
        this.data[key] = value;
    }
    
    has(key) {
        return key in this.data;
    }
    
    remove(key) {
        delete this.data[key];
    }
    
    clear() {
        this.data = {};
    }
    
    merge(data) {
        Object.assign(this.data, data);
    }
    
    toJSON() {
        return JSON.stringify(this.data);
    }
    
    update() {}
    onAdd() {}
    onRemove() {}
}

class AudioComponent {
    constructor(config = {}) {
        this.enabled = true;
        this.volume = config.volume || 1;
        this.pitch = config.pitch || 1;
        this.loop = config.loop || false;
        this.spatial = config.spatial || false;
        this.distance = config.distance || 100;
        
        this.sources = new Map();
        
        this.onPlay = config.onPlay || null;
        this.onPause = config.onPause || null;
        this.onStop = config.onStop || null;
        this.onEnd = config.onEnd || null;
    }
    
    addSource(name, audio) {
        this.sources.set(name, audio);
    }
    
    play(name, options = {}) {
        const audio = this.sources.get(name);
        if (!audio) return null;
        
        audio.volume = options.volume !== undefined ? options.volume : this.volume;
        audio.pitch = options.pitch !== undefined ? options.pitch : this.pitch;
        audio.loop = options.loop !== undefined ? options.loop : this.loop;
        
        if (this.onPlay) {
            this.onPlay(name);
        }
        
        return audio.play();
    }
    
    pause(name) {
        const audio = this.sources.get(name);
        if (audio) {
            audio.pause();
            if (this.onPause) {
                this.onPause(name);
            }
        }
    }
    
    stop(name) {
        const audio = this.sources.get(name);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            if (this.onStop) {
                this.onStop(name);
            }
        }
    }
    
    stopAll() {
        for (const audio of this.sources.values()) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    update() {}
    onAdd() {}
    onRemove() {}
}

export { TransformComponent };
export { RenderComponent };
export { PhysicsComponent };
export { ColliderComponent };
export { ClickableComponent };
export { ParticleComponent };
export { PlantComponent };
export { UIComponent };
export { DataComponent };
export { AudioComponent };