// 花卉配置——与 Canvas2D 原型一致
export interface FlowerType {
    id: string;
    name: string;
    growthTime: number; // 生长时间（秒）
    reward: number;     // 收获金币
    price: number;      // 种子价格
    color: string;      // 花色（hex）
    unlockLevel: number; // 解锁等级
    description: string; // 花语/描述
}

export const FLOWER_TYPES: FlowerType[] = [
    {
        id: 'sunflower',
        name: '向日葵',
        growthTime: 300,    // 5分钟
        reward: 10,
        price: 5,
        color: '#FFD700',
        unlockLevel: 1,
        description: '永远向着阳光，带来温暖和希望'
    },
    {
        id: 'tulip',
        name: '郁金香',
        growthTime: 600,    // 10分钟
        reward: 20,
        price: 10,
        color: '#FF69B4',
        unlockLevel: 1,
        description: '优雅的绽放，诉说着春天的故事'
    },
    {
        id: 'rose',
        name: '玫瑰',
        growthTime: 1800,   // 30分钟
        reward: 50,
        price: 25,
        color: '#E53935',
        unlockLevel: 1,
        description: '热情的红，送给值得被爱的人'
    },
    {
        id: 'daisy',
        name: '小雏菊',
        growthTime: 900,    // 15分钟
        reward: 30,
        price: 15,
        color: '#FFFFFF',
        unlockLevel: 3,
        description: '天真烂漫，每一天都是新的开始'
    },
    {
        id: 'lavender',
        name: '薰衣草',
        growthTime: 3600,   // 1小时
        reward: 100,
        price: 50,
        color: '#9C27B0',
        unlockLevel: 5,
        description: '紫色的梦，让心灵回归宁静'
    }
];

export function getFlowerType(id: string): FlowerType | undefined {
    return FLOWER_TYPES.find(f => f.id === id);
}

export interface FlowerData {
    type: string;
    growthStartTime: number;    // 种植时间戳
    growthDuration: number;     // 生长总时长（秒）
    progress: number;           // 0-1
    state: 'growing' | 'ready' | 'withered';
    plantedPlot: number;        // 所在地块ID
}
