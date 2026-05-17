/**
 * ManagerBase — 单例管理器基类
 *
 * Cocos Creator 3.8 全局管理器基础模式
 * 实现懒加载 + 引擎就绪检查
 */

import { director } from 'cc';

export abstract class ManagerBase {
    private static _instance: ManagerBase | null = null;

    /** 获取实例前先检查引擎状态 */
    static checkReady(): boolean {
        if (!director || !director.root) {
            console.warn('[ManagerBase] 引擎未就绪');
            return false;
        }
        return true;
    }

    /** 标记实例已创建 */
    static markInitialized(instance: ManagerBase): void {
        ManagerBase._instance = instance;
    }

    /** 获取实例 */
    static getInstance<T extends ManagerBase>(): T | null {
        return ManagerBase._instance as T | null;
    }

    /** 是否已初始化 */
    static isInitialized(): boolean {
        return ManagerBase._instance !== null;
    }
}
