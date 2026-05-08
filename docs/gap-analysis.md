# 治愈花园 - 双轨差距分析

## 概述

项目存在两条独立的技术路径：

| 路径 | 位置 | 状态 | 技术栈 |
|------|------|------|--------|
| Canvas 2D | `src/game.js` (2232行) | ✅ **已投产** (微信/抖音小游戏) | Canvas 2D + Platform适配层 |
| Cocos Creator | `game/` (TypeScript) | ⏳ 架构壳（无游戏逻辑/渲染） | Cocos Creator 3.8.8 |

## Canvas 2D 版本核心架构

```
src/game.js (2232行, 58KB)
├── CONFIG          — 屏幕尺寸/颜色/地块布局/按钮定义
├── GameState       — 玩家状态 (level/coins/exp/flowers/plots)
├── HealingGardenGame — 主游戏类
│   ├── 生命周期: init/update/save/load/startGameLoop
│   ├── 渲染系统: drawBackground/drawGardenView/drawPlots/drawFlowers
│   │   ├── 远景: drawFarView (天空渐变, 远山, 云朵)
│   │   ├── 花园: drawGardenView (草地, 围栏, 石径)
│   │   ├── 地块: drawPlots/drawPlot (24格, 含锁定态)
│   │   ├── 花朵: drawGrowingFlower/drawBloomFlower/clover/dandelion等
│   │   └── 前景: drawForeground (草丛)
│   ├── UI系统: drawTopNavigation/drawBottomBar/drawButtons
│   ├── 合成系统: initSynthesisSystem/attemptSimpleSynthesis
│   └── 输入: bindTouchEvents (触摸事件分发)
├── Utils           — 工具函数
└── 入口: initGame()/bindTouchEvents()
```

## Cocos Creator 版本已有组件

```
game/assets/scripts/
├── GameManager.ts     — 游戏主管理器 (Component)
├── EconomySystem.ts   — 商店/背包/经济 (Component)
├── GardenSystem.ts    — 花园区域/装饰 (Component)
├── PlantManager.ts    — 植物管理 (Component)
├── UIManager.ts       — UI管理 (Component)
├── MeditationManager.ts — 冥想系统
├── StorageUtil.ts     — 跨平台存储工具
├── PlatformManager.ts — 平台适配 (桥接)
├── platforms/
│   ├── WeChatAdapter.ts — 微信适配器
│   ├── DouyinAdapter.ts — 抖音适配器
│   └── WebAdapter.ts    — Web适配器
└── MainScene.fire      — 720×1280竖屏场景
```

## 差距矩阵

| 功能 | Canvas 2D | Cocos Creator | 优先级 |
|------|-----------|---------------|--------|
| 24格地块系统 | ✅ (4×6, 含锁定/解锁) | ❌ 无 | P0 |
| 花朵渲染(生长/绽放) | ✅ 6+种花朵绘制 | ❌ 无 | P0 |
| 颜色主题/视觉风格 | ✅ 完整配色方案 | ❌ 使用默认材质 | P0 |
| 触摸交互 | ✅ 点击/选择/种植 | ❌ 无输入处理 | P0 |
| 游戏循环(update) | ✅ 定期更新+渲染 | ✅ 空壳update方法 | P1 |
| 经验值/等级系统 | ✅ levelling+exp | ❌ 无 | P1 |
| 金币经济 | ✅ 消费/赚取 | ✅ 商店结构(无充值) | P1 |
| 合成系统 | ✅ 花朵合并 | ❌ 无 | P1 |
| 背包系统 | ✅ 种子/道具 | ✅ 基础结构 | P2 |
| 解锁系统 | ✅ 等级解锁地块 | ❌ 无 | P2 |
| 游戏状态保存 | ✅ localStorage | ✅ StorageUtil就位 | P2 |
| 微信小游戏适配 | ✅ 已部署 | ✅ Platform适配层就位 | P2 |
| 抖音小游戏适配 | ✅ 已部署 | ✅ Platform适配层就位 | P2 |
| 音效/背景音乐 | ❌ 无 | ❌ 无 | P3 |
| 社交/排行榜 | ❌ 无 | ❌ 无 | P3 |
| 新手引导 | ❌ 无 | ❌ 无 | P3 |
| 装饰品系统 | ❌ 无 | ✅ 基础结构 | P3 |
| 花园区域解锁 | ❌ 无 | ✅ 结构就位 | P3 |

## 迁移策略

### 阶段1 (P0) — 基础游戏链路
- 将 Canvas 2D 的 plot 系统(24格/解锁)移植到 Cocos Creator
- 实现基本的触摸→地块交互
- 实现花朵生长/绽放的渲染(使用 Sprite/材质替代 Canvas 绘制)
- 目标: 在编辑器预览中能打开花园、点击地块、种花

### 阶段2 (P1) — 核心玩法移植
- 移植经验值/等级系统
- 移植金币经济系统(对接已有 EconomySystem)
- 移植合成系统
- 目标: 功能覆盖率 60%+

### 阶段3 (P2) — 数据/补完
- 移植存储一体化(StorageUtil 已就位)
- 完成背包和商店
- 移植解锁链
- 目标: 功能覆盖率 90%

### 阶段4 (P3+) — 增值功能
- 音效/动效增强
- 花园区域系统（对接已有 GardenSystem）
- 装饰品系统
- 社交/排行榜/新手引导

## 阻塞项

1. **无法 CLI 构建** — Cocos Creator 3.8.8 不支持 `--build` 命令行构建。需通过 GUI 工具：
   - 打开 Cocos Dashboard
   - 导入 `D:\AutoHealingGarden\game`
   - 点击 Project → Build
2. **无可运行预览** — 无法在终端验证 Cocos 版本效果
3. **真实素材缺失** — 目前 WAV/PNG 为占位文件，需替换

## 建议

鉴于 Canvas 2D 版本已投产，Cocos Creator 版本在构建链路打通前，优先保证**代码质量和架构一致性**。待 GUI 构建落地后，进入阶段1快速验证。
