/**
 * 游戏数据模型
 */

const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  version: { type: String, default: '1.0.0' },
  config: {
    maxPlayers: { type: Number, default: 1000 },
    defaultCoins: { type: Number, default: 100 },
    adFrequency: { type: Number, default: 3 },
    levelRewards: Map,
    plantGrowthTimes: Map,
    itemPrices: Map
  },
  statistics: {
    totalPlayers: { type: Number, default: 0 },
    totalCoinsEarned: { type: Number, default: 0 },
    totalAdsWatched: { type: Number, default: 0 },
    averagePlayTime: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 索引
GameSchema.index({ gameId: 1 });
GameSchema.index({ name: 1 });
GameSchema.index({ 'statistics.totalPlayers': -1 });

// 中间件：保存前更新时间戳
GameSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 静态方法：查找游戏
GameSchema.statics.findByGameId = function(gameId) {
  return this.findOne({ gameId });
};

// 静态方法：更新统计信息
GameSchema.statics.updateStatistics = async function(gameId, updates) {
  return this.findOneAndUpdate(
    { gameId },
    { $set: { statistics: updates }, $currentDate: { updatedAt: true } },
    { new: true }
  );
};

module.exports = mongoose.model('Game', GameSchema);