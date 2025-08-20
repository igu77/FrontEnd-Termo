import { create } from 'zustand'

function load(){
  try { return JSON.parse(localStorage.getItem('auth') || '{}') } catch { return {} }
}

const initial = load()

const useAuth = create((set) => ({
  token: initial.token || null,
  user: initial.user || null,
  login(token, user){
    const data = { token, user }
    localStorage.setItem('auth', JSON.stringify(data))
    set(data)
  },
  logout(){
    localStorage.removeItem('auth')
    set({ token: null, user: null })
  }
}))

export default useAuth
