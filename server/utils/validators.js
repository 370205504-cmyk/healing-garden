/**
 * 数据验证工具
 */

const helpers = require('./helpers');

/**
 * 用户注册验证
 * @param {Object} data - 注册数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateRegister(data) {
  const errors = [];
  
  // 用户名验证
  if (!data.username || data.username.trim() === '') {
    errors.push('用户名不能为空');
  } else if (data.username.length < 3 || data.username.length > 20) {
    errors.push('用户名长度必须在3-20个字符之间');
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push('用户名只能包含字母、数字和下划线');
  }
  
  // 邮箱验证
  if (data.email && data.email.trim() !== '') {
    if (!helpers.isValidEmail(data.email)) {
      errors.push('邮箱格式无效');
    }
  }
  
  // 密码验证
  if (!data.password || data.password.trim() === '') {
    errors.push('密码不能为空');
  } else if (data.password.length < 6 || data.password.length > 50) {
    errors.push('密码长度必须在6-50个字符之间');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push('密码必须包含大小写字母和数字');
  }
  
  // 确认密码验证
  if (data.password !== data.confirmPassword) {
    errors.push('两次输入的密码不一致');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 用户登录验证
 * @param {Object} data - 登录数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateLogin(data) {
  const errors = [];
  
  // 用户名验证
  if (!data.username || data.username.trim() === '') {
    errors.push('用户名不能为空');
  }
  
  // 密码验证
  if (!data.password || data.password.trim() === '') {
    errors.push('密码不能为空');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 游戏数据验证
 * @param {Object} gameData - 游戏数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateGameData(gameData) {
  const errors = [];
  
  if (!gameData || typeof gameData !== 'object') {
    errors.push('游戏数据必须是一个对象');
    return { valid: false, errors };
  }
  
  // 金币验证
  if (gameData.coins !== undefined) {
    if (typeof gameData.coins !== 'number') {
      errors.push('金币必须是数字');
    } else if (gameData.coins < 0) {
      errors.push('金币不能为负数');
    } else if (gameData.coins > 1000000) {
      errors.push('金币数量超过上限');
    }
  }
  
  // 等级验证
  if (gameData.level !== undefined) {
    if (typeof gameData.level !== 'number') {
      errors.push('等级必须是数字');
    } else if (gameData.level < 1 || gameData.level > 100) {
      errors.push('等级必须在1-100之间');
    }
  }
  
  // 经验验证
  if (gameData.experience !== undefined) {
    if (typeof gameData.experience !== 'number') {
      errors.push('经验必须是数字');
    } else if (gameData.experience < 0) {
      errors.push('经验不能为负数');
    }
  }
  
  // 解锁区域验证
  if (gameData.unlockedAreas !== undefined) {
    if (!Array.isArray(gameData.unlockedAreas)) {
      errors.push('解锁区域必须是数组');
    } else {
      for (const area of gameData.unlockedAreas) {
        if (typeof area !== 'number' || area < 1 || area > 10) {
          errors.push('解锁区域编号必须在1-10之间');
          break;
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 广告请求验证
 * @param {Object} data - 广告请求数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateAdRequest(data) {
  const errors = [];
  const validTypes = ['rewarded_video', 'interstitial', 'banner'];
  const validPlatforms = ['web', 'wechat', 'douyin'];
  
  // 用户ID验证
  if (!data.userId || data.userId.trim() === '') {
    errors.push('用户ID不能为空');
  }
  
  // 广告类型验证
  if (!data.type || data.type.trim() === '') {
    errors.push('广告类型不能为空');
  } else if (!validTypes.includes(data.type)) {
    errors.push(`广告类型必须是以下之一: ${validTypes.join(', ')}`);
  }
  
  // 平台验证
  if (!data.platform || data.platform.trim() === '') {
    errors.push('平台不能为空');
  } else if (!validPlatforms.includes(data.platform)) {
    errors.push(`平台必须是以下之一: ${validPlatforms.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 广告完成验证
 * @param {Object} data - 广告完成数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateAdComplete(data) {
  const errors = [];
  const validStatuses = ['pending', 'shown', 'completed', 'failed', 'rewarded'];
  
  // 广告ID验证
  if (!data.adId || data.adId.trim() === '') {
    errors.push('广告ID不能为空');
  }
  
  // 状态验证
  if (!data.status || data.status.trim() === '') {
    errors.push('状态不能为空');
  } else if (!validStatuses.includes(data.status)) {
    errors.push(`状态必须是以下之一: ${validStatuses.join(', ')}`);
  }
  
  // 观看百分比验证
  if (data.watchedPercentage !== undefined) {
    if (typeof data.watchedPercentage !== 'number') {
      errors.push('观看百分比必须是数字');
    } else if (data.watchedPercentage < 0 || data.watchedPercentage > 100) {
      errors.push('观看百分比必须在0-100之间');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 游戏反馈验证
 * @param {Object} data - 反馈数据
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateFeedback(data) {
  const errors = [];
  const validTypes = ['bug', 'suggestion', 'complaint', 'question', 'other'];
  
  // 类型验证
  if (!data.type || data.type.trim() === '') {
    errors.push('反馈类型不能为空');
  } else if (!validTypes.includes(data.type)) {
    errors.push(`反馈类型必须是以下之一: ${validTypes.join(', ')}`);
  }
  
  // 内容验证
  if (!data.content || data.content.trim() === '') {
    errors.push('反馈内容不能为空');
  } else if (data.content.length < 5) {
    errors.push('反馈内容至少需要5个字符');
  } else if (data.content.length > 1000) {
    errors.push('反馈内容不能超过1000个字符');
  }
  
  // 联系方式验证
  if (data.contact) {
    if (data.contact.includes('@')) {
      if (!helpers.isValidEmail(data.contact)) {
        errors.push('邮箱格式无效');
      }
    } else if (/^\d+$/.test(data.contact)) {
      if (!helpers.isValidPhone(data.contact)) {
        errors.push('手机号格式无效');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 分页参数验证
 * @param {Object} params - 分页参数
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validatePagination(params) {
  const errors = [];
  
  // 页码验证
  if (params.page !== undefined) {
    const page = parseInt(params.page);
    if (isNaN(page) || page < 1) {
      errors.push('页码必须是大于0的整数');
    }
  }
  
  // 每页数量验证
  if (params.limit !== undefined) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('每页数量必须是1-100之间的整数');
    }
  }
  
  // 排序字段验证
  if (params.sortField) {
    const validSortFields = ['createdAt', 'updatedAt', 'username', 'level', 'coins', 'experience'];
    if (!validSortFields.includes(params.sortField)) {
      errors.push(`排序字段必须是以下之一: ${validSortFields.join(', ')}`);
    }
  }
  
  // 排序顺序验证
  if (params.sortOrder) {
    if (params.sortOrder !== 'asc' && params.sortOrder !== 'desc') {
      errors.push('排序顺序必须是asc或desc');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 日期范围验证
 * @param {Object} range - 日期范围 {startDate, endDate}
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
function validateDateRange(range) {
  const errors = [];
  
  if (range.startDate) {
    const startDate = new Date(range.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('开始日期格式无效');
    }
  }
  
  if (range.endDate) {
    const endDate = new Date(range.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('结束日期格式无效');
    }
  }
  
  if (range.startDate && range.endDate) {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    
    if (startDate > endDate) {
      errors.push('开始日期不能晚于结束日期');
    }
    
    // 检查日期范围是否过大（不超过1年）
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (endDate - startDate > oneYearMs) {
      errors.push('日期范围不能超过1年');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateGameData,
  validateAdRequest,
  validateAdComplete,
  validateFeedback,
  validatePagination,
  validateDateRange
};