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
    ctx.fill();
}

class RenderSystem {
    constructor(engine) {
        this.engine = engine;
        this.priority = 10;
        this.enabled = true;
        this.camera = null;
        this.layers = new Map();
        this._init();
    }
    
    _init() {
        this._setupDefaultLayers();
        this._setupCamera();
    }
    
    _setupDefaultLayers() {
        this.addLayer('background', 0);
        this.addLayer('terrain', 10);
        this.addLayer('plants', 20);
        this.addLayer('particles', 30);
        this.addLayer('ui', 100);
    }
    
    _setupCamera() {
        this.camera = {
            x: 0,
            y: 0,
            width: this.engine.config.width,
            height: this.engine.config.height,
            zoom: 1,
            target: null,
            followSpeed: 0.1
        };
    }
    
    addLayer(name, zIndex) {
        this.layers.set(name, { zIndex, entities: new Set() });
    }
    
    removeLayer(name) {
        this.layers.delete(name);
    }
    
    addToLayer(entity, layerName) {
        if (!this.layers.has(layerName)) {
            this.addLayer(layerName, this.layers.size * 10);
        }
        this.layers.get(layerName).entities.add(entity);
    }
    
    removeFromLayer(entity, layerName) {
        this.layers.get(layerName)?.entities.delete(entity);
    }
    
    update(deltaTime) {
        this._updateCamera(deltaTime);
    }
    
    _updateCamera(deltaTime) {
        if (this.camera.target) {
            const targetComp = this.camera.target.getComponent('TransformComponent');
            if (targetComp) {
                const targetX = targetComp.x - this.camera.width / 2;
                const targetY = targetComp.y - this.camera.height / 2;
                
                this.camera.x += (targetX - this.camera.x) * this.camera.followSpeed;
                this.camera.y += (targetY - this.camera.y) * this.camera.followSpeed;
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        
        const sortedLayers = Array.from(this.layers.entries())
            .sort((a, b) => a[1].zIndex - b[1].zIndex);
        
        for (const [layerName, layer] of sortedLayers) {
            ctx.save();
            ctx.globalAlpha = 1;
            
            for (const entity of layer.entities) {
                if (!entity.active) continue;
                
                const renderComp = entity.getComponent('RenderComponent');
                const transformComp = entity.getComponent('TransformComponent');
                
                if (!renderComp) continue;
                
                ctx.save();
                
                if (transformComp) {
                    ctx.translate(transformComp.x, transformComp.y);
                    ctx.rotate(transformComp.rotation || 0);
                    ctx.scale(transformComp.scaleX || 1, transformComp.scaleY || 1);
                }
                
                this._renderEntity(ctx, entity, renderComp);
                
                ctx.restore();
            }
            
            ctx.restore();
        }
        
        ctx.restore();
        
        this._renderDebug(ctx);
    }
    
    _renderEntity(ctx, entity, renderComp) {
        switch (renderComp.type) {
            case 'rect':
                this._renderRect(ctx, renderComp);
                break;
            case 'circle':
                this._renderCircle(ctx, renderComp);
                break;
            case 'text':
                this._renderText(ctx, renderComp);
                break;
            case 'image':
                this._renderImage(ctx, renderComp);
                break;
            case 'sprite':
                this._renderSprite(ctx, renderComp);
                break;
            case 'emoji':
                this._renderEmoji(ctx, renderComp);
                break;
            case 'custom':
                if (renderComp.render) {
                    renderComp.render(ctx);
                }
                break;
        }
    }
    
    _renderRect(ctx, comp) {
        ctx.fillStyle = comp.fillColor || '#ffffff';
        ctx.strokeStyle = comp.strokeColor || 'transparent';
        ctx.lineWidth = comp.lineWidth || 0;
        
        if (comp.radius) {
            roundRect(ctx, -comp.width/2, -comp.height/2, comp.width, comp.height, comp.radius);
        } else {
            ctx.fillRect(-comp.width/2, -comp.height/2, comp.width, comp.height);
        }
        
        if (ctx.lineWidth > 0) {
            ctx.stroke();
        }
    }
    
    _renderCircle(ctx, comp) {
        ctx.fillStyle = comp.fillColor || '#ffffff';
        ctx.strokeStyle = comp.strokeColor || 'transparent';
        ctx.lineWidth = comp.lineWidth || 0;
        
        ctx.beginPath();
        ctx.arc(0, 0, comp.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (ctx.lineWidth > 0) {
            ctx.stroke();
        }
    }
    
    _renderText(ctx, comp) {
        ctx.font = `${comp.fontSize || 16}px ${comp.fontFamily || 'Arial'}`;
        ctx.fillStyle = comp.fillColor || '#000000';
        ctx.textAlign = comp.textAlign || 'left';
        ctx.textBaseline = comp.textBaseline || 'middle';
        
        if (comp.strokeColor) {
            ctx.strokeStyle = comp.strokeColor;
            ctx.lineWidth = comp.lineWidth || 2;
            ctx.strokeText(comp.text, 0, 0);
        }
        
        ctx.fillText(comp.text, 0, 0);
    }
    
    _renderImage(ctx, comp) {
        if (!comp.image) return;
        
        const width = comp.width || comp.image.width;
        const height = comp.height || comp.image.height;
        
        ctx.globalAlpha = comp.alpha || 1;
        ctx.drawImage(comp.image, -width/2, -height/2, width, height);
    }
    
    _renderSprite(ctx, comp) {
        if (!comp.spriteSheet) return;
        
        const frame = comp.frames[comp.currentFrame || 0];
        if (!frame) return;
        
        ctx.globalAlpha = comp.alpha || 1;
        ctx.drawImage(
            comp.spriteSheet,
            frame.x, frame.y,
            frame.width, frame.height,
            -frame.width/2, -frame.height/2,
            frame.width, frame.height
        );
    }
    
    _renderEmoji(ctx, comp) {
        ctx.font = `${comp.fontSize || 24}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.emoji, 0, 0);
    }
    
    _renderDebug(ctx) {
        if (!this.engine.debug) return;
        
        ctx.save();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'left';
        
        const stats = this.engine.stats;
        let y = 20;
        ctx.fillText(`FPS: ${stats.fps}`, 10, y); y += 15;
        ctx.fillText(`Entities: ${stats.entityCount}`, 10, y); y += 15;
        ctx.fillText(`Memory: ${stats.memoryUsage}`, 10, y);
        
        ctx.restore();
    }
    
    setCameraTarget(entity) {
        this.camera.target = entity;
    }
    
    clearCameraTarget() {
        this.camera.target = null;
    }
    
    getLayerEntities(layerName) {
        return this.layers.get(layerName)?.entities || new Set();
    }
    
    get layerCount() {
        return this.layers.size;
    }
}

export { RenderSystem };