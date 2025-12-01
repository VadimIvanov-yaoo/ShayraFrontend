import React, { useContext, useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './components/appRouter/appRouter.jsx'
import { observer } from 'mobx-react'
import { Context } from './main'
import { check } from './http/userApi'
import socket from './Websoket/socket'
import { PuffLoader } from 'react-spinners'

const App = observer(() => {
  const { user } = useContext(Context)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id)
      })

      socket.on('disconnect', () => {
        console.log('Disconnected')
      })

      check()
        .then((userData) => {
          user.setUser(userData)
          user.setIsAuth(true)
        })
        .catch(() => {
          user.setIsAuth(false)
          user.setUser({})
        })
        .finally(() => setLoading(false))
    }, 1000)

    return () => {
      clearTimeout(timer)
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  if (loading) {
    return (
      <PuffLoader
        size={260}
        color="#47adbb"
        cssOverride={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    )
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
})

export default App
