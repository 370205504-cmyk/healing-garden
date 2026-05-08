// 自动治愈花园 - 抖音小游戏版
console.log('抖音小游戏版 v1.0.0-production');

// 抖音适配层
const DouyinAdapter = {
    init() {
        console.log('初始化抖音平台');
        return { platform: 'douyin', version: '1.0.0-production', features: ['视频录制'] };
    }
};

// 游戏逻辑
window.game = {
    platform: 'douyin',
    version: '1.0.0-production',
    start() { console.log('抖音版游戏开始'); }
};

console.log('✅ 抖音小游戏版就绪');