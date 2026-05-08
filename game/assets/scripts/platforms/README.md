# 平台适配层

## 概述
平台适配层提供了统一的接口，使游戏能够在不同平台（微信小游戏、抖音小游戏、Web浏览器）上运行，而无需修改核心游戏逻辑。

## 架构

### 核心组件

1. **IPlatformAdapter** (`IPlatformAdapter.ts`)
   - 平台适配器接口，定义所有平台必须实现的功能
   - 包括广告、分享、登录、支付、存储等

2. **PlatformManager** (`PlatformManager.ts`)
   - 单例管理器，自动检测当前平台并初始化对应的适配器
   - 提供快捷方法和全局访问点

3. **具体平台适配器**
   - **WebAdapter** (`WebAdapter.ts`) - Web浏览器适配器，也作为降级方案
   - **WeChatAdapter** (`WeChatAdapter.ts`) - 微信小游戏适配器
   - **DouyinAdapter** (`DouyinAdapter.ts`) - 抖音小游戏适配器

### 平台检测逻辑
- 检测全局对象 `wx` → 微信小游戏
- 检测全局对象 `tt` → 抖音小游戏
- 默认 → Web浏览器

## 使用方法

### 1. 在场景中集成

```typescript
// MainScene.ts 中添加
import { PlatformManager } from './platforms/PlatformManager';

// 在场景中创建PlatformManager节点
// 或通过代码动态创建
```

### 2. 在代码中使用

```typescript
// 获取平台管理器实例
const platform = PlatformManager.instance;

// 使用快捷方法
platform.showRewardedVideo(); // 显示激励视频广告
platform.share({ title: '快来玩！' }); // 分享游戏
platform.login(); // 用户登录
platform.toast('操作成功'); // 显示消息提示

// 直接访问适配器
const adapter = platform.adapter;
adapter.showInterstitialAd('ad-unit-id');
```

### 3. 平台特定功能示例

```typescript
// 广告功能
const result = await platform.showRewardedVideo();
if (result.success && result.rewarded) {
    // 给予玩家奖励
    gameManager.addCoins(100);
}

// 分享功能
await platform.share({
    title: '我在玩自动治愈花园',
    imageUrl: '分享图URL',
});

// 数据上报
await platform.track('plant_harvested', {
    plantType: 'sunflower',
    coinsEarned: 10,
});

// 震动反馈
await platform.vibrate('short'); // 短震动
```

## 各平台特性

### Web浏览器
- **广告**: 模拟广告，用于开发和测试
- **分享**: 使用Web Share API或复制链接
- **存储**: 使用localStorage
- **登录**: 模拟用户信息

### 微信小游戏
- **广告**: 调用 `wx.createRewardedVideoAd()` 等API
- **分享**: 调用 `wx.shareAppMessage()`
- **登录**: 调用 `wx.login()` 和 `wx.getUserInfo()`
- **支付**: 调用微信支付API
- **数据上报**: 调用 `wx.reportAnalytics()`

### 抖音小游戏
- **广告**: 调用 `tt.createRewardedVideoAd()` 等API
- **分享**: 调用 `tt.shareAppMessage()`
- **登录**: 调用 `tt.login()` 和 `tt.getUserInfo()`
- **支付**: 调用抖音支付API
- **数据上报**: 调用 `tt.reportAnalytics()`

## 构建配置

### 微信小游戏构建
1. 在Cocos Creator中配置微信小游戏平台
2. 设置AppID和项目配置
3. 构建时自动包含微信适配器

### 抖音小游戏构建
1. 在Cocos Creator中配置抖音小游戏平台
2. 设置AppID和项目配置
3. 构建时自动包含抖音适配器

### Web构建
1. 标准Web构建配置
2. 适配器自动降级到Web模式

## 开发建议

### 1. 平台条件编译
```typescript
// 可以根据平台类型执行不同逻辑
if (PlatformManager.instance.isWeChat) {
    // 微信特有逻辑
} else if (PlatformManager.instance.isDouyin) {
    // 抖音特有逻辑
}
```

### 2. 错误处理
```typescript
try {
    await platform.showRewardedVideo();
} catch (error) {
    console.error('广告显示失败:', error);
    // 降级处理
    gameManager.addCoins(50); // 给予部分奖励
}
```

### 3. 功能检测
```typescript
// 检测功能是否可用
if (platform.adapter.someOptionalFeature) {
    // 使用可选功能
}
```

## 测试

### 单元测试
- 模拟不同平台环境
- 测试平台检测逻辑
- 测试适配器方法调用

### 集成测试
- 在实际平台上测试功能
- 验证广告、分享、登录等流程
- 测试跨平台数据兼容性

## 扩展新平台

要添加新的平台支持：

1. 创建新的适配器类，实现 `IPlatformAdapter` 接口
2. 在 `PlatformManager.detectPlatform()` 中添加平台检测逻辑
3. 在 `PlatformManager.initializeAdapter()` 中添加适配器初始化逻辑
4. 更新构建配置

## 注意事项

1. **API差异**: 不同平台的API有细微差异，需要仔细处理
2. **审核要求**: 各平台有不同审核要求，需遵循平台规范
3. **性能考虑**: 平台API调用可能有性能开销，需合理使用
4. **用户隐私**: 严格遵守用户隐私政策，获取必要授权

## 相关文件
- `IPlatformAdapter.ts` - 接口定义
- `PlatformManager.ts` - 平台管理器
- `WebAdapter.ts` - Web适配器
- `WeChatAdapter.ts` - 微信适配器
- `DouyinAdapter.ts` - 抖音适配器
- `package.json` - 构建配置依赖