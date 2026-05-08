/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }
    
    // 检查用户是否存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    
    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建用户
    const user = new User({
      username,
      email,
      passwordHash,
      gameData: {
        coins: 100,
        level: 1,
        experience: 0,
        unlockedAreas: [1],
        lastLogin: new Date()
      }
    });
    
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          gameData: user.gameData
        },
        token
      }
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码是必填项' });
    }
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 更新最后登录时间
    user.gameData.lastLogin = new Date();
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          gameData: user.gameData
        },
        token
      }
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新用户游戏数据
router.put('/game-data', authenticateToken, async (req, res) => {
  try {
    const { gameData } = req.body;
    
    if (!gameData || typeof gameData !== 'object') {
      return res.status(400).json({ error: '游戏数据无效' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 更新游戏数据
    user.gameData = { ...user.gameData, ...gameData };
    await user.save();
    
    res.json({
      success: true,
      message: '游戏数据更新成功',
      data: { gameData: user.gameData }
    });
    
  } catch (error) {
    console.error('更新游戏数据错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'coins', limit = 10 } = req.query;
    
    const sortField = `gameData.${type}`;
    const sortOrder = type === 'level' || type === 'coins' ? -1 : 1;
    
    const users = await User.find()
      .sort({ [sortField]: sortOrder })
      .limit(parseInt(limit))
      .select('username gameData.coins gameData.level gameData.experience');
    
    res.json({
      success: true,
      data: { leaderboard: users }
    });
    
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// JWT认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'development_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;