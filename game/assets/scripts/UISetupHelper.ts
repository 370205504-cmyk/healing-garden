/**
 * UISetupHelper.ts — 运行时 UI 自动创建器
 *
 * 场景必须已有 Canvas 节点（新场景默认包含）。
 * start() 时自动创建顶部栏 + 底部栏并绑定到 UIManager。
 */

import { _decorator, Component, Node, Label, Button, ProgressBar, Sprite, Color, UITransform, v3, Vec3 } from 'cc';
import { UIManager } from './UIManager';
import { THEME } from './PlotSystem';
const { ccclass, property } = _decorator;

const W = 750;
const H = 1334;

@ccclass('UISetupHelper')
export class UISetupHelper extends Component {

    @property autoCreate: boolean = true;

    private _uiManager: UIManager | null = null;
    private _created = false;

    start() { if (this.autoCreate) this.createUI(); }
    setUIManager(ui: UIManager) { this._uiManager = ui; }

    createUI() {
        if (this._created) return;
        this._created = true;

        const canvas = this.node.scene?.getChildByName('Canvas');
        if (!canvas) { console.warn('[UIHelper] 场景无 Canvas'); return; }

        const topBar = this.createTopBar();
        canvas.addChild(topBar);

        const bottomBar = this.createBottomBar();
        canvas.addChild(bottomBar);

        if (this._uiManager || this.findUI()) this.bindUI(topBar, bottomBar);
        console.log('[UIHelper] UI 创建完成 ✓');
    }

    private createTopBar(): Node {
        const bar = new Node('AutoTopBar');
        this.addRect(bar, new Color(255,255,255,210), W, 80, v3(0, H/2-40, 0));

        const c = this.mkLabel('coinsLabel', '💰 100', 24, new Color(255,215,0));
        c.setPosition(v3(0, H/2-30, 0)); bar.addChild(c);

        const l = this.mkLabel('levelLabel', 'Lv.1', 20, THEME.textGreen);
        l.setPosition(v3(-120, H/2-20, 0)); bar.addChild(l);

        const p = this.mkProgress('expProgress', H/2-44, 180, 12);
        bar.addChild(p);

        const e = this.mkLabel('expLabel', '0/100', 12, THEME.textGray);
        e.setPosition(v3(-120, H/2-58, 0)); bar.addChild(e);

        return bar;
    }

    private createBottomBar(): Node {
        const bar = new Node('AutoBottomBar');
        this.addRect(bar, new Color(245,245,220,230), W, 100, v3(0, -(H/2-50), 0));
        this.mkBtn(bar, 'shopButton', '🏪 商店', 0, -(H/2-50), 140, 50);
        this.mkBtn(bar, 'gardenButton', '🌱 花园', -150, -(H/2-50), 140, 50);
        this.mkBtn(bar, 'inventoryButton', '🎒 背包', 150, -(H/2-50), 140, 50);
        return bar;
    }

    private mkLabel(n: string, t: string, s: number, c: Color): Node {
        const node = new Node(n);
        const l = node.addComponent(Label); l.string = t; l.fontSize = s; l.color = c;
        node.addComponent(UITransform).setContentSize(200, s+8);
        return node;
    }

    private mkProgress(n: string, y: number, w: number, h: number): Node {
        const node = new Node(n);
        node.setPosition(v3(-120, y, 0));
        node.addComponent(UITransform).setContentSize(w, h);
        node.addComponent(Sprite).color = new Color(220,220,220);
        const fn = new Node('Fill');
        node.addChild(fn);
        fn.addComponent(UITransform).setContentSize(w, h);
        fn.setPosition(v3(-w/2, 0, 0));
        fn.addComponent(Sprite).color = THEME.gold;
        const bar = node.addComponent(ProgressBar);
        bar.barSprite = fn.getComponent(Sprite)!;
        bar.totalLength = w; bar.type = ProgressBar.Type.FILLED;
        return node;
    }

    private mkBtn(p: Node, name: string, text: string, x: number, y: number, w: number, h: number) {
        const n = new Node(name); p.addChild(n);
        n.setPosition(v3(x, y, 0));
        n.addComponent(UITransform).setContentSize(w, h);
        const sp = n.addComponent(Sprite); sp.color = THEME.textGreen; sp.type = Sprite.Type.SIMPLE;
        const lb = new Node('L'); n.addChild(lb);
        const l = lb.addComponent(Label); l.string = text; l.fontSize = 22; l.color = Color.WHITE;
        lb.addComponent(UITransform).setContentSize(w, h);
        n.addComponent(Button);
    }

    private addRect(p: Node, c: Color, w: number, h: number, pos: Vec3) {
        const n = new Node('BG'); p.addChild(n);
        n.setPosition(pos);
        n.addComponent(UITransform).setContentSize(w, h);
        n.addComponent(Sprite).color = c;
    }

    private findUI(): UIManager | null {
        if (this._uiManager) return this._uiManager;
        const scene = this.node.scene; if (!scene) return null;
        const w = (n: Node): UIManager | null => { const c = n.getComponent(UIManager); if (c) return c; for (const ch of n.children) { const f = w(ch); if (f) return f; } return null; };
        this._uiManager = w(scene); return this._uiManager;
    }

    private bindUI(top: Node, bottom: Node) {
        const ui = this._uiManager!;
        const lb = (n: string) => top.getChildByName(n)?.getComponent(Label) || null;
        const pg = (n: string) => top.getChildByName(n)?.getComponent(ProgressBar) || null;
        const bt = (n: string) => bottom.getChildByName(n)?.getComponent(Button) || null;
        const u = ui as any;
        u.coinsLabel = lb('coinsLabel'); u.levelLabel = lb('levelLabel');
        u.expProgress = pg('expProgress'); u.expLabel = lb('expLabel');
        u.shopButton = bt('shopButton'); u.inventoryButton = bt('inventoryButton'); u.gardenButton = bt('gardenButton');
        const on = (n: string, cb: () => void) => { const b = u[n]; if (b) b.node.on(Button.EventType.CLICK, cb); };
        on('shopButton', () => u.showPanel?.(u.shopPanel));
        on('inventoryButton', () => u.showPanel?.(u.inventoryPanel));
        on('gardenButton', () => u.showPanel?.(u.gardenPanel));
        console.log('[UIHelper] UI 绑定完成');
    }
}
