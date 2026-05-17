import { _decorator, Component } from 'cc';
import { GardenController } from './GardenController';
import { UIController } from './UIController';

const { ccclass, property } = _decorator;

@ccclass('GardenSceneController')
export class GardenSceneController extends Component {
    @property(GardenController)
    public gardenController: GardenController | null = null;

    @property(UIController)
    public uiController: UIController | null = null;

    start() {
        console.log('[GardenSceneController] Initialized');
    }
}
