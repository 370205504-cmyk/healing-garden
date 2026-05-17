/**
 * Launch — 全局唯一启动入口
 *
 * Cocos Creator 3.8 统一启动脚本
 * 在所有其他组件之前执行，初始化引擎系统
 */

import { _decorator, Component, director, game } from 'cc';
const { ccclass, executionOrder } = _decorator;

@ccclass('Launch')
@executionOrder(-10000)
export class Launch extends Component {

    onLoad() {
        console.log('[Launch] 引擎就绪');

        // 校验 director 可用性
        if (!director || !director.getScene()) {
            console.error('[Launch] director 未就绪');
            return;
        }
    }

    start() {
        console.log('[Launch] 启动游戏');
        this.initGame();
    }

    private initGame() {
        // 设置游戏帧率
        game.frameRate = 60;

        // 后续初始化交给场景中的 Manager 系统
        console.log('[Launch] 游戏系统等待场景初始化');
    }
}
