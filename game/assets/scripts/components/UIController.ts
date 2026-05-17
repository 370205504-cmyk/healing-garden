import {
    _decorator, Component, Node, Sprite, Label, Button,
    UITransform, Color, Vec3, input, Input, EventMouse, EventTouch,
    Size, tween
} from 'cc';
const { ccclass, property } = _decorator;

/** 可种植的花卉类型 */
export enum FlowerType {
    Rose = 'rose',
    Tulip = 'tulip',
    Sunflower = 'sunflower',
    Daisy = 'daisy',
    Lily = 'lily',
    Cherry = 'cherry',
}

/** 花卉配置（显示名 + 颜色，以后可扩展为从配置表读取） */
export const FLOWER_CONFIGS: Record<string, { name: string; color: Color }> = {
    [FlowerType.Rose]:      { name: '🌹 玫瑰',    color: new Color(220, 50, 80) },
    [FlowerType.Tulip]:     { name: '🌷 郁金香',  color: new Color(255, 130, 180) },
    [FlowerType.Sunflower]: { name: '🌻 向日葵',  color: new Color(255, 200, 50) },
    [FlowerType.Daisy]:     { name: '🌼 雏菊',    color: new Color(255, 240, 100) },
    [FlowerType.Lily]:      { name: '🌸 百合',    color: new Color(200, 180, 255) },
    [FlowerType.Cherry]:    { name: '🌸 樱花',    color: new Color(255, 180, 200) },
};

/** 自定义事件名称 */
export const UI_EVENTS = {
    /** 请求种植指定花卉 payload: { flowerType: FlowerType } */
    REQUEST_PLANT: 'ui-request-plant',
    /** 请求浇水 */
    REQUEST_WATER: 'ui-request-water',
} as const;

@ccclass('UIController')
export class UIController extends Component {
    // ==================== 布局常量 ====================
    private static readonly BOTTOM_BAR_HEIGHT = 80;
    private static readonly TOP_BAR_HEIGHT = 60;
    private static readonly PANEL_ANIM_DURATION = 0.2; // 秒

    // ==================== 持有的节点引用 ====================
    private _topBar: Node | null = null;
    private _coinLabel: Label | null = null;
    private _levelLabel: Label | null = null;
    private _plantPanel: Node | null = null;
    private _panelBg: Node | null = null;
    private _panelContent: Node | null = null;

    // ==================== 状态 ====================
    private _panelOpen = false;

    // ==================== 生命周期 ====================

    protected onLoad(): void {
        this._buildUI();
    }

    // ==================== 公开 API ====================

    /** 更新金币数量显示 */
    public updateCoin(amount: number): void {
        if (this._coinLabel) {
            this._coinLabel.string = `💰 ${amount}`;
        }
    }

    /** 更新等级显示 */
    public updateLevel(level: number): void {
        if (this._levelLabel) {
            this._levelLabel.string = `Lv.${level}`;
        }
    }

    /** 打开/关闭种植面板 */
    public togglePlantPanel(open?: boolean): void {
        const target = open !== undefined ? open : !this._panelOpen;
        if (target === this._panelOpen) return;
        this._panelOpen = target;
        this._animatePanel(target);
    }

    // ==================== UI 构建 ====================

    private _buildUI(): void {
        const canvas = this.node;
        const winSize = canvas.getComponent(UITransform)!.contentSize;

        this._createTopBar(canvas, winSize);
        this._createBottomBar(canvas, winSize);
        this._createPlantPanel(canvas);
    }

    // ---------- 顶部状态栏 ----------

    private _createTopBar(parent: Node, winSize: Size): void {
        const bar = new Node('TopBar');
        const barTransform = bar.addComponent(UITransform);
        barTransform.contentSize = new Size(winSize.width, UIController.TOP_BAR_HEIGHT);
        bar.setPosition(0, winSize.height / 2 - UIController.TOP_BAR_HEIGHT / 2);

        // 半透明背景
        const bg = this._createSprite(bar, 'TopBarBg', Color.BLACK);
        bg.color = new Color(0, 0, 0, 120);
        const bgTransform = bg.getComponent(UITransform)!;
        bgTransform.contentSize = barTransform.contentSize;
        bg.setPosition(0, 0);

        // 金币
        const coinLabel = this._createLabel(bar, 'CoinLabel', '💰 0', Color.WHITE);
        coinLabel.fontSize = 22;
        coinLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
        coinLabel.verticalAlign = Label.VerticalAlign.CENTER;
        const coinNode = coinLabel.node;
        coinNode.setPosition(-winSize.width / 2 + 20, 0);

        // 等级
        const levelLabel = this._createLabel(bar, 'LevelLabel', 'Lv.1', Color.WHITE);
        levelLabel.fontSize = 20;
        levelLabel.horizontalAlign = Label.HorizontalAlign.RIGHT;
        levelLabel.verticalAlign = Label.VerticalAlign.CENTER;
        const levelNode = levelLabel.node;
        levelNode.setPosition(winSize.width / 2 - 20, 0);

        this._topBar = bar;
        this._coinLabel = coinLabel;
        this._levelLabel = levelLabel;

        parent.addChild(bar);
    }

