import React from 'react'
import api from '../services/api'
import Board from '../ui/Board'
import Keyboard from '../ui/Keyboard'

const COLS = 5

function emptyRow() { return { letters: Array(COLS).fill(''), states: Array(COLS).fill(null) } }
function makeBoard(rows) { return Array.from({ length: rows }, emptyRow) }

const rank = { absent: 0, present: 1, correct: 2 }

export default function Game({ mode, onBack }) {
  const boardsCount = mode === 'classic' ? 1 : mode === 'dueto' ? 2 : 4

  const [rows, setRows] = React.useState(null) // número de linhas vindo do backend (6/7/9)
  const [boards, setBoards] = React.useState([]) // array de boards
  const [rowIndex, setRowIndex] = React.useState(0)
  const [cursors, setCursors] = React.useState([]) // cursor por board (manter sincronizado)
  const [solved, setSolved] = React.useState(Array(boardsCount).fill(false))
  const [message, setMessage] = React.useState('')
  const [finished, setFinished] = React.useState(false)
  const [gameId, setGameId] = React.useState(null)
  const [guessedSet, setGuessedSet] = React.useState(new Set())
  const [letterMap, setLetterMap] = React.useState({}) // teclado: a: 'present'|'correct'|'absent'
  const [startedAt, setStartedAt] = React.useState(null)
  const [finishedAt, setFinishedAt] = React.useState(null)
  const [now, setNow] = React.useState(Date.now())

  // foco visual: board selecionado + coluna
  const [focused, setFocused] = React.useState({ board: 0, col: 0 })

  // Timer tick
  React.useEffect(() => {
    if (!startedAt || finishedAt) return
    const t = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(t)
  }, [startedAt, finishedAt])

  // Start game
  React.useEffect(() => {
    api.post('/game/start', { mode }).then(r => {
      setGameId(r.data.gameId)
      setRows(r.data.rows)
      setBoards(Array.from({ length: boardsCount }, () => makeBoard(r.data.rows)))
      setCursors(Array(boardsCount).fill(0))
      setSolved(Array(boardsCount).fill(false))
      setFocused({ board: 0, col: 0 })
    }).catch(() => setMessage('Falha ao iniciar o jogo.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  function updateLetterMap(states, lettersPerBoard) {
    const lm = { ...letterMap }
    for (let b = 0; b < boardsCount; b++) {
      const rowStates = states[b]
      const rowLetters = lettersPerBoard[b] || []
      if (!rowStates) continue
      for (let i = 0; i < COLS; i++) {
        const L = (rowLetters[i] || '').toLowerCase()
        const st = rowStates[i]
        if (!L || !st) continue
        if (!lm[L] || rank[st] > rank[lm[L]]) lm[L] = st
      }
    }
    setLetterMap(lm)
  }

  // Ao clicar no tile, posiciona o foco (coluna e seleciona o board clicado)
  function onTileClick(boardIndex, colIndex) {
    if (finished || solved[boardIndex] || rowIndex >= (rows || 0)) return
    // sincroniza todos os cursores para a mesma coluna (comportamento que você pediu)
    setFocused({ board: boardIndex, col: colIndex })
    setCursors(Array(boardsCount).fill(colIndex))
  }

  // Apaga (backspace = apaga anterior em todas as boards não-resolvidas)
  function handleBackspace() {
    setBoards(prev => {
      const p = prev.map(b => b.map(r => ({ ...r })));
      const cs = [...cursors];
      let col = Number(focused.col || 0);

      if (col === 0 && p[0][rowIndex].letters[col] === '') {
        // Nada a apagar se estamos na primeira coluna e vazia
        return prev;
      }
ss
      // Apaga letra na coluna atual para todos os boards não resolvidos
      for (let b = 0; b < boardsCount; b++) {
        if (solved[b]) continue;
        p[b][rowIndex].letters[col] = '';
      }

      // Move cursor uma coluna para a esquerda, se não estiver na primeira
      if (col > 0) col -= 1;

      for (let b = 0; b < boardsCount; b++) {
        cs[b] = col;
      }

      setCursors(cs);
      setFocused({ board: Math.min(focused.board, boardsCount - 1), col });

      return p;
    });
  }

  // Delete = apaga na posição atual (coluna atual) em todas as boards não-resolvidas
  function handleDelete() {
    setBoards(prev => {
      const p = prev.map(b => b.map(r => ({ ...r })))
      const cs = [...cursors]
      const col = focused.col
      for (let b = 0; b < boardsCount; b++) {
        if (solved[b]) continue
        p[b][rowIndex].letters[col] = ''
        cs[b] = col
      }
      setCursors(cs)
      return p
    })
  }

  // Ao digitar, aplica em TODOS os conjuntos (exceto os já resolvidos)
  function handleChar(ch) {
    if (!ch) return
    setBoards(prev => {
      const p = prev.map(b => b.map(r => ({ ...r })))
      const cs = [...cursors]
      for (let b = 0; b < boardsCount; b++) {
        if (solved[b]) continue
        const pos = Math.max(0, Number(cs[b] || 0))
        if (pos < COLS) {
          p[b][rowIndex].letters[pos] = ch.toLowerCase()
          cs[b] = Math.min(COLS, pos + 1)
        }
      }
      setCursors(cs)
      // atualiza foco de coluna com base no cursor do board selecionado
      const newCol = Math.min(COLS - 1, Number(cs[focused.board] || 0))
      setFocused({ board: focused.board, col: newCol })
      return p
    })
  }

  // Avança célula (espaço)
  function moveNextCell() {
    const next = Math.min(COLS - 1, focused.col + 1)
    setFocused({ board: focused.board, col: next })
    setCursors(Array(boardsCount).fill(next))
  }

  // Setas de navegação
  function handleArrowLeft() {
    let { board, col } = focused
    if (col > 0) col = col - 1
    else if (board > 0) { board = board - 1; col = COLS - 1 }
    setFocused({ board, col })
    setCursors(Array(boardsCount).fill(col))
  }
  function handleArrowRight() {
    let { board, col } = focused
    if (col < COLS - 1) col = col + 1
    else if (board < boardsCount - 1) { board = board + 1; col = 0 }
    setFocused({ board, col })
    setCursors(Array(boardsCount).fill(col))
  }
  function handleArrowUp() {
    const newBoard = Math.max(0, focused.board - 1)
    setFocused({ board: newBoard, col: focused.col })
  }
  function handleArrowDown() {
    const newBoard = Math.min(boardsCount - 1, focused.board + 1)
    setFocused({ board: newBoard, col: focused.col })
  }

  React.useEffect(() => {
    function onKey(e) {
      if (finished || rows == null) return
      if (e.key === 'Backspace') { e.preventDefault(); handleBackspace() }
      else if (e.key === 'Delete') { e.preventDefault(); handleDelete() }
      else if (e.key === 'Enter') { e.preventDefault(); submitGuess() }
      else if (e.key === ' ') { e.preventDefault(); moveNextCell() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handleArrowLeft() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleArrowRight() }
      else if (e.key === 'ArrowUp') { e.preventDefault(); handleArrowUp() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); handleArrowDown() }
      else if (/^[a-zA-Zá-úÁ-Ú]$/.test(e.key)) { handleChar(e.key) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, rows, focused, cursors, rowIndex, solved, boardsCount])

  async function submitGuess() {
    if (rows == null) return
    // Monta palpites: boards resolvidos enviam string vazia (será ignorado no backend)
    const guesses = Array.from({ length: boardsCount }, (_, b) => {
      return solved[b] ? '' : boards[b][rowIndex].letters.join('')
    })

    // Valida localmente (comprimento)
    for (let b = 0; b < boardsCount; b++) {
      if (solved[b]) continue
      if (guesses[b].length !== COLS) { setMessage('Complete todas as palavras.'); return }
    }

    // (3) Bloqueia repetidas localmente
    for (let b = 0; b < boardsCount; b++) {
      if (solved[b]) continue
      const w = guesses[b].toLowerCase()
      if (guessedSet.has(w)) { setMessage(`A palavra "${w}" já foi usada neste jogo.`); return }
    }

    try {
      const r = await api.post('/game/guess', { gameId, guesses })
      const { states, wins, solved: solvedServer, overallWon, ended, startedAt: sAt, finishedAt: fAt, reveal, maxAttempts, attempts } = r.data

      // aplica estados no board atual
      setBoards(prev => {
        const p = prev.map(b => b.map(r => ({ ...r })))
        for (let b = 0; b < boardsCount; b++) {
          p[b][rowIndex] = { letters: p[b][rowIndex].letters, states: states[b] }
        }
        return p
      })

      // atualiza mapa de letras (teclado)
      const lettersPerBoard = boards.map(b => b[rowIndex].letters)
      updateLetterMap(states, lettersPerBoard)

      // marca resolvidos e palavras usadas
      setSolved(solvedServer)
      setGuessedSet(prev => {
        const s = new Set(prev)
        for (let b = 0; b < boardsCount; b++) {
          if (!solved[b]) s.add(guesses[b].toLowerCase())
        }
        return s
      })

      if (sAt && !startedAt) setStartedAt(Date.parse(sAt))
      if (fAt) setFinishedAt(Date.parse(fAt))

      if (overallWon) {
        setFinished(true)
        setMessage('Você acertou todas! 🎉')
      } else if (ended) {
        setFinished(true)
        if (reveal && Array.isArray(reveal)) {
          setMessage(`Fim de jogo. Palavras: ${reveal.join(', ').toUpperCase()}`)
        } else {
          setMessage('Fim de jogo.')
        }
      } else {
        setRowIndex(prev => prev + 1)
        // reposiciona cursor no início do próximo row na coluna 0 (ou na mesma coluna se preferir)
        setCursors(Array(boardsCount).fill(0))
        setFocused({ board: 0, col: 0 })
      }
    } catch (e) {
      setMessage(e.response?.data?.error || 'Erro ao enviar palpite.')
    }
  }

  const wrapClass = boardsCount === 1 ? 'single' : (boardsCount === 2 ? 'dueto' : 'quarteto')

  const elapsedMs = startedAt ? ((finishedAt || now) - startedAt) : 0
  const mm = String(Math.floor(elapsedMs / 60000)).padStart(2, '0')
  const ss = String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')

  if (rows == null) return <div className="game"><p>Carregando...</p></div>

  return (
    <div className="game">
      <div className="topbar">
        <button onClick={onBack}>← Voltar</button>
        <h2>{mode === 'classic' ? 'Clássico' : mode === 'dueto' ? 'Dueto' : 'Quarteto'}</h2>
        <div style={{ marginLeft: 'auto', opacity: .8 }}>⏱ {mm}:{ss}</div>
      </div>

      <div className={`board-wrap ${wrapClass}`}>
        {boards.map((board, i) => (
          <Board
            key={i}
            rows={board}
            currentRow={rowIndex}
            locked={solved[i]}
            focusedCol={focused.col}          // nota: foco de coluna é global (aplica em todos)
            selected={i === focused.board}    // board selecionado (seta com as setas)
            onTileClick={(col) => onTileClick(i, col)}
          />
        ))}
      </div>

      <div className="actions">
        {finished && <button className="secondary" onClick={() => window.location.reload()}>Jogar novamente</button>}
      </div>

      <Keyboard
        onChar={handleChar}
        onEnter={submitGuess}
        onBackspace={handleBackspace}
        letterMap={letterMap}
        disabled={finished}
      />

      {message && <p className="message">{message}</p>}
    </div>
  )
}
