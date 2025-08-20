import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Stats from './pages/Stats'
import Leaderboard from './pages/Leaderboard'
import Feedback from './pages/Feedback'
import useAuth from './store/auth'

export default function App() {
  const [page, setPage] = React.useState('home')
  const auth = useAuth()

  function Nav() {
    return (
      <nav>
        <button onClick={() => setPage('home')}>Jogar</button>
        <button onClick={() => setPage('stats')}>Estatísticas</button>
        <button onClick={() => setPage('leader')}>Ranking</button>
        <button onClick={() => setPage('feedback')}>Feedback</button>
        {!auth.token ? (
          <>
            <button onClick={() => setPage('login')}>Entrar</button>
            <button onClick={() => setPage('register')}>Cadastrar</button>
          </>
        ) : (
          <button onClick={() => { auth.logout(); setPage('home') }}>
            Sair ({auth.user?.username || auth.user?.email})
          </button>
        )}
      </nav>
    )
  }

  return (
    <div className="container">
      <Nav />
      {page === 'home' && <Home />}
      {page === 'login' && <Login onDone={() => setPage('home')} />}
      {page === 'register' && <Register onDone={() => setPage('home')} />}
      {page === 'stats' && <Stats />}
      {page === 'leader' && <Leaderboard />}
      {page === 'feedback' && <Feedback />}
    </div>
  )
}
