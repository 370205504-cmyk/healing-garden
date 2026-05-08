# 《自动治愈花园》项目结构

## 项目概述
- **项目名称**：自动治愈花园（AutoHealingGarden）
- **游戏类型**：竖屏休闲解压种植游戏
- **技术栈**：Cocos Creator 3.8.8 + TypeScript
- **目标平台**：微信小游戏（主）、抖音小游戏（备）
- **开发模式**：100%自动化流水线开发
- **存储位置**：D:\AutoHealingGarden（遵守存储红线）

## 目录结构

### 1. 核心游戏项目
```
AutoHealingGarden/
├── assets/                    # 游戏资源
│   ├── scripts/              # TypeScript脚本
│   ├── scenes/               # 游戏场景
│   ├── resources/            # 资源文件
│   │   ├── textures/         # 图片纹理
│   │   ├── prefabs/          # 预制体
│   │   ├── sounds/           # 音效
│   │   └── fonts/            # 字体
│   └── animations/           # 动画资源
├── project.json              # 项目配置文件
├── package.json              # 依赖配置
└── tsconfig.json             # TypeScript配置
```

### 2. 自动化流水线
```
AutoHealingGarden/
├── automation/               # 自动化流水线
│   ├── pipeline/            # 流水线核心
│   │   ├── orchestrator.py  # 总调度器
│   │   ├── monitor.py       # 进度监控
│   │   └── reporter.py      # 报告生成
│   ├── roles/               # 12岗位自动化脚本
│   │   ├── cost-controller/ # 预算与成本控制师
│   │   ├── product-manager/ # 产品经理
│   │   ├── ui-designer/     # UI/UX设计师
│   │   ├── tech-director/   # 技术总监
│   │   ├── project-manager/ # 项目经理
│   │   ├── cocos-dev/       # Cocos开发工程师
│   │   ├── server-dev/      # 服务端开发工程师
│   │   ├── tester/          # 测试工程师
│   │   ├── auditor/         # 审核专员
│   │   ├── ops-engineer/    # 运维工程师
│   │   ├── build-delivery/  # 构建打包与上线交付工程师
│   │   └── master-control/  # 团队总控
│   ├── tools/               # 自动化工具
│   │   ├── code-generator/  # 代码生成器
│   │   ├── resource-gen/    # 资源生成器
│   │   ├── test-framework/  # 测试框架
│   │   └── build-tools/     # 构建工具
│   └── templates/           # 模板库
│       ├── code-templates/  # 代码模板
│       ├── doc-templates/   # 文档模板
│       └── config-templates/# 配置模板
```

### 3. 项目文档
```
AutoHealingGarden/
├── docs/                     # 项目文档
│   ├── product/             # 产品文档
│   │   ├── prd.md           # 产品需求文档
│   │   ├── gameplay.md      # 玩法设计
│   │   └── ui-design.md     # UI设计
│   ├── technical/           # 技术文档
│   │   ├── architecture.md  # 架构设计
│   │   ├── api-docs.md      # API文档
│   │   └── deployment.md    # 部署文档
│   ├── testing/             # 测试文档
│   │   ├── test-plan.md     # 测试计划
│   │   ├── test-cases.md    # 测试用例
│   │   └── performance.md   # 性能报告
│   └── compliance/          # 合规文档
│       ├── audit-report.md  # 审核报告
│       └── copyright.md     # 版权声明
```

### 4. 管理与协同
```
AutoHealingGarden/
├── management/              # 项目管理
│   ├── cost-control/       # 成本控制
│   │   ├── budget.json     # 预算文件
│   │   ├── cost-tracker.py # 成本跟踪
│   │   └── roi-analysis.py # ROI分析
│   ├── schedule/           # 进度管理
│   │   ├── timeline.json   # 时间线
│   │   ├── milestones.md   # 里程碑
│   │   └── gantt-chart.py  # 甘特图
│   └── quality/            # 质量管理
│       ├── checklist.md    # 检查清单
│       └── acceptance.py   # 验收标准
```

### 5. 知识库
```
AutoHealingGarden/
├── knowledge-base/         # 知识库
│   ├── technical/          # 技术知识
│   │   ├── cocos-best-practices.md
│   │   ├── typescript-patterns.md
│   │   └── automation-tips.md
│   ├── management/         # 管理知识
│   │   ├── cost-control-methods.md
│   │   ├── team-coordination.md
│   │   └── risk-management.md
│   ├── design/             # 设计知识
│   │   ├── ui-patterns.md
│   │   ├── game-design.md
│   │   └── user-experience.md
│   └── compliance/         # 合规知识
│       ├── platform-rules.md
│       ├── copyright-guide.md
│       └── content-policy.md
```

### 6. 输出产物
```
AutoHealingGarden/
├── outputs/                # 输出产物
│   ├── builds/             # 构建产物
│   │   ├── wechat/         # 微信小游戏
│   │   ├── douyin/         # 抖音小游戏
│   │   └── web/            # H5版本
│   ├── releases/           # 发布包
│   │   ├── v1.0.0/         # 版本1.0.0
│   │   └── latest/         # 最新版本
│   └── reports/            # 报告文件
│       ├── final-report.md # 最终报告
│       └── delivery-package.zip # 交付包
```

## 存储规则
1. **强制存储位置**：所有文件必须存储在D:\AutoHealingGarden
2. **C盘禁止**：绝对禁止在C盘写入任何文件
3. **分类存储**：按功能模块分类存储，便于管理
4. **版本控制**：重要文件版本化管理
5. **备份机制**：定期备份关键文件

## 自动化流水线工作流程
```
1. 需求输入 → 2. 成本预算 → 3. 产品设计 → 4. 技术架构 → 
5. UI设计 → 6. 项目计划 → 7. 代码开发 → 8. 资源生成 → 
9. 测试验证 → 10. 合规审核 → 11. 环境部署 → 12. 构建打包 → 
13. 上架提报 → 14. 交付验收
```

## 创建脚本
创建此目录结构的自动化脚本位于：`D:\AutoHealingGarden\automation\setup\create-structure.py`

**创建时间**：2026-04-05  
**创建人**：团队总控（主Agent）  
**状态**：待执行