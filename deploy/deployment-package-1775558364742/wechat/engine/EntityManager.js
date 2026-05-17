class EntityManager {
    constructor() {
        this.entities = new Map();
        this.components = new Map();
        this.entityIdCounter = 0;
        this.tagManager = new Map();
        this.groupManager = new Map();
    }
    
    createEntity() {
        const entityId = ++this.entityIdCounter;
        const entity = new Entity(entityId);
        this.entities.set(entityId, entity);
        this.components.set(entityId, new Map());
        return entity;
    }
    
    destroyEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) return;
        
        this._removeEntityFromGroups(entityId);
        this._removeEntityTags(entityId);
        this.components.delete(entityId);
        this.entities.delete(entityId);
    }
    
    getEntity(entityId) {
        return this.entities.get(entityId) || null;
    }
    
    addComponent(entityId, component) {
        const componentMap = this.components.get(entityId);
        if (!componentMap) return false;
        
        const componentName = component.constructor.name;
        component.entityId = entityId;
        componentMap.set(componentName, component);
        
        if (component.onAdd) {
            component.onAdd();
        }
        
        this.eventBus?.emit('componentAdded', { entityId, componentName });
        return true;
    }
    
    removeComponent(entityId, componentName) {
        const componentMap = this.components.get(entityId);
        if (!componentMap) return false;
        
        const component = componentMap.get(componentName);
        if (component?.onRemove) {
            component.onRemove();
        }
        
        const result = componentMap.delete(componentName);
        this.eventBus?.emit('componentRemoved', { entityId, componentName });
        return result;
    }
    
    getComponent(entityId, componentName) {
        const componentMap = this.components.get(entityId);
        return componentMap ? componentMap.get(componentName) : null;
    }
    
    hasComponent(entityId, componentName) {
        const componentMap = this.components.get(entityId);
        return componentMap ? componentMap.has(componentName) : false;
    }
    
    getAllComponents(entityId) {
        const componentMap = this.components.get(entityId);
        return componentMap ? Array.from(componentMap.values()) : [];
    }
    
    addTag(entityId, tag) {
        if (!this.tagManager.has(tag)) {
            this.tagManager.set(tag, new Set());
        }
        this.tagManager.get(tag).add(entityId);
    }
    
    removeTag(entityId, tag) {
        this.tagManager.get(tag)?.delete(entityId);
    }
    
    hasTag(entityId, tag) {
        return this.tagManager.get(tag)?.has(entityId) || false;
    }
    
    getEntitiesByTag(tag) {
        const entityIds = this.tagManager.get(tag);
        if (!entityIds) return [];
        return Array.from(entityIds).map(id => this.entities.get(id)).filter(Boolean);
    }
    
    addToGroup(entityId, groupName) {
        if (!this.groupManager.has(groupName)) {
            this.groupManager.set(groupName, new Set());
        }
        this.groupManager.get(groupName).add(entityId);
    }
    
    removeFromGroup(entityId, groupName) {
        this.groupManager.get(groupName)?.delete(entityId);
    }
    
    getEntitiesInGroup(groupName) {
        const entityIds = this.groupManager.get(groupName);
        if (!entityIds) return [];
        return Array.from(entityIds).map(id => this.entities.get(id)).filter(Boolean);
    }
    
    getEntitiesWithComponents(componentNames) {
        const results = [];
        for (const [entityId, componentMap] of this.components) {
            let hasAll = true;
            for (const name of componentNames) {
                if (!componentMap.has(name)) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                const entity = this.entities.get(entityId);
                if (entity) results.push(entity);
            }
        }
        return results;
    }
    
    update(deltaTime) {
        for (const [entityId, componentMap] of this.components) {
            for (const component of componentMap.values()) {
                if (component.update) {
                    try {
                        component.update(deltaTime);
                    } catch (e) {
                        console.error(`Component update error (${entityId}):`, e);
                    }
                }
            }
        }
    }
    
    _removeEntityFromGroups(entityId) {
        for (const group of this.groupManager.values()) {
            group.delete(entityId);
        }
    }
    
    _removeEntityTags(entityId) {
        for (const tagSet of this.tagManager.values()) {
            tagSet.delete(entityId);
        }
    }
    
    get entityCount() {
        return this.entities.size;
    }
    
    clear() {
        this.entities.clear();
        this.components.clear();
        this.tagManager.clear();
        this.groupManager.clear();
    }
}

class Entity {
    constructor(id) {
        this.id = id;
        this.active = true;
        this.enabled = true;
        this.parent = null;
        this.children = [];
        this._components = new Map();
    }
    
    addComponent(component) {
        const name = component.constructor.name;
        component.entity = this;
        component.entityId = this.id;
        this._components.set(name, component);
        if (component.onAdd) component.onAdd();
        return this;
    }
    
    removeComponent(componentName) {
        const component = this._components.get(componentName);
        if (component?.onRemove) component.onRemove();
        this._components.delete(componentName);
        return this;
    }
    
    getComponent(componentName) {
        return this._components.get(componentName) || null;
    }
    
    hasComponent(componentName) {
        return this._components.has(componentName);
    }
    
    setParent(parent) {
        if (this.parent) {
            this.parent.children = this.parent.children.filter(c => c !== this);
        }
        this.parent = parent;
        if (parent) {
            parent.children.push(this);
        }
    }
    
    destroy() {
        this.active = false;
    }
    
    get allComponents() {
        return Array.from(this._components.values());
    }
}

export { EntityManager, Entity };