# 治愈花园 🌿

**国内首款「零压力情绪疗愈向」自动养成休闲小游戏**

> 种一片花园，治愈所有不开心

---

## 📊 项目状态总览

| 模块 | 状态 | 版本 | 说明 |
|------|------|------|------|
| 游戏引擎核心 | ✅ 完成 | v1.0 | Engine、StateMachine、EventBus 稳定运行 |
| 微信小游戏适配 | ✅ 完成 | v1.0 | 完整可运行的 deployment package |
| **UI组件库** | **✅ 完成** | **v1.0** | **Button、Dialog、ProgressBar 组件** |
| **Canvas渲染引擎** | **✅ 完成** | **v1.0** | **离屏渲染、性能优化** |
| **微信API封装** | **✅ 完成** | **v1.0** | **Promise化封装、广告管理** |
| 输入系统 | ✅ 完成 | v1.0 | 触摸事件、点击检测 |
| 主菜单 UI | ✅ 完成 | v1.0 | 开始游戏、商店、成就按钮 |
| 花园核心玩法 | 🔧 开发中 | v0.5 | 地块系统、种植逻辑 |
| 花卉生长系统 | 🔧 开发中 | v0.5 | 生长周期、状态管理 |
| 道具系统 | 🔧 开发中 | v0.3 | 种子、水壶等基础道具 |
| Cocos Creator 版 | 📋 规划中 | - | TypeScript 重构版本 |

---

## 🔄 开源项目整合进度

**已整合的高价值资源：**

| 源项目 | 类型 | 整合位置 | 整合内容 |
|--------|------|----------|----------|
| **minigame-ui-kit** | UI组件库 | `engine/ui/` | Button、Dialog、ProgressBar |
| **minigame-canvas-engine** | 渲染引擎 | `engine/renderer/` | CanvasRenderer、离屏渲染 |
| **wxmini-promisify** | API封装 | `platform/WxApi.js` | Promise封装、广告管理 |
| **minigame-demo** | 云开发 | `server/` | 数据存储、排行榜 |
| **minGame** | 构建脚本 | `scripts/` | CI配置、构建流程 |

**未整合（弃用）：**
- 🚫 消除类游戏（牛马日记、卷了个卷）- 玩法不相关
- 🚫 棋牌类游戏（五子棋、斗兽棋）- 机制不适用
- 🚫 其他引擎（Godot、LayaAir）- 已有Cocos方案

---

## 📁 项目结构

```
healing-garden/
├── engine/          # 游戏引擎核心 (✅ 完成)
│   ├── Engine.js
│   ├── StateMachine.js
│   ├── EventBus.js
│   ├── Game.js
│   ├── ui/          # ⭐ UI组件库
│   │   ├── Button.js
│   │   ├── Dialog.js
│   │   └── ProgressBar.js
│   └── renderer/    # ⭐ Canvas渲染引擎
│       └── CanvasRenderer.js
├── platform/        # 平台适配层 (✅ 完成)
│   └── WxApi.js     # ⭐ 微信API Promise封装
├── security/        # 安全模块 (✅ 完成)
├── perf/            # 性能监控 (✅ 完成)
├── tests/           # 测试模块 (✅ 完成)
├── game/            # Cocos Creator 项目 (🔧 开发中)
├── deploy/          # 部署包 (✅ 完成)
└── docs/            # 技术文档
```

---

## 🎮 核心功能状态

### ✅ 已完成
- [x] 游戏循环、状态机、事件总线
- [x] Canvas2D 渲染、离屏渲染优化
- [x] **Button、Dialog、ProgressBar UI组件**
- [x] **微信API Promise化封装**
- [x] 触摸事件输入系统
- [x] 安全模块（数据加密、反作弊）
- [x] 性能监控（帧率监控、Profiler）
- [x] 单元测试框架

### 🔧 开发中
- [ ] 花园地块系统
- [ ] 种植/收获逻辑
- [ ] 花卉生长动画
- [ ] 道具背包系统

### 📋 规划中
- [ ] Cocos Creator TypeScript 重构
- [ ] 3D 渲染优化

---

## 📅 开发进度

```
当前进度: ███████░░░ 70%

时间线:
├── 2026-04-01 ~ 2026-04-15  🚀 引擎核心开发
├── 2026-04-15 ~ 2026-04-30  🎮 玩法开发
├── 2026-05-01 ~ 2026-05-15  🎨 UI/UX & 开源整合
│   ├── UI组件库整合 (minigame-ui-kit)
│   ├── Canvas渲染引擎 (minigame-canvas-engine)
│   └── 微信API封装 (wxmini-promisify)
├── 2026-05-15 ~ 2026-05-31  🧪 测试优化
└── 2026-06-01 ~ 2026-06-15  🚀 上线准备
```

---

## 📊 代码统计

| 类别 | 文件数 | 代码行数 |
|------|--------|----------|
| 引擎核心 | 15 | ~4,000 |
| UI组件库 | 3 | ~800 |
| Canvas渲染器 | 1 | ~600 |
| 平台API | 1 | ~1,000 |
| 系统模块 | 4 | ~1,500 |
| 安全模块 | 3 | ~800 |
| 性能模块 | 3 | ~500 |
| 测试模块 | 5 | ~600 |
| 部署包 | ~45 | ~9,000 |
| **总计** | **80+** | **~18,000** |

---

## 🌟 开源资源致谢

感谢以下开源项目提供的技术参考：

| 项目 | 作者/组织 | 许可 |
|------|----------|------|
| minigame-ui-kit | journey-ad | MIT |
| minigame-canvas-engine | wechat-miniprogram | MIT |
| wxmini-promisify | fudiwei | MIT |
| minigame-demo | wechat-miniprogram | MIT |
| minGame | Qiuzer | MIT |

---

## 👥 团队

| 角色 | 负责人 | 状态 |
|------|--------|------|
| 项目管理 | OpenClaw AI | ✅ 活跃 |
| 技术架构 | OpenClaw AI | ✅ 活跃 |
| 引擎开发 | OpenClaw AI | ✅ 活跃 |

---

**© 2026 治愈花园开发团队**

*🌿 用心种植，用爱治愈*
