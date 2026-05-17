import { _decorator, Component } from 'cc';
import { IPlatformAdapter } from './IPlatformAdapter';
import { WebAdapter } from './WebAdapter';

const { ccclass, property } = _decorator;

/**
 * 平台管理器
 * 单例模式，负责检测当前平台并初始化对应的适配器
 */
@ccclass('PlatformManager')
export class PlatformManager extends Component {
    
    private static _instance: PlatformManager;
    
    public static get instance(): PlatformManager {
        return PlatformManager._instance;
    }
    
    /** 当前平台适配器 */
    private _currentAdapter: IPlatformAdapter | null = null;
    
    /** 平台类型 */
    private _platformType: 'wechat' | 'douyin' | 'web' | 'unknown' = 'unknown';
    
    onLoad() {
        if (PlatformManager._instance && PlatformManager._instance !== this) {
            this.destroy();
            return;
        }
        PlatformManager._instance = this;
        
        // 检测当前平台
        this.detectPlatform();
        
        // 初始化适配器
        this.initializeAdapter();
    }
    
    /**
     * 检测当前运行平台
     */
    private detectPlatform(): void {
        const wx = (window as any).wx;
        const tt = (window as any).tt;
        
        if (wx && wx.login && wx.request) {
            this._platformType = 'wechat';
            console.log('检测到平台: 微信小游戏');
        } else if (tt && tt.login && tt.request) {
            this._platformType = 'douyin';
            console.log('检测到平台: 抖音小游戏');
        } else {
            this._platformType = 'web';
            console.log('检测到平台: Web浏览器');
        }
    }
    
    /**
     * 初始化平台适配器
     */
    private async initializeAdapter(): Promise<void> {
        try {
            switch (this._platformType) {
                case 'wechat':
                    const { WeChatAdapter } = await import('./WeChatAdapter');
                    this._currentAdapter = new WeChatAdapter();
                    break;
                case 'douyin':
                    const { DouyinAdapter } = await import('./DouyinAdapter');
                    this._currentAdapter = new DouyinAdapter();
                    break;
                case 'web':
                default:
                    this._currentAdapter = new WebAdapter();
                    break;
            }
            
            const success = await this._currentAdapter.initialize();
            if (success) {
                console.log(`平台适配器初始化成功: ${this._currentAdapter.platformName}`);
            } else {
                console.error('平台适配器初始化失败，降级到Web适配器');
                this._currentAdapter = new WebAdapter();
                await this._currentAdapter.initialize();
            }
        } catch (error) {
            console.error('平台适配器加载失败:', error);
            this._currentAdapter = new WebAdapter();
            await this._currentAdapter.initialize();
        }
    }
    
    public get adapter(): IPlatformAdapter {
        if (!this._currentAdapter) {
            throw new Error('平台适配器未初始化');
        }
        return this._currentAdapter;
    }
    
    public get platformType(): string {
        return this._platformType;
    }
    
    public get isWeChat(): boolean {
        return this._platformType === 'wechat';
    }
    
    public get isDouyin(): boolean {
        return this._platformType === 'douyin';
    }
    
    public get isWeb(): boolean {
        return this._platformType === 'web';
    }
    
    public async showRewardedVideo(adUnitId?: string): Promise<{ success: boolean; rewarded: boolean }> {
        const defaultAdUnitId = this.isWeChat ? 'your-wechat-ad-unit-id' :
                               this.isDouyin ? 'your-douyin-ad-unit-id' : 'web-ad-unit';
        return this.adapter.showRewardedVideoAd(adUnitId || defaultAdUnitId);
    }
    
    public async share(options?: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        const shareOptions = {
            title: options?.title || '自动治愈花园 - 放松身心的种植游戏',
            imageUrl: options?.imageUrl || '',
            query: options?.query || '',
        };
        return this.adapter.shareGame(shareOptions);
    }
    
    public async login(): Promise<{ success: boolean; code?: string; userInfo?: any }> {
        return this.adapter.login();
    }
    
    public async track(eventName: string, data?: any): Promise<void> {
        return this.adapter.trackEvent(eventName, data);
    }
    
    public async toast(message: string, duration?: number): Promise<void> {
        return this.adapter.showToast(message, duration);
    }
    
    public async setStorage(key: string, data: any): Promise<void> {
        return this.adapter.setStorage(key, data);
    }
    
    public async getStorage<T>(key: string): Promise<T | null> {
        return this.adapter.getStorage<T>(key);
    }
    
    public async vibrate(style: 'short' | 'long' = 'short'): Promise<void> {
        if (style === 'short') {
            return this.adapter.vibrateShort();
        } else {
            return this.adapter.vibrateLong();
        }
    }
}
