/**
 * FlowerVisual.ts — 花卉图形渲染组件
 *
 * 使用 Cocos Creator Graphics 组件绘制简易花卉形状
 * 替代 Canvas 2D 的 drawClover/drawDandelion/drawGrowingFlower/drawBloomFlower
 *
 * 设计：纯渲染层，不持有游戏状态
 * 输入：flowerType + growthProgress → 绘制对应阶段的花卉
 */

import { _decorator, Component, Graphics, Color } from 'cc';
const { ccclass, property } = _decorator;

export interface FlowerVisualConfig {
    type: string;       // 'sunflower' | 'tulip' | 'rose' | 'daisy' | 'lavender'
    progress: number;   // 0-1
    size: number;       // 渲染尺寸 (像素)
}

@ccclass('FlowerVisual')
export class FlowerVisual extends Component {

    private _graphics: Graphics | null = null;
    private _type: string = 'sunflower';
    private _progress: number = 0;
    private _size: number = 40;

    onLoad() {
        this._graphics = this.addComponent(Graphics);
    }

    /** 设置花卉参数并重绘 */
    setFlower(config: FlowerVisualConfig) {
        this._type = config.type;
        this._progress = config.progress;
        this._size = config.size;
        this.draw();
    }

    /** 只更新进度（不改变类型） */
    updateProgress(progress: number) {
        this._progress = progress;
        this.draw();
    }

    /** 获取当前进度 */
    getProgress(): number { return this._progress; }

    /** 核心绘制 */
    draw() {
        const g = this._graphics;
        if (!g) return;

        g.clear();
        const s = this._size;

        // 发芽阶段 (0-0.15): 小芽
        if (this._progress < 0.15) {
            this.drawSprout(g, s, this._progress / 0.15);
            return;
        }

        // 幼苗阶段 (0.15-0.30): 茎 + 叶子
        if (this._progress < 0.30) {
            this.drawSeedling(g, s, (this._progress - 0.15) / 0.15);
            return;
        }

        // 生长阶段 (0.30-0.70): 茎 + 花苞
        if (this._progress < 0.70) {
            const p = (this._progress - 0.30) / 0.40;
            this.drawBud(g, s, p);
            return;
        }

        // 绽放阶段 (0.70-1.0): 完整花朵，按绽放度缩放
        const bloomP = Math.min((this._progress - 0.70) / 0.30, 1);
        this.drawBloom(g, s, bloomP);
    }

    // ==================== 绘制各阶段 ====================

    /** 发芽 — 绿色小芽从土里冒出 */
    private drawSprout(g: Graphics, s: number, p: number) {
        const stemH = s * 0.3 * p;
        g.strokeColor = new Color(56, 142, 60);
        g.lineWidth = 3;
        g.moveTo(0, 0);
        g.lineTo(0, -stemH);
        g.stroke();

        // 子叶
        if (p > 0.5) {
            const leafP = (p - 0.5) / 0.5;
            g.fillColor = new Color(76, 175, 80);
            g.ellipse(-s * 0.15 * leafP, -stemH * 0.7, s * 0.1 * leafP, s * 0.06 * leafP, 0);
            g.fill();
            g.ellipse(s * 0.15 * leafP, -stemH * 0.7, s * 0.1 * leafP, s * 0.06 * leafP, 0);
            g.fill();
        }
    }

    /** 幼苗 — 长高 + 叶片展开 */
    private drawSeedling(g: Graphics, s: number, p: number) {
        const stemH = s * 0.35 + s * 0.15 * p;
        g.strokeColor = new Color(56, 142, 60);
        g.lineWidth = 3;
        g.moveTo(0, 0);
        g.lineTo(0, -stemH);
        g.stroke();

        // 左叶
        g.fillColor = new Color(129, 199, 132);
        g.ellipse(-s * 0.18, -stemH * 0.6, s * 0.12, s * 0.07, 0);
        g.fill();
        g.ellipse(s * 0.18, -stemH * 0.6, s * 0.12, s * 0.07, 0);
        g.fill();
    }

    /** 花苞 — 茎顶有未绽放的花苞 */
    private drawBud(g: Graphics, s: number, p: number) {
        const stemH = s * 0.55;
        const budSize = s * 0.08 + s * 0.08 * p;

        // 茎
        g.strokeColor = new Color(56, 142, 60);
        g.lineWidth = 3;
        g.moveTo(0, 0);
        g.lineTo(0, -stemH);
        g.stroke();

        // 花苞（绿色到花色渐变）
        const color = new Color(56, 142, 60);
        color.lerp(this.getFlowerColor(), p);
        g.fillColor = color;
        g.circle(0, -stemH, budSize);
        g.fill();

        // 花萼
        g.fillColor = new Color(56, 142, 60);
        g.moveTo(-budSize * 0.6, -stemH + budSize);
        g.lineTo(0, -stemH + budSize * 0.5);
        g.lineTo(budSize * 0.6, -stemH + budSize);
        g.close();
        g.fill();
    }

    /** 绽放 — 完整花朵 */
    private drawBloom(g: Graphics, s: number, bloomP: number) {
        const stemH = s * 0.55;
        const scale = 0.5 + 0.5 * bloomP;

        // 茎
        g.strokeColor = new Color(56, 142, 60);
        g.lineWidth = 3;
        g.moveTo(0, 0);
        g.lineTo(0, -stemH);
        g.stroke();

        // 叶子
        g.fillColor = new Color(129, 199, 132);
        g.ellipse(-s * 0.2, -stemH * 0.5, s * 0.15, s * 0.08, 0);
        g.fill();
        g.ellipse(s * 0.2, -stemH * 0.5, s * 0.15, s * 0.08, 0);
        g.fill();

        // 花朵（花卉类型专有绘制）
        g.save();
        g.translate(0, -stemH);
        g.scale(scale, scale);

        switch (this._type) {
            case 'sunflower': this.drawSunflower(g, s); break;
            case 'tulip':     this.drawTulip(g, s);     break;
            case 'rose':      this.drawRose(g, s);      break;
            case 'daisy':     this.drawDaisy(g, s);     break;
            case 'lavender':  this.drawLavender(g, s);  break;
            default:          this.drawSunflower(g, s); break;
        }

        g.restore();
    }

