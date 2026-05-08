// ==============================
// 自动治愈花园 双平台统一适配层
// 存储路径：D:\AutoHealingGarden\platform\index.js
// ==============================
const Platform = (function () {
  // 平台环境检测
  const env = (() => {
    if (typeof wx !== 'undefined') return 'wx';
    if (typeof tt !== 'undefined') return 'tt';
    return 'unknown';
  })();

  // 对外统一接口，核心逻辑仅可调用以下方法
  return {
    // 环境标识
    env,
    isWx: env === 'wx',
    isTT: env === 'tt',

    // 本地存储统一接口
    setStorage(key, data) {
      try {
        const targetApi = env === 'wx' ? wx : tt;
        return targetApi.setStorageSync(key, data);
      } catch (err) {
        console.error('存储错误已捕获:', err);
        return false;
      }
    },
    getStorage(key, defaultValue = null) {
      try {
        const targetApi = env === 'wx' ? wx : tt;
        const result = targetApi.getStorageSync(key);
        return result !== '' && result !== undefined && result !== null ? result : defaultValue;
      } catch (err) {
        console.error('读取存储错误已捕获:', err);
        return defaultValue;
      }
    },

    // 音频创建统一接口
    createAudio() {
      const targetApi = env === 'wx' ? wx : tt;
      const audio = targetApi.createInnerAudioContext();
      audio.onError((err) => {
        console.error('音频加载错误已捕获:', err);
      });
      return audio;
    },

    // 登录统一接口
    login(options = {}) {
      const targetApi = env === 'wx' ? wx : tt;
      return targetApi.login(options);
    },

    // 广告统一接口
    createRewardedVideoAd(adUnitId) {
      const targetApi = env === 'wx' ? wx : tt;
      return targetApi.createRewardedVideoAd({ adUnitId });
    },
    createBannerAd(adUnitId) {
      const targetApi = env === 'wx' ? wx : tt;
      return targetApi.createBannerAd({ adUnitId });
    },

    // Canvas 创建
    createCanvas() {
      const targetApi = env === 'wx' ? wx : tt;
      if (targetApi && targetApi.createCanvas) {
        return targetApi.createCanvas();
      }
      return null;
    },

    // requestAnimationFrame 统一接口
    requestAnimationFrame(callback) {
      const targetApi = env === 'wx' ? wx : tt;
      if (targetApi && targetApi.requestAnimationFrame) {
        return targetApi.requestAnimationFrame(callback);
      }
      if (typeof requestAnimationFrame !== 'undefined') {
        return requestAnimationFrame(callback);
      }
      return setTimeout(callback, 16);
    },

    // 触摸事件绑定
    onTouchStart(callback) {
      const targetApi = env === 'wx' ? wx : tt;
      if (targetApi && targetApi.onTouchStart) {
        targetApi.onTouchStart(callback);
      }
    },

    // 显示事件
    onShow(callback) {
      const targetApi = env === 'wx' ? wx : tt;
      if (targetApi && targetApi.onShow) {
        targetApi.onShow(callback);
      }
    },

    // 全局错误捕获
    onError(callback) {
      const targetApi = env === 'wx' ? wx : tt;
      if (targetApi && targetApi.onError) {
        targetApi.onError(callback);
      }
    }
  };
})();

// 挂载到全局，禁止业务代码直接修改
if (typeof globalThis !== 'undefined') {
  globalThis.Platform = Platform;
}

module.exports = Platform;