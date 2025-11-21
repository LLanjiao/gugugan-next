// 类型定义


interface GameObject {
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Bullet extends GameObject {
  speed: number
  damage: number
}

interface Enemy extends GameObject {
  hp: number
  maxHp: number
  level: number
  speed: number
  damage: number
}

interface Player extends GameObject {
  hp: number
  maxHp: number
  level: number
  exp: number
  expToNextLevel: number
  bulletSpeed: number
  bulletCount: number // 一次发射子弹数量
  bulletTimer: number // 射击冷却计时
}