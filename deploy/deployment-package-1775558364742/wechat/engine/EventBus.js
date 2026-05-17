class EventBus {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.globalListeners = [];
        this.queue = [];
        this.processing = false;
        this.maxListeners = 100;
    }
    
    on(event, callback, context = null) {
        this._ensureEvent(event);
        
        if (this.listeners.get(event).length >= this.maxListeners) {
            console.warn(`Event "${event}" has reached max listeners (${this.maxListeners})`);
            return;
        }
        
        this.listeners.get(event).push({ callback, context });
    }
    
    once(event, callback, context = null) {
        this._ensureEvent(event, true);
        this.onceListeners.get(event).push({ callback, context });
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.set(event, 
            this.listeners.get(event).filter(listener => listener.callback !== callback)
        );
        
        if (this.onceListeners.has(event)) {
            this.onceListeners.set(event,
                this.onceListeners.get(event).filter(listener => listener.callback !== callback)
            );
        }
    }
    
    emit(event, data = null) {
        if (this.processing) {
            this.queue.push({ event, data });
            return;
        }
        
        this.processing = true;
        this._emit(event, data);
        
        while (this.queue.length > 0) {
            const queued = this.queue.shift();
            this._emit(queued.event, queued.data);
        }
        
        this.processing = false;
    }
    
    _emit(event, data) {
        this._notifyGlobalListeners(event, data);
        this._notifyOnceListeners(event, data);
        this._notifyListeners(event, data);
    }
    
    _notifyListeners(event, data) {
        if (!this.listeners.has(event)) return;
        
        const listeners = this.listeners.get(event).slice();
        for (const listener of listeners) {
            try {
                listener.callback.call(listener.context, data);
            } catch (e) {
                console.error(`Event listener error (${event}):`, e);
            }
        }
    }
    
    _notifyOnceListeners(event, data) {
        if (!this.onceListeners.has(event)) return;
        
        const listeners = this.onceListeners.get(event);
        for (const listener of listeners) {
            try {
                listener.callback.call(listener.context, data);
            } catch (e) {
                console.error(`Once listener error (${event}):`, e);
            }
        }
        this.onceListeners.set(event, []);
    }
    
    _notifyGlobalListeners(event, data) {
        for (const listener of this.globalListeners) {
            try {
                listener(event, data);
            } catch (e) {
                console.error('Global listener error:', e);
            }
        }
    }
    
    _ensureEvent(event, once = false) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        if (once && !this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }
    }
    
    addGlobalListener(callback) {
        this.globalListeners.push(callback);
    }
    
    removeGlobalListener(callback) {
        this.globalListeners = this.globalListeners.filter(l => l !== callback);
    }
    
    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
            this.globalListeners = [];
        }
    }
    
    getListenerCount(event) {
        const normal = this.listeners.get(event)?.length || 0;
        const once = this.onceListeners.get(event)?.length || 0;
        return normal + once;
    }
    
    debounce(event, delay) {
        let timer = null;
        const originalEmit = this.emit.bind(this, event);
        
        return function(data) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => originalEmit(data), delay);
        };
    }
    
    throttle(event, limit) {
        let inThrottle = false;
        const originalEmit = this.emit.bind(this, event);
        
        return function(data) {
            if (!inThrottle) {
                originalEmit(data);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    get events() {
        return Array.from(this.listeners.keys());
    }
}

class Signal {
    constructor() {
        this._listeners = [];
        this._onceListeners = [];
    }
    
    add(callback) {
        if (!this._listeners.includes(callback)) {
            this._listeners.push(callback);
        }
    }
    
    addOnce(callback) {
        if (!this._onceListeners.includes(callback)) {
            this._onceListeners.push(callback);
        }
    }
    
    remove(callback) {
        this._listeners = this._listeners.filter(l => l !== callback);
        this._onceListeners = this._onceListeners.filter(l => l !== callback);
    }
    
    dispatch(...args) {
        for (const listener of this._onceListeners) {
            try {
                listener(...args);
            } catch (e) {
                console.error('Signal once listener error:', e);
            }
        }
        this._onceListeners = [];
        
        for (const listener of this._listeners) {
            try {
                listener(...args);
            } catch (e) {
                console.error('Signal listener error:', e);
            }
        }
    }
    
    clear() {
        this._listeners = [];
        this._onceListeners = [];
    }
    
    get numListeners() {
        return this._listeners.length + this._onceListeners.length;
    }
}

export { EventBus, Signal };