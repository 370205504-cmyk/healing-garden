import { _decorator, Component, Node } from 'cc';
import { StorageUtil } from './utils/StorageUtil';
const { ccclass, property } = _decorator;

@ccclass('EconomySystem')
export class EconomySystem extends Component {
    
    // 商店物品
    private shopItems = [
        { id: 1, name: '向日葵种子', price: 10, type: 'seed', unlockLevel: 1 },
        { id: 2, name: '玫瑰种子', price: 20, type: 'seed', unlockLevel: 2 },
        { id: 3, name: '仙人掌种子', price: 15, type: 'seed', unlockLevel: 3 },
        { id: 4, name: '幸运草种子', price: 5, type: 'seed', unlockLevel: 1 },
        { id: 5, name: '普通肥料', price: 30, type: 'fertilizer', unlockLevel: 2 },
        { id: 6, name: '高级肥料', price: 50, type: 'fertilizer', unlockLevel: 4 },
        { id: 7, name: '花园长椅', price: 100, type: 'decoration', unlockLevel: 3 },
        { id: 8, name: '喷泉', price: 200, type: 'decoration', unlockLevel: 5 }
    ];
    
    // 玩家背包
    private inventory: Map<number, number> = new Map();
    
    // 系统引用
    private _gameManager: any = null;
    private _uiManager: any = null;
    
    onLoad() {
        this.loadInventory();
    }
    
    // 购买物品
    buyItem(itemId: number, quantity: number = 1): boolean {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return false;
        
        // 检查是否已解锁
        const gameManager = (window as any).GameManager?.instance;
        if (gameManager && gameManager.level < item.unlockLevel) {
            console.log(`需要等级 ${item.unlockLevel} 才能购买 ${item.name}`);
            return false;
        }
        
        const totalCost = item.price * quantity;
        
        // 检查金币是否足够
        if (gameManager && gameManager.spendCoins(totalCost)) {
            // 添加到背包
            const current = this.inventory.get(itemId) || 0;
            this.inventory.set(itemId, current + quantity);
            
            // 保存背包数据
            this.saveInventory();
            
            // 触发购买事件
            this.node.emit('item-purchased', { item, quantity });
            
            console.log(`购买了 ${quantity} 个 ${item.name}，花费 ${totalCost} 金币`);
            return true;
        }
        
        return false;
    }
    
    // 出售物品（如果有出售功能）
    sellItem(itemId: number, quantity: number = 1): boolean {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return false;
        
        const current = this.inventory.get(itemId) || 0;
        if (current < quantity) return false;
        
        const totalValue = Math.floor(item.price * 0.7 * quantity); // 70% 回收价
        
        // 更新背包
        this.inventory.set(itemId, current - quantity);
        if (this.inventory.get(itemId) === 0) {
            this.inventory.delete(itemId);
        }
        
        // 保存背包数据
        this.saveInventory();
        
        // 增加金币
        const gameManager = (window as any).GameManager?.instance;
        if (gameManager) {
            gameManager.addCoins(totalValue);
        }
        
        // 触发出售事件
        this.node.emit('item-sold', { item, quantity, value: totalValue });
        
        return true;
    }
    
    // 使用物品
    useItem(itemId: number, quantity: number = 1): boolean {
        const current = this.inventory.get(itemId) || 0;
        if (current < quantity) return false;
        
        // 更新背包
        this.inventory.set(itemId, current - quantity);
        if (this.inventory.get(itemId) === 0) {
            this.inventory.delete(itemId);
        }
        
        // 保存背包数据
        this.saveInventory();
        
        // 触发使用事件
        const item = this.shopItems.find(i => i.id === itemId);
        if (item) {
            this.node.emit('item-used', { item, quantity });
        }
        
        return true;
    }
    
    // 获取商店物品
    getShopItems(): any[] {
        const gameManager = (window as any).GameManager?.instance;
        const playerLevel = gameManager?.level || 1;
        
        // 只返回已解锁的物品
        return this.shopItems.filter(item => item.unlockLevel <= playerLevel);
    }
    
    // 获取背包物品
    getInventory(): Map<number, number> {
        return new Map(this.inventory);
    }
    
    // 获取物品数量
    getItemQuantity(itemId: number): number {
        return this.inventory.get(itemId) || 0;
    }
    
    // 保存背包数据
    saveInventory() {
        const inventoryObj = Object.fromEntries(this.inventory);
        StorageUtil.set('inventory', inventoryObj);
    }
    
    // 加载背包数据
    loadInventory() {
        const inventoryObj = StorageUtil.get<Record<string, number>>('inventory');
        if (inventoryObj) {
            try {
                this.inventory = new Map(Object.entries(inventoryObj));
            } catch (e) {
                console.error('加载背包数据失败:', e);
            }
        }
    }
    
    // 获取玩家资产统计
    getPlayerAssets(): any {
        const gameManager = (window as any).GameManager?.instance;
        
        return {
            coins: gameManager?.coins || 0,
            level: gameManager?.level || 1,
            inventorySize: this.inventory.size,
            totalItems: Array.from(this.inventory.values()).reduce((sum, qty) => sum + qty, 0)
        };
    }
    
    // 系统引用设置
    setGameManager(gameManager: any) {
        this._gameManager = gameManager;
    }
    
    setUIManager(uiManager: any) {
        this._uiManager = uiManager;
    }
    
    // 获取系统引用
    get gameManager(): any {
        return this._gameManager;
    }
    
    get uiManager(): any {
        return this._uiManager;
    }
    
    // 更新循环
    update(deltaTime: number) {
        // 经济系统定期更新逻辑
    }
}