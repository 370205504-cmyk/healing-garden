class Crypto {
    constructor() {
        this.secretKey = this._generateSecret();
        this.iv = this._generateIV();
    }
    
    _generateSecret() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return (timestamp + random).padEnd(32, '0').substr(0, 32);
    }
    
    _generateIV() {
        return Math.random().toString(36).substr(2, 16).padEnd(16, '0');
    }
    
    encrypt(data) {
        try {
            const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
            let encrypted = '';
            
            for (let i = 0; i < jsonData.length; i++) {
                const charCode = jsonData.charCodeAt(i);
                const keyCode = this.secretKey.charCodeAt(i % this.secretKey.length);
                encrypted += String.fromCharCode(charCode ^ keyCode);
            }
            
            return btoa(encrypted + '|' + this.iv);
        } catch (e) {
            console.error('Encryption error:', e);
            return null;
        }
    }
    
    decrypt(encryptedData) {
        try {
            const decoded = atob(encryptedData);
            const [dataPart, iv] = decoded.split('|');
            
            if (!iv) {
                throw new Error('Invalid encrypted data');
            }
            
            this.iv = iv;
            let decrypted = '';
            
            for (let i = 0; i < dataPart.length; i++) {
                const charCode = dataPart.charCodeAt(i);
                const keyCode = this.secretKey.charCodeAt(i % this.secretKey.length);
                decrypted += String.fromCharCode(charCode ^ keyCode);
            }
            
            try {
                return JSON.parse(decrypted);
            } catch {
                return decrypted;
            }
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    }
    
    generateChecksum(data) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
    
    validateChecksum(data, checksum) {
        return this.generateChecksum(data) === checksum;
    }
    
    generateToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 12);
        const hash = this.generateChecksum(timestamp + random);
        return `${timestamp}-${random}-${hash}`;
    }
    
    validateToken(token) {
        const parts = token.split('-');
        if (parts.length !== 3) return false;
        
        const [timestamp, random, hash] = parts;
        const expectedHash = this.generateChecksum(timestamp + random);
        
        if (hash !== expectedHash) return false;
        
        const age = Date.now() - parseInt(timestamp);
        return age < 3600000;
    }
    
    maskString(str, visibleChars = 4) {
        if (str.length <= visibleChars) return str;
        const mask = '*'.repeat(str.length - visibleChars);
        return mask + str.substr(-visibleChars);
    }
    
    sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.replace(/[<>\"\'&]/g, char => {
                const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
                return entities[char] || char;
            });
        }
        return input;
    }
    
    isJsonString(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }
    
    get secureStorage() {
        return {
            set: (key, value) => {
                const encrypted = this.encrypt(value);
                if (encrypted) {
                    const data = {
                        value: encrypted,
                        checksum: this.generateChecksum(value),
                        timestamp: Date.now(),
                        version: '1.0'
                    };
                    if (typeof wx !== 'undefined') {
                        wx.setStorageSync(key, JSON.stringify(data));
                    } else {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                }
            },
            get: (key) => {
                let data;
                if (typeof wx !== 'undefined') {
                    data = wx.getStorageSync(key);
                } else {
                    data = localStorage.getItem(key);
                }
                
                if (!data) return null;
                
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    const decrypted = this.decrypt(parsed.value);
                    
                    if (parsed.checksum !== this.generateChecksum(decrypted)) {
                        console.warn('Data integrity check failed');
                        return null;
                    }
                    
                    return decrypted;
                } catch (e) {
                    console.error('Secure storage read error:', e);
                    return null;
                }
            },
            remove: (key) => {
                if (typeof wx !== 'undefined') {
                    wx.removeStorageSync(key);
                } else {
                    localStorage.removeItem(key);
                }
            }
        };
    }
}

const crypto = new Crypto();
export { crypto, Crypto };