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
| **社交系统** | **✅ 完成** | **v1.0** | **分享、排行榜、签到** |
| **广告聚合框架** | **✅ 完成** | **v1.0** | **激励视频、Banner、插屏广告** |
| **商店系统** | **✅ 完成** | **v1.0** | **道具购买、货币系统** |
| **热更新方案** | **✅ 完成** | **v1.0** | **商用级热更框架** |
| 花园核心玩法 | 🔧 开发中 | v0.5 | 地块系统、种植逻辑 |
| 花卉生长系统 | 🔧 开发中 | v0.5 | 生长周期、状态管理 |
| 道具系统 | 🔧 开发中 | v0.3 | 种子、水壶等基础道具 |
| Cocos Creator 版 | 📋 规划中 | - | TypeScript 重构版本 |

---

## 🔄 开源项目整合进度

**已整合的高价值资源（2026年5月第二批）：**

| 源项目 | 类型 | 整合位置 | 整合内容 |
|--------|------|----------|----------|
| **wxgame-ad-framework** | 广告框架 | `engine/ads/` | AdManager、激励视频、Banner |
| **minigame-rank-server** | 排行榜 | `engine/social/` | RankManager、世界/好友排行 |
| **share-fission-mini** | 社交裂变 | `engine/social/` | ShareManager、分享奖励 |
| **sign-gift-minigame** | 签到福利 | `engine/social/` | SignManager、连续签到奖励 |
| **minigame-hotupdate** | 热更新 | `engine/hotupdate/` | HotUpdateManager |
| **wxgame-cloud-server** | 后端服务 | `engine/store/` | StoreManager、商城系统 |
| **cocos-wxgame-business-template** | 商用模板 | `engine/` | 整体架构优化 |

**第一批已整合：**

| 源项目 | 类型 | 整合位置 |
|--------|------|----------|
| **minigame-ui-kit** | UI组件库 | `engine/ui/` |
| **minigame-canvas-engine** | 渲染引擎 | `engine/renderer/` |
| **wxmini-promisify** | API封装 | `platform/WxApi.js` |

**未整合（弃用）：**
- 🚫 消除类、合成类、塔防类游戏 - 玩法不相关
- 🚫 棋牌对战类 - 机制不适用
- 🚫 跑酷、跳一跳类 - 玩法不相关

---

## 📁 项目结构

```
healing-garden/
├── engine/                    # 游戏引擎核心
│   ├── Engine.js              # 引擎主类
│   ├── StateMachine.js        # 状态机管理
│   ├── EventBus.js            # 事件总线
│   ├── Game.js                # 游戏主逻辑
│   ├── ui/                    # ⭐ UI组件库
│   │   ├── Button.js
│   │   ├── Dialog.js
│   │   ├── ProgressBar.js
│   │   └── index.js
│   ├── renderer/              # ⭐ Canvas渲染引擎
│   │   └── CanvasRenderer.js
│   ├── systems/               # 子系统
│   ├── social/                # ⭐ 社交模块
│   │   ├── ShareManager.js    # 分享管理
│   │   ├── RankManager.js     # 排行榜
│   │   └── SignManager.js     # 签到系统
│   ├── ads/                   # ⭐ 广告模块
│   │   └── AdManager.js       # 广告聚合框架
│   ├── store/                 # ⭐ 商店模块
│   │   └── StoreManager.js    # 商城系统
│   └── hotupdate/             # ⭐ 热更新模块
│       └── HotUpdateManager.js
├── platform/                  # 平台适配层
│   └── WxApi.js               # 微信API Promise封装
├── security/                  # 安全模块
├── perf/                      # 性能监控
├── tests/                     # 测试模块
├── game/                      # Cocos Creator 项目
├── deploy/                    # 部署包
└── docs/                      # 技术文档
```

---

## 🎮 核心功能状态

### ✅ 已完成（变现能力完整）

#### 1. 游戏引擎
- [x] 游戏循环、状态机、事件总线
- [x] Canvas2D 渲染、离屏渲染优化
- [x] ECS 实体组件系统

#### 2. UI组件库
- [x] Button - 按钮组件
- [x] Dialog - 模态对话框
- [x] ProgressBar - 进度条

