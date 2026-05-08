// 抖音小游戏平台专属适配层
// 存储路径：D:\AutoHealingGarden\platform\tt\index.js

const DouyinAdapter = {
  // 平台标识
  platform: 'douyin',
  
  // 抖音专属API
  douyin: {
    // 抖音登录
    login() {
      return new Promise((resolve, reject) => {
        tt.login({
          success: (res) => {
            if (res.code) {
              resolve({ code: res.code });
            } else {
              reject(new Error('抖音登录失败'));
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
        tt.getUserInfo({
          success: (res) => {
            resolve(res.userInfo);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    },
    
    // 抖音分享
    shareAppMessage(options) {
      return tt.shareAppMessage(options);
    },
    
    // 显示分享菜单
    showShareMenu() {
      tt.showShareMenu({
        withShareTicket: true
      });
    },
    
    // 创建短视频
    createVideo() {
      return new Promise((resolve, reject) => {
        if (tt.createVideo) {
          const video = tt.createVideo({
            autoplay: false,
            loop: false,
            success: () => resolve(video),
            fail: reject
          });
        } else {
          reject(new Error('抖音版本过低，不支持视频功能'));
        }
      });
    },
    
    // 录制屏幕
    startRecordScreen() {
      return new Promise((resolve, reject) => {
        if (tt.startRecordScreen) {
          tt.startRecordScreen({
            success: resolve,
            fail: reject
          });
        } else {
          reject(new Error('抖音版本过低，不支持录屏功能'));
        }
      });
    },
    
    stopRecordScreen() {
      return new Promise((resolve, reject) => {
        if (tt.stopRecordScreen) {
          tt.stopRecordScreen({
            success: (res) => {
              resolve(res.videoPath);
            },
            fail: reject
          });
        } else {
          reject(new Error('抖音版本过低，不支持录屏功能'));
        }
      });
    },
    
    // 抖音广告
    createRewardedVideoAd(adUnitId) {
      return tt.createRewardedVideoAd({ adUnitId });
    },
    
    createBannerAd(adUnitId) {
      return tt.createBannerAd({ adUnitId });
    },
    
    createInterstitialAd(adUnitId) {
      return tt.createInterstitialAd({ adUnitId });
    },
    
    // 抖音支付
    requestPayment(options) {
      return new Promise((resolve, reject) => {
        tt.requestPayment({
          ...options,
          success: resolve,
          fail: reject
        });
      });
    }
  },
  
  // 社交功能
  social: {
    // 邀请好友
    inviteFriend() {
      return new Promise((resolve, reject) => {
        tt.shareAppMessage({
          title: '快来一起种花治愈心灵吧！',
          imageUrl: 'https://example.com/share-image.jpg',
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 生成游戏短视频
    generateGameVideo(gameData) {
      console.log('生成游戏短视频:', gameData);
      // TODO: 实现短视频生成逻辑
      return Promise.resolve('video_temp_path.mp4');
    },
    
    // 发布到抖音
    publishToDouyin(videoPath, description) {
      console.log('发布视频到抖音:', videoPath, description);
      // TODO: 实现视频发布逻辑
      return Promise.resolve('video_id_123');
    },
    
    // 获取好友列表
    getFriendList() {
      return new Promise((resolve, reject) => {
        if (tt.getFriendList) {
          tt.getFriendList({
            success: resolve,
            fail: reject
          });
        } else {
          reject(new Error('抖音版本过低，不支持好友列表功能'));
        }
      });
    },
    
    // 向好友发送消息
    sendMessageToFriend(friendOpenId, message) {
      console.log('向好友发送消息:', friendOpenId, message);
      // TODO: 实现消息发送逻辑
    }
  },
  
  // 抖音专属UI组件
  ui: {
    // 显示模态对话框
    showModal(options) {
      return new Promise((resolve, reject) => {
        tt.showModal({
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
      tt.showLoading({ title });
    },
    
    // 隐藏加载提示
    hideLoading() {
      tt.hideLoading();
    },
    
    // 显示消息提示
    showToast(options) {
      tt.showToast(options);
    },
    
    // 显示操作菜单
    showActionSheet(itemList) {
      return new Promise((resolve, reject) => {
        tt.showActionSheet({
          itemList,
          success: (res) => {
            resolve(res.tapIndex);
          },
          fail: reject
        });
      });
    },
    
    // 抖音专属：显示选择器
    showPicker(options) {
      return new Promise((resolve, reject) => {
        tt.showPicker({
          ...options,
          success: (res) => {
            resolve(res.value);
          },
          fail: reject
        });
      });
    }
  },
  
  // 抖音系统功能
  system: {
    // 获取系统信息
    getSystemInfo() {
      return tt.getSystemInfoSync();
    },
    
    // 获取网络状态
    getNetworkType() {
      return new Promise((resolve, reject) => {
        tt.getNetworkType({
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
        tt.getBatteryInfo({
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 振动反馈
    vibrateShort() {
      tt.vibrateShort();
    },
    
    vibrateLong() {
      tt.vibrateLong();
    },
    
    // 抖音专属：获取设备ID
    getDeviceId() {
      return new Promise((resolve, reject) => {
        if (tt.getDeviceId) {
          tt.getDeviceId({
            success: (res) => {
              resolve(res.deviceId);
            },
            fail: reject
          });
        } else {
          reject(new Error('抖音版本过低，不支持获取设备ID'));
        }
      });
    }
  },
  
  // 文件系统
  file: {
    // 保存文件到本地
    saveFile(tempFilePath) {
      return new Promise((resolve, reject) => {
        tt.saveFile({
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
        tt.getSavedFileList({
          success: resolve,
          fail: reject
        });
      });
    },
    
    // 抖音专属：选择文件
    chooseFile() {
      return new Promise((resolve, reject) => {
        tt.chooseFile({
          success: resolve,
          fail: reject
        });
      });
    }
  },
  
  // 抖音特色功能
  features: {
    // AR特效
    createAREffect(effectId) {
      console.log('创建AR特效:', effectId);
      // TODO: 实现AR特效
    },
    
    // 美颜滤镜
    applyBeautyFilter(filterType) {
      console.log('应用美颜滤镜:', filterType);
      // TODO: 实现美颜滤镜
    },
    
    // 背景音乐
    addBackgroundMusic(musicPath) {
      console.log('添加背景音乐:', musicPath);
      // TODO: 实现背景音乐添加
    }
  }
};

// 导出抖音适配器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DouyinAdapter;
}

// 全局注册（仅在抖音环境）
if (typeof tt !== 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.DouyinAdapter = DouyinAdapter;
  }
}