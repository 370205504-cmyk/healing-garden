/**
 * Jest测试全局配置
 */

// 模拟Cocos Creator环境
globalThis.cc = {
  _decorator: {
    ccclass: (name: string) => (target: any) => target,
    property: (type?: any) => (target: any, key: string) => {},
  },
  Component: class Component {},
  Node: class Node {
    emit(event: string, data?: any) {}
    on(event: string, callback: Function) {}
    getComponent(type: any) { return {}; }
    setPosition(x: number, y?: number, z?: number) {}
    addChild(node: Node) {}
    destroy() {}
  },
  Prefab: class Prefab {},
  Vec3: class Vec3 {
    constructor(public x: number, public y: number, public z: number) {}
  },
  instantiate: (prefab: any) => new cc.Node(),
  Label: class Label {},
  ProgressBar: class ProgressBar {},
  Sprite: class Sprite {},
  Button: class Button {},
  Widget: class Widget {},
};

// 模拟localStorage
class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

globalThis.localStorage = new MockStorage();

// 模拟console方法
globalThis.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
} as any;

// 测试前清理
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// 测试后清理
afterEach(() => {
  // 清理资源
});

// 全局测试超时
jest.setTimeout(10000);