#### 3. 社交系统（新增）
- [x] **ShareManager** - 微信分享、分享奖励
- [x] **RankManager** - 世界排行、好友排行
- [x] **SignManager** - 连续签到、每日奖励

#### 4. 广告框架（新增）
- [x] **AdManager** - 激励视频广告
- [x] Banner广告管理
- [x] 插屏广告管理
- [x] 广告统计分析

#### 5. 商店系统（新增）
- [x] **StoreManager** - 商品管理
- [x] 货币系统（金币、水滴）
- [x] 道具购买流程
- [x] 广告兑换奖励

#### 6. 热更新（新增）
- [x] **HotUpdateManager** - 版本检测
- [x] 资源包下载
- [x] 增量更新

#### 7. 微信API封装
- [x] Promise化封装
- [x] 环境检测
- [x] 存储管理

#### 8. 安全模块
- [x] 数据加密
- [x] 反作弊检测
- [x] 日志系统

#### 9. 性能监控
- [x] 帧率监控
- [x] Profiler
- [x] 资源懒加载

### 🔧 开发中
- [ ] 花园地块系统
- [ ] 种植/收获逻辑
- [ ] 花卉生长动画
- [ ] 道具背包系统

### 📋 规划中
- [ ] Cocos Creator TypeScript 重构
- [ ] 3D 渲染优化
- [ ] 抖音平台适配

---

## 💰 变现能力

| 变现方式 | 状态 | 说明 |
|----------|------|------|
| ✅ 激励视频广告 | 已集成 | AdManager自动管理 |
| ✅ Banner广告 | 已集成 | 底部悬浮展示 |
| ✅ 插屏广告 | 已集成 | 关卡结算展示 |
| ✅ 分享裂变 | 已集成 | 分享获得奖励 |
| ✅ 签到系统 | 已集成 | 留存提升 |
| ✅ 虚拟商品商城 | 已集成 | 内购道具 |
| 📋 社交排行榜 | 已集成 | 竞争驱动 |

---

## 📅 开发进度

```
当前进度: ████████░░ 80%

时间线:
├── 2026-04-01 ~ 2026-04-15  🚀 引擎核心开发
├── 2026-04-15 ~ 2026-04-30  🎮 玩法开发
├── 2026-05-01 ~ 2026-05-15  🎨 UI/UX & 第一批开源整合
├── 2026-05-15 ~ 2026-05-20  💰 第二批开源整合（变现模块）
│   ├── 社交系统 (分享、排行榜、签到)
│   ├── 广告框架 (激励视频、Banner、插屏)
│   ├── 商店系统 (货币、道具、内购)
│   └── 热更新方案
├── 2026-05-20 ~ 2026-05-31  🧪 测试优化
└── 2026-06-01 ~ 2026-06-15  🚀 上线准备
```

---

## 📊 代码统计

| 类别 | 文件数 | 代码行数 |
|------|--------|----------|
| 引擎核心 | 15 | ~4,000 |
| UI组件库 | 4 | ~1,000 |
| Canvas渲染器 | 1 | ~600 |
| 社交模块 | 3 | ~1,200 |
| 广告框架 | 1 | ~800 |
| 商店系统 | 1 | ~600 |
| 热更新 | 1 | ~500 |
| 平台API | 1 | ~1,000 |
| 系统模块 | 4 | ~1,500 |
| 安全模块 | 3 | ~800 |
| 性能模块 | 3 | ~500 |
| 测试模块 | 5 | ~600 |
| 部署包 | ~55 | ~12,000 |
| **总计** | **95+** | **~25,000** |

---

## 🌟 开源资源致谢

| 项目 | 类型 | 许可 |
|------|------|------|
| minigame-ui-kit | UI组件 | MIT |
| minigame-canvas-engine | 渲染引擎 | MIT |
| wxmini-promisify | API封装 | MIT |
| wxgame-ad-framework | 广告框架 | MIT |
| minigame-rank-server | 排行榜 | MIT |
| share-fission-mini | 社交裂变 | MIT |
| sign-gift-minigame | 签到系统 | MIT |
| minigame-hotupdate | 热更新 | MIT |
| wxgame-cloud-server | 后端服务 | MIT |
| cocos-wxgame-business-template | 商用模板 | MIT |

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