    // ==================== 各花卉品种绘制 ====================

    /** 向日葵 */
    private drawSunflower(g: Graphics, s: number) {
        const r = s * 0.55;
        g.fillColor = new Color(255, 215, 0); // #FFD700
        for (let i = 0; i < 16; i++) {
            const angle = (i * 22.5 * Math.PI) / 180;
            g.save();
            g.rotate(angle);
            g.ellipse(r * 1.2, 0, r * 0.25, r * 0.5, Math.PI / 2);
            g.fill();
            g.restore();
        }
        g.fillColor = new Color(121, 85, 72);
        g.circle(0, 0, r * 0.65);
        g.fill();
        g.fillColor = new Color(93, 64, 55);
        for (let i = 0; i < 8; i++) {
            const a = (i * 45 * Math.PI) / 180;
            g.circle(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35, r * 0.08);
            g.fill();
        }
    }

    /** 郁金香 */
    private drawTulip(g: Graphics, s: number) {
        const r = s * 0.5;
        g.fillColor = new Color(255, 105, 180);
        g.moveTo(-r * 0.5, -r * 0.2);
        g.bezierCurveTo(-r * 0.8, -r * 0.5, -r * 0.6, -r * 1.0, 0, -r * 1.0);
        g.lineTo(0, -r * 0.2);
        g.close();
        g.fill();
        g.moveTo(r * 0.5, -r * 0.2);
        g.bezierCurveTo(r * 0.8, -r * 0.5, r * 0.6, -r * 1.0, 0, -r * 1.0);
        g.lineTo(0, -r * 0.2);
        g.close();
        g.fill();
        g.fillColor = new Color(255, 130, 190);
        g.moveTo(0, -r * 0.2);
        g.bezierCurveTo(-r * 0.15, -r * 0.6, r * 0.15, -r * 0.6, 0, -r * 1.0);
        g.close();
        g.fill();
        g.fillColor = new Color(255, 215, 0);
        g.circle(0, -r * 0.5, r * 0.06);
        g.fill();
    }

    /** 玫瑰 */
    private drawRose(g: Graphics, s: number) {
        const r = s * 0.5;
        g.fillColor = new Color(183, 28, 28);
        for (let i = 0; i < 5; i++) {
            const a = (i * 72 * Math.PI) / 180;
            g.save();
            g.rotate(a);
            g.ellipse(r * 0.7, r * 0.3, r * 0.3, r * 0.5, 0);
            g.fill();
            g.restore();
        }
        g.fillColor = new Color(229, 57, 53);
        for (let i = 0; i < 4; i++) {
            const a = (i * 90 + 36) * Math.PI / 180;
            g.save();
            g.rotate(a);
            g.ellipse(r * 0.45, r * 0.2, r * 0.2, r * 0.4, 0);
            g.fill();
            g.restore();
        }
        g.fillColor = new Color(136, 14, 14);
        g.circle(0, 0, r * 0.15);
        g.fill();
    }

    /** 小雏菊 */
    private drawDaisy(g: Graphics, s: number) {
        const r = s * 0.5;
        g.fillColor = Color.WHITE;
        for (let i = 0; i < 12; i++) {
            const a = (i * 30 * Math.PI) / 180;
            g.save();
            g.rotate(a);
            g.ellipse(r * 0.8, 0, r * 0.08, r * 0.3, 0);
            g.fill();
            g.restore();
        }
        g.fillColor = new Color(255, 215, 0);
        g.circle(0, 0, r * 0.2);
        g.fill();
        g.fillColor = new Color(255, 193, 7);
        g.circle(-r * 0.05, r * 0.05, r * 0.06);
        g.fill();
        g.circle(r * 0.05, -r * 0.05, r * 0.06);
        g.fill();
    }

    /** 薰衣草 */
    private drawLavender(g: Graphics, s: number) {
        const r = s * 0.5;
        g.strokeColor = new Color(56, 142, 60);
        g.lineWidth = 3;
        g.moveTo(0, r * 0.3);
        g.lineTo(0, -r * 1.8);
        g.stroke();
        const colors = [
            new Color(156, 39, 176),
            new Color(186, 104, 200),
            new Color(206, 147, 216),
        ];
        const stemLen = r * 2.0;
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            const y = -r * 0.2 - t * stemLen;
            const xOffset = Math.sin(t * Math.PI * 4) * r * 0.25;
            const size = r * 0.1 * (1 - t * 0.5);
            const ci = Math.min(Math.floor(t * colors.length), colors.length - 1);
            g.fillColor = colors[ci];
            g.circle(xOffset, y, size);
            g.fill();
        }
        g.fillColor = colors[0];
        g.circle(0, -r * 1.9, r * 0.12);
        g.fill();
    }

    /** 根据花卉类型获取主色 */
    private getFlowerColor(): Color {
        switch (this._type) {
            case 'sunflower': return new Color(255, 215, 0);
            case 'tulip':     return new Color(255, 105, 180);
            case 'rose':      return new Color(229, 57, 53);
            case 'daisy':     return Color.WHITE;
            case 'lavender':  return new Color(156, 39, 176);
            default:          return new Color(255, 215, 0);
        }
    }
}
