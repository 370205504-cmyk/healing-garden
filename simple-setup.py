#!/usr/bin/env python3
"""
简单项目结构创建脚本（避免编码问题）
"""

import os
import json
from pathlib import Path

def create_dir(path):
    """创建目录"""
    Path(path).mkdir(parents=True, exist_ok=True)
    print(f"创建目录: {path}")
    return True

def create_file(path, content=""):
    """创建文件"""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"创建文件: {path}")
    return True

def main():
    project_root = r"D:\AutoHealingGarden"
    
    print("创建《自动治愈花园》项目结构")
    print("=" * 50)
    
    # 1. 游戏资源目录
    print("\n1. 创建游戏资源目录...")
    game_dirs = [
        "assets/scripts",
        "assets/scenes", 
        "assets/resources/textures",
        "assets/resources/prefabs",
        "assets/resources/sounds",
        "assets/resources/fonts",
        "assets/animations"
    ]
    
    for dir_path in game_dirs:
        create_dir(os.path.join(project_root, dir_path))
    
    # 2. 自动化流水线
    print("\n2. 创建自动化流水线...")
    automation_dirs = [
        "automation/pipeline",
        "automation/monitor",
        "automation/reporter"
    ]
    
    # 12个岗位
    roles = [
        "cost-controller",
        "product-manager", 
        "ui-designer",
        "tech-director",
        "project-manager",
        "cocos-dev",
        "server-dev",
        "tester",
        "auditor",
        "ops-engineer",
        "build-delivery",
        "master-control"
    ]
    
    for role in roles:
        create_dir(os.path.join(project_root, f"automation/roles/{role}"))
    
    # 工具目录
    tools = [
        "code-generator",
        "resource-gen",
        "test-framework",
        "build-tools"
    ]
    
    for tool in tools:
        create_dir(os.path.join(project_root, f"automation/tools/{tool}"))
    
    # 3. 文档目录
    print("\n3. 创建项目文档...")
    doc_dirs = [
        "docs/product",
        "docs/technical",
        "docs/testing",
        "docs/compliance",
        "docs/management"
    ]
    
    for doc_dir in doc_dirs:
        create_dir(os.path.join(project_root, doc_dir))
    
    # 4. 管理系统
    print("\n4. 创建管理系统...")
    management_dirs = [
        "management/cost-control",
        "management/schedule",
        "management/quality",
        "management/risk"
    ]
    
    for mgmt_dir in management_dirs:
        create_dir(os.path.join(project_root, mgmt_dir))
    
    # 5. 知识库
    print("\n5. 创建知识库...")
    kb_dirs = [
        "knowledge-base/technical",
        "knowledge-base/management",
        "knowledge-base/design",
        "knowledge-base/compliance"
    ]
    
    for kb_dir in kb_dirs:
        create_dir(os.path.join(project_root, kb_dir))
    
    # 6. 输出目录
    print("\n6. 创建输出目录...")
    output_dirs = [
        "outputs/builds/wechat",
        "outputs/builds/douyin",
        "outputs/builds/web",
        "outputs/releases/v1.0.0",
        "outputs/reports",
        "outputs/logs"
    ]
    
    for output_dir in output_dirs:
        create_dir(os.path.join(project_root, output_dir))
    
    # 7. 创建关键配置文件
    print("\n7. 创建配置文件...")
    
    # project.json
    project_config = {
        "engine": "cocos-creator",
        "engineVersion": "3.8.8",
        "projectType": "2d",
        "designResolution": {
            "width": 720,
            "height": 1280
        },
        "startScene": "db://assets/scenes/main.fire",
        "scenes": ["db://assets/scenes/main.fire"]
    }
    
    create_file(
        os.path.join(project_root, "project.json"),
        json.dumps(project_config, indent=2, ensure_ascii=False)
    )
    
    # package.json
    package_config = {
        "name": "auto-healing-garden",
        "version": "1.0.0",
        "description": "自动治愈花园 - 自动化开发的休闲解压种植游戏"
    }
    
    create_file(
        os.path.join(project_root, "package.json"),
        json.dumps(package_config, indent=2, ensure_ascii=False)
    )
    
    # 项目信息文件
    project_info = {
        "project_name": "自动治愈花园 (AutoHealingGarden)",
        "project_type": "自动化游戏开发流水线",
        "game_type": "竖屏休闲解压种植游戏",
        "technology_stack": ["Cocos Creator 3.8.8", "TypeScript", "Python"],
        "target_platforms": ["微信小游戏", "抖音小游戏"],
        "team_size": 12,
        "automation_level": "全流程自动化",
        "budget": 10.0,
        "timeline_days": 7,
        "created_at": "2026-04-05",
        "created_by": "团队总控（主Agent）"
    }
    
    create_file(
        os.path.join(project_root, "project-info.json"),
        json.dumps(project_info, indent=2, ensure_ascii=False)
    )
    
    # 创建完成报告
    print("\n" + "=" * 50)
    print("项目结构创建完成")
    print("=" * 50)
    
    # 统计目录和文件
    total_dirs = 0
    total_files = 0
    
    for root, dirs, files in os.walk(project_root):
        total_dirs += len(dirs)
        total_files += len(files)
    
    report = f"""
项目结构创建完成报告
=======================
项目根目录: {project_root}
总目录数: {total_dirs}
总文件数: {total_files}
创建时间: 2026-04-05

主要目录结构:
1. 游戏资源目录 (assets/) - 核心游戏内容
2. 自动化流水线 (automation/) - 12岗位自动化脚本
3. 项目文档 (docs/) - 完整项目文档
4. 管理系统 (management/) - 成本、进度、质量管理
5. 知识库 (knowledge-base/) - 经验积累与复用
6. 输出产物 (outputs/) - 构建和发布产物

下一步行动:
1. 启动自动化流水线开发
2. 开始游戏设计
3. 分配12个岗位任务
4. 启动7天开发倒计时
"""
    
    create_file(os.path.join(project_root, "SETUP_COMPLETE.md"), report)
    print(report)
    print(f"详细报告: {os.path.join(project_root, 'SETUP_COMPLETE.md')}")

if __name__ == "__main__":
    main()