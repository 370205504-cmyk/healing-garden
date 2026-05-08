/**
 * 广告数据模型
 */

const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  adId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['rewarded_video', 'interstitial', 'banner'],
    required: true 
  },
  platform: { 
    type: String, 
    enum: ['wechat', 'douyin', 'web'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'shown', 'completed', 'failed', 'rewarded'],
    default: 'pending'
  },
  reward: {
    coins: { type: Number, default: 0 },
    items: [String],
    bonuses: Map
  },
  metadata: {
    adUnitId: String,
    placementId: String,
    duration: Number,
    watchedPercentage: Number,
    timestamp: Date
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

// 索引
AdSchema.index({ adId: 1 });
AdSchema.index({ userId: 1 });
AdSchema.index({ type: 1 });
AdSchema.index({ platform: 1 });
AdSchema.index({ status: 1 });
AdSchema.index({ createdAt: -1 });

// 中间件：完成时设置完成时间
AdSchema.pre('save', function(next) {
  if (this.isModified('status') && ['completed', 'rewarded'].includes(this.status)) {
    this.completedAt = new Date();
  }
  next();
});

// 静态方法：查找用户广告
AdSchema.statics.findByUserId = function(userId, options = {}) {
  const query = { userId };
  if (options.type) query.type = options.type;
  if (options.platform) query.platform = options.platform;
  if (options.status) query.status = options.status;
  
  return this.find(query).sort({ createdAt: -1 }).limit(options.limit || 100);
};

// 静态方法：统计广告收益
AdSchema.statics.getRevenueStats = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: { $in: ['completed', 'rewarded'] } } },
    { $group: {
      _id: null,
      totalAds: { $sum: 1 },
      totalCoins: { $sum: '$reward.coins' },
      byType: { $push: { type: '$type', coins: '$reward.coins' } },
      byPlatform: { $push: { platform: '$platform', coins: '$reward.coins' } }
    }}
  ]);
  
  return result[0] || { totalAds: 0, totalCoins: 0, byType: [], byPlatform: [] };
};

module.exports = mongoose.model('Ad', AdSchema);