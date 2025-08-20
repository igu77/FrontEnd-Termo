import React from 'react'
import Tile from './Tile'

export default function Board({ rows, currentRow, locked, focusedCol, onTileClick, selected }) {
  return (
    <div className={`board ${selected ? 'selected-board' : ''}`} aria-disabled={locked}>
      {rows.map((r, i) => (
        <div key={i} className="row">
          {r.letters.map((ch, j) => (
            <Tile
              key={j}
              value={ch}
              state={r.states[j]}
              active={i===currentRow && !locked}
              focused={i===currentRow && j===focusedCol && !locked}
              onClick={() => { if(i===currentRow && !locked) onTileClick?.(j) }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
