import React from 'react'
import api from '../services/api'

export default function Leaderboard(){
  const [rows, setRows] = React.useState([])
  const [msg, setMsg] = React.useState('')

  React.useEffect(() => {
    api.get('/stats/leaderboard').then(r => setRows(r.data.leaderboard)).catch(() => setMsg('Falha ao carregar ranking'))
  }, [])

  if (msg) return <p>{msg}</p>

  return (
    <div className="leader">
      <h2>Ranking</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Jogador</th><th>Vitórias</th><th>Partidas</th><th>% Acertos</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{r.username}</td>
              <td>{r.wins}</td>
              <td>{r.games_played}</td>
              <td>{r.win_rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
