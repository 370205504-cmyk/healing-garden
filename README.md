# 治愈花园 🌿

**国内首款「零压力情绪疗愈向」自动养成休闲小游戏**

> 种一片花园，治愈所有不开心

---

## 📊 项目状态总览

| 模块 | 状态 | 版本 | 说明 |
|------|------|------|------|
| 游戏引擎核心 | ✅ 完成 | v1.0 | Engine、StateMachine、EventBus 稳定运行 |
| 微信小游戏适配 | ✅ 完成 | v1.0 | 完整可运行的 deployment package |
| 渲染系统 | ✅ 完成 | v1.0 | Canvas2D 渲染、分层渲染 |
| 输入系统 | ✅ 完成 | v1.0 | 触摸事件、点击检测 |
| 主菜单 UI | ✅ 完成 | v1.0 | 开始游戏、商店、成就按钮 |
| 花园核心玩法 | 🔧 开发中 | v0.5 | 地块系统、种植逻辑 |
| 花卉生长系统 | 🔧 开发中 | v0.5 | 生长周期、状态管理 |
| 道具系统 | 🔧 开发中 | v0.3 | 种子、水壶等基础道具 |
| Cocos Creator 版 | 📋 规划中 | - | TypeScript 重构版本 |
| 抖音适配 | 📋 规划中 | - | 双平台支持 |

---

## 📁 项目结构

```
healing-garden/
├── 📦 engine/                    # 游戏引擎核心 (✅ 完成)
│   ├── Engine.js                 # 引擎主类、游戏循环
│   ├── StateMachine.js           # 状态机管理
│   ├── EventBus.js               # 事件总线
│   ├── Game.js                   # 游戏主逻辑
│   ├── EntityManager.js          # 实体管理
│   ├── ObjectPool.js             # 对象池
│   ├── ResourceManager.js        # 资源管理
│   ├── components/               # 组件系统
│   └── systems/                  # 子系统
│       ├── InputSystem.js        # 输入处理
│       ├── RenderSystem.js       # 渲染系统
│       ├── PhysicsSystem.js      # 物理系统
│       └── AnimationSystem.js    # 动画系统
│
├── 📦 security/                  # 安全模块 (✅ 完成)
│   ├── Crypto.js                 # 数据加密
│   ├── AntiCheat.js              # 反作弊检测
│   └── Logger.js                 # 日志记录
│
├── 📦 perf/                      # 性能监控 (✅ 完成)
│   ├── Profiler.js               # 性能分析
│   ├── FrameRateMonitor.js       # 帧率监控
│   └── LazyLoader.js             # 资源懒加载
│
├── 📦 tests/                     # 测试模块 (✅ 完成)
│   ├── TestRunner.js             # 测试运行器
│   ├── security.test.js          # 安全模块测试
│   ├── eventBus.test.js          # 事件总线测试
│   └── entityManager.test.js     # 实体管理测试
│
├── 📦 game/                      # Cocos Creator 项目 (🔧 开发中)
│   ├── assets/
│   │   ├── scripts/              # TypeScript 脚本
│   │   ├── prefabs/              # 预制件
│   │   ├── scenes/               # 场景
│   │   └── textures/             # 纹理资源
│   ├── settings/                 # 项目设置
│   └── profiles/                 # 构建配置
│
├── 📦 deploy/                    # 部署包 (✅ 完成)
│   └── deployment-package-*/
│       └── wechat/               # 微信小游戏包
│           ├── app.js            # 小程序入口
│           ├── game.js           # 游戏入口
│           ├── game.json         # 游戏配置
│           ├── project.config.json
│           └── engine/           # 完整引擎拷贝
│
├── 📦 scripts/                   # 工具脚本
│   ├── build.js                  # 构建脚本
│   ├── validate.js               # 验证脚本
│   └── security-scan.js          # 安全扫描
│
├── 📦 docs/                      # 技术文档
│   ├── architecture.md           # 架构设计
│   ├── DESIGN_V8_DEEP.md         # 深度设计
│   └── build-operations-guide.md # 构建指南
│
└── 📦 knowledge-base/            # 知识库
    ├── technical/                # 技术方案
    ├── design/                   # 设计文档
    └── compliance/               # 合规检查
```

---

## 🎮 核心功能状态

### ✅ 已完成功能

#### 1. 游戏引擎
- [x] **游戏循环** - 稳定的 update/render 周期
- [x] **状态机** - menu/playing 状态切换
- [x] **事件总线** - 发布/订阅模式
- [x] **实体管理** - ECS 架构基础
- [x] **对象池** - 性能优化

#### 2. 渲染系统
- [x] **Canvas2D 渲染** - 微信兼容方案
- [x] **圆角矩形** - 自定义 roundRect 实现
- [x] **分层渲染** - 背景、场景、UI 层级

#### 3. 输入系统
- [x] **触摸事件** - wx.onTouchStart/Move/End
- [x] **点击检测** - 按钮区域判断
- [x] **事件分发** - 统一事件处理

#### 4. 安全模块
- [x] **数据加密** - Crypto.js
- [x] **反作弊** - 数据验证
- [x] **日志系统** - 分级日志

#### 5. 性能监控
- [x] **帧率监控** - FrameRateMonitor
- [x] **性能分析** - Profiler
- [x] **资源懒加载** - LazyLoader

