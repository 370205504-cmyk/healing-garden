#!/usr/bin/env node

/**
 * 更新微信小游戏AppID脚本
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const wechatDistConfig = path.join(projectRoot, 'dist', 'wechat', 'project.config.json');
const wechatTemplateConfig = path.join(projectRoot, 'game', 'build-templates', 'wechatgame', 'project.config.json');

// 用户提供的AppID
const newAppId = 'wx2322a80f2186758f';

console.log('🔄 更新微信小游戏AppID');
console.log(`新的AppID: ${newAppId}`);

function updateConfigFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ 配置文件不存在: ${filePath}`);
        return false;
    }
    
    try {
        const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const oldAppId = config.appid || '未设置';
        
        config.appid = newAppId;
        config.projectname = '自动治愈花园';
        
        // 备份原始文件
        const backupPath = filePath + '.backup';
        fs.copyFileSync(filePath, backupPath);
        
        // 写入更新
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
        
        console.log(`✅ 更新成功: ${path.relative(projectRoot, filePath)}`);
        console.log(`   旧AppID: ${oldAppId} → 新AppID: ${newAppId}`);
        
        return true;
    } catch (error) {
        console.log(`❌ 更新失败: ${filePath}`, error.message);
        return false;
    }
}

// 更新两个配置文件
const success1 = updateConfigFile(wechatDistConfig);
const success2 = updateConfigFile(wechatTemplateConfig);

if (success1 && success2) {
    console.log('\n🎉 AppID更新完成！');
    console.log('可以运行微信小游戏部署脚本了。');
} else {
    console.log('\n⚠️ 部分文件更新失败，请手动检查。');
}