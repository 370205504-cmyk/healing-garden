class InputSystem {
    constructor(engine) {
        this.engine = engine;
        this.priority = 5;
        this.enabled = true;
        
        this.keys = new Set();
        this.mouse = {
            x: 0,
            y: 0,
            down: false,
            button: 0,
            wheel: 0
        };
        this.touch = {
            active: false,
            x: 0,
            y: 0,
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
            touches: []
        };
        
        this.doubleClickTime = 300;
        this.lastClickTime = 0;
        this.lastClickPos = { x: 0, y: 0 };
        
        this._setupInputMap();
    }
    
    _setupInputMap() {
        this.inputMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right',
            'Space': 'jump',
            'KeyE': 'interact',
            'KeyF': 'action',
            'Escape': 'escape',
            'Enter': 'confirm'
        };
    }
    
    update(deltaTime) {
        this.touch.deltaX = 0;
        this.touch.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    handleInput(event) {
        switch (event.type) {
            case 'keydown':
                this._handleKeyDown(event);
                break;
            case 'keyup':
                this._handleKeyUp(event);
                break;
            case 'mousedown':
                this._handleMouseDown(event);
                break;
            case 'mouseup':
                this._handleMouseUp(event);
                break;
            case 'mousemove':
                this._handleMouseMove(event);
                break;
            case 'mousewheel':
                this._handleMouseWheel(event);
                break;
            case 'touchstart':
                this._handleTouchStart(event);
                break;
            case 'touchmove':
                this._handleTouchMove(event);
                break;
            case 'touchend':
                this._handleTouchEnd(event);
                break;
        }
    }
    
    _handleKeyDown(event) {
        const action = this.inputMap[event.code];
        if (action) {
            event.preventDefault();
            this.keys.add(action);
            this.engine.eventBus.emit('input_action', { action, pressed: true });
        }
        
        this.engine.eventBus.emit('key_down', { 
            key: event.key, 
            code: event.code, 
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
            alt: event.altKey
        });
    }
    
    _handleKeyUp(event) {
        const action = this.inputMap[event.code];
        if (action) {
            event.preventDefault();
            this.keys.delete(action);
            this.engine.eventBus.emit('input_action', { action, pressed: false });
        }
        
        this.engine.eventBus.emit('key_up', { 
            key: event.key, 
            code: event.code 
        });
    }
    
    _handleMouseDown(event) {
        const rect = this.engine.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
        this.mouse.down = true;
        this.mouse.button = event.button;
        
        this._checkDoubleClick(event);
        
        this.engine.eventBus.emit('mouse_down', {
            x: this.mouse.x,
            y: this.mouse.y,
            button: event.button
        });
        
        this._checkClickableEntities(this.mouse.x, this.mouse.y);
    }
    
    _handleMouseUp(event) {
        const rect = this.engine.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.mouse.down = false;
        this.mouse.button = 0;
        
        this.engine.eventBus.emit('mouse_up', {
            x,
            y,
            button: event.button
        });
    }
    
    _handleMouseMove(event) {
        const rect = this.engine.canvas.getBoundingClientRect();
        const lastX = this.mouse.x;
        const lastY = this.mouse.y;
        
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
        
        const deltaX = this.mouse.x - lastX;
        const deltaY = this.mouse.y - lastY;
        
        this.engine.eventBus.emit('mouse_move', {
            x: this.mouse.x,
            y: this.mouse.y,
            deltaX,
            deltaY
        });
    }
    
    _handleMouseWheel(event) {
        this.mouse.wheel = event.deltaY;
        
        this.engine.eventBus.emit('mouse_wheel', {
            delta: event.deltaY,
            x: this.mouse.x,
            y: this.mouse.y
        });
    }
    
    _handleTouchStart(event) {
        const touch = event.touches[0] || event.changedTouches[0];
        const rect = this.engine.canvas.getBoundingClientRect();
        
        this.touch.active = true;
        this.touch.x = touch.clientX - rect.left;
        this.touch.y = touch.clientY - rect.top;
        this.touch.startX = this.touch.x;
        this.touch.startY = this.touch.y;
        this.touch.deltaX = 0;
        this.touch.deltaY = 0;
        this.touch.touches = Array.from(event.touches).map(t => ({
            x: t.clientX - rect.left,
            y: t.clientY - rect.top,
            id: t.identifier
        }));
        
        this.engine.eventBus.emit('touch_start', {
            x: this.touch.x,
            y: this.touch.y,
            touches: this.touch.touches
        });
        
        this._checkClickableEntities(this.touch.x, this.touch.y);
    }
    
    _handleTouchMove(event) {
        if (!this.touch.active) return;
        
        const touch = event.touches[0] || event.changedTouches[0];
        const rect = this.engine.canvas.getBoundingClientRect();
        
        const lastX = this.touch.x;
        const lastY = this.touch.y;
        
        this.touch.x = touch.clientX - rect.left;
        this.touch.y = touch.clientY - rect.top;
        this.touch.deltaX = this.touch.x - lastX;
        this.touch.deltaY = this.touch.y - lastY;
        this.touch.touches = Array.from(event.touches).map(t => ({
            x: t.clientX - rect.left,
            y: t.clientY - rect.top,
            id: t.identifier
        }));
        
        this.engine.eventBus.emit('touch_move', {
            x: this.touch.x,
            y: this.touch.y,
            deltaX: this.touch.deltaX,
            deltaY: this.touch.deltaY,
            startX: this.touch.startX,
            startY: this.touch.startY,
            touches: this.touch.touches
        });
    }
    
    _handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        const rect = this.engine.canvas.getBoundingClientRect();
        
        const endX = touch.clientX - rect.left;
        const endY = touch.clientY - rect.top;
        const distance = Math.sqrt(
            Math.pow(endX - this.touch.startX, 2) + 
            Math.pow(endY - this.touch.startY, 2)
        );
        
        if (distance < 10) {
            this.engine.eventBus.emit('tap', {
                x: this.touch.startX,
                y: this.touch.startY
            });
        }
        
        this.touch.active = false;
        this.touch.touches = [];
        
        this.engine.eventBus.emit('touch_end', {
            x: endX,
            y: endY,
            startX: this.touch.startX,
            startY: this.touch.startY,
            distance
        });
    }
    
    _checkDoubleClick(event) {
        const now = Date.now();
        const timeDiff = now - this.lastClickTime;
        const posDiff = Math.sqrt(
            Math.pow(this.mouse.x - this.lastClickPos.x, 2) +
            Math.pow(this.mouse.y - this.lastClickPos.y, 2)
        );
        
        if (timeDiff < this.doubleClickTime && posDiff < 10) {
            this.engine.eventBus.emit('double_click', {
                x: this.mouse.x,
                y: this.mouse.y
            });
        }
        
        this.lastClickTime = now;
        this.lastClickPos = { x: this.mouse.x, y: this.mouse.y };
    }
    
    _checkClickableEntities(x, y) {
        const clickableEntities = this.engine.entityManager.getEntitiesWithComponents(['ClickableComponent']);
        
        for (const entity of clickableEntities) {
            const clickable = entity.getComponent('ClickableComponent');
            if (!clickable.enabled) continue;
            
            const transform = entity.getComponent('TransformComponent');
            if (!transform) continue;
            
            if (this._isPointInBounds(x, y, transform, clickable)) {
                clickable.onClick?.();
                this.engine.eventBus.emit('entity_click', {
                    entity,
                    x,
                    y,
                    component: clickable
                });
                break;
            }
        }
    }
    
    _isPointInBounds(x, y, transform, clickable) {
        const width = clickable.width || 100;
        const height = clickable.height || 100;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        
        return x >= transform.x - halfWidth &&
               x <= transform.x + halfWidth &&
               y >= transform.y - halfHeight &&
               y <= transform.y + halfHeight;
    }
    
    isKeyDown(action) {
        return this.keys.has(action);
    }
    
    isKeyPressed(action) {
        const pressed = this.keys.has(action);
        if (pressed) {
            this.keys.delete(action);
        }
        return pressed;
    }
    
    getInputVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.keys.has('up')) vector.y = -1;
        if (this.keys.has('down')) vector.y = 1;
        if (this.keys.has('left')) vector.x = -1;
        if (this.keys.has('right')) vector.x = 1;
        
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length > 0) {
            vector.x /= length;
            vector.y /= length;
        }
        
        return vector;
    }
    
    get stats() {
        return {
            keysPressed: this.keys.size,
            mouseX: Math.round(this.mouse.x),
            mouseY: Math.round(this.mouse.y),
            mouseDown: this.mouse.down,
            touchActive: this.touch.active
        };
    }
}

export { InputSystem };