    // ---------- 底部操作栏 ----------

    private _createBottomBar(parent: Node, winSize: Size): void {
        const bar = new Node('BottomBar');
        const barTransform = bar.addComponent(UITransform);
        barTransform.contentSize = new Size(winSize.width, UIController.BOTTOM_BAR_HEIGHT);
        bar.setPosition(0, -winSize.height / 2 + UIController.BOTTOM_BAR_HEIGHT / 2);

        // 半透明背景
        const bg = this._createSprite(bar, 'BottomBarBg', Color.BLACK);
        bg.color = new Color(0, 0, 0, 140);
        const bgTransform = bg.getComponent(UITransform)!;
        bgTransform.contentSize = barTransform.contentSize;
        bg.setPosition(0, 0);

        // 按钮尺寸
        const btnW = 120;
        const btnH = 44;
        const spacing = 30;

        // 种花按钮
        this._createBarButton(bar, 'PlantBtn', '🌱 种花', 0, () => {
            this.togglePlantPanel();
        });

        // 浇水按钮
        this._createBarButton(bar, 'WaterBtn', '💧 浇水', -(btnW + spacing), () => {
            this.node.emit(UI_EVENTS.REQUEST_WATER, {});
            this.node.dispatchEvent(new EventTouch(UI_EVENTS.REQUEST_WATER, false));
        });

        parent.addChild(bar);
    }

    private _createBarButton(parent: Node, name: string, text: string, offsetX: number, callback: () => void): void {
        const btnNode = new Node(name);
        parent.addChild(btnNode);

        const transform = btnNode.addComponent(UITransform);
        transform.contentSize = new Size(120, 44);
        btnNode.setPosition(offsetX, 0);

        // 背景
        const bg = this._createSprite(btnNode, 'Bg', new Color(60, 140, 80));
        bg.getComponent(UITransform)!.contentSize = transform.contentSize;
        bg.setPosition(0, 0);

        // 圆角感：用九宫格 tint 模拟，真实做法应使用 SpriteFrame 但这里简化
        // 文字
        const label = this._createLabel(btnNode, 'Label', text, Color.WHITE);
        label.fontSize = 18;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.node.setPosition(0, 0);

        // 按钮
        const btn = btnNode.addComponent(Button);
        btn.target = bg.node;
        btn.transition = Button.Transition.COLOR;
        btn.normalColor = new Color(60, 140, 80);
        btn.pressedColor = new Color(40, 100, 60);
        btn.hoverColor = new Color(80, 170, 100);
        btn.duration = 0.1;
        btn.node.on(Button.EventType.CLICK, callback);
    }

    // ---------- 种植选择面板 ----------

    private _createPlantPanel(parent: Node): void {
        // 外层容器（负责点击背景关闭）
        const panel = new Node('PlantPanel');
        const panelTransform = panel.addComponent(UITransform);
        const winSize = parent.getComponent(UITransform)!.contentSize;
        panelTransform.contentSize = winSize;
        panel.setPosition(0, 0);
        panel.active = false;

        // ---------- 半透明背景 ----------
        const bg = this._createSprite(panel, 'PanelBg', Color.BLACK);
        bg.color = new Color(0, 0, 0, 160);
        const bgTransform = bg.getComponent(UITransform)!;
        bgTransform.contentSize = winSize;
        bg.setPosition(0, 0);

        // 点击背景关闭
        bg.node.on(Node.EventType.TOUCH_END, () => {
            this.togglePlantPanel(false);
        });

        // ---------- 内容容器（居中） ----------
        const content = new Node('PanelContent');
        panel.addChild(content);

        // 内边距 & 网格参数
        const cols = 3;
        const cellW = 130;
        const cellH = 100;
        const gap = 16;
        const hPadding = 40;
        const vPadding = 30;

        const flowerTypes = Object.values(FlowerType);
        const rows = Math.ceil(flowerTypes.length / cols);
        const contentW = cols * cellW + (cols - 1) * gap + hPadding * 2;
        const contentH = rows * cellH + (rows - 1) * gap + vPadding * 2 + 40; // 多 40 给标题

        const contentTransform = content.addComponent(UITransform);
        contentTransform.contentSize = new Size(contentW, contentH);

        // 白色背景（面板底色）
        const panelBg = this._createSprite(content, 'ContentBg', Color.WHITE);
        panelBg.color = new Color(60, 60, 80);
        const panelBgTransform = panelBg.getComponent(UITransform)!;
        panelBgTransform.contentSize = contentTransform.contentSize;
        panelBg.setPosition(0, 0);

        // 标题
        const titleLabel = this._createLabel(content, 'PanelTitle', '🌱 选择种下的花', Color.WHITE);
        titleLabel.fontSize = 20;
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        titleLabel.verticalAlign = Label.VerticalAlign.CENTER;
        const titleNode = titleLabel.node;
        titleNode.setPosition(0, contentH / 2 - 30);

        // 花卉格子
        const startX = -((cols - 1) * (cellW + gap)) / 2;
        const startY = contentH / 2 - 60 - cellH / 2;

        flowerTypes.forEach((type, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cellW + gap);
            const y = startY - row * (cellH + gap);

            this._createFlowerCell(content, type, x, y, cellW, cellH);
        });

