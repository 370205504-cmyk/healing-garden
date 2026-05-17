# 治愈花园 — Cocos Creator 3.8 架构总览

创建时间：2026-05-09 22:10~23:30
任务：从 Canvas 2D 移植到 Cocos Creator 3.8

## 目录结构

```
game/assets/scripts/
├── MainScene.ts           场景控制器，DI 连线
├── GameManager.ts         游戏状态（金币/等级/经验）
├── PlantingSystem.ts      种植系统（24格网格/生长/touch/存档）
├── GardenSystem.ts        花园系统
├── EconomySystem.ts       经济系统（商店/背包）
├── UIManager.ts           UI 显示（程序化创建标签/按钮/Toast）
├── SynthesisLogic.ts      合成规则引擎（纯逻辑，零引擎依赖）
├── SynthesisSystem.ts     合成系统 Cocos Component（模式状态机）
├── components/
│   └── Plot.ts            单个地块组件（deltaTime 生长/阶段/收获）
├── data/
│   └── FlowerTypes.ts     8种花朵类型定义（id/name/growTime/value/color）
├── Framework/
│   ├── Launch.ts          统一启动入口（skill 规范要求）
│   └── ManagerBase.ts     单例管理器基类
├── utils/
│   ├── StorageUtil.ts     跨平台存储
│   └── EventBus.ts        事件总线
└── platforms/             平台适配层（WeChat/Douyin/Web）
```

## 数据流

```
用户触摸 → UIManager 底部按钮 → PlantingSystem/SynthesisSystem
                                        ↓
                                    Plot.grow(dt) ← deltaTime
                                        ↓
                                  成熟 → PlantSystem.harvest()
                                        ↓
                               GameManager.addCoins/Experience → level-up
                                        ↓
                               UIManager.onCoinsUpdated/LevelUp
```

合成模式时：
```
PlantingSystem.onPlotTap → SynthesisSystem.isActive? → 委托
                                        ↓
                         SynthesisLogic.trySynthesize() ← 纯逻辑
                                        ↓
                         Plot.clear() + Plot.plant() + GameManager奖励
```

## 新文件清单（需 git add）

```
git add -A

game/assets/scripts/components/Plot.ts
game/assets/scripts/data/FlowerTypes.ts
game/assets/scripts/Framework/Launch.ts
game/assets/scripts/Framework/ManagerBase.ts
game/assets/scripts/SynthesisLogic.ts
game/assets/scripts/SynthesisSystem.ts
game/assets/scenes/         ← setup-scene.js 生成

setup-scene.js

docs/architecture.md       ← 此文件
```

## 修改文件

```
game/assets/scripts/MainScene.ts     重写（移除 PlotSystem，合成连线）
game/assets/scripts/GameManager.ts   移除 PlotSystem 死依赖
game/assets/scripts/PlantingSystem.ts 重写（24格 + deltaTime + 合成委托）
game/assets/scripts/UIManager.ts     重写（程序化 UI + 合成按钮）
game/assets/scripts/components/Plot.ts 新增 clear()
```

## 需要手动操作

1. 清理 exec 限制（EPERM）或重启环境
2. `cd D:\AutoHealingGarden && node setup-scene.js`
3. `git add -A && git commit -m "P0地块+合成+UI" && git push`
4. 在 Cocos Dashboard 打开 `game/` 项目
5. 在编辑器中把 6 个 Component 节点拖到 MainScene 的 `@property` 槽位
6. 编辑场景 → 添加 Sprite/纹理 → 构建验证
