# 治愈花园 — Cocos Creator 3.8.8 构建操作手册

> 由于 Cocos Creator 3.8.8 不支持 CLI 构建，所有构建操作必须通过 GUI 完成。
> 本手册按步骤指导你完成：打开项目 → 修复场景 → 构建微信小游戏 → 预览真机。

---

## 前置条件

| 项目 | 状态 | 备注 |
|------|------|------|
| Cocos Creator 3.8.8 | ✅ 已安装 | `C:\ProgramData\cocos\editors\Creator\3.8.8` |
| Cocos Dashboard | ✅ 已安装 | `D:\CocosCreator\CocosDashboard` |
| 项目路径 | ✅ 就绪 | `D:\AutoHealingGarden\game` |
| 微信开发者工具 | ❓ 需确认 | 用于预览构建产物 |
| 微信 AppID | ❓ 需确认 | `wx2322a80f2186758f`（之前记录） |

---

## 第一步：在 Cocos Dashboard 中创建新项目

> **预检结果：** 现有项目缺少 `.meta` 文件（Cocos Creator 必须的资产 UUID 映射）和场景文件。最可靠的方式是创建新项目再复制脚本。

**操作：**

1. 打开 **Cocos Dashboard**
2. 点击 **Project** → **New** → 选择 **Cocos Creator 3.8.8**
3. 填写项目信息：
   - **名称**：`AutoHealingGarden`
   - **路径**：选择 `D:\AutoHealingGarden\game-new`（或其他你方便的位置）
   - 模板选择 **Empty 2D** 或 **最小模板**
4. 等待项目创建完成，Cocos Creator 编辑器自动打开
5. 关闭 Cocos Creator 编辑器

**复制脚本文件：**

打开文件资源管理器，将现有脚本文件复制到新项目：

```
源: D:\AutoHealingGarden\game\assets\scripts\*
目标: D:\AutoHealingGarden\game-new\assets\scripts\
```

具体需要复制的目录和文件：

| 源路径 | 目标路径 |
|--------|--------|
| `game/assets/scripts/GameManager.ts` | `game-new/assets/scripts/GameManager.ts` |
| `game/assets/scripts/PlantingSystem.ts` | `game-new/assets/scripts/PlantingSystem.ts` |
| `game/assets/scripts/GardenSystem.ts` | `game-new/assets/scripts/GardenSystem.ts` |
| `game/assets/scripts/EconomySystem.ts` | `game-new/assets/scripts/EconomySystem.ts` |
| `game/assets/scripts/UIManager.ts` | `game-new/assets/scripts/UIManager.ts` |
| `game/assets/scripts/SynthesisSystem.ts` | `game-new/assets/scripts/SynthesisSystem.ts` |
| `game/assets/scripts/SynthesisLogic.ts` | `game-new/assets/scripts/SynthesisLogic.ts` |
| `game/assets/scripts/components/Plot.ts` | `game-new/assets/scripts/components/Plot.ts` |
| `game/assets/scripts/data/FlowerTypes.ts` | `game-new/assets/scripts/data/FlowerTypes.ts` |
| `game/assets/scripts/utils/StorageUtil.ts` | `game-new/assets/scripts/utils/StorageUtil.ts` |
| `game/assets/scripts/platforms/*.ts` | `game-new/assets/scripts/platforms/*.ts` |

**⚠️ 不要复制 `.meta` 文件**（它们不存在，新项目会自动生成）

6. 重新打开 Cocos Creator 编辑器（通过 Dashboard 点击项目）
7. Cocos Creator 会自动为所有新文件生成 `.meta` 文件
8. 观察编辑器底部的编译状态，等待 **绿色勾 ✓ 编译成功**

**预期结果：**
- 编辑器左下角显示 **3.8.8** 版本号
- 编译成功，无红字错误
- 资源管理器中能看到所有导入的 `.ts` 文件

---

## 第二步：在编辑器中创建场景

> **项目缺少场景文件 (MainScene.fire)，需要你手动创建**

**操作（在 Cocos Creator 3.8.8 编辑器中）：**

1. 在 **资源管理器 (Assets)** 面板中，找到 `assets` 目录
2. 在 `assets` 目录下右键 → **创建 → Scene**（或使用 Ctrl+N 快捷键）
3. 命名场景为 **`MainScene`**
4. 在 **层级管理器 (Hierarchy)** 中选中 `MainScene` 节点
5. 在 **属性检查器 (Inspector)** 中设置：
   - Canvas 节点 → 设计分辨率：**720 × 1280**（竖屏）
6. 保存场景：Ctrl+S

