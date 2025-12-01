import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL)
// const socket = io('https://sour-coins-live.loca.lt')
// const socket = io('https://shayra-backend.onrender.com')

export default socket
