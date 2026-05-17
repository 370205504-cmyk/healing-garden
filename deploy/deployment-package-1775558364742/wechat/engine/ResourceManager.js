class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadingResources = new Set();
        this.cache = new Map();
        this.loadingComplete = false;
        this.totalResources = 0;
        this.loadedResources = 0;
        
        this.onLoadStart = null;
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onResourceLoaded = null;
    }
    
    load(type, path, options = {}) {
        return new Promise((resolve, reject) => {
            const key = options.key || path;
            
            if (this.cache.has(key)) {
                if (this.onResourceLoaded) {
                    this.onResourceLoaded({ key, type, path, cached: true });
                }
                resolve(this.cache.get(key));
                return;
            }
            
            if (this.loadingResources.has(key)) {
                const checkInterval = setInterval(() => {
                    if (this.cache.has(key)) {
                        clearInterval(checkInterval);
                        resolve(this.cache.get(key));
                    } else if (!this.loadingResources.has(key)) {
                        clearInterval(checkInterval);
                        reject(new Error(`Resource loading failed: ${key}`));
                    }
                }, 50);
                return;
            }
            
            this.totalResources++;
            this.loadingResources.add(key);
            
            if (this.onLoadStart && this.loadedResources === 0) {
                this.onLoadStart(this.totalResources);
            }
            
            this._loadResource(type, path, key, options)
                .then(resource => {
                    this.cache.set(key, resource);
                    this.resources.set(key, { type, path, resource, loadedAt: Date.now() });
                    this.loadingResources.delete(key);
                    this.loadedResources++;
                    
                    if (this.onResourceLoaded) {
                        this.onResourceLoaded({ key, type, path, cached: false });
                    }
                    
                    if (this.onLoadProgress) {
                        this.onLoadProgress({
                            loaded: this.loadedResources,
                            total: this.totalResources,
                            percentage: Math.round((this.loadedResources / this.totalResources) * 100),
                            key
                        });
                    }
                    
                    this._checkLoadComplete();
                    resolve(resource);
                })
                .catch(error => {
                    this.loadingResources.delete(key);
                    console.error(`Failed to load resource ${key}:`, error);
                    reject(error);
                });
        });
    }
    
    _loadResource(type, path, key, options) {
        return new Promise((resolve, reject) => {
            switch (type.toLowerCase()) {
                case 'image':
                    this._loadImage(path, options).then(resolve).catch(reject);
                    break;
                case 'json':
                    this._loadJSON(path).then(resolve).catch(reject);
                    break;
                case 'audio':
                    this._loadAudio(path, options).then(resolve).catch(reject);
                    break;
                case 'font':
                    this._loadFont(path, options).then(resolve).catch(reject);
                    break;
                case 'text':
                    this._loadText(path).then(resolve).catch(reject);
                    break;
                default:
                    reject(new Error(`Unsupported resource type: ${type}`));
            }
        });
    }
    
    _loadImage(path, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = options.crossOrigin || 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    }
    
    _loadJSON(path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                return response.json();
            });
    }
    
    _loadAudio(path, options) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(path);
            audio.volume = options.volume || 1;
            audio.loop = options.loop || false;
            audio.onloadeddata = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
            audio.load();
        });
    }
    
    _loadFont(path, options) {
        return new Promise((resolve, reject) => {
            const fontName = options.fontName || path.split('/').pop().split('.')[0];
            const fontFace = new FontFace(fontName, `url(${path})`);
            
            fontFace.load().then(face => {
                document.fonts.add(face);
                resolve({ fontName, fontFace });
            }).catch(reject);
        });
    }
    
    _loadText(path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                return response.text();
            });
    }
    
    get(key) {
        return this.cache.get(key) || null;
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    remove(key) {
        this.cache.delete(key);
        this.resources.delete(key);
    }
    
    clear() {
        this.cache.clear();
        this.resources.clear();
        this.loadingResources.clear();
        this.totalResources = 0;
        this.loadedResources = 0;
        this.loadingComplete = false;
    }
    
    async loadBatch(resources) {
        const promises = resources.map(resource => 
            this.load(resource.type, resource.path, resource)
        );
        
        return Promise.all(promises);
    }
    
    _checkLoadComplete() {
        if (this.loadedResources >= this.totalResources && this.totalResources > 0) {
            this.loadingComplete = true;
            if (this.onLoadComplete) {
                this.onLoadComplete({
                    loaded: this.loadedResources,
                    total: this.totalResources,
                    resources: Array.from(this.resources.keys())
                });
            }
        }
    }
    
    get memoryUsage() {
        let bytes = 0;
        for (const [key, data] of this.resources) {
            const resource = data.resource;
            if (resource instanceof Image) {
                bytes += resource.width * resource.height * 4;
            } else if (resource instanceof Audio) {
                bytes += 1024 * 1024;
            } else if (typeof resource === 'string') {
                bytes += resource.length * 2;
            } else if (typeof resource === 'object') {
                bytes += JSON.stringify(resource).length * 2;
            }
        }
        
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    get stats() {
        return {
            totalResources: this.totalResources,
            loadedResources: this.loadedResources,
            loadingResources: this.loadingResources.size,
            cacheSize: this.cache.size,
            memoryUsage: this.memoryUsage,
            loadingComplete: this.loadingComplete,
            loadPercentage: this.totalResources > 0 
                ? Math.round((this.loadedResources / this.totalResources) * 100) 
                : 100
        };
    }
}

export { ResourceManager };