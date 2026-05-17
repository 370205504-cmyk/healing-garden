import { IPlatformAdapter } from './IPlatformAdapter';

/**
 * 抖音小游戏适配器
 */
export class DouyinAdapter implements IPlatformAdapter {
    readonly platformName = '抖音小游戏';
    
    private _initialized = false;
    private _bannerAd: any = null;
    
    async initialize(): Promise<boolean> {
        console.log('DouyinAdapter: 初始化抖音适配器');
        if (!this.isDouyinAvailable()) {
            console.error('抖音API不可用');
            return false;
        }
        try {
            this._initialized = true;
            console.log('抖音适配器初始化成功');
            return true;
        } catch (error) {
            console.error('抖音适配器初始化失败:', error);
            return false;
        }
    }
    
    private isDouyinAvailable(): boolean {
        return typeof tt !== 'undefined' && tt.login && tt.request;
    }
    
    async showRewardedVideoAd(adUnitId: string): Promise<{ success: boolean; rewarded: boolean }> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve({ success: false, rewarded: false }); return; }
            try {
                const videoAd = tt.createRewardedVideoAd({ adUnitId });
                videoAd.onLoad(() => console.log('激励视频广告加载成功'));
                videoAd.onError(() => resolve({ success: false, rewarded: false }));
                videoAd.onClose((res: any) => resolve({ success: true, rewarded: res.isEnded || false }));
                videoAd.show().catch(() => resolve({ success: false, rewarded: false }));
            } catch (error) { resolve({ success: false, rewarded: false }); }
        });
    }
    
    async showInterstitialAd(adUnitId: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve(false); return; }
            try {
                const ad = tt.createInterstitialAd({ adUnitId });
                ad.onLoad(() => console.log('插屏广告加载成功'));
                ad.onError(() => resolve(false));
                ad.onClose(() => resolve(true));
                ad.show().catch(() => resolve(false));
            } catch (error) { resolve(false); }
        });
    }
    
    async showBannerAd(adUnitId: string, position: 'top' | 'bottom'): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve(false); return; }
            try {
                if (this._bannerAd) { this._bannerAd.destroy(); this._bannerAd = null; }
                this._bannerAd = tt.createBannerAd({
                    adUnitId,
                    style: { left: 0, top: position === 'top' ? 0 : undefined, bottom: position === 'bottom' ? 0 : undefined, width: 300 },
                });
                this._bannerAd.onLoad(() => resolve(true));
                this._bannerAd.onError(() => resolve(false));
                this._bannerAd.show();
            } catch (error) { resolve(false); }
        });
    }
    
    async hideBannerAd(): Promise<void> {
        if (this._bannerAd) this._bannerAd.hide();
        return Promise.resolve();
    }
    
    async shareGame(options: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve(false); return; }
            try {
                tt.shareAppMessage({
                    title: options.title || '自动治愈花园 - 放松身心的种植游戏',
                    imageUrl: options.imageUrl || '',
                    query: options.query || '',
                });
                resolve(true);
            } catch (error) { resolve(false); }
        });
    }
    
    async login(): Promise<{ success: boolean; code?: string; userInfo?: any }> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve({ success: false }); return; }
            tt.login({
                success: (res: any) => resolve({ success: true, code: res.code }),
                fail: () => resolve({ success: false }),
            });
        });
    }
    
    async getUserInfo(): Promise<{ success: boolean; userInfo?: any }> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve({ success: false }); return; }
            tt.getUserInfo({
                success: (res: any) => resolve({ success: true, userInfo: res.userInfo }),
                fail: () => resolve({ success: false }),
            });
        });
    }
    
    async createOrder(options: { productId: string; productName: string; price: number }): Promise<{ success: boolean; orderId?: string }> {
        return Promise.resolve({ success: true, orderId: `douyin_order_${Date.now()}` });
    }
    
    async trackEvent(eventName: string, data?: any): Promise<void> {
        if (!this.isDouyinAvailable()) return;
        try { tt.reportAnalytics(eventName, data || {}); } catch (error) { /* ignore */ }
        return Promise.resolve();
    }
    
    async getSystemInfo(): Promise<{
        platform: string; version: string; SDKVersion: string;
        brand?: string; model?: string; pixelRatio: number;
        screenWidth: number; screenHeight: number;
        windowWidth: number; windowHeight: number; language: string;
    }> {
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) { resolve(this.getDefaultSystemInfo()); return; }
            tt.getSystemInfo({
                success: (res: any) => resolve({
                    platform: 'douyin', version: res.version || '1.0.0', SDKVersion: res.SDKVersion || '1.0.0',
                    brand: res.brand, model: res.model, pixelRatio: res.pixelRatio || 1,
                    screenWidth: res.screenWidth, screenHeight: res.screenHeight,
                    windowWidth: res.windowWidth, windowHeight: res.windowHeight,
                    language: res.language || 'zh_CN',
                }),
                fail: () => resolve(this.getDefaultSystemInfo()),
            });
        });
    }
    
    private getDefaultSystemInfo() {
        return {
            platform: 'douyin', version: '1.0.0', SDKVersion: '1.0.0',
            pixelRatio: 1, screenWidth: 375, screenHeight: 667,
            windowWidth: 375, windowHeight: 667, language: 'zh_CN',
        };
    }
    
    async vibrateShort(): Promise<void> {
        if (!this.isDouyinAvailable()) return;
        try { tt.vibrateShort({}); } catch (e) { /* ignore */ }
        return Promise.resolve();
    }
    
    async vibrateLong(): Promise<void> {
        if (!this.isDouyinAvailable()) return;
        try { tt.vibrateLong({}); } catch (e) { /* ignore */ }
        return Promise.resolve();
    }
    
    async setStorage(key: string, data: any): Promise<void> {
        if (!this.isDouyinAvailable()) return;
        try { tt.setStorageSync(key, data); } catch (error) { console.error(`DouyinAdapter: 存储失败 (key=${key}):`, error); }
    }
    
    async getStorage<T>(key: string): Promise<T | null> {
        if (!this.isDouyinAvailable()) return null;
        try {
            const result = tt.getStorageSync(key);
            return result !== '' && result !== undefined ? result as T : null;
        } catch (error) { return null; }
    }
}
