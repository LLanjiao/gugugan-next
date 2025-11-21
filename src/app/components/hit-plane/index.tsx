'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { renderPlayer, renderEnemy, renderBullet } from './gameRenderer'

// --- 1. 类型定义与常量配置 ---

// 游戏常量
const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 600
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 50
const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 40
const BULLET_WIDTH = 6
const BULLET_HEIGHT = 15

// --- 2. 辅助函数 ---

// 碰撞检测 (AABB)
const checkCollision = (rect1: GameObject, rect2: GameObject) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

export default function HitPlane() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 游戏状态 (UI用)
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSE' | 'GAME_OVER'>('START')
  const [score, setScore] = useState(0)
  const [displayLevel, setDisplayLevel] = useState(1)
  const [displayHp, setDisplayHp] = useState(100)

  // 游戏核心数据 (Ref用，避免重渲染)
  const requestRef = useRef<number | null>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  
  // 实体数据 Refs
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    color: '#00f', // 蓝色
    hp: 100,
    maxHp: 100,
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    bulletSpeed: 7,
    bulletCount: 1,
    bulletTimer: 0,
  })
  
  const bulletsRef = useRef<Bullet[]>([])
  const enemiesRef = useRef<Enemy[]>([])
  const frameCountRef = useRef(0)

  // --- 3. 游戏逻辑方法 ---

  // 初始化游戏
  const initGame = () => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#3b82f6',
      hp: 100,
      maxHp: 100,
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      bulletSpeed: 8,
      bulletCount: 1,
      bulletTimer: 0,
    }
    bulletsRef.current = []
    enemiesRef.current = []
    frameCountRef.current = 0
    setScore(0)
    setDisplayLevel(1)
    setDisplayHp(100)
    setGameState('PLAYING')
  }

  // 继续游戏
  const continueGame = () => {
    setGameState('PLAYING')
  }

  // 1. 生成敌人
  const spawnEnemy = useCallback(() => {
    const spawnRate = Math.max(20, 60 - Math.floor(score / 500))
    if (frameCountRef.current % spawnRate === 0) {
      const level = Math.floor(Math.random() * playerRef.current.level) + 1
      const sizeMultiplier = 1 + (level * 0.1)
      
      enemiesRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH),
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH * sizeMultiplier,
        height: ENEMY_HEIGHT * sizeMultiplier,
        color: '#ef4444',
        hp: level * 20,
        maxHp: level * 20,
        level: level,
        speed: 2 + level * 0.2,
        damage: 10 + level * 5,
      })
    }
  }, [score])

  // 2. 玩家升级
  const levelUpPlayer = useCallback(() => {
    const p = playerRef.current
    if (p.exp >= p.expToNextLevel) {
      p.level += 1
      p.exp -= p.expToNextLevel
      p.expToNextLevel = Math.floor(p.expToNextLevel * 1.5)
      p.maxHp += 20
      p.hp = p.maxHp
      
      const upgradeType = p.level % 3
      if (upgradeType === 0) p.bulletCount = Math.min(p.bulletCount + 1, 5)
      if (upgradeType === 1) p.bulletSpeed += 1
      if (upgradeType === 2) p.maxHp += 50

      setDisplayLevel(p.level)
    }
  }, [])

  // 游戏数据更新
  const updateGame = useCallback(() => {
    if (gameState !== 'PLAYING') return
    
    const p = playerRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    // 1. 玩家移动
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      p.x = Math.max(0, p.x - 5)
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      p.x = Math.min(CANVAS_WIDTH - p.width, p.x + 5)
    }

    // 2. 发射子弹 (自动射击)
    p.bulletTimer++
    if (p.bulletTimer > 15) { // 射速控制
      p.bulletTimer = 0
      // 根据 bulletCount 计算散布
      const startX = p.x + p.width / 2
      for (let i = 0; i < p.bulletCount; i++) {
        const offset = (i - (p.bulletCount - 1) / 2) * 10
        bulletsRef.current.push({
          x: startX + offset - BULLET_WIDTH / 2,
          y: p.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          color: '#fbbf24', // 黄色
          speed: p.bulletSpeed,
          damage: 10 + p.level * 2, // 伤害随等级增加
        })
      }
    }

    // 3. 更新子弹位置
    bulletsRef.current.forEach(b => b.y -= b.speed)
    bulletsRef.current = bulletsRef.current.filter(b => b.y + b.height > 0)

    // 4. 生成敌人
    spawnEnemy()

    // 5. 更新敌人位置
    enemiesRef.current.forEach(e => e.y += e.speed)
    
    // 6. 碰撞检测 logic
    // 子弹击中敌人
    bulletsRef.current.forEach((b, bIndex) => {
      enemiesRef.current.forEach((e, eIndex) => {
        if (checkCollision(b, e)) {
          e.hp -= b.damage
          // 移除子弹
          bulletsRef.current.splice(bIndex, 1) 
          
          if (e.hp <= 0) {
            // 敌人阵亡
            enemiesRef.current.splice(eIndex, 1)
            setScore(prev => prev + e.level * 10)
            p.exp += e.level * 10
            levelUpPlayer()
          }
        }
      })
    })

    // 敌人撞击玩家 or 敌人超出屏幕
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const e = enemiesRef.current[i]
      
      // 撞击玩家
      if (checkCollision(e, p)) {
        p.hp -= e.damage
        enemiesRef.current.splice(i, 1) // 敌人撞击后消失
        setDisplayHp(p.hp)
        if (p.hp <= 0) {
          setGameState('GAME_OVER')
        }
      }
      // 超出屏幕底部
      else if (e.y > CANVAS_HEIGHT) {
        enemiesRef.current.splice(i, 1)
      }
    }

    frameCountRef.current++
  }, [gameState, spawnEnemy, levelUpPlayer])

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = '#1e1e2e' // 深色背景
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 绘制玩家
    const p = playerRef.current
    renderPlayer(ctx, p)

    // 绘制子弹
    ctx.fillStyle = '#fbbf24'
    bulletsRef.current.forEach(b => renderBullet(ctx, b))

    // 绘制敌人
    enemiesRef.current.forEach(e => renderEnemy(ctx, e))
  }, [])

  const gameLoop = useCallback(() => {
    if (keysPressed.current['Escape'] || keysPressed.current['Esc']) {
      setGameState('PAUSE')
    }

    updateGame()
    renderGame()
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState, updateGame, renderGame])

  // --- 4. 生命周期与事件监听 ---
  useEffect(() => {
    // 键盘事件绑定
    const handleKeyDown = (e: KeyboardEvent) => (keysPressed.current[e.key] = true)
    const handleKeyUp = (e: KeyboardEvent) => (keysPressed.current[e.key] = false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 启动循环
    if (gameState === 'PLAYING') {
        requestRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [gameState, gameLoop])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 font-sans">
      <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700">
        
        {/* Canvas 画布 */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-gray-800 block"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        />

        {/* UI HUD 层 (显示在Canvas之上) */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between text-white font-bold text-lg pointer-events-none">
          <div className="flex flex-col gap-1">
            <span className="text-yellow-400">分数: {score}</span>
            <span className="text-blue-400">等级: {displayLevel}</span>
            <div className="w-32 h-4 bg-gray-700 rounded mt-1">
               <div 
                 className="h-full bg-green-500 rounded transition-all duration-200" 
                 style={{ width: `${Math.max(0, (displayHp / playerRef.current.maxHp) * 100)}%` }}
               />
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-400">EXP</div>
             <div className="w-24 h-2 bg-gray-700 rounded">
                <div 
                  className="h-full bg-purple-500 rounded" 
                  style={{ width: `${Math.min(100, (playerRef.current.exp / playerRef.current.expToNextLevel) * 100)}%` }}
                />
             </div>
          </div>
        </div>

        {/* 游戏开始界面 */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-blue-500">NEXT.JS 战机</h1>
            <p className="mb-8 text-gray-300">使用 ← → 移动，自动射击</p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition"
            >
              开始游戏
            </button>
          </div>
        )}

        {/* 游戏暂停界面 */}
        {gameState === 'PAUSE' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-blue-500">暂停中</h1>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition"
            >
              重新开始
            </button>
            <button
              onClick={continueGame}
              className="px-8 py-3 my-3 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition"
            >
              继续游戏
            </button>
          </div>
        )}

        {/* 游戏结束界面 */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white">
            <h1 className="text-5xl font-bold mb-2">GAME OVER</h1>
            <p className="text-2xl mb-6">最终得分: {score}</p>
            <p className="text-lg mb-8 text-gray-300">达到等级: {displayLevel}</p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-white text-red-900 hover:bg-gray-200 rounded-full text-xl font-bold transition"
            >
              重新开始
            </button>
          </div>
        )}
      </div>
    </div>
  )
}