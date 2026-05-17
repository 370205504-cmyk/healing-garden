class SecurityLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.level = 'info';
        this.enabled = true;
        this.sensitiveFields = ['password', 'token', 'deviceId', 'openid', 'secret'];
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            critical: 4
        };
    }
    
    _shouldLog(level) {
        if (!this.enabled) return false;
        return this.levels[level] >= this.levels[this.level];
    }
    
    _sanitizeData(data) {
        if (typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (this.sensitiveFields.includes(key.toLowerCase())) {
                    sanitized[key] = '***';
                } else {
                    sanitized[key] = typeof value === 'object' ? this._sanitizeData(value) : value;
                }
            }
            return sanitized;
        }
        return data;
    }
    
    _createLog(level, message, data = null) {
        return {
            timestamp: Date.now(),
            level,
            message,
            data: data ? this._sanitizeData(data) : null,
            stack: level === 'error' || level === 'critical' ? new Error().stack : null
        };
    }
    
    debug(message, data = null) {
        if (!this._shouldLog('debug')) return;
        const log = this._createLog('debug', message, data);
        this.logs.push(log);
        console.debug(`[DEBUG] ${message}`, data);
        this._trimLogs();
    }
    
    info(message, data = null) {
        if (!this._shouldLog('info')) return;
        const log = this._createLog('info', message, data);
        this.logs.push(log);
        console.info(`[INFO] ${message}`, data);
        this._trimLogs();
    }
    
    warn(message, data = null) {
        if (!this._shouldLog('warn')) return;
        const log = this._createLog('warn', message, data);
        this.logs.push(log);
        console.warn(`[WARN] ${message}`, data);
        this._trimLogs();
    }
    
    error(message, data = null) {
        if (!this._shouldLog('error')) return;
        const log = this._createLog('error', message, data);
        this.logs.push(log);
        console.error(`[ERROR] ${message}`, data);
        this._trimLogs();
    }
    
    critical(message, data = null) {
        if (!this._shouldLog('critical')) return;
        const log = this._createLog('critical', message, data);
        this.logs.push(log);
        console.error(`[CRITICAL] ${message}`, data);
        
        if (typeof wx !== 'undefined') {
            wx.showToast({ title: '系统异常', icon: 'none' });
        }
        
        this._trimLogs();
    }
    
    _trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }
    
    logEvent(eventName, data = null) {
        this.info(`Event: ${eventName}`, data);
    }
    
    logAction(action, target, result = 'success') {
        this.info(`Action: ${action} -> ${target} (${result})`);
    }
    
    logError(error, context = null) {
        this.error(error.message || 'Unknown error', {
            name: error.name,
            stack: error.stack,
            context
        });
    }
    
    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }
    
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
    
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
    
    clearLogs() {
        this.logs = [];
    }
    
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {}
        };
        
        for (const level of Object.keys(this.levels)) {
            stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
        }
        
        return stats;
    }
}

const logger = new SecurityLogger();
export { logger, SecurityLogger };