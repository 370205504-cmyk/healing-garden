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
    }
  };
})();

// 挂载到全局，禁止业务代码直接修改
if (typeof globalThis !== 'undefined') {
  globalThis.Platform = Platform;
}

module.exports = Platform;