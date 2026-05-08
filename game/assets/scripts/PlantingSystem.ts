import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlantingSystem')
export class PlantingSystem extends Component {
    
    @property(Prefab)
    plantPrefab: Prefab = null;
    
    @property(Node)
    gardenArea: Node = null;
    
    // 系统引用
    private _gameManager: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;
    
    // 植物类型定义
    private plantTypes = [
        { id: 1, name: '向日葵', growTime: 10, value: 10, unlockLevel: 1 },
        { id: 2, name: '玫瑰花', growTime: 20, value: 20, unlockLevel: 2 },
        { id: 3, name: '仙人掌', growTime: 15, value: 15, unlockLevel: 3 },
        { id: 4, name: '幸运草', growTime: 5, value: 5, unlockLevel: 1 }
    ];
    
    // 当前种植的植物
    private plants: any[] = [];
    
    onLoad() {
        // 初始化种植区域点击事件
        this.initPlantingArea();
    }
    
    initPlantingArea() {
        if (this.gardenArea) {
            this.gardenArea.on(Node.EventType.TOUCH_END, this.onGardenTap, this);
        }
    }
    
    // 花园区域点击
    onGardenTap(event: any) {
        const touchPos = event.getUILocation();
        // 转换坐标
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        
        // 检查是否有空位
        if (this.canPlantAt(worldPos)) {
            this.plantSeed(1, worldPos); // 种植向日葵
        }
    }
    
    // 检查是否可以种植
    canPlantAt(position: Vec3): boolean {
        // 简单检查：位置是否在边界内
        const boundary = 500;
        return Math.abs(position.x) < boundary && Math.abs(position.y) < boundary;
    }
    
    // 种植种子
    plantSeed(plantTypeId: number, position: Vec3) {
        const plantType = this.plantTypes.find(p => p.id === plantTypeId);
        if (!plantType) return;
        
        // 创建植物节点
        const plantNode = instantiate(this.plantPrefab);
        plantNode.setPosition(position);
        this.gardenArea.addChild(plantNode);
        
        // 设置植物数据
        const plantData = {
            id: Date.now(),
            typeId: plantTypeId,
            name: plantType.name,
            position: position,
            growTime: plantType.growTime,
            value: plantType.value,
            growthStage: 0, // 0-3
            plantedAt: Date.now(),
            isMature: false,
            node: plantNode
        };
        
        this.plants.push(plantData);
        
        // 开始生长
        this.startGrowth(plantData);
        
        // 触发种植事件
        this.node.emit('plant-planted', plantData);
        
        console.log(`种植了${plantType.name}，生长时间：${plantType.growTime}秒`);
    }
    
    // 开始生长
    startGrowth(plantData: any) {
        const growthStages = 3;
        const stageTime = plantData.growTime / growthStages * 1000; // 毫秒
        
        let currentStage = 0;
        
        const grow = () => {
            if (currentStage < growthStages) {
                currentStage++;
                plantData.growthStage = currentStage;
                
                // 更新植物外观
                this.updatePlantAppearance(plantData);
                
                // 触发生长事件
                this.node.emit('plant-grown', plantData);
                
                // 继续下一阶段
                setTimeout(grow, stageTime);
            } else {
                // 完全成熟
                plantData.isMature = true;
                this.node.emit('plant-mature', plantData);
            }
        };
        
        // 开始生长计时器
        setTimeout(grow, stageTime);
    }
    
    // 更新植物外观
    updatePlantAppearance(plantData: any) {
        const plantNode = plantData.node;
        if (!plantNode) return;
        
        // 根据生长阶段调整大小
        const scale = 0.5 + (plantData.growthStage * 0.5 / 3);
        plantNode.setScale(scale, scale, scale);
        
        // 可以添加更多视觉效果
    }
    
    // 收获植物
    harvestPlant(plantId: number) {
        const index = this.plants.findIndex(p => p.id === plantId);
        if (index === -1) return null;
        
        const plant = this.plants[index];
        
        if (!plant.isMature) {
            console.log('植物还未成熟');
            return null;
        }
        
        // 移除植物
        if (plant.node) {
            plant.node.destroy();
        }
        
        this.plants.splice(index, 1);
        
        // 触发收获事件
        this.node.emit('plant-harvested', plant);
        
        return plant;
    }
    
    // 获取所有植物
    getAllPlants(): any[] {
        return [...this.plants];
    }
    
    // 获取成熟植物数量
    getMaturePlantsCount(): number {
        return this.plants.filter(p => p.isMature).length;
    }
    
    // 浇水
    waterPlant(plantId: number) {
        const plant = this.plants.find(p => p.id === plantId);
        if (plant) {
            // 减少生长时间
            plant.growTime = Math.max(1, plant.growTime - 2);
            this.node.emit('plant-watered', plant);
        }
    }
    
    // 获取植物类型列表
    getPlantTypes() {
        return [...this.plantTypes];
    }
    
    // 根据等级获取可种植的植物
    getAvailablePlants(level: number) {
        return this.plantTypes.filter(plant => plant.unlockLevel <= level);
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
        // 可以添加种植系统的定期更新逻辑
        // 例如：检查植物生长状态、自动收获等
    }
}
