# 自动治愈花园游戏服务器

## 概述
这是《自动治愈花园》游戏的后端服务器，提供用户管理、游戏数据存储、商店API、排行榜和实时通信功能。

## 技术栈
- **Node.js** 18+
- **Express.js** 4.18 - Web框架
- **MongoDB** + **Mongoose** - 数据库
- **Socket.IO** - 实时通信
- **JWT** - 身份验证
- **bcryptjs** - 密码加密

## 功能特性

### 1. 用户系统
- 用户注册/登录
- 游戏数据持久化
- 安全认证（JWT）

### 2. 游戏数据API
- 获取/更新玩家游戏状态
- 背包管理
- 花园状态同步

### 3. 商店系统
- 商品列表
- 购买交易
- 等级解锁验证

### 4. 排行榜
- 实时金币/等级排名
- 前10名榜单

### 5. 实时通信
- 植物种植/收获广播
- 多人互动事件
- 实时状态更新

## 快速开始

### 环境要求
- Node.js 18+
- MongoDB 6.0+ (本地或云服务)

### 安装
```bash
cd server
npm install
```

### 配置
1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件：
```
MONGODB_URI=mongodb://localhost:27017/auto_healing_garden
JWT_SECRET=your-secret-key
PORT=3000
```

### 运行
**开发模式** (带热重载)：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

### 测试
```bash
npm test
```

## API文档

### 基础信息
- `GET /` - 服务器状态和端点列表

### 用户API
- `POST /api/users/register` - 注册新用户
- `POST /api/users/login` - 用户登录
- `GET /api/users/:id` - 获取用户信息

### 游戏数据API
- `GET /api/game-data/:userId` - 获取游戏数据
- `PUT /api/game-data/:userId` - 更新游戏数据
- `POST /api/game-data/:userId/actions` - 记录游戏动作

### 商店API
- `GET /api/shop/items` - 获取商品列表
- `POST /api/shop/purchase` - 购买商品

### 排行榜API
- `GET /api/leaderboard` - 获取排行榜
- `GET /api/leaderboard/:userId` - 获取用户排名

## WebSocket事件

### 客户端发送事件
- `plant-planted` - 植物种植
- `plant-harvested` - 植物收获
- `garden-updated` - 花园更新
- `player-joined` - 玩家加入

### 服务器广播事件
- `plant-planted` - 其他玩家种植
- `plant-harvested` - 其他玩家收获
- `leaderboard-updated` - 排行榜更新
- `system-message` - 系统消息

## 数据模型

### User（用户）
```javascript
{
  username: String,      // 用户名
  email: String,         // 邮箱
  passwordHash: String,  // 密码哈希
  gameData: {            // 游戏数据
    coins: Number,       // 金币
    level: Number,       // 等级
    experience: Number,  // 经验
    unlockedAreas: Array, // 解锁区域
    inventory: Map,      // 背包
    gardenState: Object, // 花园状态
    lastLogin: Date      // 最后登录
  }
}
```

### GameSession（游戏会话）
```javascript
{
  userId: ObjectId,      // 用户ID
  sessionId: String,     // 会话ID
  startTime: Date,       // 开始时间
  endTime: Date,         // 结束时间
  actions: Array,        // 动作记录
  rewards: Object        // 奖励记录
}
```

## 部署

### 本地部署
1. 安装并启动 MongoDB
2. 配置环境变量
3. 运行 `npm start`

### Docker部署
```bash
docker build -t auto-healing-garden-server .
docker run -p 3000:3000 --env-file .env auto-healing-garden-server
```

### 云部署
支持部署到：
- **Vercel** (Serverless)
- **Railway**
- **Heroku**
- **AWS EC2** / **EKS**

## 开发说明

### 项目结构
```
server/
├── app.js              # 主应用文件
├── package.json        # 依赖配置
├── .env.example        # 环境变量模板
├── models/             # 数据模型
├── routes/             # API路由
├── middleware/         # 中间件
├── utils/              # 工具函数
├── tests/              # 测试文件
└── docs/               # 文档
```

### 代码规范
- 使用ES6+语法
- 异步操作使用 async/await
- 错误处理使用try-catch
- 日志记录使用console.log/warn/error

### 测试策略
- 单元测试: Jest
- 集成测试: Supertest
- 覆盖率目标: 80%+

## 监控与维护

### 日志
- 控制台输出（开发环境）
- 文件日志（生产环境）
- 错误追踪（Sentry）

### 性能监控
- 响应时间监控
- 内存使用监控
- 数据库连接池监控

### 备份策略
- 每日数据库备份
- 配置文件版本控制
- 环境变量加密存储

## 联系方式
- **项目负责人**: 服务端工程师岗位
- **问题反馈**: GitHub Issues
- **文档更新**: 随代码变更同步更新

---

**最后更新**: 2026-04-07  
**版本**: 1.0.0 (基础框架)