/**
 * 通用工具函数
 */

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
function generateId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串 (默认: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);
  
  const replacements = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0'),
  };
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
}

/**
 * 计算时间差
 * @param {Date} start - 开始时间
 * @param {Date} end - 结束时间 (默认: 当前时间)
 * @returns {Object} 时间差对象 {days, hours, minutes, seconds, totalSeconds}
 */
function timeDiff(start, end = new Date()) {
  const diff = Math.abs(end - start);
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diff / 1000)
  };
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式 (中国大陆)
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * 生成分页参数
 * @param {Object} options - 分页选项
 * @param {number} options.page - 页码 (默认: 1)
 * @param {number} options.limit - 每页数量 (默认: 20)
 * @param {string} options.sortField - 排序字段 (默认: 'createdAt')
 * @param {string} options.sortOrder - 排序顺序 (默认: 'desc')
 * @returns {Object} 分页参数
 */
function getPaginationParams(options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;
  
  const sortField = options.sortField || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };
  
  return { page, limit, skip, sort };
}

/**
 * 生成分页响应
 * @param {Array} data - 数据数组
 * @param {number} total - 总记录数
 * @param {Object} pagination - 分页参数
 * @returns {Object} 分页响应对象
 */
function createPaginationResponse(data, total, pagination) {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * 生成成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {Object} 成功响应对象
 */
function successResponse(data, message = '操作成功') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * 生成错误响应
 * @param {string} error - 错误消息
 * @param {number} code - 错误代码
 * @returns {Object} 错误响应对象
 */
function errorResponse(error, code = 500) {
  return {
    success: false,
    error,
    code
  };
}

/**
 * 验证请求参数
 * @param {Object} params - 请求参数
 * @param {Array} required - 必填字段数组
 * @returns {Object} 验证结果 {valid: boolean, missing: Array}
 */
function validateParams(params, required) {
  const missing = [];
  
  for (const field of required) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * 限制函数调用频率
 * @param {Function} fn - 要限制的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} 限制后的函数
 */
function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

module.exports = {
  generateId,
  formatDate,
  timeDiff,
  isValidEmail,
  isValidPhone,
  deepMerge,
  getPaginationParams,
  createPaginationResponse,
  successResponse,
  errorResponse,
  validateParams,
  throttle,
  debounce
};