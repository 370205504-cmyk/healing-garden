import { _decorator, Component } from 'cc';
import { StorageUtil } from './utils/StorageUtil';
import { FLOWER_TYPES, FlowerType } from './FlowerConfig';
const { ccclass } = _decorator;

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    type: 'seed' | 'fertilizer' | 'decoration';
    unlockLevel: number;
    description: string;
}

@ccclass('EconomySystem')
export class EconomySystem extends Component {
    // 商店物品——种子从FlowerConfig同步
    private shopItems: ShopItem[] = [];

    // 玩家背包: itemId -> quantity
    private inventory: Map<string, number> = new Map();

    private _gameManager: any = null;
    private _uiManager: any = null;

    onLoad() {
        this.initShop();
        this.loadInventory();
    }

    /** 初始化商店物品列表 */
    private initShop() {
        this.shopItems = [];

        // 从 FlowerConfig 同步种子
        for (const flower of FLOWER_TYPES) {
            this.shopItems.push({
                id: `seed_${flower.id}`,
                name: `${flower.name}种子`,
                price: flower.price,
                type: 'seed',
                unlockLevel: flower.unlockLevel,
                description: `种植后${Math.round(flower.growthTime / 60)}分钟收获`
            });
        }

        // 肥料和装饰品
        this.shopItems.push(
            { id: 'fertilizer_normal', name: '普通肥料', price: 30, type: 'fertilizer', unlockLevel: 2, description: '加速生长50%' },
            { id: 'fertilizer_advanced', name: '高级肥料', price: 80, type: 'fertilizer', unlockLevel: 4, description: '加速生长100%' },
            { id: 'decoration_bench', name: '花园长椅', price: 100, type: 'decoration', unlockLevel: 3, description: '花园装饰' },
            { id: 'decoration_fountain', name: '喷泉', price: 200, type: 'decoration', unlockLevel: 5, description: '提升花园美观度' }
        );
    }

    /** 获取可购买的商店物品（根据玩家等级） */
    getAvailableShopItems(playerLevel: number): ShopItem[] {
        return this.shopItems.filter(item => item.unlockLevel <= playerLevel);
    }

    /** 获取所有商店物品 */
    getAllShopItems(): ShopItem[] {
        return [...this.shopItems];
    }

    /** 购买物品 */
    buyItem(itemId: string, quantity: number = 1): boolean {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return false;

        const gm = this._gameManager;
        if (!gm) return false;

        // 等级检查
        if (gm.level < item.unlockLevel) {
            this._uiManager?.showMessage(`需要等级 ${item.unlockLevel}`);
            return false;
        }

        const totalCost = item.price * quantity;
        if (!gm.spendCoins(totalCost)) {
            this._uiManager?.showMessage('金币不足！');
            return false;
        }

        // 入背包
        const current = this.inventory.get(itemId) || 0;
        this.inventory.set(itemId, current + quantity);
        this.saveInventory();
        this.node.emit('item-purchased', { item, quantity });
        return true;
    }

    /** 使用/消耗物品 */
    useItem(itemId: string, quantity: number = 1): boolean {
        const current = this.inventory.get(itemId) || 0;
        if (current < quantity) return false;

        this.inventory.set(itemId, current - quantity);
        if (this.inventory.get(itemId)! <= 0) {
            this.inventory.delete(itemId);
        }
        this.saveInventory();
        this.node.emit('item-used', { itemId, quantity });
        return true;
    }

    /** 获取背包中某物品数量 */
    getItemQuantity(itemId: string): number {
        return this.inventory.get(itemId) || 0;
    }

    /** 获取全部背包 */
    getInventory(): Map<string, number> {
        return new Map(this.inventory);
    }

    /** 保存背包 */
    saveInventory() {
        StorageUtil.set('inventory_v2', Object.fromEntries(this.inventory));
    }

    /** 加载背包 */
    loadInventory() {
        const data = StorageUtil.get<Record<string, number>>('inventory_v2');
        if (data) {
            this.inventory = new Map(Object.entries(data));
        }
    }

    /** 获取经济状态摘要 */
    getPlayerAssets(): any {
        return {
            coins: this._gameManager?.coins || 0,
            level: this._gameManager?.level || 1,
            inventorySize: this.inventory.size,
            totalItems: Array.from(this.inventory.values()).reduce((a, b) => a + b, 0)
        };
    }

    setGameManager(gm: any) { this._gameManager = gm; }
    setUIManager(ui: any) { this._uiManager = ui; }

    get gameManager(): any { return this._gameManager; }
    get uiManager(): any { return this._uiManager; }

    update(_deltaTime: number) {}
}
