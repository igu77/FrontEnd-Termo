import React from 'react'
import Game from './Game'
import useAuth from '../store/auth'

export default function Home(){
  const [mode, setMode] = React.useState(null)
  const auth = useAuth()

  if (!auth.token) {
    return (
      <div className="home">
        <h1>Termo Competitivo</h1>
        <p>Faça login para jogar e registrar suas estatísticas.</p>
      </div>
    )
  }

  if (mode) return <Game mode={mode} onBack={() => setMode(null)} />

  return (
    <div className="home">
      <h1>Termo Competitivo</h1>
      <p>Escolha um modo para começar a jogar.</p>
      <div className="modes">
        <button onClick={() => setMode('classic')}>Clássico (1 palavra)</button>
        <button onClick={() => setMode('dueto')}>Dueto (2 palavras)</button>
        <button onClick={() => setMode('quarteto')}>Quarteto (4 palavras)</button>
      </div>
    </div>
  )
}
