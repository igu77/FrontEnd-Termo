import React from 'react'

export default function Tile({ value, state, active, focused, onClick }){
  const cls = ['tile']
  if (state) cls.push(state)
  if (active) cls.push('active')
  if (focused) cls.push('focused')
  return <div className={cls.join(' ')} onClick={onClick}>{value}</div>
}
