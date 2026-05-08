/**
 * 游戏路由
 */

const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');

// 获取游戏配置
router.get('/config', async (req, res) => {
  try {
    let game = await Game.findOne({ gameId: 'auto_healing_garden' });
    
    // 如果游戏不存在，创建默认配置
    if (!game) {
      game = new Game({
        gameId: 'auto_healing_garden',
        name: '自动治愈花园',
        version: '1.0.0',
        config: {
          maxPlayers: 1000,
          defaultCoins: 100,
          adFrequency: 3,
          levelRewards: {
            1: { coins: 50, items: ['basic_seed'] },
            5: { coins: 100, items: ['rare_seed', 'fertilizer'] },
            10: { coins: 200, items: ['epic_seed', 'golden_watering_can'] }
          },
          plantGrowthTimes: {
            basic_seed: 300, // 5分钟
            rare_seed: 900,  // 15分钟
            epic_seed: 3600  // 1小时
          },
          itemPrices: {
            basic_seed: 10,
            rare_seed: 50,
            epic_seed: 200,
            fertilizer: 30,
            watering_can: 20,
            golden_watering_can: 100
          }
        }
      });
      
      await game.save();
    }
    
    res.json({
      success: true,
      data: {
        game: {
          id: game._id,
          gameId: game.gameId,
          name: game.name,
          version: game.version,
          config: game.config
        }
      }
    });
    
  } catch (error) {
    console.error('获取游戏配置错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新游戏统计
router.post('/statistics', async (req, res) => {
  try {
    const { totalPlayers, totalCoinsEarned, totalAdsWatched, averagePlayTime, retentionRate } = req.body;
    
    const game = await Game.findOneAndUpdate(
      { gameId: 'auto_healing_garden' },
      {
        $set: {
          'statistics.totalPlayers': totalPlayers || 0,
          'statistics.totalCoinsEarned': totalCoinsEarned || 0,
          'statistics.totalAdsWatched': totalAdsWatched || 0,
          'statistics.averagePlayTime': averagePlayTime || 0,
          'statistics.retentionRate': retentionRate || 0
        },
        $currentDate: { updatedAt: true }
      },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: '游戏统计更新成功',
      data: { statistics: game.statistics }
    });
    
  } catch (error) {
    console.error('更新游戏统计错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取游戏状态
router.get('/status', async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: 'auto_healing_garden' });
    
    if (!game) {
      return res.status(404).json({ error: '游戏配置不存在' });
    }
    
    // 获取在线用户数（简化版，实际可能需要Redis）
    const onlineUsers = await User.countDocuments({
      'gameData.lastLogin': { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30分钟内登录
    });
    
    res.json({
      success: true,
      data: {
        game: {
          id: game._id,
          gameId: game.gameId,
          name: game.name,
          version: game.version
        },
        status: {
          onlineUsers,
          totalPlayers: game.statistics.totalPlayers,
          serverTime: new Date(),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        }
      }
    });
    
  } catch (error) {
    console.error('获取游戏状态错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取游戏公告
router.get('/announcements', async (req, res) => {
  try {
    const announcements = [
      {
        id: 1,
        title: '游戏上线公告',
        content: '《自动治愈花园》正式上线！快来体验治愈系种植乐趣。',
        type: 'system',
        priority: 'high',
        createdAt: new Date('2026-04-07T00:00:00Z'),
        expiresAt: new Date('2026-05-07T00:00:00Z')
      },
      {
        id: 2,
        title: '新手福利',
        content: '新用户注册即送100金币和基础种子包！',
        type: 'promotion',
        priority: 'medium',
        createdAt: new Date('2026-04-07T00:00:00Z'),
        expiresAt: new Date('2026-04-14T00:00:00Z')
      },
      {
        id: 3,
        title: '维护通知',
        content: '服务器将于每周三凌晨3:00进行例行维护，预计时长30分钟。',
        type: 'maintenance',
        priority: 'low',
        createdAt: new Date('2026-04-07T00:00:00Z'),
        expiresAt: new Date('2026-12-31T00:00:00Z')
      }
    ];
    
    // 过滤过期公告
    const currentTime = new Date();
    const activeAnnouncements = announcements.filter(
      announcement => announcement.expiresAt > currentTime
    );
    
    res.json({
      success: true,
      data: { announcements: activeAnnouncements }
    });
    
  } catch (error) {
    console.error('获取游戏公告错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 提交游戏反馈
router.post('/feedback', async (req, res) => {
  try {
    const { userId, type, content, contact } = req.body;
    
    if (!content || !type) {
      return res.status(400).json({ error: '反馈内容和类型是必填项' });
    }
    
    // 这里可以保存到数据库，简化版直接返回成功
    console.log('收到游戏反馈:', { userId, type, content, contact, timestamp: new Date() });
    
    res.json({
      success: true,
      message: '反馈提交成功，感谢您的建议！',
      data: { feedbackId: Date.now() }
    });
    
  } catch (error) {
    console.error('提交游戏反馈错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;