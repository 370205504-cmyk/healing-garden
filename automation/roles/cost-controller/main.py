#!/usr/bin/env python3
"""
预算与成本控制师主脚本
岗位：预算与成本控制师 (cost-controller)
职责：成本核算、预算控制、ROI分析
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

class CostControllerRole:
    """预算与成本控制师自动化类"""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.role_id = "cost-controller"
        self.role_name = "预算与成本控制师"
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志"""
        log_dir = self.project_root / "outputs" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / f"{self.role_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(self.role_name)
    
    def load_config(self):
        """加载岗位配置"""
        config_file = self.project_root / "automation" / "roles" / self.role_id / "config.json"
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def analyze_project_requirements(self):
        """分析项目需求，确定成本要素"""
        self.logger.info("分析项目需求...")
        
        # 读取项目信息
        project_info_file = self.project_root / "project-info.json"
        with open(project_info_file, 'r', encoding='utf-8') as f:
            project_info = json.load(f)
        
        # 读取游戏设计
        game_design_file = self.project_root / "docs" / "product" / "game_design.md"
        with open(game_design_file, 'r', encoding='utf-8') as f:
            game_design = f.read()
        
        # 成本要素分析
        cost_elements = {
            "automation_development": {
                "description": "自动化流水线开发",
                "elements": ["调度器开发", "岗位脚本开发", "工具链开发"],
                "complexity": "高"
            },
            "game_development": {
                "description": "游戏功能开发",
                "elements": ["核心玩法", "UI系统", "经济系统", "社交系统"],
                "complexity": "中高"
            },
            "resource_generation": {
                "description": "资源生成与处理",
                "elements": ["美术资源", "音效资源", "配置数据"],
                "complexity": "中"
            },
            "testing_qa": {
                "description": "测试与质量保证",
                "elements": ["功能测试", "性能测试", "兼容性测试"],
                "complexity": "中"
            },
            "deployment_delivery": {
                "description": "部署与交付",
                "elements": ["构建打包", "环境部署", "上架提报"],
                "complexity": "低中"
            }
        }
        
        return {
            "project_info": project_info,
            "cost_elements": cost_elements,
            "game_complexity": self.assess_game_complexity(game_design)
        }
    
    def assess_game_complexity(self, game_design):
        """评估游戏复杂度"""
        complexity_score = 0
        
        # 基于游戏设计评估复杂度
        if "种植系统" in game_design:
            complexity_score += 1
        if "花园系统" in game_design:
            complexity_score += 1
        if "经济系统" in game_design:
            complexity_score += 2
        if "任务系统" in game_design:
            complexity_score += 1
        if "商店系统" in game_design:
            complexity_score += 1
        if "社交系统" in game_design:
            complexity_score += 2
        
        if complexity_score <= 3:
            return "低"
        elif complexity_score <= 5:
            return "中"
        elif complexity_score <= 7:
            return "中高"
        else:
            return "高"
    
    def allocate_budget(self, total_budget=10.0):
        """分配预算"""
        self.logger.info(f"分配总预算: {total_budget}元")
        
        # 基于项目阶段分配预算
        budget_allocation = {
            "stage_1_foundation": {
                "name": "基础架构搭建",
                "description": "自动化流水线基础架构，12岗位配置",
                "percentage": 0.20,  # 20%
                "budget": total_budget * 0.20,
                "time_days": 2,
                "priority": "高"
            },
            "stage_2_development": {
                "name": "核心开发阶段",
                "description": "游戏核心功能开发，6大系统实现",
                "percentage": 0.50,  # 50%
                "budget": total_budget * 0.50,
                "time_days": 3,
                "priority": "高"
            },
            "stage_3_testing": {
                "name": "测试验证阶段",
                "description": "自动化测试，性能优化，合规审核",
                "percentage": 0.15,  # 15%
                "budget": total_budget * 0.15,
                "time_days": 1,
                "priority": "中"
            },
            "stage_4_delivery": {
                "name": "交付部署阶段",
                "description": "构建打包，上架提报，项目交付",
                "percentage": 0.10,  # 10%
                "budget": total_budget * 0.10,
                "time_days": 1,
                "priority": "中"
            },
            "stage_5_contingency": {
                "name": "应急储备",
                "description": "风险应对，意外处理，缓冲空间",
                "percentage": 0.05,  # 5%
                "budget": total_budget * 0.05,
                "time_days": 0,
                "priority": "低"
            }
        }
        
        # 验证分配总和为100%
        total_percentage = sum(stage["percentage"] for stage in budget_allocation.values())
        assert abs(total_percentage - 1.0) < 0.001, f"预算分配比例错误: {total_percentage}"
        
        return budget_allocation
    
    def create_cost_control_model(self):
        """创建成本控制模型"""
        self.logger.info("创建成本控制模型...")
        
        cost_model = {
            "monitoring_metrics": {
                "real_time_cost": {
                    "description": "实时成本监控",
                    "frequency": "每小时",
                    "thresholds": {
                        "warning": 0.8,  # 达到预算80%预警
                        "critical": 0.9   # 达到预算90%严重警告
                    }
                },
                "cost_per_role": {
                    "description": "岗位成本分析",
                    "frequency": "每日",
                    "analysis": "比较实际成本与估算成本"
                },
                "roi_tracking": {
                    "description": "投资回报率跟踪",
                    "frequency": "阶段结束",
                    "metrics": ["成本效益比", "时间回报率", "质量回报率"]
                }
            },
            "control_mechanisms": {
                "budget_alert": {
                    "description": "预算预警机制",
                    "triggers": ["超预算风险", "进度延迟", "质量下降"],
                    "actions": ["调整分配", "优化流程", "启用应急储备"]
                },
                "cost_optimization": {
                    "description": "成本优化策略",
                    "strategies": ["prompt缓存", "模板复用", "自动化效率提升", "资源优化"]
                },
                "risk_mitigation": {
                    "description": "风险缓解措施",
                    "measures": ["备用方案", "进度缓冲", "预算缓冲", "技术降级"]
                }
            },
            "reporting_framework": {
                "daily_report": {
                    "content": ["当日成本", "累计成本", "预算剩余", "成本趋势"],
                    "format": "JSON + Markdown"
                },
                "stage_report": {
                    "content": ["阶段成本总结", "ROI分析", "经验教训", "改进建议"],
                    "format": "详细报告"
                },
                "final_report": {
                    "content": ["总成本分析", "预算执行情况", "成本效益评估", "经验总结"],
                    "format": "综合报告"
                }
            }
        }
        
        return cost_model
    
    def generate_budget_document(self, analysis_result, budget_allocation, cost_model):
        """生成预算文档"""
        self.logger.info("生成预算文档...")
        
        # 创建预算目录
        budget_dir = self.project_root / "management" / "cost-control"
        budget_dir.mkdir(parents=True, exist_ok=True)
        
        # 生成JSON预算文件
        budget_data = {
            "project": "auto-healing-garden",
            "total_budget": 10.0,
            "currency": "CNY",
            "created_at": datetime.now().isoformat(),
            "created_by": self.role_name,
            "game_complexity": analysis_result["game_complexity"],
            "budget_allocation": budget_allocation,
            "cost_control_model": cost_model,
            "assumptions": [
                "全程prompt缓存开启，减少无效Token消耗",
                "通用模板强制复用，避免重复开发",
                "自动化流程优化，减少人工耗时",
                "实时监控预警，及时调整策略"
            ],
            "constraints": [
                "总预算不得超过10元",
                "任何成本超支10%必须立即预警",
                "应急储备仅用于风险应对",
                "所有成本必须有明确记录和理由"
            ]
        }
        
        budget_file = budget_dir / "budget.json"
        with open(budget_file, 'w', encoding='utf-8') as f:
            json.dump(budget_data, f, indent=2, ensure_ascii=False)
        
        # 生成Markdown报告
        report_file = budget_dir / "cost_control_report.md"
        report_content = self.generate_markdown_report(budget_data)
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        self.logger.info(f"预算文档已生成: {budget_file}")
        self.logger.info(f"成本报告已生成: {report_file}")
        
        return {
            "budget_file": str(budget_file),
            "report_file": str(report_file)
        }
    
    def generate_markdown_report(self, budget_data):
        """生成Markdown格式报告"""
        report = f"""# 《自动治愈花园》项目成本控制报告

## 报告信息
- **生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **生成岗位**: {self.role_name}
- **项目名称**: {budget_data['project']}
- **总预算**: {budget_data['total_budget']} {budget_data['currency']}
- **游戏复杂度评估**: {budget_data['game_complexity']}

## 预算分配方案

### 总预算: {budget_data['total_budget']}元

| 阶段 | 名称 | 预算(元) | 占比 | 时间(天) | 优先级 |
|------|------|----------|------|----------|--------|
"""
        
        for stage_id, stage_data in budget_data['budget_allocation'].items():
            report += f"| {stage_id} | {stage_data['name']} | {stage_data['budget']:.2f} | {stage_data['percentage']*100:.0f}% | {stage_data['time_days']} | {stage_data['priority']} |\n"
        
        report += f"""
### 预算分配饼图
- 基础架构搭建: {budget_data['budget_allocation']['stage_1_foundation']['percentage']*100:.0f}%
- 核心开发阶段: {budget_data['budget_allocation']['stage_2_development']['percentage']*100:.0f}%
- 测试验证阶段: {budget_data['budget_allocation']['stage_3_testing']['percentage']*100:.0f}%
- 交付部署阶段: {budget_data['budget_allocation']['stage_4_delivery']['percentage']*100:.0f}%
- 应急储备: {budget_data['budget_allocation']['stage_5_contingency']['percentage']*100:.0f}%

## 成本控制模型

### 监控指标
"""
        
        for metric_id, metric_data in budget_data['cost_control_model']['monitoring_metrics'].items():
            report += f"#### {metric_data['description']}\n"
            report += f"- **监控频率**: {metric_data['frequency']}\n"
            if 'thresholds' in metric_data:
                for threshold_name, threshold_value in metric_data['thresholds'].items():
                    report += f"- **{threshold_name}阈值**: {threshold_value*100:.0f}%\n"
            report += "\n"
        
        report += """### 控制机制
"""
        
        for mechanism_id, mechanism_data in budget_data['cost_control_model']['control_mechanisms'].items():
            report += f"#### {mechanism_data['description']}\n"
            if 'triggers' in mechanism_data:
                report += f"- **触发条件**: {', '.join(mechanism_data['triggers'])}\n"
            if 'actions' in mechanism_data:
                report += f"- **应对措施**: {', '.join(mechanism_data['actions'])}\n"
            if 'strategies' in mechanism_data:
                report += f"- **优化策略**: {', '.join(mechanism_data['strategies'])}\n"
            if 'measures' in mechanism_data:
                report += f"- **缓解措施**: {', '.join(mechanism_data['measures'])}\n"
            report += "\n"
        
        report += f"""## 关键假设

{budget_data['assumptions'][0]}
{budget_data['assumptions'][1]}
{budget_data['assumptions'][2]}
{budget_data['assumptions'][3]}

## 约束条件

{budget_data['constraints'][0]}
{budget_data['constraints'][1]}
{budget_data['constraints'][2]}
{budget_data['constraints'][3]}

## 执行建议

### 第一阶段（基础架构）成本控制重点
1. **实时监控**：建立每小时成本监控机制
2. **预警设置**：预算使用率达到80%时立即预警
3. **优化措施**：优先使用prompt缓存和模板复用
4. **应急准备**：预留5%应急储备应对意外情况

### 成本效益目标
- **直接效益**：完成《自动治愈花园》游戏开发
- **间接效益**：建立可复用的自动化流水线
- **知识效益**：积累游戏开发与成本控制经验
- **ROI目标**：投资回报率 ≥ 200%

## 风险提示

### 主要风险
1. **技术风险**：自动化代码质量不稳定，可能导致返工成本增加
2. **时间风险**：7天开发周期紧张，进度延迟可能增加成本
3. **资源风险**：AI生成资源质量不达标，可能需要额外优化成本

### 风险缓解
1. **技术备用**：关键环节准备手动替代方案
2. **进度缓冲**：每个阶段预留20%时间缓冲
3. **预算缓冲**：5%应急储备专门用于风险应对

---

**报告状态**: 已生成，等待审核  
**审核流程**: 岗位自检 → 审核专员二审 → 团队总控终审  
**生效时间**: 审核通过后立即生效  

*本报告由{self.role_name}自动化生成，数据基于项目分析和行业最佳实践*"""
        
        return report
    
    def execute(self):
        """执行岗位任务"""
        self.logger.info(f"开始执行岗位: {self.role_name}")
        
        try:
            # 1. 分析项目需求
            analysis_result = self.analyze_project_requirements()
            self.logger.info(f"游戏复杂度评估: {analysis_result['game_complexity']}")
            
            # 2. 分配预算
            budget_allocation = self.allocate_budget(total_budget=10.0)
            self.logger.info("预算分配完成")
            
            # 3. 创建成本控制模型
            cost_model = self.create_cost_control_model()
            self.logger.info("成本控制模型创建完成")
            
            # 4. 生成预算文档
            output_files = self.generate_budget_document(analysis_result, budget_allocation, cost_model)
            
            # 5. 岗位自检
            self.self_check(budget_allocation, cost_model)
            
            self.logger.info(f"岗位执行完成: {self.role_name}")
            
            return {
                "success": True,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "execution_time": datetime.now().isoformat(),
                "outputs": list(output_files.values()),
                "budget_summary": {
                    "total_budget": 10.0,
                    "stage_allocation": {k: v["budget"] for k, v in budget_allocation.items()},
                    "contingency_reserve": budget_allocation["stage_5_contingency"]["budget"]
                },
                "cost_model_ready": True
            }
            
        except Exception as e:
            self.logger.error(f"岗位执行失败: {str(e)}")
            return {
                "success": False,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "error": str(e),
                "execution_time": datetime.now().isoformat()
            }
    
    def self_check(self, budget_allocation, cost_model):
        """岗位自检（三级验收第一级）"""
        self.logger.info("执行岗位自检...")
        
        checks = []
        
        # 检查1: 预算分配总和为10元
        total_budget = sum(stage["budget"] for stage in budget_allocation.values())
        check1 = abs(total_budget - 10.0) < 0.01
        checks.append(("预算分配总和为10元", check1, total_budget))
        
        # 检查2: 应急储备比例合理（3-10%）
        contingency_percentage = budget_allocation["stage_5_contingency"]["percentage"]
        check2 = 0.03 <= contingency_percentage <= 0.10
        checks.append(("应急储备比例合理(3-10%)", check2, f"{contingency_percentage*100:.1f}%"))
        
        # 检查3: 成本控制模型完整
        check3 = all(key in cost_model for key in ["monitoring_metrics", "control_mechanisms", "reporting_framework"])
        checks.append(("成本控制模型完整", check3, "三大组件完整"))
        
        # 检查4: 文档已生成
        budget_file = self.project_root / "management" / "cost-control" / "budget.json"
        report_file = self.project_root / "management" / "cost-control" / "cost_control_report.md"
        check4 = budget_file.exists() and report_file.exists()
        checks.append(("输出文档已生成", check4, f"文件存在: {budget_file.exists() and report_file.exists()}"))
        
        # 输出检查结果
        self.logger.info("自检结果:")
        for check_name, check_result, check_value in checks:
            status = "✅ 通过" if check_result else "❌ 失败"
            self.logger.info(f"  {status} {check_name}: {check_value}")
        
        # 判断是否通过自检
        all_passed = all(check_result for _, check_result, _ in checks)
        
        if all_passed:
            self.logger.info("✅ 岗位自检通过，等待审核专员二审")
            return True
        else:
            self.logger.warning("⚠️ 岗位自检未完全通过，需要改进")
            return False

def main():
    """主函数"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    role = CostControllerRole(project_root)
    result = role.execute()
    
    # 输出结果
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 根据结果返回退出码
    sys.exit(0 if result.get("success") else 1)

if __name__ == "__main__":
    main()