        this._panelBg = bg.node;
        this._panelContent = content;
        this._plantPanel = panel;

        parent.addChild(panel);
    }

    private _createFlowerCell(parent: Node, flowerType: FlowerType, x: number, y: number, w: number, h: number): void {
        const config = FLOWER_CONFIGS[flowerType];
        if (!config) return;

        const cell = new Node(`Cell_${flowerType}`);
        parent.addChild(cell);

        const transform = cell.addComponent(UITransform);
        transform.contentSize = new Size(w, h);
        cell.setPosition(x, y);

        // 背景色块
        const bg = this._createSprite(cell, 'CellBg', config.color);
        bg.color = new Color(255, 255, 255, 50); // 半透明白底
        const bgTransform = bg.getComponent(UITransform)!;
        bgTransform.contentSize = new Size(w, h);
        bg.setPosition(0, 0);

        // 花图标（简单的 emoji 文字代替图片）
        const iconLabel = this._createLabel(cell, 'Icon', config.name.charAt(0), config.color);
        iconLabel.fontSize = 28;
        iconLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        iconLabel.verticalAlign = Label.VerticalAlign.CENTER;
        iconLabel.node.setPosition(0, 8);

        // 名字
        const nameLabel = this._createLabel(cell, 'Name', config.name, Color.WHITE);
        nameLabel.fontSize = 14;
        nameLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        nameLabel.verticalAlign = Label.VerticalAlign.CENTER;
        nameLabel.node.setPosition(0, -20);

        // 按钮交互
        const btn = cell.addComponent(Button);
        btn.target = bg.node;
        btn.transition = Button.Transition.COLOR;
        btn.normalColor = new Color(255, 255, 255, 60);
        btn.pressedColor = new Color(255, 255, 255, 140);
        btn.hoverColor = new Color(255, 255, 255, 100);
        btn.duration = 0.08;
        btn.node.on(Button.EventType.CLICK, () => {
            // 发射种植事件
            const payload = { flowerType };
            this.node.emit(UI_EVENTS.REQUEST_PLANT, payload);
            this.node.dispatchEvent(new EventTouch(UI_EVENTS.REQUEST_PLANT, false));
            // 选中后关闭面板
            this.togglePlantPanel(false);
        });
    }

    // ==================== 面板动画 ====================

    private _animatePanel(open: boolean): void {
        if (!this._plantPanel || !this._panelBg || !this._panelContent) return;

        const panel = this._plantPanel;

        if (open) {
            panel.active = true;
            this._panelBg!.opacity = 0;
            this._panelContent!.setScale(new Vec3(0.8, 0.8, 1));
            this._panelContent!.opacity = 0;

            // 背景淡入
            tween(this._panelBg!)
                .to(UIController.PANEL_ANIM_DURATION, { opacity: 160 })
                .start();

            // 内容弹性放大
            tween(this._panelContent!)
                .to(UIController.PANEL_ANIM_DURATION, { scale: new Vec3(1, 1, 1), opacity: 255 },
                    { easing: 'backOut' })
                .start();
        } else {
            // 背景淡出
            tween(this._panelBg!)
                .to(UIController.PANEL_ANIM_DURATION * 0.6, { opacity: 0 })
                .start();

            // 内容缩小淡出
            tween(this._panelContent!)
                .to(UIController.PANEL_ANIM_DURATION * 0.6,
                    { scale: new Vec3(0.8, 0.8, 1), opacity: 0 },
                    { easing: 'smooth' })
                .call(() => {
                    panel.active = false;
                })
                .start();
        }
    }

    // ==================== 辅助方法 ====================

    private _createSprite(parent: Node, name: string, color: Color): Sprite {
        const node = new Node(name);
        parent.addChild(node);
        const sprite = node.addComponent(Sprite);
        sprite.type = Sprite.Type.SIMPLE;
        sprite.color = color;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        return sprite;
    }

    private _createLabel(parent: Node, name: string, text: string, color: Color): Label {
        const node = new Node(name);
        parent.addChild(node);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = 16;
        label.lineHeight = 24;
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        return label;
    }
}
