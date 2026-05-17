/**
 * GardenBootstrapper.ts — 游戏系统自动组装器
 *
 * 用法：在场景中找一个空节点挂上此组件。
 * 启动时会自动扫描场景中的 PlotSystem/UIManager/GameManager 等，
 * 将所有系统引用串联起来。并自动创建 UI 元素。
 *
 * 零编辑器配置，挂上即跑。
 */

import { _decorator, Component, Node, director } from 'cc';
import { GameManager } from './GameManager';
import { PlotSystem } from './PlotSystem';
import { UIManager } from './UIManager';
import { EconomySystem } from './EconomySystem';
import { GardenSystem } from './GardenSystem';
import { PlantingSystem } from './PlantingSystem';
import { UISetupHelper } from './UISetupHelper';
const { ccclass, property } = _decorator;

@ccclass('GardenBootstrapper')
export class GardenBootstrapper extends Component {

    @property
    autoWire: boolean = true;

    @property
    autoCreateUI: boolean = true;

    start() {
        if (this.autoWire) this.wireSystems();
    }

    private wireSystems() {
        console.log('[Bootstrapper] 开始组装...');

        const gm = GameManager.instance;
        if (!gm) { console.warn('[Bootstrapper] GameManager 未找到'); return; }

        const ps = this.findCom(PlotSystem);
        if (ps) { gm.setPlotSystem(ps); ps.setGameManager(gm); }

        const ui = this.findCom(UIManager);
        if (ui) { gm.setUIManager(ui); ui.setGameManager(gm); if (ps) ui.setPlotSystem(ps); }

        const ec = this.findCom(EconomySystem);
        if (ec) { gm.setEconomySystem(ec); ec.setGameManager(gm); if (ui) ec.setUIManager(ui); if (ps) ps.setEconomySystem(ec); }

        const gs = this.findCom(GardenSystem);
        if (gs) { gm.setGardenSystem(gs); gs.setGameManager(gm); gs.setUIManager(ui); gs.setEconomySystem(ec); }

        const pl = this.findCom(PlantingSystem);
        if (pl) { gm.setPlantingSystem(pl); pl.setGameManager(gm); pl.setUIManager(ui); pl.setEconomySystem(ec); }

        if (this.autoCreateUI) {
            const h = this.node.getComponent(UISetupHelper) || this.node.addComponent(UISetupHelper);
            h.setUIManager(ui);
            h.createUI();
        }

        gm.initializeGame();
        console.log('[Bootstrapper] 组装完毕 ✓');
    }

    private findCom<T extends Component>(t: new (...a: any[]) => T): T | null {
        const scene = director.getScene();
        if (!scene) return null;
        const walk = (n: Node): T | null => {
            const c = n.getComponent(t); if (c) return c;
            for (const ch of n.children) { const f = walk(ch); if (f) return f; }
            return null;
        };
        return walk(scene);
    }
}
