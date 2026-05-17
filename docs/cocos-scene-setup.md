# 治愈花园 Cocos Creator 场景搭建指南

## 前置条件

- Cocos Creator 3.8.8 已安装（路径：`C:\ProgramData\cocos\editors\Creator\3.8.8`）
- 通过 Cocos Dashboard 打开 `D:\AutoHealingGarden\game` 项目



## 快速启动

新建场景后：

1. 在场景根节点下创建一个空节点（叫 `Bootstrap` 即可）
2. 在 `Bootstrap` 节点上添加组件：
   - [GameManager](file:///D:\AutoHealingGarden\game\assets\Scripts\GameManager.ts)
   - [PlotSystem](file:///D:\AutoHealingGarden\game\assets\Scripts\PlotSystem.ts)
   - [UIManager](file:///D:\AutoHealingGarden\game\assets\Scripts\UIManager.ts)
   - [GardenBootstrapper](file:///D:\AutoHealingGarden\game\assets\Scripts\GardenBootstrapper.ts)
3. ✅ 点 Preview

`GardenBootstrapper` 和 `UISetupHelper` 自动处理所有引用串联和 UI 创建。

## 手动配置（可选）

如果需要手动设计 UI 而非自动创建：
- Canvas Design Resolution: 750 × 1334, Fit Height ✅, Fit Width ✅
- UIManager 的 Inspector 中绑定 coinsLabel/levelLabel 等

## 故障排查

### 常见问题

**"GameManager 未找到"**
→ 确认 GameManager 组件已挂载到场景某个节点上

**PlotSystem 不显示地块**
→ 确认 PlotSystem 挂载在 Canvas 的子节点上（需要 UITransform 尺寸）
→ 确认 Canvas Design Resolution 设为 750×1334

**点击地块没反应**
→ 确认地块未锁定（前6格才可点击）
→ 查看 Console 是否有 "[PlotSystem]" 前缀的日志

**花卉不显示**
→ 确认 [FlowerVisual](file:///D:\AutoHealingGarden\game\assets\Scripts\FlowerVisual.ts) 已导入项目
→ FlowerVisual 使用 Graphics 组件，无需额外资源

## 文件清单

### 新增文件
| 文件 | 行数 | 用途 |
|------|------|------|
| [PlotSystem.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\PlotSystem.ts) | ~630 | 24格地块系统核心 |
| [FlowerVisual.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\FlowerVisual.ts) | ~350 | 花卉图形渲染（Graphics） |
| [GardenBootstrapper.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\GardenBootstrapper.ts) | ~90 | 系统自动组装器 |
| [UISetupHelper.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\UISetupHelper.ts) | ~180 | 运行时 UI 自动创建 |

### 修改文件
| 文件 | 改动 |
|------|------|
| [GameManager.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\GameManager.ts) | 集成 PlotSystem 引用 + 自动解锁 |
| [UIManager.ts](file:///D:\AutoHealingGarden\game\assets\Scripts\UIManager.ts) | 集成 PlotSystem 事件 + 种植选择 |
