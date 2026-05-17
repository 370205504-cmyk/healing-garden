class PhysicsSystem {
    constructor(engine) {
        this.engine = engine;
        this.priority = 20;
        this.enabled = true;
        
        this.gravity = { x: 0, y: 980 };
        this.friction = 0.8;
        this.bounce = 0.6;
        
        this.collisionLayers = new Map();
        this._initCollisionLayers();
    }
    
    _initCollisionLayers() {
        this.collisionLayers.set('default', { mask: 0xFFFFFFFF });
        this.collisionLayers.set('player', { mask: 0x00000001 });
        this.collisionLayers.set('ground', { mask: 0x00000002 });
        this.collisionLayers.set('plant', { mask: 0x00000004 });
        this.collisionLayers.set('particle', { mask: 0x00000008 });
        this.collisionLayers.set('ui', { mask: 0x00000010 });
    }
    
    update(deltaTime) {
        this._updateVelocity(deltaTime);
        this._updatePosition(deltaTime);
        this._checkCollisions();
    }
    
    _updateVelocity(deltaTime) {
        const physicsEntities = this.engine.entityManager.getEntitiesWithComponents(['PhysicsComponent']);
        
        for (const entity of physicsEntities) {
            if (!entity.active) continue;
            
            const physics = entity.getComponent('PhysicsComponent');
            if (!physics.enabled) continue;
            
            physics.velocity.x += this.gravity.x * deltaTime * physics.gravityScale;
            physics.velocity.y += this.gravity.y * deltaTime * physics.gravityScale;
            
            physics.velocity.x *= Math.pow(1 - this.friction, deltaTime * 60);
            physics.velocity.y *= Math.pow(1 - this.friction, deltaTime * 60);
            
            const maxSpeed = physics.maxSpeed || 1000;
            const speed = Math.sqrt(physics.velocity.x ** 2 + physics.velocity.y ** 2);
            if (speed > maxSpeed) {
                physics.velocity.x = (physics.velocity.x / speed) * maxSpeed;
                physics.velocity.y = (physics.velocity.y / speed) * maxSpeed;
            }
            
            if (physics.angularVelocity) {
                physics.angularVelocity *= Math.pow(1 - physics.angularDamping, deltaTime * 60);
            }
        }
    }
    
    _updatePosition(deltaTime) {
        const physicsEntities = this.engine.entityManager.getEntitiesWithComponents(['PhysicsComponent', 'TransformComponent']);
        
        for (const entity of physicsEntities) {
            if (!entity.active) continue;
            
            const physics = entity.getComponent('PhysicsComponent');
            const transform = entity.getComponent('TransformComponent');
            
            if (!physics.enabled) continue;
            
            transform.x += physics.velocity.x * deltaTime;
            transform.y += physics.velocity.y * deltaTime;
            
            if (physics.angularVelocity) {
                transform.rotation += physics.angularVelocity * deltaTime;
            }
            
            if (physics.onMove) {
                physics.onMove(transform.x, transform.y);
            }
        }
    }
    
    _checkCollisions() {
        const physicsEntities = this.engine.entityManager.getEntitiesWithComponents(['PhysicsComponent', 'ColliderComponent']);
        const entities = Array.from(physicsEntities).filter(e => e.active);
        
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const e1 = entities[i];
                const e2 = entities[j];
                
                if (this._shouldCheckCollision(e1, e2)) {
                    const collision = this._checkCollision(e1, e2);
                    if (collision) {
                        this._resolveCollision(collision);
                    }
                }
            }
        }
    }
    
    _shouldCheckCollision(e1, e2) {
        const c1 = e1.getComponent('ColliderComponent');
        const c2 = e2.getComponent('ColliderComponent');
        
        if (!c1.enabled || !c2.enabled) return false;
        
        const layer1 = this.collisionLayers.get(c1.layer)?.mask || 0xFFFFFFFF;
        const layer2 = this.collisionLayers.get(c2.layer)?.mask || 0xFFFFFFFF;
        
        return (layer1 & layer2) !== 0;
    }
    
    _checkCollision(e1, e2) {
        const c1 = e1.getComponent('ColliderComponent');
        const c2 = e2.getComponent('ColliderComponent');
        const t1 = e1.getComponent('TransformComponent');
        const t2 = e2.getComponent('TransformComponent');
        
        if (c1.type === 'circle' && c2.type === 'circle') {
            return this._circleCircleCollision(t1, c1, t2, c2);
        }
        
        if (c1.type === 'rect' && c2.type === 'rect') {
            return this._rectRectCollision(t1, c1, t2, c2);
        }
        
        if (c1.type === 'circle' && c2.type === 'rect') {
            return this._circleRectCollision(t1, c1, t2, c2);
        }
        
        if (c1.type === 'rect' && c2.type === 'circle') {
            const result = this._circleRectCollision(t2, c2, t1, c1);
            if (result) {
                return { e1: e2, e2: e1, ...result };
            }
        }
        
        return null;
    }
    
    _circleCircleCollision(t1, c1, t2, c2) {
        const dx = t2.x - t1.x;
        const dy = t2.y - t1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = c1.radius + c2.radius;
        
        if (distance < minDistance) {
            return {
                type: 'circle_circle',
                penetration: minDistance - distance,
                normal: { x: dx / distance, y: dy / distance },
                point: {
                    x: t1.x + (dx * c1.radius) / minDistance,
                    y: t1.y + (dy * c1.radius) / minDistance
                }
            };
        }
        
        return null;
    }
    
    _rectRectCollision(t1, c1, t2, c2) {
        const hw1 = c1.width / 2;
        const hh1 = c1.height / 2;
        const hw2 = c2.width / 2;
        const hh2 = c2.height / 2;
        
        const left = t2.x - hw2 < t1.x + hw1;
        const right = t2.x + hw2 > t1.x - hw1;
        const top = t2.y - hh2 < t1.y + hh1;
        const bottom = t2.y + hh2 > t1.y - hh1;
        
        if (left && right && top && bottom) {
            const dx = (t2.x - t1.x);
            const dy = (t2.y - t1.y);
            
            const overlapX = (hw1 + hw2) - Math.abs(dx);
            const overlapY = (hh1 + hh2) - Math.abs(dy);
            
            let normal, penetration;
            
            if (overlapX < overlapY) {
                normal = { x: dx < 0 ? -1 : 1, y: 0 };
                penetration = overlapX;
            } else {
                normal = { x: 0, y: dy < 0 ? -1 : 1 };
                penetration = overlapY;
            }
            
            return {
                type: 'rect_rect',
                penetration,
                normal,
                point: { x: t1.x, y: t1.y }
            };
        }
        
        return null;
    }
    
    _circleRectCollision(t1, c1, t2, c2) {
        const hw = c2.width / 2;
        const hh = c2.height / 2;
        
        const closestX = Math.max(t2.x - hw, Math.min(t1.x, t2.x + hw));
        const closestY = Math.max(t2.y - hh, Math.min(t1.y, t2.y + hh));
        
        const dx = t1.x - closestX;
        const dy = t1.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < c1.radius) {
            return {
                type: 'circle_rect',
                penetration: c1.radius - distance,
                normal: distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: -1 },
                point: { x: closestX, y: closestY }
            };
        }
        
        return null;
    }
    
    _resolveCollision(collision) {
        const p1 = collision.e1.getComponent('PhysicsComponent');
        const p2 = collision.e2.getComponent('PhysicsComponent');
        const t1 = collision.e1.getComponent('TransformComponent');
        const t2 = collision.e2.getComponent('TransformComponent');
        
        const totalMass = (p1?.mass || 1) + (p2?.mass || 1);
        const mass1 = p1?.mass || 1;
        const mass2 = p2?.mass || 1;
        
        if (t1 && !p1?.isStatic) {
            t1.x -= collision.normal.x * collision.penetration * (mass2 / totalMass);
            t1.y -= collision.normal.y * collision.penetration * (mass2 / totalMass);
        }
        
        if (t2 && !p2?.isStatic) {
            t2.x += collision.normal.x * collision.penetration * (mass1 / totalMass);
            t2.y += collision.normal.y * collision.penetration * (mass1 / totalMass);
        }
        
        if (p1 && !p1.isStatic) {
            const velocityAlongNormal = p1.velocity.x * collision.normal.x + p1.velocity.y * collision.normal.y;
            
            if (velocityAlongNormal > 0) {
                p1.velocity.x -= velocityAlongNormal * collision.normal.x * this.bounce;
                p1.velocity.y -= velocityAlongNormal * collision.normal.y * this.bounce;
            }
        }
        
        if (p2 && !p2.isStatic) {
            const velocityAlongNormal = p2.velocity.x * collision.normal.x + p2.velocity.y * collision.normal.y;
            
            if (velocityAlongNormal < 0) {
                p2.velocity.x -= velocityAlongNormal * collision.normal.x * this.bounce;
                p2.velocity.y -= velocityAlongNormal * collision.normal.y * this.bounce;
            }
        }
        
        this.engine.eventBus.emit('collision', {
            e1: collision.e1,
            e2: collision.e2,
            collision
        });
        
        p1?.onCollision?.(collision.e2, collision);
        p2?.onCollision?.(collision.e1, collision);
    }
    
    addForce(entity, force) {
        const physics = entity.getComponent('PhysicsComponent');
        if (physics && !physics.isStatic) {
            physics.velocity.x += force.x / (physics.mass || 1);
            physics.velocity.y += force.y / (physics.mass || 1);
        }
    }
    
    setVelocity(entity, velocity) {
        const physics = entity.getComponent('PhysicsComponent');
        if (physics) {
            physics.velocity = { ...velocity };
        }
    }
    
    get stats() {
        const physicsEntities = this.engine.entityManager.getEntitiesWithComponents(['PhysicsComponent']);
        const colliderEntities = this.engine.entityManager.getEntitiesWithComponents(['ColliderComponent']);
        
        return {
            physicsEntities: physicsEntities.length,
            colliderEntities: colliderEntities.length,
            gravity: { x: this.gravity.x, y: this.gravity.y },
            friction: this.friction,
            bounce: this.bounce
        };
    }
}

export { PhysicsSystem };