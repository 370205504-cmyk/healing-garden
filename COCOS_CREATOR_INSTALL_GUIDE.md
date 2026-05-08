# Cocos Creator 3.8.8 安装指南

## 概述
本文档提供《自动治愈花园》游戏开发所需的Cocos Creator 3.8.8安装指南。Cocos Creator是项目构建和打包的核心工具，必须正确安装才能进行实际构建和部署。

## 为什么需要Cocos Creator 3.8.8

### 项目依赖
- **版本要求**: 必须使用 **Cocos Creator 3.8.8** 版本
- **版本锁定原因**: 项目架构和配置基于3.8.8版本开发，其他版本可能导致兼容性问题
- **核心功能**: 游戏场景编辑、资源管理、多平台构建、代码编译

### 环境检查结果
根据环境检查报告，当前环境中 **Cocos Creator 3.8.8未安装**，这是实际上线部署的主要障碍。

## 安装步骤

### 步骤1：下载Cocos Creator

#### 方案一：官方下载（推荐）
```bash
# 访问Cocos官网下载页面
# 网址: https://www.cocos.com/creator/download

# 选择版本: Cocos Creator 3.8.8
# 平台: Windows (64位)
# 文件大小: 约1.2GB

# 下载完成后，运行安装程序
```

#### 方案二：备用下载链接
```bash
# 如果官网下载缓慢，可尝试以下备用链接：
# 1. Cocos国内镜像站
# 2. 百度网盘（如有分享链接）
# 3. 腾讯云存储

# 注意：务必验证文件完整性和安全性
```

### 步骤2：安装Cocos Creator

#### Windows安装步骤
```bash
# 1. 运行下载的安装程序
#    文件名: CocosCreator_v3.8.8_win.exe

# 2. 安装向导
#    - 选择安装语言: 中文(简体)
#    - 接受许可协议
#    - 选择安装路径: 建议使用默认路径
#       默认: C:\Program Files\Cocos\CocosDashboard
#    - 选择组件: 全部勾选（包括Cocos Dashboard）

# 3. 完成安装
#    - 安装过程约需5-10分钟
#    - 安装完成后，确保勾选"启动Cocos Creator"

# 4. 验证安装
#    - 桌面应该出现Cocos Creator图标
#    - 开始菜单应该有Cocos Creator 3.8.8
```

#### 安装路径配置
```bash
# 项目配置的Cocos Creator路径
# 编辑项目根目录的 .env.build 文件：

COCOS_CREATOR_PATH="C:\Program Files\Cocos\CocosDashboard\resources\editors\creator\3.8.8\CocosCreator.exe"

# 如果安装到其他路径，请相应修改
```

### 步骤3：初始配置

#### 首次启动配置
```bash
# 1. 启动Cocos Creator
#    - 双击桌面图标或从开始菜单启动
#    - 首次启动可能需要几分钟初始化

# 2. 登录Cocos账号
#    - 如果没有账号，需要注册
#    - 登录后可以访问在线资源和服务

# 3. 选择工作空间
#    - 设置项目工作空间路径
#    - 建议: D:\CocosProjects\

# 4. 安装必要扩展
#    - TypeScript支持（已内置）
#    - 微信小游戏平台支持
#    - 抖音小游戏平台支持
```

#### 项目打开验证
```bash
# 1. 通过Cocos Creator打开项目
#    - 启动Cocos Creator
#    - 点击"打开其他项目"
#    - 选择项目路径: D:\AutoHealingGarden\game

# 2. 验证项目加载
#    - 应该能看到项目结构
#    - 主场景: MainScene
#    - 资源管理器显示所有资源

# 3. 检查控制台输出
#    - 确保没有错误提示
#    - TypeScript编译应该正常
```

### 步骤4：环境验证

#### 运行安装验证脚本
```bash
# 在项目目录中运行验证脚本
cd D:\AutoHealingGarden
node scripts/environment-check.js

# 预期输出：
# ✅ Cocos Creator 3.8.8安装
# ✅ Cocos项目配置
```

#### 手动验证要点
```bash
# 1. 检查Cocos Creator可执行文件
Test-Path "C:\Program Files\Cocos\CocosDashboard\resources\editors\creator\3.8.8\CocosCreator.exe"

# 2. 检查项目配置文件
Test-Path "D:\AutoHealingGarden\game\settings\project.json"

# 3. 检查命令行调用
# 打开命令提示符，执行：
"C:\Program Files\Cocos\CocosDashboard\resources\editors\creator\3.8.8\CocosCreator.exe" --version
```

## 常见问题解决

### 问题1：安装失败或错误
```bash
# 症状: 安装过程中出现错误，无法完成安装

# 解决方案:
1. 关闭所有杀毒软件和防火墙临时
2. 以管理员身份运行安装程序
3. 确保磁盘空间充足（至少5GB可用空间）
4. 检查.NET Framework版本（需要4.6.1或更高）
5. 尝试重新下载安装包
```

