class ObjectPool {
    constructor() {
        this.pools = new Map();
        this.defaultConfig = {
            initialSize: 10,
            maxSize: 100,
            expandBy: 5,
            shrinkTo: 5
        };
    }
    
    createPool(poolName, factory, config = {}) {
        if (this.pools.has(poolName)) {
            console.warn(`Pool "${poolName}" already exists`);
            return this.pools.get(poolName);
        }
        
        const poolConfig = { ...this.defaultConfig, ...config };
        const pool = new Pool(poolName, factory, poolConfig);
        this.pools.set(poolName, pool);
        
        return pool;
    }
    
    getPool(poolName) {
        return this.pools.get(poolName) || null;
    }
    
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            console.error(`Pool "${poolName}" not found`);
            return null;
        }
        return pool.acquire();
    }
    
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            console.error(`Pool "${poolName}" not found`);
            return;
        }
        pool.release(obj);
    }
    
    clearPool(poolName) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.clear();
        }
    }
    
    clearAll() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
        this.pools.clear();
    }
    
    cleanup() {
        for (const pool of this.pools.values()) {
            pool.cleanup();
        }
    }
    
    prewarm(poolName, count) {
        const pool = this.pools.get(poolName);
        if (pool) {
            pool.prewarm(count);
        }
    }
    
    get stats() {
        const stats = {};
        for (const [name, pool] of this.pools) {
            stats[name] = pool.stats;
        }
        return stats;
    }
}

class Pool {
    constructor(name, factory, config) {
        this.name = name;
        this.factory = factory;
        this.config = config;
        this.freeObjects = [];
        this.inUseObjects = new Set();
        this.totalCreated = 0;
    }
    
    acquire() {
        if (this.freeObjects.length > 0) {
            const obj = this.freeObjects.pop();
            if (obj.onAcquire) {
                obj.onAcquire();
            }
            this.inUseObjects.add(obj);
            return obj;
        }
        
        if (this.inUseObjects.size >= this.config.maxSize) {
            console.warn(`Pool "${this.name}" is at max capacity (${this.config.maxSize})`);
            return null;
        }
        
        if (this.freeObjects.length + this.inUseObjects.size < this.config.maxSize) {
            this._expand();
        }
        
        if (this.freeObjects.length > 0) {
            const obj = this.freeObjects.pop();
            if (obj.onAcquire) {
                obj.onAcquire();
            }
            this.inUseObjects.add(obj);
            return obj;
        }
        
        return null;
    }
    
    release(obj) {
        if (!this.inUseObjects.has(obj)) {
            console.warn(`Object not in use pool: ${this.name}`);
            return;
        }
        
        if (obj.onRelease) {
            obj.onRelease();
        }
        
        this.inUseObjects.delete(obj);
        
        if (this.freeObjects.length < this.config.maxSize) {
            this.freeObjects.push(obj);
        }
    }
    
    _expand() {
        const newObjects = [];
        for (let i = 0; i < this.config.expandBy; i++) {
            if (this.totalCreated >= this.config.maxSize) break;
            const obj = this.factory();
            obj.poolName = this.name;
            newObjects.push(obj);
            this.totalCreated++;
        }
        this.freeObjects.push(...newObjects);
    }
    
    prewarm(count) {
        const targetCount = Math.min(count, this.config.maxSize);
        while (this.freeObjects.length + this.inUseObjects.size < targetCount) {
            this._expand();
        }
    }
    
    cleanup() {
        while (this.freeObjects.length > this.config.shrinkTo) {
            this.freeObjects.pop();
        }
    }
    
    clear() {
        this.freeObjects = [];
        this.inUseObjects.clear();
        this.totalCreated = 0;
    }
    
    get stats() {
        return {
            name: this.name,
            freeCount: this.freeObjects.length,
            inUseCount: this.inUseObjects.size,
            totalCreated: this.totalCreated,
            maxSize: this.config.maxSize,
            utilization: this.inUseObjects.size > 0 
                ? Math.round((this.inUseObjects.size / (this.freeObjects.length + this.inUseObjects.size)) * 100) 
                : 0
        };
    }
}

export { ObjectPool };