import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { authRouts, publicRouts } from '../routes.js'
import { Context } from '../../main'
import { Navigate } from 'react-router-dom'
import { LOGIN_ROUTE, MAIN_ROUTE } from '../../utils/consts'
import { observer } from 'mobx-react'

const AppRouter = observer(() => {
  const isAuth = false
  const { user } = useContext(Context)

  return (
    <Routes>
      {user.isAuth
        ? authRouts.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))
        : publicRouts.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
      <Route
        path="*"
        element={
          user.isAuth ? (
            <Navigate to="/chats" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
})

export default AppRouter
