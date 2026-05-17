const getNow = (() => {
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

class FrameRateMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = getNow();
        this.fpsHistory = [];
        this.maxHistoryLength = 60;
        this.enabled = false;
        this.visualizer = null;
        this.warningThreshold = 50;
        this.criticalThreshold = 30;
        
        this.callbacks = {
            onWarning: null,
            onCritical: null,
            onRecovery: null,
            onUpdate: null
        };
        
        this.stats = {
            currentFps: 0,
            avgFps: 0,
            minFps: Infinity,
            maxFps: 0,
            frameTime: 0,
            droppedFrames: 0,
            totalFrames: 0
        };
    }
    
    start() {
        if (this.enabled) return;
        this.enabled = true;
        this._loop();
    }
    
    stop() {
        this.enabled = false;
    }
    
    _loop() {
        if (!this.enabled) return;
        
        this.frameCount++;
        this.stats.totalFrames++;
        
        const currentTime = getNow();
        const delta = currentTime - this.lastTime;
        
        if (delta >= 1000) {
            this._updateFps(delta);
            this.lastTime = currentTime;
            this.frameCount = 0;
        }
        
        requestAnimationFrame(() => this._loop());
    }
    
    _updateFps(delta) {
        const fps = (this.frameCount * 1000) / delta;
        this.stats.currentFps = fps;
        this.stats.frameTime = delta / this.frameCount;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
        
        this.stats.avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        this.stats.minFps = Math.min(this.stats.minFps, fps);
        this.stats.maxFps = Math.max(this.stats.maxFps, fps);
        
        if (fps < this.criticalThreshold) {
            this.stats.droppedFrames += Math.floor(this.criticalThreshold - fps);
            if (this.callbacks.onCritical) {
                this.callbacks.onCritical(fps, this.stats);
            }
        } else if (fps < this.warningThreshold) {
            if (this.callbacks.onWarning) {
                this.callbacks.onWarning(fps, this.stats);
            }
        } else if (this.callbacks.onRecovery) {
            this.callbacks.onRecovery(fps, this.stats);
        }
        
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.stats);
        }
        
        this._updateVisualizer();
    }
    
    _updateVisualizer() {
        if (!this.visualizer) return;
        
        const ctx = this.visualizer.getContext('2d');
        const width = this.visualizer.width;
        const height = this.visualizer.height;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        
        const step = width / this.maxHistoryLength;
        const maxFps = 60;
        
        ctx.beginPath();
        for (let i = 0; i < this.fpsHistory.length; i++) {
            const x = i * step;
            const y = height - (this.fpsHistory[i] / maxFps) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(`${Math.round(this.stats.currentFps)} FPS`, 5, height - 5);
    }
    
    setVisualizer(canvas) {
        this.visualizer = canvas;
    }
    
    setCallback(type, callback) {
        if (this.callbacks[type] !== undefined) {
            this.callbacks[type] = callback;
        }
    }
    
    reset() {
        this.fpsHistory = [];
        this.stats = {
            currentFps: 0,
            avgFps: 0,
            minFps: Infinity,
            maxFps: 0,
            frameTime: 0,
            droppedFrames: 0,
            totalFrames: 0
        };
    }
    
    getReport() {
        return {
            ...this.stats,
            history: [...this.fpsHistory],
            thresholds: {
                warning: this.warningThreshold,
                critical: this.criticalThreshold
            }
        };
    }
    
    getPerformanceLevel() {
        if (this.stats.currentFps >= this.warningThreshold) return 'good';
        if (this.stats.currentFps >= this.criticalThreshold) return 'warning';
        return 'critical';
    }
}

const frameRateMonitor = new FrameRateMonitor();
export { frameRateMonitor, FrameRateMonitor };