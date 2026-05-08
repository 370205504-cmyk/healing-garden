import { IPlatformAdapter } from './IPlatformAdapter';

/**
 * 抖音小游戏适配器
 * 实现抖音小游戏平台的特定功能
 */
export class DouyinAdapter implements IPlatformAdapter {
    readonly platformName = '抖音小游戏';
    
    private _initialized = false;
    private _bannerAd: any = null;
    
    async initialize(): Promise<boolean> {
        console.log('DouyinAdapter: 初始化抖音适配器');
        
        // 检查抖音API是否可用
        if (!this.isDouyinAvailable()) {
            console.error('抖音API不可用');
            return false;
        }
        
        try {
            // 抖音小游戏初始化逻辑
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
        console.log(`DouyinAdapter: 显示激励视频广告 (${adUnitId})`);
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve({ success: false, rewarded: false });
                return;
            }
            
            try {
                // 抖音激励视频广告
                const videoAd = tt.createRewardedVideoAd({
                    adUnitId: adUnitId,
                });
                
                videoAd.onLoad(() => {
                    console.log('激励视频广告加载成功');
                });
                
                videoAd.onError((err: any) => {
                    console.error('激励视频广告加载失败:', err);
                    resolve({ success: false, rewarded: false });
                });
                
                videoAd.onClose((res: any) => {
                    console.log('激励视频广告关闭', res);
                    resolve({ 
                        success: true, 
                        rewarded: res.isEnded || false 
                    });
                });
                
                videoAd.show().catch((err: any) => {
                    console.error('激励视频广告显示失败:', err);
                    resolve({ success: false, rewarded: false });
                });
                
            } catch (error) {
                console.error('激励视频广告异常:', error);
                resolve({ success: false, rewarded: false });
            }
        });
    }
    
    async showInterstitialAd(adUnitId: string): Promise<boolean> {
        console.log(`DouyinAdapter: 显示插屏广告 (${adUnitId})`);
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve(false);
                return;
            }
            
            try {
                const interstitialAd = tt.createInterstitialAd({
                    adUnitId: adUnitId,
                });
                
                interstitialAd.onLoad(() => {
                    console.log('插屏广告加载成功');
                });
                
                interstitialAd.onError((err: any) => {
                    console.error('插屏广告加载失败:', err);
                    resolve(false);
                });
                
                interstitialAd.onClose(() => {
                    console.log('插屏广告关闭');
                    resolve(true);
                });
                
                interstitialAd.show().catch((err: any) => {
                    console.error('插屏广告显示失败:', err);
                    resolve(false);
                });
                
            } catch (error) {
                console.error('插屏广告异常:', error);
                resolve(false);
            }
        });
    }
    
    async showBannerAd(adUnitId: string, position: 'top' | 'bottom'): Promise<boolean> {
        console.log(`DouyinAdapter: 显示横幅广告 (${adUnitId}, ${position})`);
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve(false);
                return;
            }
            
            try {
                // 销毁之前的横幅广告
                if (this._bannerAd) {
                    this._bannerAd.destroy();
                    this._bannerAd = null;
                }
                
                // 创建横幅广告
                this._bannerAd = tt.createBannerAd({
                    adUnitId: adUnitId,
                    style: {
                        left: 0,
                        top: position === 'top' ? 0 : undefined,
                        bottom: position === 'bottom' ? 0 : undefined,
                        width: 300,
                    },
                });
                
                this._bannerAd.onLoad(() => {
                    console.log('横幅广告加载成功');
                    resolve(true);
                });
                
                this._bannerAd.onError((err: any) => {
                    console.error('横幅广告加载失败:', err);
                    resolve(false);
                });
                
                this._bannerAd.onResize((size: any) => {
                    console.log('横幅广告尺寸:', size);
                });
                
                this._bannerAd.show();
                
            } catch (error) {
                console.error('横幅广告异常:', error);
                resolve(false);
            }
        });
    }
    
    async hideBannerAd(): Promise<void> {
        console.log('DouyinAdapter: 隐藏横幅广告');
        
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
        return Promise.resolve();
    }
    
    async shareGame(options: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        console.log('DouyinAdapter: 分享游戏');
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve(false);
                return;
            }
            
            try {
                tt.shareAppMessage({
                    title: options.title || '自动治愈花园 - 放松身心的种植游戏',
                    imageUrl: options.imageUrl || '',
                    query: options.query || '',
                });
                resolve(true);
            } catch (error) {
                console.error('分享失败:', error);
                resolve(false);
            }
        });
    }
    
    async login(): Promise<{ success: boolean; code?: string; userInfo?: any }> {
        console.log('DouyinAdapter: 用户登录');
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve({ success: false });
                return;
            }
            
            tt.login({
                success: (res: any) => {
                    console.log('抖音登录成功:', res.code);
                    resolve({
                        success: true,
                        code: res.code,
                    });
                },
                fail: (err: any) => {
                    console.error('抖音登录失败:', err);
                    resolve({ success: false });
                },
            });
        });
    }
    
    async getUserInfo(): Promise<{ success: boolean; userInfo?: any }> {
        console.log('DouyinAdapter: 获取用户信息');
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve({ success: false });
                return;
            }
            
            tt.getUserInfo({
                success: (res: any) => {
                    console.log('获取用户信息成功:', res.userInfo);
                    resolve({
                        success: true,
                        userInfo: res.userInfo,
                    });
                },
                fail: (err: any) => {
                    console.error('获取用户信息失败:', err);
                    resolve({ success: false });
                },
            });
        });
    }
    
    async createOrder(options: { productId: string; productName: string; price: number }): Promise<{ success: boolean; orderId?: string }> {
        console.log(`DouyinAdapter: 创建订单 - ${options.productName}`);
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve({ success: false });
                return;
            }
            
            // 抖音支付逻辑
            resolve({
                success: true,
                orderId: `douyin_order_${Date.now()}`,
            });
        });
    }
    
    async trackEvent(eventName: string, data?: any): Promise<void> {
        console.log(`DouyinAdapter: 跟踪事件 - ${eventName}`);
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        // 抖音数据上报
        try {
            tt.reportAnalytics(eventName, data || {});
        } catch (error) {
            console.error('数据上报失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async getSystemInfo(): Promise<{
        platform: string;
        version: string;
        SDKVersion: string;
        brand?: string;
        model?: string;
        pixelRatio: number;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        language: string;
    }> {
        console.log('DouyinAdapter: 获取系统信息');
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve(this.getDefaultSystemInfo());
                return;
            }
            
            tt.getSystemInfo({
                success: (res: any) => {
                    resolve({
                        platform: 'douyin',
                        version: res.version || '1.0.0',
                        SDKVersion: res.SDKVersion || '1.0.0',
                        brand: res.brand,
                        model: res.model,
                        pixelRatio: res.pixelRatio || 1,
                        screenWidth: res.screenWidth,
                        screenHeight: res.screenHeight,
                        windowWidth: res.windowWidth,
                        windowHeight: res.windowHeight,
                        language: res.language || 'zh_CN',
                    });
                },
                fail: () => {
                    resolve(this.getDefaultSystemInfo());
                },
            });
        });
    }
    
    private getDefaultSystemInfo() {
        return {
            platform: 'douyin',
            version: '1.0.0',
            SDKVersion: '1.0.0',
            pixelRatio: 1,
            screenWidth: 375,
            screenHeight: 667,
            windowWidth: 375,
            windowHeight: 667,
            language: 'zh_CN',
        };
    }
    
    async vibrateShort(): Promise<void> {
        console.log('DouyinAdapter: 短震动');
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.vibrateShort({});
        } catch (error) {
            console.error('震动失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async vibrateLong(): Promise<void> {
        console.log('DouyinAdapter: 长震动');
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.vibrateLong({});
        } catch (error) {
            console.error('长震动失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async setStorage(key: string, data: any): Promise<void> {
        console.log(`DouyinAdapter: 设置存储 - ${key}`);
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.setStorage({
                key: key,
                data: data,
            });
        } catch (error) {
            console.error('存储失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async getStorage<T>(key: string): Promise<T | null> {
        console.log(`DouyinAdapter: 获取存储 - ${key}`);
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve(null);
                return;
            }
            
            tt.getStorage({
                key: key,
                success: (res: any) => {
                    resolve(res.data);
                },
                fail: () => {
                    resolve(null);
                },
            });
        });
    }
    
    async showToast(message: string, duration: number = 2000): Promise<void> {
        console.log(`DouyinAdapter: 显示消息提示 - ${message}`);
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.showToast({
                title: message,
                icon: 'none',
                duration: duration,
            });
        } catch (error) {
            console.error('显示消息提示失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async showLoading(title?: string): Promise<void> {
        console.log(`DouyinAdapter: 显示加载提示 - ${title || '加载中...'}`);
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.showLoading({
                title: title || '加载中...',
            });
        } catch (error) {
            console.error('显示加载提示失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async hideLoading(): Promise<void> {
        console.log('DouyinAdapter: 隐藏加载提示');
        
        if (!this.isDouyinAvailable()) {
            return Promise.resolve();
        }
        
        try {
            tt.hideLoading();
        } catch (error) {
            console.error('隐藏加载提示失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async getNetworkType(): Promise<{ networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none' }> {
        console.log('DouyinAdapter: 获取网络类型');
        
        return new Promise((resolve) => {
            if (!this.isDouyinAvailable()) {
                resolve({ networkType: 'unknown' });
                return;
            }
            
            tt.getNetworkType({
                success: (res: any) => {
                    resolve({
                        networkType: res.networkType === 'wifi' ? 'wifi' :
                                    res.networkType === '2g' ? '2g' :
                                    res.networkType === '3g' ? '3g' :
                                    res.networkType === '4g' ? '4g' :
                                    res.networkType === '5g' ? '5g' : 'unknown',
                    });
                },
                fail: () => {
                    resolve({ networkType: 'unknown' });
                },
            });
        });
    }
    
    async setStorage(key: string, data: any): Promise<void> {
        if (!this.isDouyinAvailable()) return;
        try {
            tt.setStorageSync(key, data);
        } catch (error) {
            console.error(`DouyinAdapter: 存储失败 (key=${key}):`, error);
        }
    }

    async getStorage<T>(key: string): Promise<T | null> {
        if (!this.isDouyinAvailable()) return null;
        try {
            const result = tt.getStorageSync(key);
            return result !== '' && result !== undefined ? result as T : null;
        } catch (error) {
            console.error(`DouyinAdapter: 读取失败 (key=${key}):`, error);
            return null;
        }
    }
}