/**
 * 平台适配器接口
 * 定义不同平台（微信小游戏、抖音小游戏等）需要实现的功能
 */

export interface IPlatformAdapter {
    /** 平台名称 */
    readonly platformName: string;
    
    /** 平台初始化 */
    initialize(): Promise<boolean>;
    
    /** 显示激励视频广告 */
    showRewardedVideoAd(adUnitId: string): Promise<{ success: boolean; rewarded: boolean }>;
    
    /** 显示插屏广告 */
    showInterstitialAd(adUnitId: string): Promise<boolean>;
    
    /** 显示横幅广告 */
    showBannerAd(adUnitId: string, position: 'top' | 'bottom'): Promise<boolean>;
    
    /** 隐藏横幅广告 */
    hideBannerAd(): Promise<void>;
    
    /** 分享游戏 */
    shareGame(options: {
        title?: string;
        imageUrl?: string;
        query?: string;
    }): Promise<boolean>;
    
    /** 登录 */
    login(): Promise<{
        success: boolean;
        code?: string;
        userInfo?: any;
    }>;
    
    /** 获取用户信息 */
    getUserInfo(): Promise<{
        success: boolean;
        userInfo?: any;
    }>;
    
    /** 创建订单（支付） */
    createOrder(options: {
        productId: string;
        productName: string;
        price: number;
    }): Promise<{
        success: boolean;
        orderId?: string;
    }>;
    
    /** 数据上报（埋点） */
    trackEvent(eventName: string, data?: any): Promise<void>;
    
    /** 获取系统信息 */
    getSystemInfo(): Promise<{
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
    }>;
    
    /** 震动反馈 */
    vibrateShort(): Promise<void>;
    vibrateLong(): Promise<void>;
    
    /** 保存数据到平台存储 */
    setStorage(key: string, data: any): Promise<void>;
    
    /** 从平台存储读取数据 */
    getStorage<T>(key: string): Promise<T | null>;
    
    /** 显示消息提示 */
    showToast(message: string, duration?: number): Promise<void>;
    
    /** 显示加载提示 */
    showLoading(title?: string): Promise<void>;
    
    /** 隐藏加载提示 */
    hideLoading(): Promise<void>;
    
    /** 获取网络状态 */
    getNetworkType(): Promise<{
        networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none';
    }>;
}