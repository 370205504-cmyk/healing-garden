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
        // 通过全局对象检测
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
                    // 动态导入微信适配器
                    const { WeChatAdapter } = await import('./WeChatAdapter');
                    this._currentAdapter = new WeChatAdapter();
                    break;
                case 'douyin':
                    // 动态导入抖音适配器
                    const { DouyinAdapter } = await import('./DouyinAdapter');
                    this._currentAdapter = new DouyinAdapter();
                    break;
                case 'web':
                default:
                    // 使用Web适配器
                    this._currentAdapter = new WebAdapter();
                    break;
            }
            
            // 初始化适配器
            const success = await this._currentAdapter.initialize();
            if (success) {
                console.log(`平台适配器初始化成功: ${this._currentAdapter.platformName}`);
            } else {
                console.error('平台适配器初始化失败');
                this._currentAdapter = new WebAdapter(); // 降级到Web适配器
                await this._currentAdapter.initialize();
            }
        } catch (error) {
            console.error('平台适配器加载失败:', error);
            // 降级到Web适配器
            this._currentAdapter = new WebAdapter();
            await this._currentAdapter.initialize();
        }
    }
    
    /**
     * 获取当前平台适配器
     */
    public get adapter(): IPlatformAdapter {
        if (!this._currentAdapter) {
            throw new Error('平台适配器未初始化');
        }
        return this._currentAdapter;
    }
    
    /**
     * 获取平台类型
     */
    public get platformType(): string {
        return this._platformType;
    }
    
    /**
     * 是否为微信小游戏
     */
    public get isWeChat(): boolean {
        return this._platformType === 'wechat';
    }
    
    /**
     * 是否为抖音小游戏
     */
    public get isDouyin(): boolean {
        return this._platformType === 'douyin';
    }
    
    /**
     * 是否为Web环境
     */
    public get isWeb(): boolean {
        return this._platformType === 'web';
    }
    
    /**
     * 显示激励视频广告（快捷方法）
     */
    public async showRewardedVideo(adUnitId?: string): Promise<{ success: boolean; rewarded: boolean }> {
        const defaultAdUnitId = this.isWeChat ? 'your-wechat-ad-unit-id' :
                               this.isDouyin ? 'your-douyin-ad-unit-id' : 'web-ad-unit';
        
        return this.adapter.showRewardedVideoAd(adUnitId || defaultAdUnitId);
    }
    
    /**
     * 分享游戏（快捷方法）
     */
    public async share(options?: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        const shareOptions = {
            title: options?.title || '自动治愈花园 - 放松身心的种植游戏',
            imageUrl: options?.imageUrl || '',
            query: options?.query || '',
        };
        return this.adapter.shareGame(shareOptions);
    }
    
    /**
     * 用户登录（快捷方法）
     */
    public async login(): Promise<{ success: boolean; code?: string; userInfo?: any }> {
        return this.adapter.login();
    }
    
    /**
     * 数据上报（快捷方法）
     */
    public async track(eventName: string, data?: any): Promise<void> {
        return this.adapter.trackEvent(eventName, data);
    }
    
    /**
     * 显示消息提示（快捷方法）
     */
    public async toast(message: string, duration?: number): Promise<void> {
        return this.adapter.showToast(message, duration);
    }
    
    /**
     * 震动反馈（快捷方法）
     */
    public async vibrate(style: 'short' | 'long' = 'short'): Promise<void> {
        if (style === 'short') {
            return this.adapter.vibrateShort();
        } else {
            return this.adapter.vibrateLong();
        }
    }
}