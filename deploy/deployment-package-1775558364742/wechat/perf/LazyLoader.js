class LazyLoader {
    constructor() {
        this.loadingQueue = [];
        this.loadedResources = new Map();
        this.loadingStates = new Map();
        this.priorityQueue = new Set();
        
        this.onProgress = null;
        this.onComplete = null;
    }
    
    addResource(resource) {
        const id = resource.id || resource.name;
        
        if (this.loadedResources.has(id)) {
            return Promise.resolve(this.loadedResources.get(id));
        }
        
        if (this.loadingStates.get(id) === 'loading') {
            return new Promise((resolve) => {
                const checkLoaded = () => {
                    if (this.loadingStates.get(id) === 'loaded') {
                        resolve(this.loadedResources.get(id));
                    } else {
                        setTimeout(checkLoaded, 50);
                    }
                };
                checkLoaded();
            });
        }
        
        this.loadingQueue.push(resource);
        if (resource.priority) {
            this.priorityQueue.add(id);
        }
        
        return this._loadResource(resource);
    }
    
    async _loadResource(resource) {
        const id = resource.id || resource.name;
        this.loadingStates.set(id, 'loading');
        
        try {
            const result = await this._fetchResource(resource);
            this.loadedResources.set(id, result);
            this.loadingStates.set(id, 'loaded');
            this.priorityQueue.delete(id);
            
            this._notifyProgress();
            
            return result;
        } catch (error) {
            this.loadingStates.set(id, 'error');
            console.error(`Failed to load resource: ${id}`, error);
            throw error;
        }
    }
    
    async _fetchResource(resource) {
        switch (resource.type) {
            case 'image':
                return this._loadImage(resource);
            case 'audio':
                return this._loadAudio(resource);
            case 'json':
                return this._loadJson(resource);
            case 'font':
                return this._loadFont(resource);
            default:
                return this._loadGeneric(resource);
        }
    }
    
    async _loadImage(resource) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${resource.url}`));
            
            if (resource.placeholder) {
                img.src = resource.placeholder;
            }
            img.src = resource.url;
        });
    }
    
    async _loadAudio(resource) {
        return new Promise((resolve, reject) => {
            const audio = new (window.Audio || wx.createInnerAudioContext)();
            audio.src = resource.url;
            
            if (audio instanceof Audio) {
                audio.onloadeddata = () => resolve(audio);
                audio.onerror = () => reject(new Error(`Failed to load audio: ${resource.url}`));
            } else {
                resolve(audio);
            }
        });
    }
    
    async _loadJson(resource) {
        const response = await fetch(resource.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
    
    async _loadFont(resource) {
        return new Promise((resolve, reject) => {
            const fontFace = new FontFace(resource.name, `url(${resource.url})`);
            
            fontFace.load().then((loadedFont) => {
                document.fonts.add(loadedFont);
                resolve(loadedFont);
            }).catch(reject);
        });
    }
    
    async _loadGeneric(resource) {
        const response = await fetch(resource.url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    }
    
    _notifyProgress() {
        if (this.onProgress) {
            const loaded = this.loadedResources.size;
            const total = this.loadingQueue.length;
            this.onProgress(loaded, total);
        }
    }
    
    async loadAll() {
        const priorityResources = this.loadingQueue.filter(r => this.priorityQueue.has(r.id || r.name));
        const normalResources = this.loadingQueue.filter(r => !this.priorityQueue.has(r.id || r.name));
        
        await Promise.all(priorityResources.map(r => this._loadResource(r)));
        await Promise.all(normalResources.map(r => this._loadResource(r)));
        
        if (this.onComplete) {
            this.onComplete();
        }
        
        return this.loadedResources;
    }
    
    getResource(id) {
        return this.loadedResources.get(id) || null;
    }
    
    hasResource(id) {
        return this.loadedResources.has(id);
    }
    
    removeResource(id) {
        this.loadedResources.delete(id);
        this.loadingStates.delete(id);
    }
    
    clear() {
        this.loadedResources.clear();
        this.loadingStates.clear();
        this.loadingQueue = [];
        this.priorityQueue.clear();
    }
    
    preload(resourceIds) {
        const toLoad = resourceIds.filter(id => !this.loadedResources.has(id));
        return Promise.all(toLoad.map(id => this._loadResourceById(id)));
    }
    
    async _loadResourceById(id) {
        const resource = this.loadingQueue.find(r => r.id === id || r.name === id);
        if (resource) {
            return this.addResource(resource);
        }
        return null;
    }
    
    getStats() {
        return {
            loaded: this.loadedResources.size,
            queued: this.loadingQueue.length,
            inProgress: Array.from(this.loadingStates.values()).filter(s => s === 'loading').length
        };
    }
}

const lazyLoader = new LazyLoader();
export { lazyLoader, LazyLoader };