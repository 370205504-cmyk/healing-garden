import { crypto } from './Crypto.js';

class AntiCheat {
    constructor() {
        this.cheatAttempts = new Map();
        this.maxCheatAttempts = 3;
        this.banDuration = 3600000;
        this.lastCheckTime = Date.now();
        this.checkInterval = 10000;
        
        this.validators = [
            { name: 'coins', validate: this._validateCoins.bind(this) },
            { name: 'level', validate: this._validateLevel.bind(this) },
            { name: 'time', validate: this._validateTime.bind(this) },
            { name: 'plants', validate: this._validatePlants.bind(this) },
            { name: 'achievements', validate: this._validateAchievements.bind(this) }
        ];
    }
    
    validateAll(data) {
        const results = [];
        let hasCheat = false;
        
        for (const validator of this.validators) {
            const result = validator.validate(data);
            results.push({ name: validator.name, ...result });
            if (!result.valid) hasCheat = true;
        }
        
        if (hasCheat) {
            this._logCheatAttempt(results);
        }
        
        return {
            valid: !hasCheat,
            checks: results,
            hasCheat
        };
    }
    
    _validateCoins(data) {
        const maxCoins = 999999;
        const coins = data.coins || 0;
        
        if (coins < 0) {
            return { valid: false, reason: 'Coins cannot be negative', value: coins };
        }
        
        if (coins > maxCoins) {
            return { valid: false, reason: `Coins exceeds maximum (${maxCoins})`, value: coins };
        }
        
        return { valid: true, reason: 'OK', value: coins };
    }
    
    _validateLevel(data) {
        const maxLevel = 100;
        const level = data.level || 1;
        const exp = data.exp || 0;
        const expForLevel = level * 50;
        
        if (level < 1) {
            return { valid: false, reason: 'Level must be at least 1', value: level };
        }
        
        if (level > maxLevel) {
            return { valid: false, reason: `Level exceeds maximum (${maxLevel})`, value: level };
        }
        
        if (exp < 0) {
            return { valid: false, reason: 'EXP cannot be negative', value: exp };
        }
        
        if (exp >= expForLevel) {
            return { valid: false, reason: `EXP should not exceed required for next level (${expForLevel})`, value: exp };
        }
        
        return { valid: true, reason: 'OK', value: level };
    }
    
    _validateTime(data) {
        const now = Date.now();
        const day = data.day || 1;
        const maxDays = 365;
        
        if (day < 1) {
            return { valid: false, reason: 'Day must be at least 1', value: day };
        }
        
        if (day > maxDays) {
            return { valid: false, reason: `Day exceeds maximum (${maxDays})`, value: day };
        }
        
        return { valid: true, reason: 'OK', value: day };
    }
    
    _validatePlants(data) {
        const inventory = data.inventory || {};
        const maxPlantsPerType = 999;
        
        for (const [plantType, count] of Object.entries(inventory)) {
            if (count < 0) {
                return { valid: false, reason: `${plantType} count cannot be negative`, value: count };
            }
            
            if (count > maxPlantsPerType) {
                return { valid: false, reason: `${plantType} exceeds maximum (${maxPlantsPerType})`, value: count };
            }
        }
        
        return { valid: true, reason: 'OK', value: Object.keys(inventory).length };
    }
    
    _validateAchievements(data) {
        const achievements = data.achievements || [];
        
        for (const achievement of achievements) {
            if (achievement.claimed && !achievement.unlocked) {
                return { valid: false, reason: `Achievement ${achievement.name} claimed but not unlocked`, value: achievement.id };
            }
        }
        
        return { valid: true, reason: 'OK', value: achievements.length };
    }
    
    _logCheatAttempt(results) {
        const deviceId = this._getDeviceId();
        const attempts = this.cheatAttempts.get(deviceId) || 0;
        const newAttempts = attempts + 1;
        
        this.cheatAttempts.set(deviceId, {
            count: newAttempts,
            lastAttempt: Date.now(),
            checks: results
        });
        
        console.warn(`Cheat attempt detected (${newAttempts}/${this.maxCheatAttempts}):`, results);
        
        if (newAttempts >= this.maxCheatAttempts) {
            this._banDevice(deviceId);
        }
    }
    
    _getDeviceId() {
        if (typeof wx !== 'undefined') {
            try {
                return wx.getSystemInfoSync().deviceId || 'unknown';
            } catch {
                return 'unknown';
            }
        }
        return 'browser_' + crypto.generateToken();
    }
    
    _banDevice(deviceId) {
        this.cheatAttempts.set(deviceId, {
            count: this.maxCheatAttempts,
            lastAttempt: Date.now(),
            bannedUntil: Date.now() + this.banDuration,
            banned: true
        });
        
        console.error(`Device ${deviceId} banned for cheating`);
        
        if (typeof wx !== 'undefined') {
            wx.showModal({
                title: '账号异常',
                content: '检测到异常操作，账号已被临时限制',
                showCancel: false
            });
        }
    }
    
    isDeviceBanned(deviceId = null) {
        const id = deviceId || this._getDeviceId();
        const record = this.cheatAttempts.get(id);
        
        if (!record || !record.banned) return false;
        if (record.bannedUntil && Date.now() > record.bannedUntil) {
            this.cheatAttempts.delete(id);
            return false;
        }
        
        return true;
    }
    
    getBanRemainingTime(deviceId = null) {
        const id = deviceId || this._getDeviceId();
        const record = this.cheatAttempts.get(id);
        
        if (!record?.bannedUntil) return 0;
        
        const remaining = record.bannedUntil - Date.now();
        return Math.max(0, remaining);
    }
    
    resetAttempts(deviceId = null) {
        const id = deviceId || this._getDeviceId();
        this.cheatAttempts.delete(id);
    }
    
    getStats() {
        return {
            totalChecks: this.validators.length,
            cheatAttempts: this.cheatAttempts.size,
            maxAttempts: this.maxCheatAttempts,
            banDuration: this.banDuration
        };
    }
}

const antiCheat = new AntiCheat();
export { antiCheat, AntiCheat };