// 自动治愈花园游戏配置文件
// 存储路径：D:\AutoHealingGarden\config\game.config.js

module.exports = {
  // 游戏基础配置
  game: {
    name: '自动治愈花园',
    version: '1.0.0',
    slogan: '种一片花园，治愈所有不开心',
    description: '国内首款「零压力情绪疗愈向」自动养成休闲小游戏'
  },
  
  // 花园配置
  garden: {
    // 花田配置
    plots: {
      maxCount: 24,
      initialCount: 6,
      rows: 4,
      cols: 6,
      size: 100,
      spacing: 20,
      unlockLevels: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46]
    },
    
    // 花卉配置
    flowers: {
      // 普通花卉（初始解锁）
      common: [
        {
          id: 'sunflower',
          name: '向日葵',
          emoji: '🌻',
          growthTime: 600, // 10分钟
          reward: { coins: 10, exp: 10 },
          price: 5,
          description: '向阳而生，带来温暖与希望',
          unlockLevel: 1
        },
        {
          id: 'tulip',
          name: '郁金香',
          emoji: '🌷',
          growthTime: 1200, // 20分钟
          reward: { coins: 20, exp: 15 },
          price: 10,
          description: '优雅绽放，传递美好祝福',
          unlockLevel: 1
        },
        {
          id: 'rose',
          name: '玫瑰',
          emoji: '🌹',
          growthTime: 3600, // 1小时
          reward: { coins: 50, exp: 30 },
          price: 25,
          description: '爱与浪漫的象征，温暖心灵',
          unlockLevel: 1
        }
      ],
      
      // 稀有花卉（等级解锁）
      rare: [
        {
          id: 'sakura',
          name: '樱花',
          emoji: '🌸',
          growthTime: 7200, // 2小时
          reward: { coins: 100, exp: 50 },
          price: 50,
          description: '短暂而绚烂，珍惜当下美好',
          unlockLevel: 5
        },
        {
          id: 'lavender',
          name: '薰衣草',
          emoji: '💜',
          growthTime: 21600, // 6小时
          reward: { coins: 300, exp: 100 },
          price: 150,
          description: '宁静安神，缓解焦虑与压力',
          unlockLevel: 10
        },
        {
          id: 'clover',
          name: '四叶草',
          emoji: '🍀',
          growthTime: 43200, // 12小时
          reward: { coins: 600, exp: 200 },
          price: 300,
          description: '幸运的象征，带来好运与惊喜',
          unlockLevel: 15
        }
      ]
    },
    
    // 花园装饰
    decorations: {
      backgrounds: [
        { id: 'spring', name: '春日花园', price: 0, unlockLevel: 1 },
        { id: 'summer', name: '夏日森林', price: 100, unlockLevel: 3 },
        { id: 'autumn', name: '秋日枫林', price: 300, unlockLevel: 8 },
        { id: 'winter', name: '冬日雪景', price: 500, unlockLevel: 12 }
      ],
      
      foregrounds: [
        { id: 'butterfly', name: '蝴蝶飞舞', price: 50, unlockLevel: 2 },
        { id: 'bird', name: '小鸟停驻', price: 100, unlockLevel: 5 },
        { id: 'rabbit', name: '小兔嬉戏', price: 200, unlockLevel: 10 }
      ]
    }
  },
  
  // 游戏经济系统
  economy: {
    // 初始资源
    initialResources: {
      coins: 100,
      gems: 0
    },
    
    // 升级所需经验
    levelUpExp: {
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
      6: 600,
      7: 700,
      8: 800,
      9: 900,
      10: 1000,
      11: 1100,
      12: 1200,
      13: 1300,
      14: 1400,
      15: 1500,
      16: 1600,
      17: 1700,
      18: 1800,
      19: 1900,
      20: 2000
    },
    
    // 花田解锁价格
    plotUnlockPrice: {
      7: 100,   // 第7块花田
      8: 150,
      9: 200,
      10: 250,
      11: 300,
      12: 350,
      13: 400,
      14: 450,
      15: 500,
      16: 550,
      17: 600,
      18: 650,
      19: 700,
      20: 750,
      21: 800,
      22: 850,
      23: 900,
      24: 1000
    }
  },
  
  // 社交系统配置
  social: {
    // 微信端功能
    wechat: {
      friendVisitReward: 10, // 好友拜访奖励
      friendWaterReward: 5,  // 好友浇水奖励
      shareReward: 20        // 分享奖励
    },
    
    // 抖音端功能
    douyin: {
      videoReward: 50,       // 视频发布奖励
      inviteReward: 100      // 邀请好友奖励
    }
  },
  
  // 广告配置
  ads: {
    // 激励视频广告
    rewardedVideo: {
      doubleHarvest: 'ad_unit_id_1',      // 双倍收获
      growthAccelerate: 'ad_unit_id_2',   // 生长加速
      signInBonus: 'ad_unit_id_3',        // 签到翻倍
      freeSeed: 'ad_unit_id_4',           // 免费种子
      vipTrial: 'ad_unit_id_5'            // VIP试用
    },
    
    // Banner广告
    banner: {
      collectionPage: 'ad_unit_id_b1',    // 图鉴页
      decoratePage: 'ad_unit_id_b2',      // 装扮页
      settingPage: 'ad_unit_id_b3'        // 设置页
    }
  },
  
  // 内购配置
  iap: {
    // 永久特权
    permanent: [
      { id: 'no_ads', name: '永久无广告', price: 6, description: '永久去除所有广告' },
      { id: 'vip', name: '永久VIP', price: 30, description: '永久VIP特权' }
    ],
    
    // 月卡/季卡/年卡
    subscriptions: [
      { id: 'monthly', name: '花园治愈月卡', price: 30, duration: 30 },
      { id: 'quarterly', name: '花园治愈季卡', price: 88, duration: 90 },
      { id: 'yearly', name: '花园治愈年卡', price: 268, duration: 365 }
    ],
    
    // 礼包
    packs: [
      { id: 'newbie', name: '新手治愈礼包', price: 6, items: { coins: 200, seeds: ['sunflower', 'tulip'] } },
      { id: 'growth', name: '等级成长礼包', price: 18, items: { coins: 500, exp: 200 } },
      { id: 'premium', name: '豪华礼包', price: 30, items: { coins: 1000, gems: 50 } }
    ],
    
    // 装扮
    decorations: [
      { id: 'fountain', name: '喷泉装饰', price: 1 },
      { id: 'bench', name: '花园长椅', price: 2 },
      { id: 'lantern', name: '花园灯笼', price: 3 },
      { id: 'spring_set', name: '春季套装', price: 18 },
      { id: 'summer_set', name: '夏季套装', price: 25 },
      { id: 'autumn_set', name: '秋季套装', price: 30 }
    ]
  },
  
  // 音效配置
  audio: {
    // 背景音乐
    bgm: {
      main: 'bgm_main.mp3',
      calm: 'bgm_calm.mp3',
      night: 'bgm_night.mp3'
    },
    
    // 音效
    sfx: {
      click: 'sfx_click.mp3',
      plant: 'sfx_plant.mp3',
      harvest: 'sfx_harvest.mp3',
      levelUp: 'sfx_levelup.mp3',
      unlock: 'sfx_unlock.mp3',
      coin: 'sfx_coin.mp3'
    },
    
    // 环境音效
    ambient: {
      birds: 'ambient_birds.mp3',
      rain: 'ambient_rain.mp3',
      wind: 'ambient_wind.mp3'
    }
  },
  
  // 性能配置
  performance: {
    maxFPS: 60,
    autoSaveInterval: 30000, // 30秒自动保存
    cacheSize: 50
  }
};