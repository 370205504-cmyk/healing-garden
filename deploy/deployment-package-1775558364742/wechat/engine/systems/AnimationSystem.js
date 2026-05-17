class AnimationSystem {
    constructor(engine) {
        this.engine = engine;
        this.priority = 15;
        this.enabled = true;
        
        this.animations = new Map();
        this.transitions = new Set();
    }
    
    update(deltaTime) {
        this._updateAnimations(deltaTime);
        this._updateTransitions(deltaTime);
    }
    
    _updateAnimations(deltaTime) {
        for (const [entityId, animations] of this.animations) {
            const entity = this.engine.entityManager.getEntity(entityId);
            if (!entity || !entity.active) continue;
            
            for (const anim of animations) {
                if (!anim.playing) continue;
                
                anim.currentTime += deltaTime * anim.speed;
                
                if (anim.currentTime >= anim.duration) {
                    if (anim.loop) {
                        anim.currentTime = 0;
                    } else {
                        anim.playing = false;
                        anim.currentTime = anim.duration;
                        this.engine.eventBus.emit('animation_complete', {
                            entity,
                            animation: anim.name
                        });
                    }
                }
                
                this._applyAnimation(entity, anim);
            }
        }
    }
    
    _updateTransitions(deltaTime) {
        const toRemove = new Set();
        
        for (const transition of this.transitions) {
            transition.currentTime += deltaTime;
            
            if (transition.currentTime >= transition.duration) {
                transition.currentTime = transition.duration;
                this._applyTransition(transition, 1);
                toRemove.add(transition);
                this.engine.eventBus.emit('transition_complete', {
                    entity: transition.entity,
                    property: transition.property
                });
            } else {
                const progress = transition.currentTime / transition.duration;
                const easedProgress = this._ease(progress, transition.easing);
                this._applyTransition(transition, easedProgress);
            }
        }
        
        for (const transition of toRemove) {
            this.transitions.delete(transition);
        }
    }
    
    _applyAnimation(entity, anim) {
        const progress = anim.currentTime / anim.duration;
        
        for (const track of anim.tracks) {
            const value = this._getValueAtProgress(track, progress);
            this._setEntityProperty(entity, track.property, value);
        }
    }
    
    _applyTransition(transition, progress) {
        const start = transition.startValue;
        const end = transition.endValue;
        
        if (typeof start === 'number' && typeof end === 'number') {
            const value = start + (end - start) * progress;
            this._setEntityProperty(transition.entity, transition.property, value);
        } else if (Array.isArray(start) && Array.isArray(end)) {
            const value = start.map((s, i) => s + (end[i] - s) * progress);
            this._setEntityProperty(transition.entity, transition.property, value);
        } else if (typeof start === 'object' && typeof end === 'object') {
            const value = {};
            for (const key of Object.keys(start)) {
                if (typeof start[key] === 'number' && typeof end[key] === 'number') {
                    value[key] = start[key] + (end[key] - start[key]) * progress;
                } else {
                    value[key] = end[key];
                }
            }
            this._setEntityProperty(transition.entity, transition.property, value);
        }
    }
    
    _getValueAtProgress(track, progress) {
        if (track.type === 'linear') {
            return track.from + (track.to - track.from) * progress;
        }
        
        if (track.type === 'keyframe') {
            for (let i = 0; i < track.keyframes.length - 1; i++) {
                const kf1 = track.keyframes[i];
                const kf2 = track.keyframes[i + 1];
                
                if (progress >= kf1.time && progress <= kf2.time) {
                    const localProgress = (progress - kf1.time) / (kf2.time - kf1.time);
                    const easedProgress = this._ease(localProgress, kf1.easing || 'linear');
                    return kf1.value + (kf2.value - kf1.value) * easedProgress;
                }
            }
            return track.keyframes[track.keyframes.length - 1].value;
        }
        
        if (track.type === 'wave') {
            const amplitude = track.amplitude || 1;
            const frequency = track.frequency || 1;
            const offset = track.offset || 0;
            
            switch (track.waveform) {
                case 'sine':
                    return offset + Math.sin(progress * Math.PI * 2 * frequency) * amplitude;
                case 'cosine':
                    return offset + Math.cos(progress * Math.PI * 2 * frequency) * amplitude;
                case 'sawtooth':
                    return offset + ((progress * frequency) % 1) * amplitude;
                case 'square':
                    return offset + (Math.floor(progress * frequency * 2) % 2 === 0 ? amplitude : -amplitude);
                default:
                    return offset;
            }
        }
        
        return track.to;
    }
    
    _ease(progress, easing) {
        switch (easing) {
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return progress * (2 - progress);
            case 'easeInOutQuad':
                return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            case 'easeInCubic':
                return progress * progress * progress;
            case 'easeOutCubic':
                return (--progress) * progress * progress + 1;
            case 'easeInOutCubic':
                return progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            case 'easeInSine':
                return 1 - Math.cos(progress * Math.PI / 2);
            case 'easeOutSine':
                return Math.sin(progress * Math.PI / 2);
            case 'easeInOutSine':
                return (1 - Math.cos(Math.PI * progress)) / 2;
            case 'bounce':
                if (progress < 1 / 2.75) return 7.5625 * progress * progress;
                if (progress < 2 / 2.75) return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
                if (progress < 2.5 / 2.75) return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
                return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
            default:
                return progress;
        }
    }
    
    _setEntityProperty(entity, property, value) {
        const parts = property.split('.');
        let target = entity;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const component = target.getComponent(parts[i]);
            if (component) {
                target = component;
            } else {
                target = target[parts[i]];
            }
            if (!target) return;
        }
        
        target[parts[parts.length - 1]] = value;
    }
    
    addAnimation(entity, animation) {
        if (!this.animations.has(entity.id)) {
            this.animations.set(entity.id, []);
        }
        
        const anim = {
            name: animation.name,
            duration: animation.duration || 1,
            speed: animation.speed || 1,
            loop: animation.loop || false,
            playing: false,
            currentTime: 0,
            tracks: animation.tracks || []
        };
        
        this.animations.get(entity.id).push(anim);
        return anim;
    }
    
    playAnimation(entity, name) {
        const animations = this.animations.get(entity.id);
        if (!animations) return null;
        
        const anim = animations.find(a => a.name === name);
        if (anim) {
            anim.playing = true;
            return anim;
        }
        
        return null;
    }
    
    pauseAnimation(entity, name) {
        const animations = this.animations.get(entity.id);
        if (!animations) return;
        
        const anim = animations.find(a => a.name === name);
        if (anim) {
            anim.playing = false;
        }
    }
    
    stopAnimation(entity, name, reset = false) {
        const animations = this.animations.get(entity.id);
        if (!animations) return;
        
        const anim = animations.find(a => a.name === name);
        if (anim) {
            anim.playing = false;
            if (reset) {
                anim.currentTime = 0;
            }
        }
    }
    
    animateProperty(entity, property, from, to, duration, easing = 'linear') {
        const transition = {
            entity,
            property,
            startValue: from,
            endValue: to,
            duration,
            easing,
            currentTime: 0
        };
        
        this.transitions.add(transition);
        return transition;
    }
    
    cancelTransition(entity, property) {
        for (const transition of this.transitions) {
            if (transition.entity === entity && transition.property === property) {
                this.transitions.delete(transition);
                break;
            }
        }
    }
    
    createWaveAnimation(name, property, duration, options = {}) {
        return {
            name,
            duration,
            loop: true,
            tracks: [{
                property,
                type: 'wave',
                waveform: options.waveform || 'sine',
                amplitude: options.amplitude || 1,
                frequency: options.frequency || 1,
                offset: options.offset || 0
            }]
        };
    }
    
    createKeyframeAnimation(name, property, keyframes, options = {}) {
        return {
            name,
            duration: options.duration || keyframes[keyframes.length - 1].time,
            loop: options.loop || false,
            tracks: [{
                property,
                type: 'keyframe',
                keyframes
            }]
        };
    }
    
    get stats() {
        let totalAnimations = 0;
        let playingAnimations = 0;
        
        for (const animations of this.animations.values()) {
            totalAnimations += animations.length;
            playingAnimations += animations.filter(a => a.playing).length;
        }
        
        return {
            totalAnimations,
            playingAnimations,
            transitions: this.transitions.size
        };
    }
}

export { AnimationSystem };