import React from 'react'
import api from '../services/api'

export default function Stats(){
  const [data, setData] = React.useState(null)
  const [msg, setMsg] = React.useState('')

  React.useEffect(() => {
    api.get('/stats/me').then(r => setData(r.data)).catch(() => setMsg('Falha ao carregar estatísticas'))
  }, [])

  if (msg) return <p>{msg}</p>
  if (!data) return <p>Carregando...</p>

  return (
    <div className="stats">
      <h2>Suas estatísticas</h2>
      <ul>
        <li>Partidas jogadas: {data.games_played ?? 0}</li>
        <li>Vitórias: {data.wins ?? 0}</li>
        <li>Tentativas médias por vitória: {data.avg_attempts ?? 0}</li>
        <li>Streak atual: {data.current_streak ?? 0}</li>
        <li>Melhor streak: {data.best_streak ?? 0}</li>
      </ul>
    </div>
  )
}
