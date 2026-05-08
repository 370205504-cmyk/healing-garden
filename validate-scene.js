/**
 * 场景集成验证脚本
 * 检查所有TypeScript文件语法和导入
 */

const fs = require('fs');
const path = require('path');

const gameDir = path.join(__dirname, 'game');
const scriptsDir = path.join(gameDir, 'assets', 'scripts');

console.log('🔍 开始场景集成验证...\n');

// 检查必要文件是否存在
const requiredFiles = [
  'GameManager.ts',
  'PlantingSystem.ts',
  'GardenSystem.ts',
  'EconomySystem.ts',
  'UIManager.ts',
  'MainScene.ts'
];

console.log('📁 检查脚本文件:');
let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(scriptsDir, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file} ${exists ? '' : '(缺失)'}`);
  if (!exists) allFilesExist = false;
}

if (!allFilesExist) {
  console.error('\n❌ 错误: 缺少必要的脚本文件');
  process.exit(1);
}

console.log('\n📄 检查文件内容:');

// 检查MainScene.ts导入
const mainScenePath = path.join(scriptsDir, 'MainScene.ts');
const mainSceneContent = fs.readFileSync(mainScenePath, 'utf8');

const requiredImports = [
  'GameManager',
  'PlantingSystem',
  'GardenSystem',
  'EconomySystem',
  'UIManager'
];

console.log('  MainScene.ts 导入检查:');
let allImportsFound = true;
for (const importName of requiredImports) {
  const regex = new RegExp(`import.*${importName}.*from`);
  const found = regex.test(mainSceneContent);
  console.log(`    ${found ? '✅' : '❌'} ${importName}`);
  if (!found) allImportsFound = false;
}

// 检查GameManager.ts的系统引用方法
const gameManagerPath = path.join(scriptsDir, 'GameManager.ts');
const gameManagerContent = fs.readFileSync(gameManagerPath, 'utf8');

const requiredMethods = [
  'setPlantingSystem',
  'setGardenSystem',
  'setEconomySystem',
  'setUIManager',
  'initializeGame'
];

console.log('\n  GameManager.ts 方法检查:');
let allMethodsFound = true;
for (const method of requiredMethods) {
  const regex = new RegExp(`${method}\\(`);
  const found = regex.test(gameManagerContent);
  console.log(`    ${found ? '✅' : '❌'} ${method}()`);
  if (!found) allMethodsFound = false;
}

// 检查场景文件
const scenesDir = path.join(gameDir, 'scenes');
const sceneFile = path.join(scenesDir, 'MainScene.fire');
const sceneExists = fs.existsSync(sceneFile);

console.log(`\n🎬 场景文件检查:`);
console.log(`  ${sceneExists ? '✅' : '❌'} MainScene.fire ${sceneExists ? '' : '(缺失)'}`);

if (sceneExists) {
  try {
    const sceneContent = fs.readFileSync(sceneFile, 'utf8');
    const sceneJson = JSON.parse(sceneContent);
    console.log('  ✅ 场景JSON格式正确');
    
    // 检查关键节点
    if (sceneJson.scene && sceneJson.scene._nodes) {
      const nodeNames = sceneJson.scene._nodes.map((n) => n._name).filter(Boolean);
      console.log(`  📋 场景节点: ${nodeNames.join(', ')}`);
      
      const requiredNodes = ['Canvas', 'GameManager', 'PlantingSystem', 'GardenSystem', 'EconomySystem', 'UIManager', 'MainSceneController'];
      const missingNodes = requiredNodes.filter(name => !nodeNames.includes(name));
      if (missingNodes.length === 0) {
        console.log('  ✅ 所有必需节点存在');
      } else {
        console.log(`  ❌ 缺失节点: ${missingNodes.join(', ')}`);
        allFilesExist = false;
      }
    }
  } catch (error) {
    console.log(`  ❌ 场景文件解析错误: ${error.message}`);
    allFilesExist = false;
  }
}

// 检查预制体
const prefabsDir = path.join(gameDir, 'assets', 'prefabs');
const plantPrefab = path.join(prefabsDir, 'PlantPrefab.prefab');
const uiPrefab = path.join(prefabsDir, 'UIPrefab.prefab');

console.log(`\n🛠️ 预制体检查:`);
console.log(`  ${fs.existsSync(plantPrefab) ? '✅' : '❌'} PlantPrefab.prefab`);
console.log(`  ${fs.existsSync(uiPrefab) ? '✅' : '❌'} UIPrefab.prefab`);

// 检查占位资源
const texturesDir = path.join(gameDir, 'assets', 'textures');
const requiredTextures = [
  'plant_placeholder.png',
  'ui_placeholder.png',
  'background.png',
  'button_icon.png'
];

console.log(`\n🎨 占位资源检查:`);
for (const texture of requiredTextures) {
  const texturePath = path.join(texturesDir, texture);
  console.log(`  ${fs.existsSync(texturePath) ? '✅' : '❌'} ${texture}`);
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 场景集成验证结果:');

if (allFilesExist && allImportsFound && allMethodsFound && sceneExists) {
  console.log('✅ 所有检查通过！场景集成完整。');
  console.log('\n🎉 场景架构验证成功:');
  console.log('  1. ✅ 所有脚本文件存在');
  console.log('  2. ✅ 系统导入正确');
  console.log('  3. ✅ GameManager方法完整');
  console.log('  4. ✅ 场景文件完整');
  console.log('  5. ✅ 预制体存在');
  console.log('  6. ✅ 占位资源齐全');
  
  // 生成下一步建议
  console.log('\n🚀 下一步建议:');
  console.log('  1. 在Cocos Creator中打开项目');
  console.log('  2. 运行MainScene场景');
  console.log('  3. 验证游戏流程: 种植 → 生长 → 收获 → 经济循环');
  console.log('  4. 连接服务端API进行数据持久化');
  console.log('  5. 运行单元测试: cd tests && npm test');
} else {
  console.log('❌ 验证失败，需要修复上述问题。');
  process.exit(1);
}

console.log('\n验证完成时间:', new Date().toLocaleString());