#### 6. 测试框架
- [x] **TestRunner** - 单元测试运行器
- [x] **自动化测试** - 核心模块测试覆盖

### 🔧 开发中功能

#### 1. 花园核心玩法
- [ ] 地块状态管理
- [ ] 种植/收获逻辑
- [ ] 花卉生长动画

#### 2. 道具系统
- [ ] 种子背包
- [ ] 水壶道具
- [ ] 肥料系统

#### 3. UI 系统
- [ ] 游戏内 HUD
- [ ] 背包界面
- [ ] 商店系统

### 📋 规划中功能

#### 1. Cocos Creator 版本
- [ ] TypeScript 重构
- [ ] 3D 渲染优化
- [ ] 粒子系统

#### 2. 抖音适配
- [ ] 平台适配器
- [ ] 支付集成
- [ ] 分享功能

---

## 🚀 快速开始

### 微信小游戏运行

```bash
# 1. 打开微信开发者工具
# 2. 导入项目：选择 deploy/deployment-package-*/wechat/
# 3. 编译运行
```

### 开发环境

```bash
# 进入项目目录
cd D:\AutoHealingGarden

# 运行测试
npm test

# 构建部署包
npm run build
```

---

## 🔧 技术架构

### 核心设计原则

1. **平台无关性** - 核心逻辑不依赖平台 API
2. **状态驱动** - 所有逻辑基于状态机
3. **事件驱动** - 解耦组件通信
4. **性能优先** - 对象池、懒加载

### 渲染调用链

```
Engine._gameLoop()
  -> Engine._update(deltaTime)
     -> StateMachine.update()
     -> EntityManager.update()
     -> Systems.update()
  -> Engine._render()
     -> StateMachine.render(ctx)
        -> Game._renderMenu(ctx) / _renderPlaying(ctx)
     -> RenderSystem.render(ctx)
```

### 输入处理链

```
wx.onTouchStart(e)
  -> Game._handleTouch(e, 'start')
     -> Game._handleClick(x, y)
        -> Game._handleMenuClick(x, y) / _handlePlayingClick(x, y)
           -> Game._startGame() / _showShop() / _showAchievements()
```

---

## 📊 代码统计

| 类别 | 文件数 | 代码行数 | 说明 |
|------|--------|----------|------|
| 引擎核心 | 15 | ~4,000 | Engine、StateMachine、Game 等 |
| 系统模块 | 4 | ~1,500 | Input、Render、Physics、Animation |
| 安全模块 | 3 | ~800 | Crypto、AntiCheat、Logger |
| 性能模块 | 3 | ~500 | Profiler、FrameRateMonitor |
| 测试模块 | 5 | ~600 | 单元测试 |
| 部署包 | ~40 | ~8,000 | 完整可运行包 |
| **总计** | **70+** | **~15,000** | 核心代码 |

---

## 📝 开发规范

### 兼容性规范
- ✅ 微信基础库 3.15.1+ 兼容
- ✅ 无 document/window 直接调用
- ✅ 所有 API 带环境检测

### 代码规范
- ✅ ES6 模块化语法
- ✅ 2 空格缩进
- ✅ 分号结尾
- ✅ 无尾逗号

### 安全规范
- ✅ 空值保护 `(obj || {}).prop`
- ✅ API 回调完整
- ✅ 数据加密存储

---

## 📄 文档清单

| 文档 | 状态 | 路径 |
|------|------|------|
| 架构设计 | ✅ | docs/architecture.md |
| 深度设计 | ✅ | docs/DESIGN_V8_DEEP.md |
| 构建指南 | ✅ | docs/build-operations-guide.md |
| 构建检查 | ✅ | docs/build-verify-checklist.md |
| Cocos 指南 | ✅ | knowledge-base/technical/CocosCreator技能包应用指南.md |
| 合规检查 | ✅ | knowledge-base/compliance/游戏审核检查清单.md |

---

## 👥 团队与联系

| 角色 | 负责人 | 状态 |
|------|--------|------|
| 项目管理 | OpenClaw AI | ✅ 活跃 |
| 技术架构 | OpenClaw AI | ✅ 活跃 |
| 引擎开发 | OpenClaw AI | ✅ 活跃 |
| UI 设计 | - | 📋 待分配 |
| 测试工程师 | - | 📋 待分配 |

---

## 📅 开发进度

```
当前进度: ██████░░░░ 60%

时间线:
├── 2026-04-01 ~ 2026-04-15  🚀 引擎核心开发
│   ├── Engine、StateMachine、EventBus
│   └── 微信小游戏适配
├── 2026-04-15 ~ 2026-04-30  🎮 玩法开发
│   ├── 花园地块系统
│   └── 花卉生长系统
├── 2026-05-01 ~ 2026-05-15  🎨 UI/UX
│   ├── 主菜单、游戏内 HUD
│   └── 道具系统
├── 2026-05-15 ~ 2026-05-31  🧪 测试优化
│   ├── 性能测试
│   └── Bug 修复
└── 2026-06-01 ~ 2026-06-15  🚀 上线准备
    ├── 审核提交
    └── 发布上线
```

---

**© 2026 治愈花园开发团队** - 保留所有权利

*🌿 用心种植，用爱治愈*
