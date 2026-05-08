#!/usr/bin/env python3
"""
创建12个岗位的基础自动化脚本
"""

import os
import json
from pathlib import Path

def create_role_script(role_id, role_config):
    """为单个岗位创建脚本"""
    role_dir = Path(f"automation/roles/{role_id}")
    role_dir.mkdir(parents=True, exist_ok=True)
    
    role_name = role_config["name"]
    description = role_config["description"]
    
    # 创建 __init__.py
    init_content = f'''"""
{role_name}自动化脚本
岗位ID: {role_id}
描述: {description}
"""

__version__ = "1.0.0"
__author__ = "AutoHealingGarden Team"
'''
    
    with open(role_dir / "__init__.py", 'w', encoding='utf-8') as f:
        f.write(init_content)
    
    # 创建 config.json
    config_content = {
        "role_id": role_id,
        "role_name": role_name,
        "description": description,
        "dependencies": role_config.get("dependencies", []),
        "outputs": role_config.get("outputs", []),
        "time_estimate": role_config.get("time_estimate", 1.0),
        "cost_estimate": role_config.get("cost_estimate", 0.1),
        "created_at": "2026-04-05",
        "version": "1.0.0"
    }
    
    with open(role_dir / "config.json", 'w', encoding='utf-8') as f:
        json.dump(config_content, f, indent=2, ensure_ascii=False)
    
    # 创建 main.py
    main_content = f'''#!/usr/bin/env python3
"""
{role_name}主脚本
岗位: {role_name} ({role_id})
"""

import os
import sys
import json
import logging
from datetime import datetime

class {role_id.replace('-', '_').title()}Role:
    """{role_name}自动化类"""
    
    def __init__(self, project_root):
        self.project_root = project_root
        self.role_id = "{role_id}"
        self.role_name = "{role_name}"
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志"""
        log_dir = os.path.join(self.project_root, "outputs", "logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, f"{{self.role_id}}_{{datetime.now().strftime('%Y%m%d_%H%M%S')}}.log")
        
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
        config_file = os.path.join(self.project_root, "automation", "roles", self.role_id, "config.json")
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def execute(self):
        """执行岗位任务"""
        self.logger.info(f"开始执行岗位: {{self.role_name}}")
        
        try:
            # 加载配置
            config = self.load_config()
            
            # 检查依赖
            dependencies = config.get("dependencies", [])
            if dependencies:
                self.logger.info(f"岗位依赖: {{', '.join(dependencies)}}")
            
            # 执行具体任务
            result = self.perform_task(config)
            
            # 生成输出
            outputs = config.get("outputs", [])
            self.generate_outputs(outputs, result)
            
            self.logger.info(f"岗位执行完成: {{self.role_name}}")
            return {{
                "success": True,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "execution_time": datetime.now().isoformat(),
                "outputs": outputs
            }}
            
        except Exception as e:
            self.logger.error(f"岗位执行失败: {{str(e)}}")
            return {{
                "success": False,
                "role_id": self.role_id,
                "role_name": self.role_name,
                "error": str(e),
                "execution_time": datetime.now().isoformat()
            }}
    
    def perform_task(self, config):
        """执行具体任务（子类需重写）"""
        self.logger.info(f"{{self.role_name}}正在执行任务...")
        
        # 模拟任务执行
        import time
        time.sleep(0.5)
        
        return {{
            "task_performed": True,
            "role": self.role_id,
            "timestamp": datetime.now().isoformat()
        }}
    
    def generate_outputs(self, outputs, result):
        """生成输出文件"""
        for output in outputs:
            output_path = os.path.join(self.project_root, output)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            if output.endswith('.json'):
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
            elif output.endswith('.md'):
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(f"# {{self.role_name}}输出报告\\n\\n")
                    f.write(f"生成时间: {{datetime.now().isoformat()}}\\n\\n")
                    f.write(f"执行结果: {{json.dumps(result, indent=2, ensure_ascii=False)}}\\n")
            elif output.endswith('/'):
                # 如果是目录，创建目录
                os.makedirs(output_path, exist_ok=True)
                # 在目录中创建完成标记
                marker_file = os.path.join(output_path, f".{{self.role_id}}_complete.txt")
                with open(marker_file, 'w', encoding='utf-8') as f:
                    f.write(f"{{self.role_name}} 完成于 {{datetime.now().isoformat()}}")
            
            self.logger.info(f"生成输出: {{output}}")

def main():
    """主函数"""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    role = {role_id.replace('-', '_').title()}Role(project_root)
    result = role.execute()
    
    # 输出结果
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 根据结果返回退出码
    sys.exit(0 if result.get("success") else 1)

if __name__ == "__main__":
    main()
'''
    
    with open(role_dir / "main.py", 'w', encoding='utf-8') as f:
        f.write(main_content)
    
    # 创建 requirements.txt
    requirements_content = '''# 岗位依赖包
# 根据实际需要添加

'''
    with open(role_dir / "requirements.txt", 'w', encoding='utf-8') as f:
        f.write(requirements_content)
    
    # 创建 README.md
    readme_content = f'''# {role_name} ({role_id})

## 岗位描述
{description}

## 职责范围
- 自动化执行{role_name}相关任务
- 生成指定输出文件
- 遵守三级验收流程
- 严格控制成本

## 输入依赖
{dependencies_str(role_config.get("dependencies", []))}

## 输出产物
{outputs_str(role_config.get("outputs", []))}

## 执行命令
```bash
python main.py
```

## 配置说明
配置文件: `config.json`
- `role_id`: 岗位ID
- `role_name`: 岗位名称
- `dependencies`: 依赖岗位
- `outputs`: 输出文件列表
- `time_estimate`: 时间估算（小时）
- `cost_estimate`: 成本估算（元）

## 验收标准
1. 成功执行所有任务
2. 生成所有指定的输出文件
3. 无错误或异常
4. 成本控制在预算范围内

## 日志位置
`outputs/logs/{role_id}_*.log`
'''
    
    with open(role_dir / "README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    return True

def dependencies_str(deps):
    """格式化依赖列表"""
    if not deps:
        return "无依赖"
    return "\n".join([f"- `{dep}`" for dep in deps])

def outputs_str(outputs):
    """格式化输出列表"""
    if not outputs:
        return "无指定输出"
    return "\n".join([f"- `{output}`" for output in outputs])

def main():
    """主函数"""
    project_root = Path(__file__).parent.parent
    
    # 加载岗位配置
    roles_config_file = project_root / "automation" / "roles" / "roles_config.json"
    
    if not roles_config_file.exists():
        print(f"错误: 岗位配置文件不存在: {roles_config_file}")
        return False
    
    with open(roles_config_file, 'r', encoding='utf-8') as f:
        roles_config = json.load(f)
    
    print("创建12个岗位的自动化脚本")
    print("=" * 50)
    
    created_count = 0
    for role_id, role_config in roles_config.items():
        print(f"创建岗位: {role_config['name']} ({role_id})")
        
        if create_role_script(role_id, role_config):
            created_count += 1
            print(f"  ✅ 创建成功")
        else:
            print(f"  ❌ 创建失败")
    
    print(f"\n完成! 成功创建 {created_count}/{len(roles_config)} 个岗位脚本")
    
    # 创建启动脚本
    create_startup_script(project_root, roles_config)
    
    return created_count == len(roles_config)

def create_startup_script(project_root, roles_config):
    """创建流水线启动脚本"""
    startup_content = '''#!/usr/bin/env python3
"""
自动化游戏开发流水线启动脚本
功能：启动12岗位自动化流水线
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

def start_pipeline():
    """启动流水线"""
    project_root = Path(__file__).parent.parent
    print("启动自动化游戏开发流水线")
    print("=" * 50)
    print(f"项目根目录: {project_root}")
    print(f"启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 加载岗位配置
    roles_config_file = project_root / "automation" / "roles" / "roles_config.json"
    with open(roles_config_file, 'r', encoding='utf-8') as f:
        roles_config = json.load(f)
    
    print(f"团队规模: {len(roles_config)} 个岗位")
    print()
    
    # 显示岗位列表
    print("岗位列表:")
    for role_id, config in roles_config.items():
        print(f"  • {config['name']} ({role_id})")
        print(f"    描述: {config['description']}")
        print(f"    依赖: {', '.join(config.get('dependencies', [])) or '无'}")
        print(f"    输出: {', '.join(config.get('outputs', []))[:50]}...")
        print()
    
    # 计算关键路径
    execution_order = calculate_execution_order(roles_config)
    print(f"执行顺序: {' → '.join(execution_order)}")
    print()
    
    # 成本估算
    total_cost = sum(config.get('cost_estimate', 0) for config in roles_config.values())
    total_time = sum(config.get('time_estimate', 0) for config in roles_config.values())
    print(f"总成本估算: {total_cost:.2f} 元")
    print(f"总时间估算: {total_time:.2f} 小时")
    print()
    
    # 确认启动
    print("确认启动流水线? (输入 'yes' 确认)")
    confirmation = input("> ").strip().lower()
    
    if confirmation != 'yes':
        print("取消启动")
        return False
    
    print()
    print("开始执行流水线...")
    print("=" * 50)
    
    # 这里可以调用实际的流水线调度器
    # 暂时模拟执行
    print("提示: 实际流水线调度器将在后续版本中实现")
    print("当前版本已创建12个岗位的基础脚本")
    print()
    print("下一步:")
    print("1. 完善各岗位的具体实现")
    print("2. 实现流水线调度器")
    print("3. 开始《自动治愈花园》游戏开发")
    
    return True

def calculate_execution_order(roles_config):
    """计算执行顺序（拓扑排序）"""
    in_degree = {role_id: 0 for role_id in roles_config}
    adjacency = {role_id: [] for role_id in roles_config}
    
    # 构建图
    for role_id, config in roles_config.items():
        for dep in config.get("dependencies", []):
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
    
    return execution_order

if __name__ == "__main__":
    try:
        success = start_pipeline()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"启动失败: {e}")
        sys.exit(1)
'''
    
    startup_file = project_root / "automation" / "start_pipeline.py"
    with open(startup_file, 'w', encoding='utf-8') as f:
        f.write(startup_content)
    
    print(f"创建启动脚本: {startup_file}")
    
    # 使脚本可执行
    try:
        os.chmod(startup_file, 0o755)
    except:
        pass  # Windows下忽略权限设置

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)