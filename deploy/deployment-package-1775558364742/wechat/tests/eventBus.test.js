import { EventBus } from '../engine/EventBus.js';

export function runEventBusTests(testRunner) {
    testRunner.describe('EventBus Tests', () => {
        let bus;
        
        testRunner.it('should subscribe and emit events', () => {
            bus = new EventBus();
            let received = false;
            
            bus.on('test_event', () => {
                received = true;
            });
            
            bus.emit('test_event');
            testRunner.assert(received);
        });
        
        testRunner.it('should pass arguments to listeners', () => {
            bus = new EventBus();
            let receivedData = null;
            
            bus.on('data_event', (data) => {
                receivedData = data;
            });
            
            const testData = { message: 'hello', value: 42 };
            bus.emit('data_event', testData);
            testRunner.assertDeepEqual(receivedData, testData);
        });
        
        testRunner.it('should support multiple listeners', () => {
            bus = new EventBus();
            let count = 0;
            
            bus.on('count_event', () => count++);
            bus.on('count_event', () => count++);
            bus.on('count_event', () => count++);
            
            bus.emit('count_event');
            testRunner.assertEqual(count, 3);
        });
        
        testRunner.it('should remove specific listener', () => {
            bus = new EventBus();
            let count = 0;
            
            const listener = () => count++;
            bus.on('remove_test', listener);
            bus.on('remove_test', () => count++);
            
            bus.off('remove_test', listener);
            bus.emit('remove_test');
            
            testRunner.assertEqual(count, 1);
        });
        
        testRunner.it('should remove all listeners for event', () => {
            bus = new EventBus();
            let count = 0;
            
            bus.on('clear_test', () => count++);
            bus.on('clear_test', () => count++);
            bus.on('clear_test', () => count++);
            
            bus.off('clear_test');
            bus.emit('clear_test');
            
            testRunner.assertEqual(count, 0);
        });
        
        testRunner.it('should handle once listeners', () => {
            bus = new EventBus();
            let count = 0;
            
            bus.once('once_test', () => count++);
            
            bus.emit('once_test');
            bus.emit('once_test');
            bus.emit('once_test');
            
            testRunner.assertEqual(count, 1);
        });
        
        testRunner.it('should support wildcard listeners', () => {
            bus = new EventBus();
            let receivedEvents = [];
            
            bus.on('*', (eventName, data) => {
                receivedEvents.push({ eventName, data });
            });
            
            bus.emit('event1', { value: 1 });
            bus.emit('event2', { value: 2 });
            
            testRunner.assertEqual(receivedEvents.length, 2);
            testRunner.assertEqual(receivedEvents[0].eventName, 'event1');
            testRunner.assertEqual(receivedEvents[1].eventName, 'event2');
        });
        
        testRunner.it('should support throttled events', () => {
            bus = new EventBus();
            let count = 0;
            
            bus.onThrottled('throttle_test', () => count++, 100);
            
            for (let i = 0; i < 10; i++) {
                bus.emit('throttle_test');
            }
            
            testRunner.assertEqual(count, 1);
        });
        
        testRunner.it('should support debounced events', (done) => {
            bus = new EventBus();
            let count = 0;
            
            bus.onDebounced('debounce_test', () => count++, 50);
            
            for (let i = 0; i < 5; i++) {
                bus.emit('debounce_test');
            }
            
            testRunner.assertEqual(count, 0);
            
            setTimeout(() => {
                testRunner.assertEqual(count, 1);
                done();
            }, 100);
        });
        
        testRunner.it('should track event history', () => {
            bus = new EventBus();
            bus.enableHistory(10);
            
            bus.emit('tracked', { a: 1 });
            bus.emit('tracked', { a: 2 });
            bus.emit('tracked', { a: 3 });
            
            const history = bus.getHistory('tracked');
            testRunner.assertEqual(history.length, 3);
            testRunner.assertEqual(history[2].data.a, 3);
        });
        
        testRunner.it('should get event stats', () => {
            bus = new EventBus();
            
            bus.emit('stat_test');
            bus.emit('stat_test');
            bus.emit('other_event');
            
            const stats = bus.getStats();
            testRunner.assertEqual(stats.totalEmits, 3);
            testRunner.assertEqual(stats.events.stat_test, 2);
        });
        
        testRunner.it('should clear all events', () => {
            bus = new EventBus();
            
            bus.on('event1', () => {});
            bus.on('event2', () => {});
            bus.on('event3', () => {});
            
            bus.clear();
            const stats = bus.getStats();
            
            testRunner.assertEqual(stats.totalListeners, 0);
        });
    });
}