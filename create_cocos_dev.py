#!/usr/bin/env python3
"""
为Cocos开发工程师岗位创建基础脚本
"""

import os
import json
from pathlib import Path

def create_cocos_dev_scripts():
    project_root = Path(r"D:\AutoHealingGarden")
    role_dir = project_root / "automation" / "roles" / "cocos-dev"
    role_dir.mkdir(parents=True, exist_ok=True)
    
    # 创建 __init__.py
    init_content = '''"""
Cocos开发工程师自动化脚本
岗位ID: cocos-dev
描述: 负责前端功能开发、性能优化
"""

__version__ = "1.0.0"
__author__ = "AutoHealingGarden Team"
'''
    
    with open(role_dir / "__init__.py", 'w', encoding='utf-8') as f:
        f.write(init_content)
    
    # 创建 config.json
    config_content = {
        "role_id": "cocos-dev",
        "role_name": "Cocos开发工程师",
        "description": "负责前端功能开发、性能优化",
        "dependencies": ["tech-director", "ui-designer"],
        "outputs": ["assets/scripts/", "docs/technical/code_documentation.md"],
        "time_estimate": 3.0,
        "cost_estimate": 0.6,
        "created_at": "2026-04-06",
        "version": "1.0.0"
    }
    
    with open(role_dir / "config.json", 'w', encoding='utf-8') as f:
        json.dump(config_content, f, indent=2, ensure_ascii=False)
    
    # 创建 main.py
    main_content = '''#!/usr/bin/env python3
"""
Cocos开发工程师主脚本
岗位: Cocos开发工程师 (cocos-dev)
"""

import os
import sys
import json
import logging
from datetime import datetime

class CocosDevRole:
    """Cocos开发工程师自动化类"""
    
    def __init__(self, project_root):
        self.project_root = project_root
        self.role_id = "cocos-dev"
        self.role_name = "Cocos开发工程师"
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志"""
        log_dir = os.path.join(self.project_root, "outputs", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, f"{self.role_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(self.role_name)
    
    def load_config(self):
        """加载岗位配置"""
        config_file = os.path.join(self.project_root, "automation", "roles", self.role_id, "config.json")
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def execute(self):
        """执行岗位任务"""
        self.logger.info("开始执行岗位: Cocos开发工程师")
        
        try:
            # 加载配置
            config = self.load_config()
            
            # 检查依赖
            dependencies = config.get("dependencies", [])
            if dependencies:
                self.logger.info(f"岗位依赖: {', '.join(dependencies)}")
            
            # 执行具体任务 - 创建Cocos Creator项目框架
            result = self.create_cocos_project()
            
            # 生成输出
            outputs = config.get("outputs", [])
            self.generate_outputs(outputs, result)
            
            self.logger.info("岗位执行完成: Cocos开发工程师")
            return {
                "success": True,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "execution_time": datetime.now().isoformat(),
                "outputs": outputs,
                "cocos_project_created": True,
                "project_path": str(self.project_root / "game")
            }
            
        except Exception as e:
            self.logger.error(f"岗位执行失败: {str(e)}")
            return {
                "success": False,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "error": str(e),
                "execution_time": datetime.now().isoformat()
            }
    
    def create_cocos_project(self):
        """创建Cocos Creator项目"""
        self.logger.info("开始创建Cocos Creator项目框架")
        
        # 项目目录
        game_dir = self.project_root / "game"
        game_dir.mkdir(exist_ok=True)
        
        # 创建Cocos Creator项目结构
        self.create_cocos_structure(game_dir)
        
        # 创建核心脚本
        self.create_core_scripts(game_dir)
        
        # 创建场景文件
        self.create_scene_files(game_dir)
        
        # 创建配置文件
        self.create_config_files(game_dir)
        
        self.logger.info("Cocos Creator项目框架创建完成")
        return {
            "project_created": True,
            "game_dir": str(game_dir),
            "timestamp": datetime.now().isoformat()
        }
    
    def create_cocos_structure(self, game_dir):
        """创建Cocos项目目录结构"""
        directories = [
            "assets",
            "assets/scripts",
            "assets/textures",
            "assets/sounds",
            "assets/prefabs",
            "scenes",
            "settings",
            "build"
        ]
        
        for directory in directories:
            dir_path = game_dir / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            self.logger.info(f"创建目录: {directory}")
    
    def create_core_scripts(self, game_dir):
        """创建核心TypeScript脚本"""
        scripts = {
            "GameManager.ts": self.get_game_manager_script(),
            "PlantingSystem.ts": self.get_planting_system_script(),
            "GardenSystem.ts": self.get_garden_system_script(),
            "EconomySystem.ts": self.get_economy_system_script(),
            "UIManager.ts": self.get_ui_manager_script()
        }
        
        for filename, content in scripts.items():
            script_path = game_dir / "assets" / "scripts" / filename
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.logger.info(f"创建脚本: {filename}")
    
    def create_scene_files(self, game_dir):
        """创建场景文件"""
        scene_content = '''{
  "__type__": "cc.SceneAsset",
  "_name": "MainScene",
  "_objFlags": 0,
  "_native": "",
  "scene": {
    "__id__": 1
  }
}'''
        
        scene_path = game_dir / "scenes" / "MainScene.fire"
        with open(scene_path, 'w', encoding='utf-8') as f:
            f.write(scene_content)
        self.logger.info("创建场景: MainScene.fire")
    
    def create_config_files(self, game_dir):
        """创建配置文件"""
        # package.json
        package_json = {
            "name": "auto-healing-garden",
            "version": "1.0.0",
            "description": "自动治愈花园 - 竖屏休闲解压种植游戏",
            "main": "main.js",
            "dependencies": {},
            "devDependencies": {}
        }
        
        with open(game_dir / "package.json", 'w', encoding='utf-8') as f:
            json.dump(package_json, f, indent=2)
        
        # project.json
        project_json = {
            "engine": "cocos-creator-3d",
            "engine_version": "3.8.8",
            "project_type": "3d",
            "start_scene": "db://assets/scenes/MainScene.fire"
        }
        
        with open(game_dir / "project.json", 'w', encoding='utf-8') as f:
            json.dump(project_json, f, indent=2)
        
        # tsconfig.json
        tsconfig = {
            "compilerOptions": {
                "target": "es2020",
                "module": "commonjs",
                "lib": ["es2020", "dom"],
                "outDir": "temp",
                "rootDir": "assets",
                "strict": True,
                "esModuleInterop": True,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true
            },
            "include": ["assets/**/*"]
        }
        
        with open(game_dir / "tsconfig.json", 'w', encoding='utf-8') as f:
            json.dump(tsconfig, f, indent=2)
        
        self.logger.info("创建配置文件: package.json, project.json, tsconfig.json")
    
    def get_game_manager_script(self):
        return '''import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
    private static _instance: GameManager;
    
    public static get instance(): GameManager {
        return GameManager._instance;
    }
    
    // 游戏状态
    private _coins: number = 100;
    private _level: number = 1;
    private _experience: number = 0;
    
    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        
        // 初始化游戏
        this.initGame();
    }
    
    initGame() {
        console.log('游戏初始化');
        // 加载保存数据
        this.loadGameData();
    }
    
    // 获取金币
    get coins(): number {
        return this._coins;
    }
    
    // 增加金币
    addCoins(amount: number) {
        this._coins += amount;
        this.saveGameData();
        // 触发金币更新事件
        this.node.emit('coins-updated', this._coins);
    }
    
    // 消耗金币
    spendCoins(amount: number): boolean {
        if (this._coins >= amount) {
            this._coins -= amount;
            this.saveGameData();
            this.node.emit('coins-updated', this._coins);
            return true;
        }
        return false;
    }
    
    // 增加经验
    addExperience(exp: number) {
        this._experience += exp;
        // 升级逻辑
        const expRequired = this._level * 100;
        if (this._experience >= expRequired) {
            this._level++;
            this._experience = 0;
            this.node.emit('level-up', this._level);
        }
        this.saveGameData();
    }
    
    // 获取等级
    get level(): number {
        return this._level;
    }
    
    // 获取经验
    get experience(): number {
        return this._experience;
    }
    
    // 保存游戏数据
    saveGameData() {
        const data = {
            coins: this._coins,
            level: this._level,
            experience: this._experience
        };
        localStorage.setItem('auto_healing_garden', JSON.stringify(data));
    }
    
    // 加载游戏数据
    loadGameData() {
        const saved = localStorage.getItem('auto_healing_garden');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this._coins = data.coins || 100;
                this._level = data.level || 1;
                this._experience = data.experience || 0;
            } catch (e) {
                console.error('加载游戏数据失败:', e);
            }
        }
    }
    
    // 重置游戏
    resetGame() {
        this._coins = 100;
        this._level = 1;
        this._experience = 0;
        this.saveGameData();
        this.node.emit('game-reset');
    }
}
'''
    
    def get_planting_system_script(self):
        return '''import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlantingSystem')
