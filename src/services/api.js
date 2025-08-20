import axios from 'axios'
import useAuth from '../store/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-termo.onrender.com/api'
})

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
