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
        // 模拟广告显示和奖励
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟用户观看完成并获得奖励
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
        
        // 在Web环境中，尝试使用Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareText,
                    text: '快来玩这款治愈系种植游戏吧！',
                    url: shareUrl,
                });
                return true;
            } catch (error) {
                console.log('Web Share API失败，使用复制链接方式:', error);
            }
        }
        
        // 降级方案：复制链接到剪贴板
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
        // 生成模拟用户信息
        const mockUser = {
            userId: `web_user_${Date.now()}`,
            nickname: 'Web玩家',
            avatarUrl: '',
            city: '未知',
            country: '中国',
            province: '未知',
            gender: 0,
        };
        
        return {
            success: true,
            code: `web_login_code_${Date.now()}`,
            userInfo: mockUser,
        };
    }
    
    async getUserInfo(): Promise<{ success: boolean; userInfo?: any }> {
        console.log('WebAdapter: 获取模拟用户信息');
        const mockUser = {
            userId: `web_user_${Date.now()}`,
            nickname: 'Web玩家',
            avatarUrl: '',
            city: '未知',
            country: '中国',
            province: '未知',
            gender: 0,
        };
        
        return {
            success: true,
            userInfo: mockUser,
        };
    }
    
    async createOrder(options: { productId: string; productName: string; price: number }): Promise<{ success: boolean; orderId?: string }> {
        console.log(`WebAdapter: 模拟创建订单 - ${options.productName} (${options.price}元)`);
        return {
            success: true,
            orderId: `web_order_${Date.now()}_${options.productId}`,
        };
    }
    
    async trackEvent(eventName: string, data?: any): Promise<void> {
        console.log(`WebAdapter: 跟踪事件 - ${eventName}`, data || '');
        // Web环境中可以发送到自己的分析服务
        // 这里简单记录到控制台
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
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        return {
            platform: 'web',
            version: '1.0.0',
            SDKVersion: '1.0.0',
            brand: isMobile ? 'Web Mobile' : 'Web Desktop',
            model: navigator.userAgent.substring(0, 50),
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            language: navigator.language || 'zh-CN',
        };
    }
    
    async vibrateShort(): Promise<void> {
        console.log('WebAdapter: 模拟短震动');
        // Web环境可以通过navigator.vibrate实现
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        return Promise.resolve();
    }
    
    async vibrateLong(): Promise<void> {
        console.log('WebAdapter: 模拟长震动');
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        return Promise.resolve();
    }
    
    async setStorage(key: string, data: any): Promise<void> {
        console.log(`WebAdapter: 设置存储 - ${key}`);
        try {
            localStorage.setItem(`web_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('WebAdapter: 存储数据失败:', error);
        }
        return Promise.resolve();
    }
    
    async getStorage<T>(key: string): Promise<T | null> {
        console.log(`WebAdapter: 获取存储 - ${key}`);
        try {
            const data = localStorage.getItem(`web_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('WebAdapter: 读取数据失败:', error);
            return null;
        }
    }
    
    async showToast(message: string, duration: number = 2000): Promise<void> {
        console.log(`WebAdapter: 显示消息提示 - ${message}`);
        // Web环境中可以使用alert或自定义toast
        // 这里简单使用console.log
        alert(message); // 实际项目中应使用更优雅的UI组件
        return Promise.resolve();
    }
    
    async showLoading(title?: string): Promise<void> {
        console.log(`WebAdapter: 显示加载提示 - ${title || '加载中...'}`);
        // Web环境中可以显示加载遮罩
        // 这里简单记录到控制台
        return Promise.resolve();
    }
    
    async hideLoading(): Promise<void> {
        console.log('WebAdapter: 隐藏加载提示');
        return Promise.resolve();
    }
    
    async getNetworkType(): Promise<{ networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none' }> {
        // Web环境可以通过navigator.connection检测网络类型
        const connection = (navigator as any).connection;
        if (connection) {
            const type = connection.effectiveType;
            return {
                networkType: type === 'wifi' ? 'wifi' :
                           type === 'slow-2g' ? '2g' :
                           type === '2g' ? '2g' :
                           type === '3g' ? '3g' :
                           type === '4g' ? '4g' : 'unknown',
            };
        }
        
        return {
            networkType: 'unknown',
        };
    }
}