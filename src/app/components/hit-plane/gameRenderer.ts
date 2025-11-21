
// 绘制玩家实体
export const renderPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
  ctx.save()
  
  // 玩家阴影
  ctx.shadowColor = 'rgba(59, 130, 246, 0.6)'
  ctx.shadowBlur = 20
  
  // 主机翼（左右展开）
  const wingGradient = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0)
  wingGradient.addColorStop(0, '#3b82f6')
  wingGradient.addColorStop(0.5, '#60a5fa')
  wingGradient.addColorStop(1, '#3b82f6')
  ctx.fillStyle = wingGradient
  ctx.beginPath()
  ctx.moveTo(p.x + 5, p.y + p.height * 0.5)
  ctx.lineTo(p.x, p.y + p.height * 0.7)
  ctx.lineTo(p.x + p.width * 0.3, p.y + p.height * 0.6)
  ctx.lineTo(p.x + p.width * 0.7, p.y + p.height * 0.6)
  ctx.lineTo(p.x + p.width, p.y + p.height * 0.7)
  ctx.lineTo(p.x + p.width - 5, p.y + p.height * 0.5)
  ctx.closePath()
  ctx.fill()
  
  // 机身（流线型）
  const bodyGradient = ctx.createLinearGradient(
    p.x + p.width / 2 - 8, 0,
    p.x + p.width / 2 + 8, 0
  )
  bodyGradient.addColorStop(0, '#1e40af')
  bodyGradient.addColorStop(0.5, '#3b82f6')
  bodyGradient.addColorStop(1, '#1e40af')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.moveTo(p.x + p.width / 2, p.y) // 机头尖端
  ctx.lineTo(p.x + p.width / 2 + 10, p.y + p.height * 0.3)
  ctx.lineTo(p.x + p.width / 2 + 10, p.y + p.height * 0.85)
  ctx.lineTo(p.x + p.width / 2, p.y + p.height)
  ctx.lineTo(p.x + p.width / 2 - 10, p.y + p.height * 0.85)
  ctx.lineTo(p.x + p.width / 2 - 10, p.y + p.height * 0.3)
  ctx.closePath()
  ctx.fill()
  
  // 驾驶舱（玻璃罩效果）
  const cockpitGradient = ctx.createRadialGradient(
    p.x + p.width / 2, p.y + p.height * 0.25,
    0,
    p.x + p.width / 2, p.y + p.height * 0.25,
    8
  )
  cockpitGradient.addColorStop(0, '#dbeafe')
  cockpitGradient.addColorStop(0.7, '#93c5fd')
  cockpitGradient.addColorStop(1, '#3b82f6')
  ctx.fillStyle = cockpitGradient
  ctx.beginPath()
  ctx.ellipse(p.x + p.width / 2, p.y + p.height * 0.25, 6, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // 尾翼
  ctx.fillStyle = '#2563eb'
  ctx.beginPath()
  ctx.moveTo(p.x + p.width / 2, p.y + p.height * 0.85)
  ctx.lineTo(p.x + p.width / 2 - 8, p.y + p.height * 0.95)
  ctx.lineTo(p.x + p.width / 2 + 8, p.y + p.height * 0.95)
  ctx.closePath()
  ctx.fill()
  
  // 引擎尾焰（双引擎）
  for (const offset of [-6, 6]) {
    const flameGradient = ctx.createRadialGradient(
      p.x + p.width / 2 + offset, p.y + p.height,
      0,
      p.x + p.width / 2 + offset, p.y + p.height + 15,
      12
    )
    flameGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    flameGradient.addColorStop(0.2, 'rgba(251, 191, 36, 0.8)')
    flameGradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.5)')
    flameGradient.addColorStop(1, 'rgba(251, 146, 60, 0)')
    ctx.fillStyle = flameGradient
    ctx.beginPath()
    ctx.ellipse(p.x + p.width / 2 + offset, p.y + p.height + 8, 5, 15, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 机身装饰线
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(p.x + p.width / 2 - 5, p.y + p.height * 0.4)
  ctx.lineTo(p.x + p.width / 2 - 5, p.y + p.height * 0.7)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(p.x + p.width / 2 + 5, p.y + p.height * 0.4)
  ctx.lineTo(p.x + p.width / 2 + 5, p.y + p.height * 0.7)
  ctx.stroke()
  
  ctx.restore()
}


export const renderEnemy = (ctx: CanvasRenderingContext2D, e: Enemy) => {
  ctx.save()
    
  // 根据等级决定配色
  let colors = { main: '#ef4444', dark: '#dc2626', light: '#f87171' }
  if (e.level >= 3) {
    colors = { main: '#a855f7', dark: '#7c3aed', light: '#c084fc' }
  } else if (e.level >= 2) {
    colors = { main: '#f59e0b', dark: '#d97706', light: '#fbbf24' }
  }
  
  // 敌机阴影
  ctx.shadowColor = `${colors.main}80`
  ctx.shadowBlur = 12
  
  // 敌机主机翼
  ctx.fillStyle = colors.dark
  ctx.beginPath()
  ctx.moveTo(e.x + 5, e.y + e.height * 0.3)
  ctx.lineTo(e.x, e.y + e.height * 0.4)
  ctx.lineTo(e.x + e.width * 0.3, e.y + e.height * 0.35)
  ctx.lineTo(e.x + e.width * 0.7, e.y + e.height * 0.35)
  ctx.lineTo(e.x + e.width, e.y + e.height * 0.4)
  ctx.lineTo(e.x + e.width - 5, e.y + e.height * 0.3)
  ctx.closePath()
  ctx.fill()
  
  // 敌机机身
  const enemyBodyGrad = ctx.createLinearGradient(
    e.x + e.width / 2 - 8, 0,
    e.x + e.width / 2 + 8, 0
  )
  enemyBodyGrad.addColorStop(0, colors.dark)
  enemyBodyGrad.addColorStop(0.5, colors.main)
  enemyBodyGrad.addColorStop(1, colors.dark)
  ctx.fillStyle = enemyBodyGrad
  ctx.beginPath()
  ctx.moveTo(e.x + e.width / 2, e.y) // 机头
  ctx.lineTo(e.x + e.width / 2 - 10, e.y + e.height * 0.2)
  ctx.lineTo(e.x + e.width / 2 - 10, e.y + e.height * 0.7)
  ctx.lineTo(e.x + e.width / 2, e.y + e.height)
  ctx.lineTo(e.x + e.width / 2 + 10, e.y + e.height * 0.7)
  ctx.lineTo(e.x + e.width / 2 + 10, e.y + e.height * 0.2)
  ctx.closePath()
  ctx.fill()
  
  // 敌机驾驶舱
  ctx.fillStyle = colors.light
  ctx.beginPath()
  ctx.ellipse(e.x + e.width / 2, e.y + e.height * 0.2, 4, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // 尾翼装饰
  ctx.fillStyle = colors.dark
  ctx.beginPath()
  ctx.moveTo(e.x + e.width / 2, e.y + e.height * 0.7)
  ctx.lineTo(e.x + e.width / 2 - 7, e.y + e.height * 0.85)
  ctx.lineTo(e.x + e.width / 2 + 7, e.y + e.height * 0.85)
  ctx.closePath()
  ctx.fill()
  
  // 武器挂载点（小矩形）
  ctx.fillStyle = colors.dark
  ctx.fillRect(e.x + e.width / 2 - 12, e.y + e.height * 0.4, 4, 6)
  ctx.fillRect(e.x + e.width / 2 + 8, e.y + e.height * 0.4, 4, 6)
  
  ctx.restore()
  
  // ============ 等级标签 ============
  ctx.save()
  ctx.font = 'bold 11px Arial'
  const levelText = `Lv.${e.level}`
  const textWidth = ctx.measureText(levelText).width
  
  // 标签背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(e.x + e.width / 2 - textWidth / 2 - 4, e.y - 20, textWidth + 8, 15)
  
  // 标签边框
  ctx.strokeStyle = colors.main
  ctx.lineWidth = 1
  ctx.strokeRect(e.x + e.width / 2 - textWidth / 2 - 4, e.y - 20, textWidth + 8, 15)
  
  // 文字
  ctx.fillStyle = e.level >= 3 ? '#e9d5ff' : '#fff'
  ctx.fillText(levelText, e.x + e.width / 2 - textWidth / 2, e.y - 9)
  ctx.restore()
  
  // ============ 精致血条 ============
  const hpPercent = e.hp / e.maxHp
  const barWidth = e.width
  const barHeight = 5
  const barY = e.y - 28
  
  // 血条外框
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(e.x - 1, barY - 1, barWidth + 2, barHeight + 2)
  
  // 血条底色
  ctx.fillStyle = '#7f1d1d'
  ctx.fillRect(e.x, barY, barWidth, barHeight)
  
  // 当前血量
  const hpGradient = ctx.createLinearGradient(e.x, 0, e.x + barWidth, 0)
  if (hpPercent > 0.6) {
    hpGradient.addColorStop(0, '#22c55e')
    hpGradient.addColorStop(1, '#16a34a')
  } else if (hpPercent > 0.3) {
    hpGradient.addColorStop(0, '#eab308')
    hpGradient.addColorStop(1, '#ca8a04')
  } else {
    hpGradient.addColorStop(0, '#ef4444')
    hpGradient.addColorStop(1, '#dc2626')
  }
  ctx.fillStyle = hpGradient
  ctx.fillRect(e.x, barY, barWidth * hpPercent, barHeight)
  
  // 血条高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(e.x, barY, barWidth * hpPercent, 2)
}

export const renderBullet = (ctx: CanvasRenderingContext2D, b: Bullet) => {
  ctx.save()
    
  // 子弹发光外圈
  const bulletGlow = ctx.createRadialGradient(
    b.x + b.width / 2, b.y + b.height / 2,
    0,
    b.x + b.width / 2, b.y + b.height / 2,
    8
  )
  bulletGlow.addColorStop(0, '#fef08a')
  bulletGlow.addColorStop(0.5, '#fbbf24')
  bulletGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = bulletGlow
  ctx.beginPath()
  ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 6, 0, Math.PI * 2)
  ctx.fill()
  
  // 子弹核心（能量球）
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 3, 0, Math.PI * 2)
  ctx.fill()
  
  // 子弹尾迹
  const trailGradient = ctx.createLinearGradient(
    b.x + b.width / 2, b.y,
    b.x + b.width / 2, b.y + b.height + 12
  )
  trailGradient.addColorStop(0, 'rgba(251, 191, 36, 0)')
  trailGradient.addColorStop(1, 'rgba(251, 191, 36, 0.4)')
  ctx.fillStyle = trailGradient
  ctx.fillRect(b.x + b.width / 2 - 1.5, b.y + b.height, 3, 12)
  
  ctx.restore()
}