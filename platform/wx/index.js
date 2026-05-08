// 微信小游戏平台专属适配层
// 存储路径：D:\AutoHealingGarden\platform\wx\index.js

const WechatAdapter = {
  // 平台标识
  platform: 'wechat',
  
  // 微信专属API
  wechat: {
    // 微信登录
    login() {
      return new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            if (res.code) {
              resolve({ code: res.code });
            } else {
              reject(new Error('微信登录失败'));
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    
    // 获取用户信息
    getUserInfo() {
      return new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: (res) => {
            resolve(res.userInfo);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    
    // 微信分享
    shareAppMessage(options) {
      return wx.shareAppMessage(options);
    },
    
    // 显示分享菜单
    showShareMenu() {
      wx.showShareMenu({
        withShareTicket: true
      });
    },
    
    // 好友排行榜
    getFriendRank() {
      return new Promise((resolve, reject) => {
        if (wx.getFriendCloudStorage) {
          wx.getFriendCloudStorage({
            keyList: ['level', 'coins', 'exp'],
            success: (res) => {
              resolve(res.data);
            },
            fail: (err) => {
              reject(err);
            }
          });
        } else {
          reject(new Error('微信版本过低，不支持好友排行榜'));
        }
      });
    },
    
    // 更新用户数据到排行榜
    updateRankData(data) {
      return new Promise((resolve, reject) => {
        if (wx.setUserCloudStorage) {
          wx.setUserCloudStorage({
            KVDataList: Object.entries(data).map(([key, value]) => ({
              key,
              value: String(value)
            })),
            success: resolve,
            fail: reject
          });
        } else {
          reject(new Error('微信版本过低，无法更新排行榜数据'));
        }
      });
    },
    
    // 微信广告
    createRewardedVideoAd(adUnitId) {
      return wx.createRewardedVideoAd({ adUnitId });
    },
    
    createBannerAd(adUnitId) {
      return wx.createBannerAd({ adUnitId });
    },
    
    createInterstitialAd(adUnitId) {
      return wx.createInterstitialAd({ adUnitId });
    },
    
    // 微信支付
    requestPayment(options) {
      return new Promise((resolve, reject) => {
        wx.requestPayment({
          ...options,
          success: resolve,
          fail: reject
        });
      });
    }
  },
  
  // 社交功能
  social: {
    // 好友花园串门
    visitFriendGarden(friendOpenId) {
      console.log('访问好友花园:', friendOpenId);
      // TODO: 实现好友花园访问逻辑
    },
    
    // 给好友浇水
    waterFriendGarden(friendOpenId) {
      console.log('给好友浇水:', friendOpenId);
      // TODO: 实现好友浇水逻辑
      return Promise.resolve(5); // 返回浇水奖励
    },
    
    // 赠送种子给好友
    giftSeedToFriend(friendOpenId, seedType) {
      console.log('赠送种子给好友:', friendOpenId, seedType);
      // TODO: 实现种子赠送逻辑
    },
    
    // 分享到朋友圈
    shareToTimeline(options) {
      return new Promise((resolve, reject) => {
        wx.shareAppMessage({
          ...options,
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 分享到微信群
    shareToGroup(options) {
      return new Promise((resolve, reject) => {
        wx.shareAppMessage({
          ...options,
          success: resolve,
          fail: reject
        });
      });
    }
  },
  
  // 微信专属UI组件
  ui: {
    // 显示模态对话框
    showModal(options) {
      return new Promise((resolve, reject) => {
        wx.showModal({
          ...options,
          success: (res) => {
            resolve(res.confirm);
          },
          fail: reject
        });
      });
    },
    
    // 显示加载提示
    showLoading(title = '加载中') {
      wx.showLoading({ title });
    },
    
    // 隐藏加载提示
    hideLoading() {
      wx.hideLoading();
    },
    
    // 显示消息提示
    showToast(options) {
      wx.showToast(options);
    },
    
    // 显示操作菜单
    showActionSheet(itemList) {
      return new Promise((resolve, reject) => {
        wx.showActionSheet({
          itemList,
          success: (res) => {
            resolve(res.tapIndex);
          },
          fail: reject
        });
      });
    }
  },
  
  // 微信系统功能
  system: {
    // 获取系统信息
    getSystemInfo() {
      return wx.getSystemInfoSync();
    },
    
    // 获取网络状态
    getNetworkType() {
      return new Promise((resolve, reject) => {
        wx.getNetworkType({
          success: (res) => {
            resolve(res.networkType);
          },
          fail: reject
        });
      });
    },
    
    // 获取设备电量
    getBatteryInfo() {
      return new Promise((resolve, reject) => {
        wx.getBatteryInfo({
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 振动反馈
    vibrateShort() {
      wx.vibrateShort();
    },
    
    vibrateLong() {
      wx.vibrateLong();
    }
  },
  
  // 文件系统
  file: {
    // 保存文件到本地
    saveFile(tempFilePath) {
      return new Promise((resolve, reject) => {
        wx.saveFile({
          tempFilePath,
          success: (res) => {
            resolve(res.savedFilePath);
          },
          fail: reject
        });
      });
    },
    
    // 获取已保存的文件列表
    getSavedFileList() {
      return new Promise((resolve, reject) => {
        wx.getSavedFileList({
          success: resolve,
          fail: reject
        });
      });
    }
  }
};

// 导出微信适配器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WechatAdapter;
}

// 全局注册（仅在微信环境）
if (typeof wx !== 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.WechatAdapter = WechatAdapter;
  }
}