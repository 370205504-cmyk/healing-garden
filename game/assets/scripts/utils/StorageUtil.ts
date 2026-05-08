/**
 * 跨平台存储工具
 *
 * 运行时自动检测平台（wx/tt/localStorage），
 * 无需组件依赖，纯静态工具可直接导入。
 *
 * Cocos Creator 3.x + TypeScript
 */

export class StorageUtil {

    /** 检测当前是否为微信小游戏环境 */
    private static get _isWx(): boolean {
        return typeof wx !== 'undefined' && wx !== null;
    }

    /** 检测当前是否为抖音小游戏环境 */
    private static get _isTt(): boolean {
        return typeof tt !== 'undefined' && tt !== null;
    }

    /**
     * 保存数据
     * @param key  存储键
     * @param data 任意可 JSON 序列化的数据
     */
    static set(key: string, data: any): void {
        try {
            if (StorageUtil._isWx) {
                wx.setStorageSync(key, data);
                return;
            }
            if (StorageUtil._isTt) {
                tt.setStorageSync(key, data);
                return;
            }
            // fallback: localStorage (Web 开发环境)
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.warn(`[StorageUtil] 写入失败 (key=${key}):`, err);
        }
    }

    /**
     * 读取数据
     * @param key          存储键
     * @param defaultValue 未找到时的默认值
     */
    static get<T = any>(key: string, defaultValue: T | null = null): T | null {
        try {
            if (StorageUtil._isWx) {
                const result = wx.getStorageSync(key);
                return result !== '' && result !== undefined ? result as T : defaultValue;
            }
            if (StorageUtil._isTt) {
                const result = tt.getStorageSync(key);
                return result !== '' && result !== undefined ? result as T : defaultValue;
            }
            // fallback: localStorage
            const raw = localStorage.getItem(key);
            if (raw === null) return defaultValue;
            return JSON.parse(raw) as T;
        } catch (err) {
            console.warn(`[StorageUtil] 读取失败 (key=${key}):`, err);
            return defaultValue;
        }
    }

    /**
     * 删除数据
     */
    static remove(key: string): void {
        try {
            if (StorageUtil._isWx) {
                wx.removeStorageSync(key);
                return;
            }
            if (StorageUtil._isTt) {
                tt.removeStorageSync(key);
                return;
            }
            localStorage.removeItem(key);
        } catch (err) {
            console.warn(`[StorageUtil] 删除失败 (key=${key}):`, err);
        }
    }
}
