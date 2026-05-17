class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentTest = null;
        this.onTestStart = null;
        this.onTestComplete = null;
        this.onAllComplete = null;
    }
    
    describe(name, fn) {
        this.tests.push({
            name,
            fn,
            type: 'describe'
        });
    }
    
    it(name, fn) {
        this.tests.push({
            name,
            fn,
            type: 'it'
        });
    }
    
    async run() {
        this.results = [];
        
        for (const test of this.tests) {
            if (test.type === 'describe') {
                console.log(`\n📋 ${test.name}`);
                continue;
            }
            
            this.currentTest = test;
            if (this.onTestStart) {
                this.onTestStart(test.name);
            }
            
            try {
                await test.fn();
                this.results.push({
                    name: test.name,
                    passed: true,
                    error: null
                });
                console.log(`  ✓ ${test.name}`);
            } catch (error) {
                this.results.push({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`  ✗ ${test.name}: ${error.message}`);
            }
            
            if (this.onTestComplete) {
                this.onTestComplete(test.name, this.results[this.results.length - 1]);
            }
        }
        
        this._printSummary();
        
        if (this.onAllComplete) {
            this.onAllComplete(this.results);
        }
        
        return this.results;
    }
    
    _printSummary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const percentage = total > 0 ? (passed / total * 100).toFixed(1) : 0;
        
        console.log('\n=======================');
        console.log(`Test Summary: ${passed}/${total} (${percentage}%)`);
        
        if (passed === total) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('❌ Some tests failed:');
            for (const result of this.results.filter(r => !r.passed)) {
                console.log(`  - ${result.name}: ${result.error}`);
            }
        }
        console.log('=======================');
    }
    
    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    assertEqual(actual, expected, message = null) {
        if (actual !== expected) {
            const msg = message || `Expected ${expected}, got ${actual}`;
            throw new Error(msg);
        }
    }
    
    assertNotEqual(actual, expected, message = null) {
        if (actual === expected) {
            const msg = message || `Expected not ${expected}`;
            throw new Error(msg);
        }
    }
    
    assertDeepEqual(actual, expected, message = null) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            const msg = message || `Deep equality check failed\nExpected: ${expectedStr}\nGot: ${actualStr}`;
            throw new Error(msg);
        }
    }
    
    assertThrows(fn, expectedError = null) {
        try {
            fn();
            throw new Error('Expected function to throw');
        } catch (error) {
            if (expectedError && error.message !== expectedError) {
                throw new Error(`Expected error "${expectedError}", got "${error.message}"`);
            }
        }
    }
    
    assertType(value, type, message = null) {
        const actualType = typeof value;
        if (actualType !== type) {
            const msg = message || `Expected type "${type}", got "${actualType}"`;
            throw new Error(msg);
        }
    }
    
    assertArrayIncludes(array, element, message = null) {
        if (!array.includes(element)) {
            const msg = message || `Expected array to include ${element}`;
            throw new Error(msg);
        }
    }
    
    assertGreaterThan(actual, expected, message = null) {
        if (actual <= expected) {
            const msg = message || `Expected ${actual} > ${expected}`;
            throw new Error(msg);
        }
    }
    
    assertLessThan(actual, expected, message = null) {
        if (actual >= expected) {
            const msg = message || `Expected ${actual} < ${expected}`;
            throw new Error(msg);
        }
    }
    
    assertNear(actual, expected, tolerance = 0.001, message = null) {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            const msg = message || `Expected ${actual} to be near ${expected} (tolerance: ${tolerance})`;
            throw new Error(msg);
        }
    }
    
    async assertRejects(promise, expectedError = null) {
        try {
            await promise;
            throw new Error('Expected promise to reject');
        } catch (error) {
            if (expectedError && error.message !== expectedError) {
                throw new Error(`Expected error "${expectedError}", got "${error.message}"`);
            }
        }
    }
    
    getStats() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        return {
            passed,
            failed: total - passed,
            total,
            percentage: total > 0 ? (passed / total * 100).toFixed(1) : 0
        };
    }
    
    skip(name) {
        this.tests.push({
            name,
            fn: () => {},
            type: 'skip'
        });
    }
    
    only(name, fn) {
        const onlyTest = {
            name,
            fn,
            type: 'it',
            only: true
        };
        this.tests = [onlyTest];
    }
}

const testRunner = new TestRunner();
export { testRunner, TestRunner };