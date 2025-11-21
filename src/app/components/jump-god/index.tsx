'use client'

import React, { useEffect, useRef, useState } from 'react'

// --- 游戏配置常量 ---
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300
const GRAVITY = 0.6
const JUMP_STRENGTH = -12
const GROUND_Y = CANVAS_HEIGHT - 30 // 地面高度
const DINO_WIDTH = 40
const DINO_HEIGHT = 50
const OBSTACLE_WIDTH = 30
const OBSTACLE_HEIGHT = 50
const GAME_SPEED_START = 5

export default function JumpGod() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  
  // 使用 ref 来存储游戏状态，避免闭包陷阱，保证 requestAnimationFrame 读到最新值
  const gameState = useRef({
    dino: {
      x: 50,
      y: GROUND_Y - DINO_HEIGHT,
      dy: 0, // 垂直速度
      isJumping: false,
    },
    obstacles: [] as { x: number; y: number; width: number; height: number }[],
    gameSpeed: GAME_SPEED_START,
    score: 0,
    frameCount: 0,
    isRunning: true,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    // --- 游戏主循环 ---
    const gameLoop = () => {
      if (!gameState.current.isRunning) return

      updateGame()
      drawGame(ctx)
      
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    // --- 更新逻辑 ---
    const updateGame = () => {
      const state = gameState.current
      
      // 1. 恐龙物理逻辑
      state.dino.y += state.dino.dy
      
      // 如果在空中，应用重力
      if (state.dino.y < GROUND_Y - DINO_HEIGHT) {
        state.dino.dy += GRAVITY
      } else {
        // 落地
        state.dino.y = GROUND_Y - DINO_HEIGHT
        state.dino.dy = 0
        state.dino.isJumping = false
      }

      // 2. 障碍物逻辑
      // 每 100 帧生成一个障碍物 (随机一点)
      state.frameCount++
      if (state.frameCount % 100 === 0) {
        // 简单的随机间隔
        if (Math.random() > 0.3) {
            state.obstacles.push({
                x: CANVAS_WIDTH,
                y: GROUND_Y - OBSTACLE_HEIGHT, // 简单的地面障碍物
                width: OBSTACLE_WIDTH,
                height: OBSTACLE_HEIGHT,
            })
        }
      }

      // 移动障碍物
      state.obstacles.forEach((obs) => {
        obs.x -= state.gameSpeed
      })

      // 移除超出屏幕的障碍物
      state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > 0)

      // 3. 碰撞检测 (AABB 矩形碰撞)
      const dinoRect = {
        x: state.dino.x,
        y: state.dino.y + 10, // 稍微缩小碰撞箱，手感更好
        w: DINO_WIDTH - 10,
        h: DINO_HEIGHT - 10,
      }

      for (const obs of state.obstacles) {
        const obsRect = { x: obs.x, y: obs.y, w: obs.width, h: obs.height }
        
        if (
          dinoRect.x < obsRect.x + obsRect.w &&
          dinoRect.x + dinoRect.w > obsRect.x &&
          dinoRect.y < obsRect.y + obsRect.h &&
          dinoRect.y + dinoRect.h > obsRect.y
        ) {
          gameOver()
        }
      }

      // 4. 分数增加
      state.score++
      // 每 500 分加快一点速度
      if (state.score % 500 === 0) {
        state.gameSpeed += 0.5
      }
      
      // 同步 React State 用于 UI 显示 (为了性能，不需要每一帧都 setScore，可以每 10 帧同步一次)
      if (state.frameCount % 10 === 0) {
        setScore(Math.floor(state.score / 10))
      }
    }

    // --- 绘图逻辑 ---
    const drawGame = (ctx: CanvasRenderingContext2D) => {
      const state = gameState.current

      // 清空画布
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 画地面
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 2
      ctx.stroke()

      // 画恐龙 (简单的矩形代替，你可以换成 drawImage)
      ctx.fillStyle = '#333'
      ctx.fillRect(state.dino.x, state.dino.y, DINO_WIDTH, DINO_HEIGHT)
      
      // 增加眼睛让它看起来像个生物
      ctx.fillStyle = '#fff'
      ctx.fillRect(state.dino.x + 25, state.dino.y + 10, 5, 5)

      // 画障碍物 (仙人掌)
      ctx.fillStyle = 'red'
      state.obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      })
    }

    const gameOver = () => {
      gameState.current.isRunning = false
      setIsGameOver(true)
      cancelAnimationFrame(animationFrameId)
    }

    // --- 输入控制 ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        // 防止空格滚动页面
        e.preventDefault() 
        if (!gameState.current.isRunning && isGameOver) {
            // 这里的重启逻辑需要通过 React 状态触发重新挂载或者手动重置
            return 
        }
        
        if (!gameState.current.dino.isJumping && gameState.current.isRunning) {
          gameState.current.dino.dy = JUMP_STRENGTH
          gameState.current.dino.isJumping = true
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isGameOver])

  // 重启游戏
  const resetGame = () => {
    gameState.current = {
      dino: { x: 50, y: GROUND_Y - DINO_HEIGHT, dy: 0, isJumping: false },
      obstacles: [],
      gameSpeed: GAME_SPEED_START,
      score: 0,
      frameCount: 0,
      isRunning: true,
    }
    setIsGameOver(false)
    setScore(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Next.js Dino Run</h1>
      
      <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        
        {/* 分数显示 */}
        <div className="absolute top-2 right-4 text-xl font-bold text-gray-600">
          Score: {score}
        </div>

        {/* 游戏结束覆盖层 */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-white mb-4 text-xl">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-gray-500">按 <span className="font-bold">空格键</span> 或 <span className="font-bold">↑</span> 跳跃</p>
    </div>
  )
}