**7. 添加 GameManager 组件：**
   - 在 Hierarchy 中创建一个空节点，命名为 **`GameManager`**
   - 选中 `GameManager` 节点
   - 在 Inspector 面板底部点击 **Add Component** → 搜索并选择 **GameManager**（自定义脚本）
   - 同样方式添加：
     - **PlantingSystem** 组件到 GameManager 节点（或创建一个 Garden 子节点挂载）
     - **GardenSystem** 组件（挂载到 Garden 子节点）
     - **EconomySystem** 组件
     - **UIManager** 组件
     - **SynthesisSystem** 组件

   （具体挂载方式参考下面「组件分配推荐」）

**预期结果：**
- 场景文件 `MainScene.fire` 生成在 `assets/` 目录下
- 编辑器中可以看到场景节点树
- 所有脚本组件可以添加到节点上

### 组件分配推荐

| 节点 | 子节点 | 挂载组件 | 说明 |
|------|--------|---------|------|
| Canvas | | UIManager | 720×1280 竖屏，UI渲染层 |
| Canvas/GardenRoot | | PlantingSystem, GardenSystem | 花园交互层 |
| Canvas/GardenRoot/GardenArea | | — | 地块容器（会被 PlantingSystem 自动创建） |
| GameManager | | GameManager, EconomySystem, SynthesisSystem | 业务逻辑层，隐藏节点 |
| — | — | — | 也可以在启动时通过代码创建所有 Manager |

> **推荐方案：** 直接在游戏启动时通过代码创建所有 Manager 节点，场景只需要一个 Canvas 和 UIManager UI 元素。这样更灵活。

---

## 第三步：构建设置

**操作：**

1. 在 Cocos Creator 编辑器中，点击菜单栏 **Project → Build**（或按 Ctrl+Shift+B）
2. 在 Build 面板中，点击 **New Build Task** → 选择平台 **WeChat Mini Game**
3. 填写配置：
   - **AppID**：`wx2322a80f2186758f`（如果已有的话）
   - **构建路径**：`build/wechatgame`（默认）
   - **游戏名称**：`治愈花园`
   - **版本号**：`1.0.0`
   - **模板**：默认可不修改
4. 点击 **Build** 按钮

**预期结果：**
- 构建任务开始，底部显示进度条
- 构建完成后，输出目录生成：
  - `D:\AutoHealingGarden\game\build\wechatgame\`（或你指定的路径）
  - 包含：`game.js`、`game.json`、`project.config.json`、`assets/` 等微信小游戏所需文件

**可能出错的情况：**

| 错误 | 原因 | 处理 |
|------|------|------|
| 找不到场景 MainScene | 场景文件缺失 | 回到第二步创建场景 |
| 脚本编译错误 | TypeScript 语法问题 | 截图错误信息，我会修复 |
| 打包超限 (>4MB) | 默认引擎很大 | 我在构建前会做引擎裁剪优化 |
| xxx.meta 文件缺失 | Cocos 项目未初始化 | 重新导入项目即可 |

---

## 第四步：微信小游戏预览

**操作：**

1. 打开 **微信开发者工具**
2. 点击 **导入项目**
3. 选择：
   - **项目目录**：上一步的构建输出目录（如 `build/wechatgame`）
   - **AppID**：`wx2322a80f2186758f`
   - **项目名称**：`治愈花园`
4. 点击 **导入**
5. 在开发者工具工具栏中点击 **预览** → 用手机微信扫码
6. 在手机上测试游戏功能

**预期结果：**
- 微信开发者工具中显示游戏画面（可能只有空场景或 UI）
- 手机上扫码后打开游戏

---

## 第五步：首次验证后反馈

把你的操作截图和错误信息发给我，我根据实际情况修复。

**第一次构建需要验证的关键项：**

1. ✅ 项目在 Cocos Creator 中能正常打开（无红字错误）
2. ✅ 场景文件创建成功，组件挂载正常
3. ✅ 构建完成，无报错
4. ✅ 微信开发者工具能正常预览
5. ✅ 手机扫码后能打开游戏

---

## 备用方案：如果 Cocos Creator 3.8.8 项目打不开

如果 `D:\AutoHealingGarden\game` 无法在 Cocos Creator 3.8.8 中正常打开：

1. **在 Dashboard 中创建一个全新的 3.8.8 项目**
2. **手动复制文件**：
   - 把 `game/assets/scripts/` 下的所有 `.ts` 文件复制到新项目的对应目录
   - 把 `game/assets/` 下的场景、预制体等资源复制过去
3. **在新项目中创建场景**（参考第二步）
4. **验证编译**：编辑器应自动检测到新文件，编译无错即可

---

> 遇到任何错误，截图发我，我立即分析修复。
