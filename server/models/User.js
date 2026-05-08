/**
 * 用户数据模型
 */

const mongoose = require('mongoose');

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

// 索引
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'gameData.level': 1 });
UserSchema.index({ 'gameData.coins': -1 });

// 中间件：保存前更新时间戳
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 静态方法：查找用户
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// 静态方法：查找邮箱
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// 实例方法：验证密码
UserSchema.methods.validatePassword = function(passwordHash) {
  return this.passwordHash === passwordHash;
};

// 实例方法：更新游戏数据
UserSchema.methods.updateGameData = function(gameData) {
  this.gameData = { ...this.gameData, ...gameData };
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);