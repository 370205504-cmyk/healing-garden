#!/usr/bin/env node
/**
 * 治愈花园 - Cocos Creator 3.8 场景文件生成器
 *
 * 输出: game/assets/scenes/MainScene.fire
 *
 * 用法:
 *   node setup-scene.js
 *
 * 生成的场景结构:
 *   Canvas (Canvas+Widget+MainScene)
 *   ├── GameManager        (GameManager.ts)
 *   ├── PlantingSystem     (PlantingSystem.ts)
 *   │   └── GardenArea     (地块容器)
 *   ├── GardenSystem       (GardenSystem.ts)
 *   ├── EconomySystem      (EconomySystem.ts)
 *   ├── UIManager          (UIManager.ts)
 *   └── SynthesisSystem    (SynthesisSystem.ts)
 *
 * 注意: 所有系统节点都是 Canvas 的子节点。
 *       MainScene.locateNodes() 通过 child name 自动查找。
 *       不需要在编辑器中手动接线。
 */

const fs = require('fs');
const path = require('path');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const UUIDS = {
  scene:    uuid(),
  canvas:   uuid(),
  gmNode:   uuid(),
  plantNode: uuid(),
  gardenNode: uuid(),
  ecoNode:   uuid(),
  uiNode:    uuid(),
  synthNode: uuid(),
  gardenArea: uuid(),
  canvasComp:     uuid(),
  widgetComp:     uuid(),
  mainSceneComp:  uuid(),
  gmComp:         uuid(),
  plantComp:      uuid(),
  gardenComp:     uuid(),
  ecoComp:        uuid(),
  uiComp:         uuid(),
  synthComp:      uuid(),
};

// INDEX in the output array: [scene, canvas, ...children, ...components]
// scene = idx 0, canvas = idx 1, children = 2~7, components = 8~
// __id__ references are 0-based array indices

function sceneData() {
  return [
    { __type__: 'cc.Scene',
      _name: 'MainScene',
      _active: true,
      _id: UUIDS.scene,
      _children: [UUIDS.canvas],
      _components: [],
    },
    // --- Canvas (index 1, children 2~7) ---
    { __type__: 'cc.Node',
      _name: 'Canvas',
      _id: UUIDS.canvas,
      _children: [UUIDS.gmNode, UUIDS.plantNode, UUIDS.gardenNode, UUIDS.ecoNode, UUIDS.uiNode, UUIDS.synthNode],
      _components: [UUIDS.canvasComp, UUIDS.widgetComp, UUIDS.mainSceneComp],
      _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
      _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
      _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
      _layer: 0x00000020,
    },
    // --- GameManager (index 2) ---
    node(GameManager,  UUIDS.gmNode,       []),
    // --- PlantingSystem (index 3) ---
    node(PlantingSystem, UUIDS.plantNode, [UUIDS.gardenArea]),
    // --- GardenSystem (index 4) ---
    node(GardenSystem,  UUIDS.gardenNode,   []),
    // --- EconomySystem (index 5) ---
    node(EconomySystem, UUIDS.ecoNode,      []),
    // --- UIManager (index 6) ---
    node(UIManager,     UUIDS.uiNode,       []),
    // --- SynthesisSystem (index 7) ---
    node(SynthesisSystem, UUIDS.synthNode,  []),
    // --- GardenArea (index 8, child of PlantingSystem @ index 3) ---
    { __type__: 'cc.Node',
      _name: 'GardenArea',
      _id: UUIDS.gardenArea,
      _children: [],
      _components: [],
      _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
      _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
      _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
      _layer: 0x00000020,
    },
    // --- Components (index 9+) ---
    comp('cc.Canvas',         UUIDS.canvasComp,    1),
    comp('cc.Widget',         UUIDS.widgetComp,    1),
    comp('MainScene',         UUIDS.mainSceneComp, 1),
    comp('GameManager',       UUIDS.gmComp,        2),
    comp('PlantingSystem',    UUIDS.plantComp,     3),
    comp('GardenSystem',      UUIDS.gardenComp,    4),
    comp('EconomySystem',     UUIDS.ecoComp,       5),
    comp('UIManager',         UUIDS.uiComp,        6),
    comp('SynthesisSystem',   UUIDS.synthComp,     7),
  ];
}

function node(name, id, children) {
  return {
    __type__: 'cc.Node',
    _name: name,
    _id: id,
    _children: children,
    _components: [],
    _active: true,
    _lpos: { __type__: 'cc.Vec3', x: 0, y: 0, z: 0 },
    _lrot: { __type__: 'cc.Quat', x: 0, y: 0, z: 0, w: 1 },
    _lscale: { __type__: 'cc.Vec3', x: 1, y: 1, z: 1 },
    _layer: 0x00000020,
  };
}

function comp(script, id, nodeIdx) {
  const base = {
    __type__: 'editor.extend.Component',
    _id: id,
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeIdx },
    _enabled: true,
  };
  if (script.startsWith('cc.')) {
    // Built-in component: Canvas, Widget
    base.__type__ = script;
    delete base.script;
    if (script === 'cc.Canvas') {
      base._alignCanvasWithScreen = true;
      base._designResolution = { __type__: 'cc.Size', width: 720, height: 1280 };
    }
    if (script === 'cc.Widget') {
      base._alignFlags = 0xffffffff;
      base._isAbsLeft = true; base._isAbsRight = true;
      base._isAbsTop = true; base._isAbsBottom = true;
      base._originalWidth = 720; base._originalHeight = 1280;
      base._top = 0; base._bottom = 0; base._left = 0; base._right = 0;
    }
  } else {
    // User script component
    base.script = { __uuid__: script };
  }
  return base;
}

function writeScene() {
  const data = sceneData();
  const outputDir = path.join(__dirname, 'game', 'assets', 'scenes');
  const outputPath = path.join(outputDir, 'MainScene.fire');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✓ Generated: ' + outputPath);
  console.log('  Nodes: Canvas + 6 child systems + GardenArea');
  console.log('  Components: 9 (Canvas, Widget, MainScene, 6 scripts)');
}

writeScene();
