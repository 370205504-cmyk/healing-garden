class StateMachine {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
        this.stateStack = [];
        this.globalState = null;
        this.debug = false;
    }
    
    addState(name, state) {
        if (this.states.has(name)) {
            console.warn(`State "${name}" already exists, overwriting`);
        }
        
        if (!(state instanceof State)) {
            state = new State(name, state);
        }
        
        state.stateMachine = this;
        this.states.set(name, state);
    }
    
    addGlobalState(state) {
        if (!(state instanceof State)) {
            state = new State('global', state);
        }
        state.stateMachine = this;
        this.globalState = state;
    }
    
    changeState(name, data = null) {
        if (!this.states.has(name)) {
            console.error(`State "${name}" not found`);
            return;
        }
        
        const nextState = this.states.get(name);
        
        if (this.currentState) {
            if (this.debug) {
                console.log(`[StateMachine] Exiting state: ${this.currentState.name}`);
            }
            this.previousState = this.currentState;
            this.currentState.exit(data);
        }
        
        this.currentState = nextState;
        
        if (this.debug) {
            console.log(`[StateMachine] Entering state: ${this.currentState.name}`);
        }
        
        this.currentState.enter(data);
        
        this._notifyStateChange(name, data);
    }
    
    pushState(name, data = null) {
        if (!this.states.has(name)) {
            console.error(`State "${name}" not found`);
            return;
        }
        
        if (this.currentState) {
            this.stateStack.push(this.currentState);
            this.currentState.pause();
        }
        
        this.currentState = this.states.get(name);
        this.currentState.enter(data);
        
        if (this.debug) {
            console.log(`[StateMachine] Pushing state: ${this.currentState.name}`);
        }
    }
    
    popState(data = null) {
        if (this.stateStack.length === 0) {
            console.warn('State stack is empty');
            return;
        }
        
        if (this.currentState) {
            this.currentState.exit(data);
        }
        
        this.currentState = this.stateStack.pop();
        this.currentState.resume(data);
        
        if (this.debug) {
            console.log(`[StateMachine] Popping state: ${this.currentState.name}`);
        }
    }
    
    update(deltaTime) {
        if (this.globalState) {
            this.globalState.update(deltaTime);
        }
        
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }
    
    render(ctx) {
        try {
            if (!ctx) {
                console.warn('StateMachine.render: ctx is null');
                return;
            }

            if (this.globalState) {
                if (typeof this.globalState.render === 'function') {
                    try {
                        this.globalState.render(ctx);
                    } catch (e) {
                        console.error('StateMachine.render: globalState.render error:', e.message);
                    }
                }
            }

            if (this.currentState) {
                if (typeof this.currentState.render === 'function') {
                    try {
                        this.currentState.render(ctx);
                    } catch (e) {
                        console.error('StateMachine.render: currentState.render error:', e.message);
                        if (e.stack) console.error(e.stack);
                    }
                } else {
                    console.warn('StateMachine.render: currentState.render is not a function');
                }
            } else {
                console.warn('StateMachine.render: currentState is null');
            }
        } catch (e) {
            console.error('StateMachine.render: Unexpected error:', e.message);
        }
    }
    
    handleInput(input) {
        if (this.globalState && this.globalState.handleInput) {
            this.globalState.handleInput(input);
        }
        
        if (this.currentState && this.currentState.handleInput) {
            this.currentState.handleInput(input);
        }
    }
    
    hasState(name) {
        return this.states.has(name);
    }
    
    getState(name) {
        return this.states.get(name) || null;
    }
    
    goToPreviousState(data = null) {
        if (this.previousState) {
            this.changeState(this.previousState.name, data);
        }
    }
    
    clearStack() {
        this.stateStack = [];
    }
    
    _notifyStateChange(name, data) {
        if (typeof this.onStateChange === 'function') {
            this.onStateChange(name, data);
        }
    }
    
    get state() {
        return this.currentState?.name || null;
    }
    
    get stackSize() {
        return this.stateStack.length;
    }
}

class State {
    constructor(name, config = {}) {
        this.name = name;
        this.stateMachine = null;
        
        this._enter = config.enter || function() {};
        this._exit = config.exit || function() {};
        this._update = config.update || function() {};
        this._render = config.render || null;
        this._handleInput = config.handleInput || null;
        this._pause = config.pause || function() {};
        this._resume = config.resume || function() {};
    }
    
    enter(data) {
        try {
            this._enter.call(this, data);
        } catch (e) {
            console.error(`Error entering state ${this.name}:`, e);
        }
    }
    
    exit(data) {
        try {
            this._exit.call(this, data);
        } catch (e) {
            console.error(`Error exiting state ${this.name}:`, e);
        }
    }
    
    update(deltaTime) {
        try {
            this._update.call(this, deltaTime);
        } catch (e) {
            console.error(`Error updating state ${this.name}:`, e);
        }
    }
    
    render(ctx) {
        if (this._render) {
            try {
                this._render.call(this, ctx);
            } catch (e) {
                console.error(`Error rendering state ${this.name}:`, e);
            }
        }
    }
    
    handleInput(input) {
        if (this._handleInput) {
            try {
                this._handleInput.call(this, input);
            } catch (e) {
                console.error(`Error handling input in state ${this.name}:`, e);
            }
        }
    }
    
    pause() {
        try {
            this._pause.call(this);
        } catch (e) {
            console.error(`Error pausing state ${this.name}:`, e);
        }
    }
    
    resume(data) {
        try {
            this._resume.call(this, data);
        } catch (e) {
            console.error(`Error resuming state ${this.name}:`, e);
        }
    }
    
    changeState(name, data) {
        if (this.stateMachine) {
            this.stateMachine.changeState(name, data);
        }
    }
    
    get isActive() {
        return this.stateMachine?.currentState === this;
    }
}

export { StateMachine, State };