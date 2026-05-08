import { _decorator, Component, Node, Vec3 } from 'cc';
import { StorageUtil } from './utils/StorageUtil';
const { ccclass, property } = _decorator;

@ccclass('GardenSystem')
export class GardenSystem extends Component {
    
    @property(Node)
    gardenLayout: Node = null;
    
    // 花园区域
    private gardenAreas = [
        { id: 1, name: '前院', unlocked: true, plantLimit: 5 },
        { id: 2, name: '后院', unlocked: false, plantLimit: 10 },
        { id: 3, name: '温室', unlocked: false, plantLimit: 15 },
        { id: 4, name: '屋顶花园', unlocked: false, plantLimit: 20 }
    ];
    
    // 装饰品
    private decorations: any[] = [];
    
    // 系统引用
    private _gameManager: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;
    
    onLoad() {
        this.initGarden();
    }
    
    initGarden() {
        // 加载已解锁的花园区域
        this.loadUnlockedAreas();
    }
    
    // 加载已解锁的区域
    loadUnlockedAreas() {
        const unlocked = this.gardenAreas.filter(area => area.unlocked);
        console.log(`已解锁花园区域: ${unlocked.map(a => a.name).join(', ')}`);
    }
    
    // 解锁新区域
    unlockArea(areaId: number): boolean {
        const area = this.gardenAreas.find(a => a.id === areaId);
        if (!area || area.unlocked) return false;
        
        // 检查解锁条件（例如：达到特定等级、花费金币）
        area.unlocked = true;
        
        // 触发解锁事件
        this.node.emit('area-unlocked', area);
        
        console.log(`解锁新区域: ${area.name}`);
        return true;
    }
    
    // 获取所有花园区域
    getAllAreas(): any[] {
        return [...this.gardenAreas];
    }
    
    // 获取已解锁区域
    getUnlockedAreas(): any[] {
        return this.gardenAreas.filter(area => area.unlocked);
    }
    
    // 获取区域信息
    getAreaInfo(areaId: number): any {
        return this.gardenAreas.find(a => a.id === areaId);
    }
    
    // 添加装饰品
    addDecoration(decorationType: string, position: Vec3): any {
        const decoration = {
            id: Date.now(),
            type: decorationType,
            position: position,
            addedAt: Date.now()
        };
        
        this.decorations.push(decoration);
        
        // 触发装饰品添加事件
        this.node.emit('decoration-added', decoration);
        
        return decoration;
    }
    
    // 移除装饰品
    removeDecoration(decorationId: number): boolean {
        const index = this.decorations.findIndex(d => d.id === decorationId);
        if (index === -1) return false;
        
        const decoration = this.decorations[index];
        this.decorations.splice(index, 1);
        
        this.node.emit('decoration-removed', decoration);
        return true;
    }
    
    // 获取所有装饰品
    getAllDecorations(): any[] {
        return [...this.decorations];
    }
    
    // 计算花园美观度
    calculateBeautyScore(): number {
        let score = 0;
        
        // 基础分数
        score += this.getUnlockedAreas().length * 10;
        
        // 装饰品分数
        score += this.decorations.length * 5;
        
        // 植物多样性加分（需要与种植系统交互）
        // 这里可以添加更复杂的逻辑
        
        return score;
    }
    
    // 获取花园统计信息
    getGardenStats(): any {
        return {
            unlockedAreas: this.getUnlockedAreas().length,
            totalAreas: this.gardenAreas.length,
            decorationsCount: this.decorations.length,
            beautyScore: this.calculateBeautyScore()
        };
    }
    
    // 保存花园数据
    saveGardenData() {
        StorageUtil.set('garden_data', {
            unlockedAreas: this.gardenAreas.filter(a => a.unlocked).map(a => a.id),
            decorations: this.decorations
        });
    }
    
    // 加载花园数据
    loadGardenData() {
        const data = StorageUtil.get<{
            unlockedAreas?: number[];
            decorations?: any[];
        }>('garden_data');
        if (data) {
            try {
                // 解锁区域
                data.unlockedAreas?.forEach((areaId: number) => {
                    const area = this.gardenAreas.find(a => a.id === areaId);
                    if (area) area.unlocked = true;
                });

                // 加载装饰品
                this.decorations = data.decorations || [];
            } catch (e) {
                console.error('加载花园数据失败:', e);
            }
        }
    }
    
    // 系统引用设置
    setGameManager(gameManager: any) {
        this._gameManager = gameManager;
    }
    
    setEconomySystem(economySystem: any) {
        this._economySystem = economySystem;
    }
    
    setUIManager(uiManager: any) {
        this._uiManager = uiManager;
    }
    
    // 获取系统引用
    get gameManager(): any {
        return this._gameManager;
    }
    
    get economySystem(): any {
        return this._economySystem;
    }
    
    get uiManager(): any {
        return this._uiManager;
    }
    
    // 更新循环
    update(deltaTime: number) {
        // 花园系统定期更新逻辑
    }
}