import React, { createContext } from 'react' // console.log(import.meta.env.VITE_API_URL)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import UserStore from './store/UserStore'
import ChatsStore from './store/ChatsStore'
import MessageStore from './store/MessageStore'
import ReactionMessageStore from './store/ReactionStore'
import CurrentChat from './store/CurrentChat'

export const Context = createContext(null)
createRoot(document.getElementById('root')).render(
  <Context.Provider
    value={{
      user: new UserStore(),
      chat: new ChatsStore(),
      message: new MessageStore(),
      reaction: new ReactionMessageStore(),
      currentChat: new CurrentChat(),
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Context.Provider>
)