export class PlantingSystem extends Component {
    
    @property(Prefab)
    plantPrefab: Prefab = null;
    
    @property(Node)
    gardenArea: Node = null;
    
    // 植物类型
    private plantTypes = [
        { id: 1, name: '向日葵', growTime: 10, value: 10 },
        { id: 2, name: '玫瑰花', growTime: 20, value: 20 },
        { id: 3, name: '仙人掌', growTime: 15, value: 15 },
        { id: 4, name: '幸运草', growTime: 5, value: 5 }
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
}
'''
    
    def get_garden_system_script(self):
        return '''import { _decorator, Component, Node, Vec3 } from 'cc';
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
        
        // 植物多样性加分
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
        const data = {
            unlockedAreas: this.gardenAreas.filter(a => a.unlocked).map(a => a.id),
            decorations: this.decorations
        };
        localStorage.setItem('garden_data', JSON.stringify(data));
    }
    
    // 加载花园数据
    loadGardenData() {
        const saved = localStorage.getItem('garden_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
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
}
'''
    
    def get_economy_system_script(self):
        return '''import { _decorator, Component, Node } from 'cc';
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
        localStorage.setItem('inventory', JSON.stringify(inventoryObj));
    }
    
    // 加载背包数据
    loadInventory() {
        const saved = localStorage.getItem('inventory');
        if (saved) {
            try {
                const inventoryObj = JSON.parse(saved);
                this.inventory = new Map(Object.entries(inventoryObj).map(([k, v]) => [parseInt(k), v as number]));
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
}
'''
    
    def get_ui_manager_script(self):
        return '''import { _decorator, Component, Node, Label, ProgressBar, Sprite, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    
    // UI组件引用
    @property(Label)
    coinsLabel: Label = null;
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(ProgressBar)
    expProgress: ProgressBar = null;
    
    @property(Label)
    expLabel: Label = null;
    
    @property(Node)
    shopPanel: Node = null;
    
    @property(Node)
    inventoryPanel: Node = null;
    
    @property(Node)
    gardenPanel: Node = null;
    
    @property(Button)
    shopButton: Button = null;
    
    @property(Button)
    inventoryButton: Button = null;
    
    @property(Button)
    gardenButton: Button = null;
    
    // 当前激活的面板
    private activePanel: Node = null;
    
    onLoad() {
        this.initUI();
        this.setupEventListeners();
        
        // 默认显示花园面板
        this.showPanel(this.gardenPanel);
    }
    
    initUI() {
        // 初始化UI状态
        this.updateCoins(100);
        this.updateLevel(1, 0, 100);
    }
    
    setupEventListeners() {
        // 按钮点击事件
        if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.shopPanel);
            });
        }
        
        if (this.inventoryButton) {
            this.inventoryButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.inventoryPanel);
            });
        }
        
        if (this.gardenButton) {
            this.gardenButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.gardenPanel);
            });
        }
        
        // 监听游戏事件
        const gameManager = (window as any).GameManager?.instance;
        if (gameManager) {
            gameManager.node.on('coins-updated', this.updateCoins, this);
            gameManager.node.on('level-up', this.updateLevel, this);
        }
    }
    
    // 更新金币显示
    updateCoins(coins: number) {
        if (this.coinsLabel) {
            this.coinsLabel.string = `金币: ${coins}`;
        }
    }
    
    // 更新等级显示
    updateLevel(level: number, currentExp: number, maxExp: number) {
        if (this.levelLabel) {
            this.levelLabel.string = `等级: ${level}`;
        }
        
        if (this.expProgress) {
            this.expProgress.progress = currentExp / maxExp;
        }
        
        if (this.expLabel) {
            this.expLabel.string = `${currentExp}/${maxExp}`;
        }
    }
    
    // 显示面板
    showPanel(panel: Node) {
        // 隐藏当前面板
        if (this.activePanel) {
            this.activePanel.active = false;
        }
        
        // 显示新面板
        if (panel) {
            panel.active = true;
            this.activePanel = panel;
        }
    }
    
    // 显示消息提示
    showMessage(text: string, duration: number = 2) {
        // 这里可以实现一个消息提示系统
        console.log(`UI消息: ${text}`);
        
        // 可以创建一个临时的消息节点
        // 暂时用控制台输出代替
    }
    
    // 显示确认对话框
    showConfirm(message: string, onConfirm: Function, onCancel: Function = null) {
        // 这里可以实现一个确认对话框
        console.log(`确认对话框: ${message}`);
        
        // 简单实现：直接调用确认函数
        if (confirm(message)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
    }
    
    // 更新商店UI
    updateShopUI(shopItems: any[]) {
        // 更新商店物品列表
        // 这里可以实现动态生成商店物品UI
        console.log(`更新商店UI，物品数量: ${shopItems.length}`);
    }
    
    // 更新背包UI
    updateInventoryUI(inventory: Map<number, number>) {
        // 更新背包物品列表
        console.log(`更新背包UI，物品种类: ${inventory.size}`);
    }
    
    // 显示加载界面
    showLoading(show: boolean, message: string = '加载中...') {
        // 显示或隐藏加载界面
        if (show) {
            console.log(`显示加载界面: ${message}`);
        } else {
            console.log('隐藏加载界面');
        }
    }
}
'''
    
    def generate_outputs(self, outputs, result):
        """生成输出文件"""
        for output in outputs:
            output_path = os.path.join(self.project_root, output)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            if output.endswith('.json'):
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
            elif output.endswith('.md'):
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(f"# Cocos开发工程师输出报告\\n\\n")
                    f.write(f"生成时间: {datetime.now().isoformat()}\\n\\n")
                    f.write(f"执行结果: {json.dumps(result, indent=2, ensure_ascii=False)}\\n")
            elif output.endswith('/'):
                # 如果是目录，创建目录
                os.makedirs(output_path, exist_ok=True)
                # 在目录中创建完成标记
                marker_file = os.path.join(output_path, f".{self.role_id}_complete.txt")
                with open(marker_file, 'w', encoding='utf-8') as f:
                    f.write(f"{self.role_name} 完成于 {datetime.now().isoformat()}")
            
            self.logger.info(f"生成输出: {output}")

def main():
    """主函数"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    role = CocosDevRole(project_root)
    result = role.execute()
    
    # 输出结果
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 根据结果返回退出码
    sys.exit(0 if result.get("success") else 1)

if __name__ == "__main__":
    main()
'''
    
    with open(role_dir / "main.py", 'w', encoding='utf-8') as f:
        f.write(main_content)
    
    # 创建 requirements.txt
    requirements_content = '''# Cocos开发工程师岗位依赖包
# 根据实际需要添加
'''
    
    with open(role_dir / "requirements.txt", 'w', encoding='utf-8') as f:
        f.write(requirements_content)
    
    # 创建 README.md
    readme_content = '''# Cocos开发工程师 (cocos-dev)

## 岗位描述
负责前端功能开发、性能优化

## 职责范围
- 自动化执行Cocos Creator项目创建和核心脚本开发
- 生成游戏核心代码和文档
- 遵守三级验收流程
- 严格控制成本

## 输入依赖
- `tech-director` (技术总监)
- `ui-designer` (UI/UX设计师)

## 输出产物
- `assets/scripts/` - 游戏脚本目录
- `docs/technical/code_documentation.md` - 代码文档

## 执行命令
```bash
python main.py
```

## 配置说明
配置文件: `config.json`
- `role_id`: cocos-dev
- `role_name`: Cocos开发工程师
- `dependencies`: ["tech-director", "ui-designer"]
- `outputs`: ["assets/scripts/", "docs/technical/code_documentation.md"]
- `time_estimate`: 3.0小时
- `cost_estimate`: 0.6元

## 验收标准
1. 成功创建Cocos Creator项目框架
2. 生成所有核心游戏脚本
3. 无错误或异常
4. 成本控制在预算范围内

## 日志位置
`outputs/logs/cocos-dev_*.log`
'''
    
    with open(role_dir / "README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"✅ 成功创建Cocos开发工程师岗位脚本")
    print(f"📁 目录: {role_dir}")
    
    return True

if __name__ == "__main__":
    create_cocos_dev_scripts()