/**
 * 广告路由
 */

const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const User = require('../models/User');

// 获取广告配置
router.get('/config', async (req, res) => {
  try {
    const { platform = 'web' } = req.query;
    
    // 平台特定的广告配置
    const adConfigs = {
      web: {
        enabled: true,
        rewardedVideo: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/5224354917', // 测试ID
          rewardAmount: 50,
          cooldown: 300 // 5分钟冷却
        },
        interstitial: {
          enabled: true,
          adUnitId: 'ca-app-pub-3940256099942544/1033173712', // 测试ID
          frequency: 3 // 每3关显示一次
        },
        banner: {
          enabled: false,
          adUnitId: 'ca-app-pub-3940256099942544/6300978111' // 测试ID
        }
      },
      wechat: {
        enabled: true,
        rewardedVideo: {
          enabled: true,
          adUnitId: 'adunit-test-wechat',
          rewardAmount: 60,
          cooldown: 300
        },
        interstitial: {
          enabled: true,
          adUnitId: 'adunit-interstitial-wechat',
          frequency: 4
        },
        banner: {
          enabled: true,
          adUnitId: 'adunit-banner-wechat'
        }
      },
      douyin: {
        enabled: true,
        rewardedVideo: {
          enabled: true,
          adUnitId: 'adunit-test-douyin',
          rewardAmount: 70,
          cooldown: 300
        },
        interstitial: {
          enabled: true,
          adUnitId: 'adunit-interstitial-douyin',
          frequency: 4
        },
        banner: {
          enabled: true,
          adUnitId: 'adunit-banner-douyin'
        }
      }
    };
    
    const config = adConfigs[platform] || adConfigs.web;
    
    res.json({
      success: true,
      data: { config }
    });
    
  } catch (error) {
    console.error('获取广告配置错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 请求广告
router.post('/request', async (req, res) => {
  try {
    const { userId, type, platform } = req.body;
    
    if (!userId || !type || !platform) {
      return res.status(400).json({ error: '用户ID、广告类型和平台是必填项' });
    }
    
    // 验证用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 检查冷却时间（简化版）
    const recentAd = await Ad.findOne({
      userId,
      type,
      platform,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5分钟内
    });
    
    if (recentAd) {
      return res.status(429).json({ 
        error: '广告请求过于频繁',
        data: { cooldownRemaining: 300 } // 5分钟冷却
      });
    }
    
    // 创建广告记录
    const ad = new Ad({
      adId: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      platform,
      status: 'pending',
      reward: {
        coins: type === 'rewarded_video' ? 50 : 0
      }
    });
    
    await ad.save();
    
    // 生成广告信息
    const adInfo = {
      adId: ad.adId,
      type: ad.type,
      platform: ad.platform,
      reward: ad.reward,
      metadata: {
        timestamp: new Date(),
        requestId: ad._id.toString()
      }
    };
    
    res.json({
      success: true,
      message: '广告请求成功',
      data: { ad: adInfo }
    });
    
  } catch (error) {
    console.error('请求广告错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 广告完成回调
router.post('/complete', async (req, res) => {
  try {
    const { adId, status, watchedPercentage = 100, metadata = {} } = req.body;
    
    if (!adId || !status) {
      return res.status(400).json({ error: '广告ID和状态是必填项' });
    }
    
    // 查找广告记录
    const ad = await Ad.findOne({ adId });
    if (!ad) {
      return res.status(404).json({ error: '广告记录不存在' });
    }
    
    // 更新广告状态
    ad.status = status;
    ad.metadata = {
      ...ad.metadata,
      watchedPercentage,
      timestamp: new Date(),
      ...metadata
    };
    
    // 如果广告完成且有奖励，给用户发放奖励
    if (status === 'completed' || status === 'rewarded') {
      const user = await User.findById(ad.userId);
      if (user) {
        user.gameData.coins += ad.reward.coins;
        await user.save();
        
        // 记录奖励发放
        ad.reward = {
          ...ad.reward,
          distributed: true,
          distributedAt: new Date()
        };
      }
    }
    
    await ad.save();
    
    res.json({
      success: true,
      message: '广告状态更新成功',
      data: { 
        ad: {
          id: ad._id,
          adId: ad.adId,
          status: ad.status,
          reward: ad.reward,
          updatedAt: ad.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('更新广告状态错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户广告历史
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 20, type, platform } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: '用户ID是必填项' });
    }
    
    // 验证用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const options = {};
    if (type) options.type = type;
    if (platform) options.platform = platform;
    
    const ads = await Ad.findByUserId(userId, { ...options, limit: parseInt(limit) });
    
    // 统计信息
    const stats = await Ad.getRevenueStats(userId);
    
    res.json({
      success: true,
      data: {
        ads,
        statistics: stats,
        summary: {
          totalAds: ads.length,
          totalCoinsEarned: stats.totalCoins,
          averageReward: ads.length > 0 ? stats.totalCoins / ads.length : 0
        }
      }
    });
    
  } catch (error) {
    console.error('获取广告历史错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 广告收益统计
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;
    
    const matchStage = { status: { $in: ['completed', 'rewarded'] } };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    if (platform) matchStage.platform = platform;
    
    const revenueStats = await Ad.aggregate([
      { $match: matchStage },
      { $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          platform: '$platform',
          type: '$type'
        },
        count: { $sum: 1 },
        totalCoins: { $sum: '$reward.coins' },
        avgCoins: { $avg: '$reward.coins' }
      }},
      { $sort: { '_id.date': -1, '_id.platform': 1 } }
    ]);
    
    res.json({
      success: true,
      data: { revenueStats }
    });
    
  } catch (error) {
    console.error('获取广告收益统计错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;