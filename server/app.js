/**
 * 自动治愈花园游戏服务器
 * 服务端工程师岗位 - 基础框架
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto_healing_garden';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => console.error('❌ MongoDB连接失败:', err));

// 数据模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  gameData: {
    coins: { type: Number, default: 100 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    unlockedAreas: [{ type: Number, default: [1] }],
    inventory: Map,
    gardenState: Object,
    lastLogin: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,
  startTime: Date,
  endTime: Date,
  actions: Array,
  rewards: Object
});

const User = mongoose.model('User', UserSchema);
const GameSession = mongoose.model('GameSession', GameSessionSchema);

// 基础路由
app.get('/', (req, res) => {
  res.json({
    service: 'Auto Healing Garden Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/users',
      '/api/game-data',
      '/api/shop',
      '/api/leaderboard'
    ]
  });
});

// 用户API - 健康检查端点
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    service: 'Auto Healing Garden User API',
    endpoints: [
      { method: 'POST', path: '/api/users/register', description: '用户注册' },
      { method: 'POST', path: '/api/users/login', description: '用户登录' },
      { method: 'GET', path: '/api/users/profile', description: '获取用户信息' },
      { method: 'PUT', path: '/api/users/game-data', description: '更新游戏数据' },
      { method: 'GET', path: '/api/users/leaderboard', description: '排行榜' }
    ],
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 用户API - 注册
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 简单验证
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码必填' });
    }
    
    // 检查用户是否存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 创建用户（简化版，未加密）
    const user = new User({
      username,
      email,
      passwordHash: password, // 实际应使用bcrypt加密
      gameData: {
        coins: 100,
        level: 1,
        experience: 0,
        unlockedAreas: [1],
        inventory: new Map(),
        gardenState: {},
        lastLogin: new Date()
      }
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: '用户注册成功',
      userId: user._id,
      gameData: user.gameData
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 游戏数据API
app.get('/api/game-data/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      success: true,
      gameData: user.gameData
    });
  } catch (error) {
    console.error('获取游戏数据错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 商店API
app.get('/api/shop/items', (req, res) => {
  const shopItems = [
    { id: 1, name: '向日葵种子', price: 10, type: 'seed', unlockLevel: 1 },
    { id: 2, name: '玫瑰种子', price: 20, type: 'seed', unlockLevel: 2 },
    { id: 3, name: '仙人掌种子', price: 15, type: 'seed', unlockLevel: 3 },
    { id: 4, name: '幸运草种子', price: 5, type: 'seed', unlockLevel: 1 },
    { id: 5, name: '普通肥料', price: 30, type: 'fertilizer', unlockLevel: 2 },
    { id: 6, name: '高级肥料', price: 50, type: 'fertilizer', unlockLevel: 4 },
    { id: 7, name: '花园长椅', price: 100, type: 'decoration', unlockLevel: 3 },
    { id: 8, name: '喷泉', price: 200, type: 'decoration', unlockLevel: 5 }
  ];
  
  res.json({
    success: true,
    items: shopItems
  });
});

// 排行榜API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find({}, 'username gameData.coins gameData.level')
      .sort({ 'gameData.coins': -1, 'gameData.level': -1 })
      .limit(limit);
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      coins: user.gameData.coins,
      level: user.gameData.level
    }));
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// WebSocket连接
io.on('connection', (socket) => {
  console.log('🔄 客户端连接:', socket.id);
  
  // 游戏事件转发
  socket.on('plant-planted', (data) => {
    console.log('🌱 植物种植:', data);
    socket.broadcast.emit('plant-planted', data);
  });
  
  socket.on('plant-harvested', (data) => {
    console.log('💰 植物收获:', data);
    socket.broadcast.emit('plant-harvested', data);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ 客户端断开:', socket.id);
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 WebSocket 运行在 ws://localhost:${PORT}`);
});

module.exports = { app, server, io, User, GameSession };