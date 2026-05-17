import { _decorator, Component } from 'cc';

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

    @property
    sampleInterval: number = 1000;

    @property
    lowFpsThreshold: number = 30;

    @property
    highMemoryThreshold: number = 100;

    private _frameCount: number = 0;
    private _lastSampleTime: number = 0;
    private _currentFps: number = 0;
    private _minFps: number = Infinity;
    private _maxFps: number = 0;
    private _fpsSamples: number[] = [];
    private _memoryUsage: number = 0;
    private _maxMemoryUsage: number = 0;

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
        this.schedule(this.updatePerformanceData, this.sampleInterval / 1000);
    }

    update(deltaTime: number) {
        this._frameCount++;
    }

    private updatePerformanceData() {
        const now = Date.now();
        const elapsed = now - this._lastSampleTime;
        if (elapsed > 0) {
            this._currentFps = Math.round((this._frameCount * 1000) / elapsed);
            this._minFps = Math.min(this._minFps, this._currentFps);
            this._maxFps = Math.max(this._maxFps, this._currentFps);
            this._fpsSamples.push(this._currentFps);
            if (this._fpsSamples.length > 60) this._fpsSamples.shift();

            if (this._currentFps < this.lowFpsThreshold && this._onLowFps) {
                this._onLowFps(this._currentFps);
            }
            this.updateMemoryUsage();
            if (this._onPerformanceData) this._onPerformanceData(this.getPerformanceData());

            this._frameCount = 0;
            this._lastSampleTime = now;
        }
    }

    private updateMemoryUsage() {
        try {
            if (performance && (performance as any).memory) {
                const memory = (performance as any).memory;
                this._memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));
                this._maxMemoryUsage = Math.max(this._maxMemoryUsage, this._memoryUsage);
                if (this._memoryUsage > this.highMemoryThreshold && this._onHighMemory) {
                    this._onHighMemory(this._memoryUsage);
                }
            }
        } catch (error) {
            this._memoryUsage = 0;
        }
    }

    getPerformanceData() {
        const avgFps = this._fpsSamples.length > 0
            ? Math.round(this._fpsSamples.reduce((s, f) => s + f, 0) / this._fpsSamples.length)
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

    getPerformanceReport() {
        const data = this.getPerformanceData();
        return `性能报告 (${new Date(data.timestamp).toLocaleTimeString()})
  ├ 帧率: ${data.fps.current} FPS (平均:${data.fps.average}, 最低:${data.fps.min}, 最高:${data.fps.max})
  ├ 内存: ${data.memory.currentMB} MB (峰值:${data.memory.maxMB} MB)
  └ 状态: ${data.performance.isLowFps ? '⚠️低帧率' : '✅帧率正常'} / ${data.performance.isHighMemory ? '⚠️高内存' : '✅内存正常'}`;
    }

    setOnLowFps(callback: (fps: number) => void) {
        this._onLowFps = callback;
    }

    setOnHighMemory(callback: (memoryMB: number) => void) {
        this._onHighMemory = callback;
    }

    setOnPerformanceData(callback: (data: any) => void) {
        this._onPerformanceData = callback;
    }

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

    takeSnapshot(tag?: string) {
        const data = this.getPerformanceData();
        console.log(`性能快照${tag ? ' - ' + tag : ''}:`, data);
        return data;
    }

    isPerformanceAcceptable(): boolean {
        const data = this.getPerformanceData();
        return !data.performance.isLowFps && !data.performance.isHighMemory;
    }
}
