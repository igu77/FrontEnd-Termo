import React from 'react'
import api from '../services/api'
import useAuth from '../store/auth'

export default function Register({ onDone }){
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const auth = useAuth()

  async function submit(e){
    e.preventDefault()
    try {
      const r = await api.post('/auth/register', { username, email, password })
      auth.login(r.data.token, r.data.user)
      onDone?.()
    } catch (e) {
      setMsg(e.response?.data?.error || 'Falha no cadastro')
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>Criar conta</h2>
      <input placeholder="Nome de usuário" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Cadastrar</button>
      {msg && <small>{msg}</small>}
    </form>
  )
}
