import { useContext, useEffect, useRef } from 'react'
import { Context } from '../../main'

export function useChatMessages() {
  const { message, chat, user } = useContext(Context)
  const prevChatIdRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const currentChatId = chat.currentChat?.id

    if (prevChatIdRef.current !== currentChatId) {
      message.clearMessages()
      prevChatIdRef.current = currentChatId
    }
  }, [chat.currentChat?.id, message])

  useEffect(() => {
    if (!chat.currentChat?.id) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    message.loadMessages(chat.currentChat.id, user.user.id)

    intervalRef.current = setInterval(() => {
      message.loadMessages(chat.currentChat?.id, user.user.id)
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [chat.currentChat?.id, message, user.user.id])

  return {
    messages: message.messages,
    currentChatId: chat.currentChat?.id,
  }
}
