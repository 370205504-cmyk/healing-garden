import { IPlatformAdapter } from './IPlatformAdapter';

/**
 * Web浏览器适配器
 * 用于Web环境或作为其他平台的降级方案
 */
export class WebAdapter implements IPlatformAdapter {
    readonly platformName = 'Web Browser';
    
    private _initialized = false;
    
    async initialize(): Promise<boolean> {
        console.log('WebAdapter: 初始化Web适配器');
        this._initialized = true;
        return true;
    }
    
    async showRewardedVideoAd(adUnitId: string): Promise<{ success: boolean; rewarded: boolean }> {
        console.log(`WebAdapter: 模拟显示激励视频广告 (${adUnitId})`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, rewarded: true });
            }, 100);
        });
    }
    
    async showInterstitialAd(adUnitId: string): Promise<boolean> {
        console.log(`WebAdapter: 模拟显示插屏广告 (${adUnitId})`);
        return Promise.resolve(true);
    }
    
    async showBannerAd(adUnitId: string, position: 'top' | 'bottom'): Promise<boolean> {
        console.log(`WebAdapter: 模拟显示横幅广告 (${adUnitId}, ${position})`);
        return Promise.resolve(true);
    }
    
    async hideBannerAd(): Promise<void> {
        console.log('WebAdapter: 模拟隐藏横幅广告');
        return Promise.resolve();
    }
    
    async shareGame(options: { title?: string; imageUrl?: string; query?: string }): Promise<boolean> {
        const shareUrl = window.location.href;
        const shareText = options.title || '自动治愈花园 - 放松身心的种植游戏';
        console.log(`WebAdapter: 模拟分享游戏 - ${shareText}`);
        
        if (navigator.share) {
            try {
                await navigator.share({ title: shareText, text: '快来玩这款治愈系种植游戏吧！', url: shareUrl });
                return true;
            } catch (error) {
                console.log('Web Share API失败:', error);
            }
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert(`游戏链接已复制到剪贴板！\n${shareUrl}`);
            return true;
        } catch (error) {
            console.error('复制链接失败:', error);
            return false;
        }
    }
    
    async login(): Promise<{ success: boolean; code?: string; userInfo?: any }> {
        console.log('WebAdapter: 模拟用户登录');
        const mockUser = {
            userId: `web_user_${Date.now()}`,
            nickname: 'Web玩家',
            avatarUrl: '',
            city: '未知',
            country: '中国',
            province: '未知',
            gender: 0,
        };
        return { success: true, code: `web_login_code_${Date.now()}`, userInfo: mockUser };
    }
    
    async getUserInfo(): Promise<{ success: boolean; userInfo?: any }> {
        const mockUser = {
            userId: `web_user_${Date.now()}`,
            nickname: 'Web玩家',
            avatarUrl: '',
            city: '未知',
            country: '中国',
            province: '未知', 
            gender: 0,
        };
        return { success: true, userInfo: mockUser };
    }
    
    async createOrder(options: { productId: string; productName: string; price: number }): Promise<{ success: boolean; orderId?: string }> {
        console.log(`WebAdapter: 模拟创建订单 - ${options.productName} (${options.price}元)`);
        return { success: true, orderId: `web_order_${Date.now()}_${options.productId}` };
    }
    
    async trackEvent(eventName: string, data?: any): Promise<void> {
        console.log(`WebAdapter: 跟踪事件 - ${eventName}`, data || '');
        return Promise.resolve();
    }
    
    async getSystemInfo(): Promise<{
        platform: string; version: string; SDKVersion: string;
        brand?: string; model?: string; pixelRatio: number;
        screenWidth: number; screenHeight: number;
        windowWidth: number; windowHeight: number; language: string;
    }> {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return {
            platform: 'web', version: '1.0.0', SDKVersion: '1.0.0',
            brand: isMobile ? 'Web Mobile' : 'Web Desktop',
            model: navigator.userAgent.substring(0, 50),
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width, screenHeight: window.screen.height,
            windowWidth: window.innerWidth, windowHeight: window.innerHeight,
            language: navigator.language || 'zh-CN',
        };
    }
    
    async vibrateShort(): Promise<void> {
        if (navigator.vibrate) navigator.vibrate(50);
        return Promise.resolve();
    }
    
    async vibrateLong(): Promise<void> {
        if (navigator.vibrate) navigator.vibrate(200);
        return Promise.resolve();
    }
    
    async showToast(message: string, duration?: number): Promise<void> {
        console.log(`WebAdapter: 显示消息提示 - ${message}`);
        alert(message);
        return Promise.resolve();
    }
    
    async showLoading(title?: string): Promise<void> {
        console.log(`WebAdapter: 显示加载提示 - ${title || '加载中...'}`);
        return Promise.resolve();
    }
    
    async hideLoading(): Promise<void> {
        console.log('WebAdapter: 隐藏加载提示');
        return Promise.resolve();
    }
    
    async getNetworkType(): Promise<{ networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none' }> {
        const connection = (navigator as any).connection;
        if (connection) {
            const type = connection.effectiveType;
            return { networkType: type === 'wifi' ? 'wifi' : type || 'unknown' };
        }
        return { networkType: 'unknown' };
    }
}
