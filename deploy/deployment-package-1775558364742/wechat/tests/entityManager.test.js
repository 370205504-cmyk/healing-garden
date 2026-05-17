import { EntityManager } from '../engine/EntityManager.js';
import { TransformComponent, RenderComponent } from '../engine/components/index.js';

export function runEntityManagerTests(testRunner) {
    testRunner.describe('EntityManager Tests', () => {
        let em;
        
        testRunner.beforeEach = () => {
            em = new EntityManager();
        };
        
        testRunner.it('should create an entity with unique id', () => {
            const entity = em.createEntity();
            testRunner.assert(entity.id !== null);
            testRunner.assertType(entity.id, 'number');
        });
        
        testRunner.it('should create entities with incrementing ids', () => {
            const e1 = em.createEntity();
            const e2 = em.createEntity();
            const e3 = em.createEntity();
            
            testRunner.assertEqual(e2.id, e1.id + 1);
            testRunner.assertEqual(e3.id, e2.id + 1);
        });
        
        testRunner.it('should add and get components', () => {
            const entity = em.createEntity();
            const transform = new TransformComponent(10, 20);
            
            entity.addComponent(transform);
            const retrieved = entity.getComponent('TransformComponent');
            
            testRunner.assert(retrieved !== null);
            testRunner.assertEqual(retrieved.x, 10);
            testRunner.assertEqual(retrieved.y, 20);
        });
        
        testRunner.it('should check if entity has component', () => {
            const entity = em.createEntity();
            entity.addComponent(new TransformComponent());
            
            testRunner.assert(entity.hasComponent('TransformComponent'));
            testRunner.assert(!entity.hasComponent('RenderComponent'));
        });
        
        testRunner.it('should remove components', () => {
            const entity = em.createEntity();
            entity.addComponent(new TransformComponent());
            
            testRunner.assert(entity.hasComponent('TransformComponent'));
            entity.removeComponent('TransformComponent');
            testRunner.assert(!entity.hasComponent('TransformComponent'));
        });
        
        testRunner.it('should get entity by id', () => {
            const entity = em.createEntity();
            const retrieved = em.getEntity(entity.id);
            
            testRunner.assert(retrieved !== null);
            testRunner.assertEqual(retrieved.id, entity.id);
        });
        
        testRunner.it('should return null for non-existent entity', () => {
            const entity = em.getEntity(9999);
            testRunner.assertEqual(entity, null);
        });
        
        testRunner.it('should destroy entity', () => {
            const entity = em.createEntity();
            const id = entity.id;
            
            testRunner.assert(em.getEntity(id) !== null);
            em.destroyEntity(id);
            testRunner.assertEqual(em.getEntity(id), null);
        });
        
        testRunner.it('should add and get tags', () => {
            const entity = em.createEntity();
            entity.addTag('player');
            
            testRunner.assert(entity.hasTag('player'));
            testRunner.assert(!entity.hasTag('enemy'));
        });
        
        testRunner.it('should find entities by tag', () => {
            const e1 = em.createEntity();
            const e2 = em.createEntity();
            const e3 = em.createEntity();
            
            e1.addTag('enemy');
            e2.addTag('enemy');
            e3.addTag('player');
            
            const enemies = em.findEntitiesByTag('enemy');
            testRunner.assertEqual(enemies.length, 2);
        });
        
        testRunner.it('should find entities by component', () => {
            const e1 = em.createEntity();
            const e2 = em.createEntity();
            const e3 = em.createEntity();
            
            e1.addComponent(new TransformComponent());
            e2.addComponent(new TransformComponent());
            e3.addComponent(new RenderComponent('rect'));
            
            const withTransform = em.findEntitiesWithComponent('TransformComponent');
            testRunner.assertEqual(withTransform.length, 2);
        });
        
        testRunner.it('should manage entity groups', () => {
            const e1 = em.createEntity();
            const e2 = em.createEntity();
            
            em.addToGroup(e1.id, 'ui');
            em.addToGroup(e2.id, 'ui');
            
            const uiGroup = em.getGroup('ui');
            testRunner.assertEqual(uiGroup.length, 2);
        });
        
        testRunner.it('should update entities', () => {
            let updated = false;
            const entity = em.createEntity();
            entity.update = () => { updated = true; };
            
            em.update(16);
            testRunner.assert(updated);
        });
        
        testRunner.it('should get all entities', () => {
            em.createEntity();
            em.createEntity();
            em.createEntity();
            
            const all = em.getAllEntities();
            testRunner.assertEqual(all.length, 3);
        });
        
        testRunner.it('should get stats', () => {
            em.createEntity();
            em.createEntity();
            
            const stats = em.stats;
            testRunner.assertEqual(stats.totalEntities, 2);
            testRunner.assertEqual(stats.totalComponents, 0);
        });
    });
}