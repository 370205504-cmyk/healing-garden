#!/usr/bin/env python3
"""
修复create-role-scripts.py中的错误
"""

import re

def fix_create_role_scripts():
    file_path = r"D:\AutoHealingGarden\automation\create-role-scripts.py"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修复第75行：log_file = os.path.join(log_dir, f"{self.role_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    # 需要将f-string转义：f"{self.role_id}..." -> f"{{self.role_id}}..."
    pattern = r'log_file = os\.path\.join\(log_dir, f"\{self\.role_id\}_\{datetime\.now\(\)\.strftime\(\'%Y%m%d_%H%M%S\'\)\}\.log"\)'
    
    # 更简单的替换：找到包含该行的部分
    # 替换整个有问题的行
    # 使用更稳健的方法：找到包含f"{self.role_id}的行并替换
    
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        if 'f"{self.role_id}' in line and 'datetime.now().strftime' in line:
            # 转义花括号
            line = line.replace('f"{self.role_id}', 'f"{{self.role_id}}')
            line = line.replace('_{datetime.now().strftime(\'%Y%m%d_%H%M%S\')}', '_{{datetime.now().strftime(\'%Y%m%d_%H%M%S\')}}')
            print("修复行:", line)
        fixed_lines.append(line)
    
    fixed_content = '\n'.join(fixed_lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("✅ 修复完成")
    
    # 测试修复
    test_fix()

def test_fix():
    """测试修复后的脚本"""
    import sys
    sys.path.insert(0, r"D:\AutoHealingGarden\automation")
    
    try:
        # 尝试导入并运行主函数
        import create_role_scripts
        print("✅ 脚本可以导入")
        
        # 尝试创建第一个岗位的脚本
        import json
        from pathlib import Path
        
        project_root = Path(r"D:\AutoHealingGarden")
        roles_config_file = project_root / "automation" / "roles" / "roles_config.json"
        
        with open(roles_config_file, 'r', encoding='utf-8') as f:
            roles_config = json.load(f)
        
        # 只测试第一个岗位
        first_role_id = list(roles_config.keys())[0]
        first_role_config = roles_config[first_role_id]
        
        # 调用修复后的函数
        from create_role_scripts import create_role_script
        result = create_role_script(first_role_id, first_role_config)
        
        if result:
            print(f"✅ 成功创建岗位脚本: {first_role_id}")
        else:
            print(f"❌ 创建岗位脚本失败: {first_role_id}")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_create_role_scripts()