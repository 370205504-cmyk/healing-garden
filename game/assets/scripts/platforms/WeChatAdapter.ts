import { IPlatformAdapter } from './IPlatformAdapter';

/**
 * 微信小游戏适配器
 * 实现微信小游戏平台的特定功能
 */
export class WeChatAdapter implements IPlatformAdapter {
    readonly platformName = '微信小游戏';
    
    private _initialized = false;
    private _bannerAd: any = null;
    
    async initialize(): Promise<boolean> {
        console.log('WeChatAdapter: 初始化微信适配器');
        
        // 检查微信API是否可用
        if (!this.isWeChatAvailable()) {
            console.error('微信API不可用');
            return false;
        }
        
        // 初始化微信小游戏
        try {
            // 微信小游戏初始化逻辑
            // 例如：检查版本、初始化分享等
            this._initialized = true;
            console.log('微信适配器初始化成功');
            return true;
        } catch (error) {
            console.error('微信适配器初始化失败:', error);
            return false;
        }
    }
    
    private isWeChatAvailable(): boolean {
        return typeof wx !== 'undefined' && wx.login && wx.request;
    }
    
    async showRewardedVideoAd(adUnitId: string): Promise<{ success: boolean; rewarded: boolean }> {
        console.log(`WeChatAdapter: 显示激励视频广告 (${adUnitId})`);
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve({ success: false, rewarded: false });
                return;
            }
            
            try {
                // 创建激励视频广告实例
                const videoAd = wx.createRewardedVideoAd({
                    adUnitId: adUnitId,
                });
                
                // 监听加载事件
                videoAd.onLoad(() => {
                    console.log('激励视频广告加载成功');
                });
                
                videoAd.onError((err: any) => {
                    console.error('激励视频广告加载失败:', err);
                    resolve({ success: false, rewarded: false });
                });
                
                videoAd.onClose((res: any) => {
                    console.log('激励视频广告关闭', res);
                    // 根据res.isEnded判断是否给予奖励
                    resolve({ 
                        success: true, 
                        rewarded: res.isEnded || false 
                    });
                });
                
                // 显示广告
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
        console.log(`WeChatAdapter: 显示插屏广告 (${adUnitId})`);
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve(false);
                return;
            }
            
            try {
                const interstitialAd = wx.createInterstitialAd({
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
        console.log(`WeChatAdapter: 显示横幅广告 (${adUnitId}, ${position})`);
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
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
                this._bannerAd = wx.createBannerAd({
                    adUnitId: adUnitId,
                    style: {
                        left: 0,
                        top: position === 'top' ? 0 : undefined,
                        bottom: position === 'bottom' ? 0 : undefined,
                        width: 300, // 宽度
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
        console.log('WeChatAdapter: 隐藏横幅广告');
        
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
        return Promise.resolve();
    }
    
    async shareGame(options: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        console.log('WeChatAdapter: 分享游戏');
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve(false);
                return;
            }
            
            try {
                wx.shareAppMessage({
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
        console.log('WeChatAdapter: 用户登录');
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve({ success: false });
                return;
            }
            
            wx.login({
                success: (res: any) => {
                    console.log('微信登录成功:', res.code);
                    resolve({
                        success: true,
                        code: res.code,
                    });
                },
                fail: (err: any) => {
                    console.error('微信登录失败:', err);
                    resolve({ success: false });
                },
            });
        });
    }
    
    async getUserInfo(): Promise<{ success: boolean; userInfo?: any }> {
        console.log('WeChatAdapter: 获取用户信息');
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve({ success: false });
                return;
            }
            
            wx.getUserInfo({
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
        console.log(`WeChatAdapter: 创建订单 - ${options.productName}`);
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve({ success: false });
                return;
            }
            
            // 微信支付逻辑
            // 实际实现需要与后端服务器配合
            resolve({
                success: true,
                orderId: `wx_order_${Date.now()}`,
            });
        });
    }
    
    async trackEvent(eventName: string, data?: any): Promise<void> {
        console.log(`WeChatAdapter: 跟踪事件 - ${eventName}`);
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        // 微信数据上报
        try {
            wx.reportAnalytics(eventName, data || {});
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
        console.log('WeChatAdapter: 获取系统信息');
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve(this.getDefaultSystemInfo());
                return;
            }
            
            wx.getSystemInfo({
                success: (res: any) => {
                    resolve({
                        platform: 'wechat',
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
            platform: 'wechat',
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
        console.log('WeChatAdapter: 短震动');
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.vibrateShort({});
        } catch (error) {
            console.error('震动失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async vibrateLong(): Promise<void> {
        console.log('WeChatAdapter: 长震动');
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.vibrateLong({});
        } catch (error) {
            console.error('长震动失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async setStorage(key: string, data: any): Promise<void> {
        console.log(`WeChatAdapter: 设置存储 - ${key}`);
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.setStorage({
                key: key,
                data: data,
            });
        } catch (error) {
            console.error('存储失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async getStorage<T>(key: string): Promise<T | null> {
        console.log(`WeChatAdapter: 获取存储 - ${key}`);
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve(null);
                return;
            }
            
            wx.getStorage({
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
        console.log(`WeChatAdapter: 显示消息提示 - ${message}`);
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.showToast({
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
        console.log(`WeChatAdapter: 显示加载提示 - ${title || '加载中...'}`);
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.showLoading({
                title: title || '加载中...',
            });
        } catch (error) {
            console.error('显示加载提示失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async hideLoading(): Promise<void> {
        console.log('WeChatAdapter: 隐藏加载提示');
        
        if (!this.isWeChatAvailable()) {
            return Promise.resolve();
        }
        
        try {
            wx.hideLoading();
        } catch (error) {
            console.error('隐藏加载提示失败:', error);
        }
        
        return Promise.resolve();
    }
    
    async getNetworkType(): Promise<{ networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none' }> {
        console.log('WeChatAdapter: 获取网络类型');
        
        return new Promise((resolve) => {
            if (!this.isWeChatAvailable()) {
                resolve({ networkType: 'unknown' });
                return;
            }
            
            wx.getNetworkType({
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
        if (!this.isWeChatAvailable()) return;
        try {
            wx.setStorageSync(key, data);
        } catch (error) {
            console.error(`WeChatAdapter: 存储失败 (key=${key}):`, error);
        }
    }

    async getStorage<T>(key: string): Promise<T | null> {
        if (!this.isWeChatAvailable()) return null;
        try {
            const result = wx.getStorageSync(key);
            return result !== '' && result !== undefined ? result as T : null;
        } catch (error) {
            console.error(`WeChatAdapter: 读取失败 (key=${key}):`, error);
            return null;
        }
    }
}