### 问题2：项目无法打开
```bash
# 症状: Cocos Creator无法打开项目，或显示错误

# 解决方案:
1. 确保项目路径不包含中文或特殊字符
2. 检查Cocos Creator版本是否为3.8.8
3. 清理Cocos Creator缓存:
   # Windows缓存位置:
   # C:\Users\[用户名]\.CocosCreator
   # C:\Users\[用户名]\AppData\Local\CocosCreator
4. 重新导入项目
```

### 问题3：构建功能异常
```bash
# 症状: 可以打开项目，但构建功能无法使用

# 解决方案:
1. 检查Cocos Creator登录状态
2. 验证网络连接
3. 更新平台支持插件
4. 重新安装Cocos Creator
```

### 问题4：版本不匹配
```bash
# 症状: 安装了其他版本的Cocos Creator

# 解决方案:
1. 卸载现有版本
2. 清理注册表和残留文件
3. 下载并安装3.8.8版本
4. 验证版本: 帮助 → 关于Cocos Creator
```

## 安装后的项目配置

### 1. 环境变量更新
```bash
# 确认.env.build文件中的路径正确
# 如果不正确，手动更新：

COCOS_CREATOR_PATH="你的实际安装路径"

# 保存后，重新运行环境检查
node scripts/environment-check.js
```

### 2. 项目完整性验证
```bash
# 运行项目验证脚本
node scripts/build-test.js

# 预期: 所有27项测试通过
```

### 3. 构建功能测试
```bash
# 测试Web平台构建
node build/scripts/build.js web

# 预期: 构建成功，生成dist/web/目录
```

## 替代方案

### 方案A：使用Docker容器（高级）
如果无法在主机安装，可以考虑使用Docker：
```dockerfile
# Dockerfile示例
FROM ubuntu:22.04
# 安装Cocos Creator和相关依赖
# 适用于CI/CD环境
```

### 方案B：远程构建服务
```bash
# 使用云构建服务
# 1. 上传项目到云构建平台
# 2. 远程执行构建
# 3. 下载构建产物

# 注意: 需要配置平台AppID和敏感信息保护
```

### 方案C：开发环境共享
```bash
# 如果有其他已安装Cocos Creator的开发环境
# 1. 共享构建产物
# 2. 远程桌面连接构建
# 3. 版本控制同步
```

## 安装验证清单

### 基本验证
- [ ] Cocos Creator 3.8.8安装程序下载完成
- [ ] 安装过程无错误
- [ ] Cocos Creator可以正常启动
- [ ] 可以登录Cocos账号
- [ ] 可以打开项目 `D:\AutoHealingGarden\game`

### 环境验证
- [ ] 环境检查脚本通过: `node scripts/environment-check.js`
- [ ] Cocos Creator路径配置正确
- [ ] 项目配置文件存在
- [ ] TypeScript编译正常

### 功能验证
- [ ] 可以打开主场景 MainScene
- [ ] 资源管理器显示正常
- [ ] 控制台无错误输出
- [ ] 构建菜单可用

## 安装时间预估

### 标准安装流程
```yaml
下载时间: 10-30分钟 (取决于网速)
安装时间: 5-10分钟
配置时间: 5分钟
验证时间: 5分钟
总计: 25-50分钟
```

### 快速安装（如果已有下载）
```yaml
安装时间: 5分钟
配置时间: 3分钟
验证时间: 2分钟
总计: 10分钟
```

## 技术支持

### 官方支持
- **Cocos官方文档**: https://docs.cocos.com/creator/manual/zh/
- **Cocos论坛**: https://forum.cocos.org/
- **技术支持**: support@cocos.com

### 项目支持
- **环境问题**: 运行 `node scripts/environment-check.js` 查看详细报告
- **安装问题**: 参考本文档的常见问题解决部分
- **配置问题**: 检查 `.env.build` 文件和项目配置

### 紧急联系
如果遇到无法解决的问题：
1. 记录详细的错误信息
2. 截图错误界面
3. 检查日志文件
4. 联系技术支持

## 后续步骤

### 安装完成后
```bash
# 1. 验证安装
node scripts/environment-check.js

# 2. 测试构建功能
node build/scripts/build.js web

# 3. 准备实际上线
# 按照 LAUNCH_PLAN.md 的时间表开始部署
```

### 实际上线准备
一旦Cocos Creator安装完成，项目将具备完整的"跑通上线"能力：
1. **实际构建测试**: 验证多平台构建功能
2. **部署环境配置**: 准备服务器和平台配置
3. **上线流程执行**: 按计划开始实际上线

---

**文档版本**: v1.0.0  
**最后更新**: 2026-04-07  
**适用版本**: Cocos Creator 3.8.8  
**验证状态**: 基于环境检查结果制定  
**安装目标**: 使项目具备完整的实际构建能力