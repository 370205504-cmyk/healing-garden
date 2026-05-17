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

class Profiler {
    constructor() {
        this.timers = new Map();
        this.frameTimes = [];
        this.maxFrameSamples = 60;
        this.enabled = true;
        this.autoReportInterval = 5000;
        this.lastReportTime = Date.now();
        
        this.stats = {
            totalFrames: 0,
            totalUpdates: 0,
            totalRenders: 0,
            avgFrameTime: 0,
            minFrameTime: Infinity,
            maxFrameTime: 0,
            fps: 0,
            memoryUsage: 0
        };
    }
    
    startTimer(name) {
        if (!this.enabled) return;
        this.timers.set(name, {
            startTime: getNow(),
            totalTime: 0,
            calls: 0
        });
    }
    
    endTimer(name) {
        if (!this.enabled) return;
        const timer = this.timers.get(name);
        if (!timer) return;
        
        const elapsed = getNow() - timer.startTime;
        timer.totalTime += elapsed;
        timer.calls++;
        
        return elapsed;
    }
    
    measure(name, fn) {
        if (!this.enabled) return fn();
        
        this.startTimer(name);
        const result = fn();
        const elapsed = this.endTimer(name);
        
        return { result, elapsed };
    }
    
    async measureAsync(name, fn) {
        if (!this.enabled) return fn();
        
        this.startTimer(name);
        const result = await fn();
        const elapsed = this.endTimer(name);
        
        return { result, elapsed };
    }
    
    recordFrameTime(deltaTime) {
        this.frameTimes.push(deltaTime);
        
        if (this.frameTimes.length > this.maxFrameSamples) {
            this.frameTimes.shift();
        }
        
        this.stats.totalFrames++;
        
        if (deltaTime < this.stats.minFrameTime) {
            this.stats.minFrameTime = deltaTime;
        }
        if (deltaTime > this.stats.maxFrameTime) {
            this.stats.maxFrameTime = deltaTime;
        }
        
        const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.stats.avgFrameTime = avg;
        this.stats.fps = 1000 / avg;
        
        this._checkAutoReport();
    }
    
    recordUpdate() {
        this.stats.totalUpdates++;
    }
    
    recordRender() {
        this.stats.totalRenders++;
    }
    
    _checkAutoReport() {
        const now = Date.now();
        if (now - this.lastReportTime >= this.autoReportInterval) {
            this.logReport();
            this.lastReportTime = now;
        }
    }
    
    logReport() {
        console.log('=== Performance Report ===');
        console.log(`Frames: ${this.stats.totalFrames}`);
        console.log(`FPS: ${this.stats.fps.toFixed(1)}`);
        console.log(`Avg Frame Time: ${this.stats.avgFrameTime.toFixed(2)}ms`);
        console.log(`Min/Max: ${this.stats.minFrameTime.toFixed(2)}ms / ${this.stats.maxFrameTime.toFixed(2)}ms`);
        console.log('--- Timers ---');
        
        for (const [name, timer] of this.timers) {
            if (timer.calls > 0) {
                const avg = timer.totalTime / timer.calls;
                console.log(`${name}: ${avg.toFixed(2)}ms (${timer.calls} calls)`);
            }
        }
        
        console.log('==============');
    }
    
    getTimerStats(name) {
        const timer = this.timers.get(name);
        if (!timer || timer.calls === 0) return null;
        
        return {
            avgTime: timer.totalTime / timer.calls,
            totalTime: timer.totalTime,
            calls: timer.calls
        };
    }
    
    resetTimer(name) {
        this.timers.delete(name);
    }
    
    resetAll() {
        this.timers.clear();
        this.frameTimes = [];
        this.stats = {
            totalFrames: 0,
            totalUpdates: 0,
            totalRenders: 0,
            avgFrameTime: 0,
            minFrameTime: Infinity,
            maxFrameTime: 0,
            fps: 0,
            memoryUsage: 0
        };
    }
    
    getReport() {
        return {
            stats: { ...this.stats },
            timers: Object.fromEntries(this.timers.entries())
        };
    }
}

const profiler = new Profiler();
export { profiler, Profiler };