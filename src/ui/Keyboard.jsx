import React from 'react'

const ROW1 = 'QWERTYUIOP'.split('')
const ROW2 = 'ASDFGHJKL'.split('')
const ROW3 = 'ZXCVBNM'.split('')

export default function Keyboard({ onChar, onEnter, onBackspace, letterMap, disabled }) {
    function keyClass(k) {
        const st = letterMap[k.toLowerCase()]
        return st ? `key ${st}` : 'key'
    }

    return (
        <div className="keyboard">
            <div className="kb-row">
                {ROW1.map(k => (
                    <button disabled={disabled} key={k} className={keyClass(k)} onClick={() => onChar(k)}>{k}</button>
                ))}
            </div>
            <div className="kb-row">
                {ROW2.map(k => (
                    <button disabled={disabled} key={k} className={keyClass(k)} onClick={() => onChar(k)}>{k}</button>
                ))}
            </div>
            <div className="kb-row">
                <button disabled={disabled} className="key wide" onClick={onBackspace}>⌫</button>
                {ROW3.map(k => (
                    <button disabled={disabled} key={k} className={keyClass(k)} onClick={() => onChar(k)}>{k}</button>
                ))}
                <button disabled={disabled} className="key wide" onClick={onEnter}>Enter</button>
            </div>
        </div>
    )
}
