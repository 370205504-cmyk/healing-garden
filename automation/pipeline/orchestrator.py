#!/usr/bin/env python3
"""
自动化游戏开发流水线调度器
功能：协调12个岗位的自动化工作，管理全流程执行
"""

import os
import sys
import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

class PipelineOrchestrator:
    """流水线调度器"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.roles_config = self.load_roles_config()
        self.pipeline_config = self.load_pipeline_config()
        self.current_stage = "initialized"
        self.start_time = datetime.now()
        
        # 设置日志
        self.setup_logging()
        
        # 初始化状态
        self.status = {
            "project": "auto-healing-garden",
            "status": "initialized",
            "current_stage": self.current_stage,
            "start_time": self.start_time.isoformat(),
            "roles_status": {},
            "progress": 0.0,
            "cost_estimate": 0.0,
            "errors": []
        }
    
    def setup_logging(self):
        """设置日志系统"""
        log_dir = self.project_root / "outputs" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / f"pipeline_{self.start_time.strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger("PipelineOrchestrator")
    
    def load_roles_config(self) -> Dict[str, Any]:
        """加载12岗位配置"""
        roles_file = self.project_root / "automation" / "roles" / "roles_config.json"
        
        if roles_file.exists():
            with open(roles_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # 默认配置
        default_roles = {
            "cost-controller": {
                "name": "预算与成本控制师",
                "description": "负责成本核算、预算控制、ROI分析",
                "dependencies": [],
                "outputs": ["budget.json", "cost_report.md"],
                "time_estimate": 0.5,  # 小时
                "cost_estimate": 0.1   # 元
            },
            "product-manager": {
                "name": "产品经理",
                "description": "负责需求分析、产品设计、PRD生成",
                "dependencies": ["cost-controller"],
                "outputs": ["prd.md", "gameplay_design.md"],
                "time_estimate": 1.0,
                "cost_estimate": 0.2
            },
            "ui-designer": {
                "name": "UI/UX设计师",
                "description": "负责UI设计、美术资源生成",
                "dependencies": ["product-manager"],
                "outputs": ["ui_design.json", "textures/"],
                "time_estimate": 1.5,
                "cost_estimate": 0.3
            },
            "tech-director": {
                "name": "技术总监",
                "description": "负责技术架构、技术选型、规范制定",
                "dependencies": ["product-manager"],
                "outputs": ["architecture.md", "tech_stack.json"],
                "time_estimate": 1.0,
                "cost_estimate": 0.2
            },
            "project-manager": {
                "name": "项目经理",
                "description": "负责项目计划、进度跟踪、资源协调",
                "dependencies": ["tech-director", "product-manager"],
                "outputs": ["project_plan.md", "timeline.json"],
                "time_estimate": 0.8,
                "cost_estimate": 0.15
            },
            "cocos-dev": {
                "name": "Cocos开发工程师",
                "description": "负责前端功能开发、性能优化",
                "dependencies": ["tech-director", "ui-designer"],
                "outputs": ["assets/scripts/", "game_modules/"],
                "time_estimate": 3.0,
                "cost_estimate": 0.6
            },
            "server-dev": {
                "name": "服务端开发工程师",
                "description": "负责后端API开发、数据安全",
                "dependencies": ["tech-director"],
                "outputs": ["server/", "api_docs.md"],
                "time_estimate": 2.0,
                "cost_estimate": 0.4
            },
            "tester": {
                "name": "测试工程师",
                "description": "负责自动化测试、性能测试",
                "dependencies": ["cocos-dev", "server-dev"],
                "outputs": ["test_report.md", "performance.json"],
                "time_estimate": 1.5,
                "cost_estimate": 0.3
            },
            "auditor": {
                "name": "审核专员",
                "description": "负责合规审核、版权排查",
                "dependencies": ["tester"],
                "outputs": ["compliance_report.md", "audit_result.json"],
                "time_estimate": 1.0,
                "cost_estimate": 0.2
            },
            "ops-engineer": {
                "name": "运维工程师",
                "description": "负责环境部署、监控配置",
                "dependencies": ["auditor"],
                "outputs": ["deployment_scripts/", "monitoring_config/"],
                "time_estimate": 1.0,
                "cost_estimate": 0.2
            },
            "build-delivery": {
                "name": "构建打包与上线交付工程师",
                "description": "负责构建打包、上架提报",
                "dependencies": ["ops-engineer", "auditor"],
                "outputs": ["builds/", "release_package/"],
                "time_estimate": 1.5,
                "cost_estimate": 0.3
            },
            "master-control": {
                "name": "团队总控",
                "description": "负责全流程调度、质量把控、终审决策",
                "dependencies": ["build-delivery"],
                "outputs": ["final_report.md", "knowledge_base/"],
                "time_estimate": 2.0,
                "cost_estimate": 0.4
            }
        }
        
        # 保存默认配置
        roles_file.parent.mkdir(parents=True, exist_ok=True)
        with open(roles_file, 'w', encoding='utf-8') as f:
            json.dump(default_roles, f, indent=2, ensure_ascii=False)
        
        return default_roles
    
    def load_pipeline_config(self) -> Dict[str, Any]:
        """加载流水线配置"""
        config_file = self.project_root / "automation" / "pipeline" / "config.json"
        
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # 默认配置
        default_config = {
            "project_name": "auto-healing-garden",
            "stages": [
                {"id": "planning", "name": "计划阶段", "duration_hours": 4},
                {"id": "design", "name": "设计阶段", "duration_hours": 8},
                {"id": "development", "name": "开发阶段", "duration_hours": 24},
                {"id": "testing", "name": "测试阶段", "duration_hours": 8},
                {"id": "deployment", "name": "部署阶段", "duration_hours": 4}
            ],
            "total_budget": 10.0,
            "time_limit_days": 7,
            "quality_targets": {
                "code_quality": "no_errors",
                "test_coverage": ">80%",
                "performance": "30fps",
                "compliance": "100%"
            }
        }
        
        # 保存默认配置
        config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2, ensure_ascii=False)
        
        return default_config
    
    def validate_dependencies(self) -> List[str]:
        """验证岗位依赖关系"""
        errors = []
        
        for role_id, role_config in self.roles_config.items():
            for dep in role_config.get("dependencies", []):
                if dep not in self.roles_config:
                    errors.append(f"岗位 {role_id} 依赖不存在的岗位: {dep}")
        
        # 检查循环依赖
        visited = {}
        
        def check_cycle(role_id, path):
            if role_id in visited:
                return visited[role_id]
            
            if role_id in path:
                cycle = path[path.index(role_id):] + [role_id]
                return True, cycle
            
            path.append(role_id)
            
            for dep in self.roles_config[role_id].get("dependencies", []):
                has_cycle, cycle_path = check_cycle(dep, path.copy())
                if has_cycle:
                    return True, cycle_path
            
            path.pop()
            visited[role_id] = (False, [])
            return False, []
        
        for role_id in self.roles_config:
            has_cycle, cycle_path = check_cycle(role_id, [])
            if has_cycle:
                errors.append(f"检测到循环依赖: {' -> '.join(cycle_path)}")
        
        return errors
    
    def calculate_critical_path(self) -> List[str]:
        """计算关键路径"""
        # 简单的拓扑排序
        in_degree = {role_id: 0 for role_id in self.roles_config}
        adjacency = {role_id: [] for role_id in self.roles_config}
        
        # 构建图
        for role_id, role_config in self.roles_config.items():
            for dep in role_config.get("dependencies", []):
                adjacency[dep].append(role_id)
                in_degree[role_id] += 1
        
        # 拓扑排序
        queue = [role_id for role_id, degree in in_degree.items() if degree == 0]
        execution_order = []
        
        while queue:
            current = queue.pop(0)
            execution_order.append(current)
            
            for neighbor in adjacency[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        if len(execution_order) != len(self.roles_config):
            self.logger.warning("可能存在循环依赖，无法计算完整关键路径")
        
        return execution_order
    
    def estimate_total_cost(self) -> float:
        """估算总成本"""
        total_cost = 0.0
        for role_config in self.roles_config.values():
            total_cost += role_config.get("cost_estimate", 0.0)
        return total_cost
    
    def estimate_total_time(self) -> float:
        """估算总时间（小时）"""
        total_time = 0.0
        for role_config in self.roles_config.values():
            total_time += role_config.get("time_estimate", 0.0)
        return total_time
    
    def execute_role(self, role_id: str) -> Dict[str, Any]:
        """执行单个岗位任务"""
        role_config = self.roles_config[role_id]
        role_name = role_config["name"]
        
        self.logger.info(f"开始执行岗位: {role_name} ({role_id})")
        
        # 更新状态
        self.status["roles_status"][role_id] = {
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "progress": 0.0
        }
        
        try:
            # 查找岗位脚本
            role_script = self.project_root / "automation" / "roles" / role_id / "main.py"
            
            if role_script.exists():
                # 执行岗位脚本
                import subprocess
                result = subprocess.run(
                    [sys.executable, str(role_script)],
                    capture_output=True,
                    text=True,
                    cwd=self.project_root
                )
                
                output = {
                    "returncode": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
                
                if result.returncode == 0:
                    self.status["roles_status"][role_id].update({
                        "status": "completed",
                        "end_time": datetime.now().isoformat(),
                        "progress": 1.0,
                        "output": output
                    })
                    self.logger.info(f"岗位执行成功: {role_name}")
                else:
                    self.status["roles_status"][role_id].update({
                        "status": "failed",
                        "end_time": datetime.now().isoformat(),
                        "progress": 0.0,
                        "error": output["stderr"]
                    })
                    self.logger.error(f"岗位执行失败: {role_name}")
                    return {"success": False, "error": output["stderr"]}
            else:
                # 如果没有具体脚本，模拟执行
                self.logger.warning(f"岗位脚本不存在，模拟执行: {role_name}")
                time.sleep(0.5)  # 模拟执行时间
                
                self.status["roles_status"][role_id].update({
                    "status": "completed",
                    "end_time": datetime.now().isoformat(),
                    "progress": 1.0,
                    "output": {"simulated": True}
                })
            
            # 更新进度
            completed = sum(1 for s in self.status["roles_status"].values() if s.get("status") == "completed")
            total = len(self.roles_config)
            self.status["progress"] = completed / total
            
            # 更新成本估算
            self.status["cost_estimate"] = self.estimate_total_cost() * self.status["progress"]
            
            return {"success": True, "role_id": role_id}
            
        except Exception as e:
            error_msg = f"执行岗位 {role_name} 时发生异常: {str(e)}"
            self.logger.error(error_msg)
            
            self.status["roles_status"][role_id].update({
                "status": "failed",
                "end_time": datetime.now().isoformat(),
                "progress": 0.0,
                "error": str(e)
            })
            
            self.status["errors"].append(error_msg)
            return {"success": False, "error": str(e)}
    
    def execute_pipeline(self) -> Dict[str, Any]:
        """执行完整流水线"""
        self.logger.info("开始执行自动化游戏开发流水线")
        self.current_stage = "executing"
        self.status["status"] = "executing"
        
        # 验证依赖
        dependency_errors = self.validate_dependencies()
        if dependency_errors:
            self.logger.error("依赖验证失败")
            for error in dependency_errors:
                self.logger.error(f"  - {error}")
            return {"success": False, "errors": dependency_errors}
        
        # 计算执行顺序
        execution_order = self.calculate_critical_path()
        self.logger.info(f"执行顺序: {' -> '.join(execution_order)}")
        
        # 成本和时间估算
        total_cost = self.estimate_total_cost()
        total_time = self.estimate_total_time()
        self.logger.info(f"估算总成本: {total_cost:.2f}元")
        self.logger.info(f"估算总时间: {total_time:.2f}小时")
        
        # 执行每个岗位
        results = []
        for role_id in execution_order:
            result = self.execute_role(role_id)
            results.append(result)
            
            if not result["success"]:
                self.logger.error(f"流水线在岗位 {role_id} 处失败")
                self.current_stage = "failed"
                self.status["status"] = "failed"
                break
        
        # 检查执行结果
        success_count = sum(1 for r in results if r.get("success"))
        
        if success_count == len(execution_order):
            self.current_stage = "completed"
            self.status["status"] = "completed"
            self.logger.info("流水线执行完成！")
            
            # 生成最终报告
            self.generate_final_report()
            
            return {
                "success": True,
                "roles_executed": len(execution_order),
                "total_cost": self.status["cost_estimate"],
                "total_time": (datetime.now() - self.start_time).total_seconds() / 3600,
                "final_report": str(self.project_root / "outputs" / "reports" / "pipeline_final_report.json")
            }
        else:
            self.current_stage = "partial_complete"
            self.status["status"] = "partial_complete"
            self.logger.warning(f"流水线部分完成: {success_count}/{len(execution_order)}")
            
            return {
                "success": False,
                "roles_executed": success_count,
                "total_roles": len(execution_order),
                "errors": self.status["errors"]
            }
    
    def generate_final_report(self):
        """生成最终报告"""
        report_dir = self.project_root / "outputs" / "reports"
        report_dir.mkdir(parents=True, exist_ok=True)
        
        report_file = report_dir / "pipeline_final_report.json"
        
        final_report = {
            "project": self.pipeline_config.get("project_name", "auto-healing-garden"),
            "execution_id": self.start_time.strftime("%Y%m%d_%H%M%S"),
            "start_time": self.start_time.isoformat(),
            "end_time": datetime.now().isoformat(),
            "duration_hours": (datetime.now() - self.start_time).total_seconds() / 3600,
            "status": self.status["status"],
            "progress": self.status["progress"],
            "total_cost": self.status["cost_estimate"],
            "roles_summary": {},
            "quality_metrics": {},
            "knowledge_extracted": [],
            "recommendations": []
        }
        
        # 汇总岗位执行情况
        for role_id, role_status in self.status["roles_status