#!/usr/bin/env python3
"""
创建Cocos Creator项目框架
"""

import os
import json
from pathlib import Path

def create_project_structure():
    project_root = Path(r"D:\AutoHealingGarden\game")
    
    # 创建目录结构
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
        dir_path = project_root / directory
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"创建目录: {directory}")
    
    # 创建GameManager.ts
    game_manager = '''import { _decorator, Component, Node } from 'cc';
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
    
    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        this.initGame();
    }
    
    initGame() {
        console.log('游戏初始化');
        this.loadGameData();
    }
    
    get coins(): number { return this._coins; }
    
    addCoins(amount: number) {
        this._coins += amount;
        this.saveGameData();
        this.node.emit('coins-updated', this._coins);
    }
    
    spendCoins(amount: number): boolean {
        if (this._coins >= amount) {
            this._coins -= amount;
            this.saveGameData();
            this.node.emit('coins-updated', this._coins);
            return true;
        }
        return false;
    }
    
    saveGameData() {
        const data = { coins: this._coins, level: this._level };
        localStorage.setItem('auto_healing_garden', JSON.stringify(data));
    }
    
    loadGameData() {
        const saved = localStorage.getItem('auto_healing_garden');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this._coins = data.coins || 100;
                this._level = data.level || 1;
            } catch (e) {
                console.error('加载失败:', e);
            }
        }
    }
}
'''
    
    with open(project_root / "assets" / "scripts" / "GameManager.ts", 'w', encoding='utf-8') as f:
        f.write(game_manager)
    
    # 创建PlantingSystem.ts
    planting_system = '''import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlantingSystem')
export class PlantingSystem extends Component {
    
    @property(Prefab)
    plantPrefab: Prefab = null;
    
    @property(Node)
    gardenArea: Node = null;
    
    onLoad() {
        if (this.gardenArea) {
            this.gardenArea.on(Node.EventType.TOUCH_END, this.onGardenTap, this);
        }
    }
    
    onGardenTap(event: any) {
        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        
        if (this.canPlantAt(worldPos)) {
            this.plantSeed(1, worldPos);
        }
    }
    
    canPlantAt(position: Vec3): boolean {
        const boundary = 500;
        return Math.abs(position.x) < boundary && Math.abs(position.y) < boundary;
    }
    
    plantSeed(plantTypeId: number, position: Vec3) {
        const plantNode = instantiate(this.plantPrefab);
        plantNode.setPosition(position);
        this.gardenArea.addChild(plantNode);
        
        console.log('种植植物');
        this.node.emit('plant-planted', { plantTypeId, position });
    }
}
'''
    
    with open(project_root / "assets" / "scripts" / "PlantingSystem.ts", 'w', encoding='utf-8') as f:
        f.write(planting_system)
    
    # 创建配置文件
    package_json = {
        "name": "auto-healing-garden",
        "version": "1.0.0",
        "description": "自动治愈花园",
        "main": "main.js",
        "dependencies": {},
        "devDependencies": {}
    }
    
    with open(project_root / "package.json", 'w', encoding='utf-8') as f:
        json.dump(package_json, f, indent=2)
    
    project_json = {
        "engine": "cocos-creator-3d",
        "engine_version": "3.8.8",
        "project_type": "3d",
        "start_scene": "db://assets/scenes/MainScene.fire"
    }
    
    with open(project_root / "project.json", 'w', encoding='utf-8') as f:
        json.dump(project_json, f, indent=2)
    
    tsconfig = {
        "compilerOptions": {
            "target": "es2020",
            "module": "commonjs",
            "lib": ["es2020", "dom"],
            "outDir": "temp",
            "rootDir": "assets",
            "strict": True,
            "esModuleInterop": True,
            "skipLibCheck": True
        },
        "include": ["assets/**/*"]
    }
    
    with open(project_root / "tsconfig.json", 'w', encoding='utf-8') as f:
        json.dump(tsconfig, f, indent=2)
    
    # 创建场景文件
    scene_content = '''{
  "__type__": "cc.SceneAsset",
  "_name": "MainScene",
  "_objFlags": 0,
  "_native": "",
  "scene": {
    "__id__": 1
  }
}'''
    
    with open(project_root / "scenes" / "MainScene.fire", 'w', encoding='utf-8') as f:
        f.write(scene_content)
    
    # 创建README
    readme_content = '''# 自动治愈花园 Cocos Creator 项目

## 项目结构
- `assets/scripts/` - 游戏脚本
- `assets/textures/` - 贴图资源
- `assets/sounds/` - 音效资源
- `scenes/` - 场景文件
- `settings/` - 项目设置

## 核心脚本
1. **GameManager.ts** - 游戏状态管理
2. **PlantingSystem.ts** - 种植系统
3. **GardenSystem.ts** - 花园系统 (待实现)
4. **EconomySystem.ts** - 经济系统 (待实现)
5. **UIManager.ts** - UI管理 (待实现)

## 技术栈
- Cocos Creator 3.8.8
- TypeScript 5.0+
- ES2020

## 启动方式
1. 用Cocos Creator 3.8.8打开本文件夹
2. 运行MainScene场景
3. 开始开发

## 开发状态
- ✅ 项目框架创建完成
- ✅ GameManager基础功能
- ✅ PlantingSystem基础功能
- ⏳ 其他系统待实现
'''
    
    with open(project_root / "README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"✅ Cocos Creator项目框架创建完成")
    print(f"📁 项目目录: {project_root}")
    print(f"📄 核心脚本: GameManager.ts, PlantingSystem.ts")
    print(f"⚙️ 配置文件: package.json, project.json, tsconfig.json")
    print(f"🎮 场景文件: MainScene.fire")
    
    return True

if __name__ == "__main__":
    create_project_structure()