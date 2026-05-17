import { crypto, antiCheat, logger } from '../security/index.js';

export function runSecurityTests(testRunner) {
    testRunner.describe('Crypto Tests', () => {
        testRunner.it('should encrypt and decrypt data', () => {
            const original = { message: 'hello world', value: 42 };
            const encrypted = crypto.encrypt(original);
            const decrypted = crypto.decrypt(encrypted);
            
            testRunner.assertDeepEqual(decrypted, original);
        });
        
        testRunner.it('should encrypt and decrypt strings', () => {
            const original = 'test string';
            const encrypted = crypto.encrypt(original);
            const decrypted = crypto.decrypt(encrypted);
            
            testRunner.assertEqual(decrypted, original);
        });
        
        testRunner.it('should generate checksums', () => {
            const data = { a: 1, b: 2 };
            const checksum = crypto.generateChecksum(data);
            
            testRunner.assertType(checksum, 'string');
            testRunner.assertEqual(checksum.length, 8);
        });
        
        testRunner.it('should validate checksums', () => {
            const data = { test: 'data' };
            const checksum = crypto.generateChecksum(data);
            
            testRunner.assert(crypto.validateChecksum(data, checksum));
            testRunner.assert(!crypto.validateChecksum(data, 'invalid'));
        });
        
        testRunner.it('should generate and validate tokens', () => {
            const token = crypto.generateToken();
            const isValid = crypto.validateToken(token);
            
            testRunner.assert(isValid);
        });
        
        testRunner.it('should invalidate expired tokens', () => {
            const oldToken = '1234567890000-random-string-12345678';
            const isValid = crypto.validateToken(oldToken);
            
            testRunner.assert(!isValid);
        });
        
        testRunner.it('should mask sensitive strings', () => {
            const masked = crypto.maskString('password1234', 4);
            testRunner.assertEqual(masked, '********34');
        });
        
        testRunner.it('should sanitize input', () => {
            const dirty = '<script>alert("xss")</script>';
            const clean = crypto.sanitizeInput(dirty);
            
            testRunner.assertEqual(clean, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });
    });
    
    testRunner.describe('AntiCheat Tests', () => {
        testRunner.it('should validate valid game data', () => {
            const validData = {
                coins: 100,
                level: 5,
                exp: 20,
                day: 10,
                inventory: { sunflower: 5, rose: 2 },
                achievements: [{ id: 'test', unlocked: true, claimed: true }]
            };
            
            const result = antiCheat.validateAll(validData);
            testRunner.assert(result.valid);
        });
        
        testRunner.it('should detect negative coins', () => {
            const badData = { coins: -10, level: 1, exp: 0 };
            const result = antiCheat.validateAll(badData);
            
            testRunner.assert(!result.valid);
        });
        
        testRunner.it('should detect coins exceeding max', () => {
            const badData = { coins: 1000000, level: 1, exp: 0 };
            const result = antiCheat.validateAll(badData);
            
            testRunner.assert(!result.valid);
        });
        
        testRunner.it('should detect invalid level', () => {
            const badData = { coins: 100, level: 0, exp: 0 };
            const result = antiCheat.validateAll(badData);
            
            testRunner.assert(!result.valid);
        });
        
        testRunner.it('should detect negative inventory', () => {
            const badData = {
                coins: 100,
                level: 1,
                exp: 0,
                inventory: { sunflower: -1 }
            };
            const result = antiCheat.validateAll(badData);
            
            testRunner.assert(!result.valid);
        });
        
        testRunner.it('should detect claimed but not unlocked achievements', () => {
            const badData = {
                coins: 100,
                level: 1,
                exp: 0,
                achievements: [{ id: 'test', unlocked: false, claimed: true }]
            };
            const result = antiCheat.validateAll(badData);
            
            testRunner.assert(!result.valid);
        });
    });
    
    testRunner.describe('Logger Tests', () => {
        testRunner.it('should log messages', () => {
            const initialCount = logger.getStats().total;
            logger.info('Test log message');
            const newCount = logger.getStats().total;
            
            testRunner.assertEqual(newCount, initialCount + 1);
        });
        
        testRunner.it('should log errors', () => {
            const initialCount = logger.getStats().byLevel.error;
            logger.error(new Error('Test error'));
            const newCount = logger.getStats().byLevel.error;
            
            testRunner.assertEqual(newCount, initialCount + 1);
        });
        
        testRunner.it('should sanitize sensitive data', () => {
            logger.info('Test with secret', { password: 'secret123', token: 'xyz' });
            const logs = logger.getRecentLogs(1);
            const lastLog = logs[0];
            
            testRunner.assertEqual(lastLog.data.password, '***');
            testRunner.assertEqual(lastLog.data.token, '***');
        });
        
        testRunner.it('should get logs by level', () => {
            logger.debug('debug test');
            logger.info('info test');
            logger.warn('warn test');
            
            const debugLogs = logger.getLogsByLevel('debug');
            testRunner.assertEqual(debugLogs.length, 1);
        });
    });
}