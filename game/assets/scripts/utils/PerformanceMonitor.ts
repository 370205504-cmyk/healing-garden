import { _decorator, Component, debug } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 性能监控器
 * 监控游戏帧率、内存使用、性能指标
 */
@ccclass('PerformanceMonitor')
export class PerformanceMonitor extends Component {
    
    private static _instance: PerformanceMonitor;
    
    public static get instance(): PerformanceMonitor {
        return PerformanceMonitor._instance;
    }
    
    /** 帧率采样间隔（毫秒） */
    @property
    sampleInterval: number = 1000;
    
    /** 低帧率阈值 */
    @property
    lowFpsThreshold: number = 30;
    
    /** 高内存使用阈值（MB） */
    @property
    highMemoryThreshold: number = 100;
    
    // 性能数据
    private _frameCount: number = 0;
    private _lastSampleTime: number = 0;
    private _currentFps: number = 0;
    private _minFps: number = Infinity;
    private _maxFps: number = 0;
    private _fpsSamples: number[] = [];
    
    // 内存数据
    private _memoryUsage: number = 0;
    private _maxMemoryUsage: number = 0;
    
    // 性能事件回调
    private _onLowFps: ((fps: number) => void) | null = null;
    private _onHighMemory: ((memoryMB: number) => void) | null = null;
    private _onPerformanceData: ((data: any) => void) | null = null;
    
    onLoad() {
        if (PerformanceMonitor._instance && PerformanceMonitor._instance !== this) {
            this.destroy();
            return;
        }
        PerformanceMonitor._instance = this;
        
        this._lastSampleTime = Date.now();
        console.log('性能监控器初始化');
    }
    
    start() {
        // 开始性能监控
        this.schedule(this.updatePerformanceData, this.sampleInterval / 1000);
    }
    
    update(deltaTime: number) {
        this._frameCount++;
    }
    
    private updatePerformanceData() {
        const now = Date.now();
        const elapsed = now - this._lastSampleTime;
        
        if (elapsed > 0) {
            // 计算当前帧率
            this._currentFps = Math.round((this._frameCount * 1000) / elapsed);
            
            // 更新最小/最大帧率
            this._minFps = Math.min(this._minFps, this._currentFps);
            this._maxFps = Math.max(this._maxFps, this._currentFps);
            
            // 记录样本
            this._fpsSamples.push(this._currentFps);
            if (this._fpsSamples.length > 60) {
                this._fpsSamples.shift();
            }
            
            // 检测低帧率
            if (this._currentFps < this.lowFpsThreshold && this._onLowFps) {
                this._onLowFps(this._currentFps);
            }
            
            // 获取内存使用情况（如果可用）
            this.updateMemoryUsage();
            
            // 触发性能数据回调
            if (this._onPerformanceData) {
                this._onPerformanceData(this.getPerformanceData());
            }
            
            // 重置计数器
            this._frameCount = 0;
            this._lastSampleTime = now;
        }
    }
    
    private updateMemoryUsage() {
        // 尝试获取内存使用情况
        // 注意：浏览器环境有限制，小游戏环境可能提供特定API
        try {
            // 浏览器性能内存API
            if (performance && (performance as any).memory) {
                const memory = (performance as any).memory;
                this._memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024)); // MB
                this._maxMemoryUsage = Math.max(this._maxMemoryUsage, this._memoryUsage);
                
                // 检测高内存使用
                if (this._memoryUsage > this.highMemoryThreshold && this._onHighMemory) {
                    this._onHighMemory(this._memoryUsage);
                }
            }
        } catch (error) {
            // 内存API不可用
            this._memoryUsage = 0;
        }
    }
    
    /**
     * 获取当前性能数据
     */
    getPerformanceData() {
        // 计算平均帧率
        const avgFps = this._fpsSamples.length > 0
            ? Math.round(this._fpsSamples.reduce((sum, fps) => sum + fps, 0) / this._fpsSamples.length)
            : this._currentFps;
        
        return {
            timestamp: Date.now(),
            fps: {
                current: this._currentFps,
                average: avgFps,
                min: this._minFps === Infinity ? this._currentFps : this._minFps,
                max: this._maxFps,
                samples: this._fpsSamples.length,
            },
            memory: {
                currentMB: this._memoryUsage,
                maxMB: this._maxMemoryUsage,
                thresholdMB: this.highMemoryThreshold,
            },
            performance: {
                isLowFps: this._currentFps < this.lowFpsThreshold,
                isHighMemory: this._memoryUsage > this.highMemoryThreshold,
            },
        };
    }
    
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const data = this.getPerformanceData();
        
        return `
性能报告 (${new Date(data.timestamp).toLocaleTimeString()})
────────────────────────
帧率:
  当前: ${data.fps.current} FPS
  平均: ${data.fps.average} FPS
  最低: ${data.fps.min} FPS
  最高: ${data.fps.max} FPS
  样本数: ${data.fps.samples}

内存:
  当前使用: ${data.memory.currentMB} MB
  峰值使用: ${data.memory.maxMB} MB
  阈值: ${data.memory.thresholdMB} MB

状态:
  低帧率: ${data.performance.isLowFps ? '⚠️ 是' : '✅ 否'}
  高内存: ${data.performance.isHighMemory ? '⚠️ 是' : '✅ 否'}
────────────────────────
`;
    }
    
    /**
     * 设置低帧率回调
     */
    setOnLowFps(callback: (fps: number) => void) {
        this._onLowFps = callback;
    }
    
    /**
     * 设置高内存回调
     */
    setOnHighMemory(callback: (memoryMB: number) => void) {
        this._onHighMemory = callback;
    }
    
    /**
     * 设置性能数据回调
     */
    setOnPerformanceData(callback: (data: any) => void) {
        this._onPerformanceData = callback;
    }
    
    /**
     * 重置性能数据
     */
    reset() {
        this._frameCount = 0;
        this._lastSampleTime = Date.now();
        this._currentFps = 0;
        this._minFps = Infinity;
        this._maxFps = 0;
        this._fpsSamples = [];
        this._memoryUsage = 0;
        this._maxMemoryUsage = 0;
        
        console.log('性能数据已重置');
    }
    
    /**
     * 记录性能快照（用于调试）
     */
    takeSnapshot(tag?: string) {
        const data = this.getPerformanceData();
        console.log(`性能快照${tag ? ' - ' + tag : ''}:`, data);
        return data;
    }
    
    /**
     * 检查当前性能是否可接受
     */
    isPerformanceAcceptable(): boolean {
        const data = this.getPerformanceData();
        return !data.performance.isLowFps && !data.performance.isHighMemory;
    }
}