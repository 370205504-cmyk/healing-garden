import { _decorator, Component, Node } from 'cc';
import { FlowerData, FLOWER_TYPES, getFlowerType, FlowerType } from './FlowerConfig';
const { ccclass, property } = _decorator;

@ccclass('PlantingSystem')
export class PlantingSystem extends Component {
    private _gameManager: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;

    /** 获取当前等级可用的花卉列表 */
    getAvailableFlowers(playerLevel: number): FlowerType[] {
        return FLOWER_TYPES.filter(f => f.unlockLevel <= playerLevel);
    }

    /** 检查玩家是否可以种植该花卉 */
    canPlant(flowerTypeId: string, plotEmpty: boolean): boolean {
        if (!plotEmpty) {
            this._uiManager?.showMessage('该地块已被占用！');
            return false;
        }

        const flowerType = getFlowerType(flowerTypeId);
        if (!flowerType) {
            this._uiManager?.showMessage('未知的花卉类型！');
            return false;
        }

        const playerLevel = this._gameManager?.level ?? 1;
        if (playerLevel < flowerType.unlockLevel) {
            this._uiManager?.showMessage(`需要等级 ${flowerType.unlockLevel} 才能种植 ${flowerType.name}`);
            return false;
        }

        return true;
    }

    /** 获取花卉类型信息（给UI用） */
    getFlowerInfo(typeId: string): FlowerType | undefined {
        return getFlowerType(typeId);
    }

    /** 获取所有花卉类型 */
    getAllFlowerTypes(): FlowerType[] {
        return [...FLOWER_TYPES];
    }

    setGameManager(gm: any) { this._gameManager = gm; }
    setEconomySystem(es: any) { this._economySystem = es; }
    setUIManager(ui: any) { this._uiManager = ui; }

    get gameManager(): any { return this._gameManager; }
    get economySystem(): any { return this._economySystem; }
    get uiManager(): any { return this._uiManager; }

    update(deltaTime: number) {}
}
