import {
  createChat,
  getInfoUsers,
  getLastedMessage,
  searchUser,
} from '../../http/userApi'
import { Context } from '../../main'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import socket from '../../Websoket/socket'
import { runInAction } from 'mobx'
import { DEFAULT_AVATAR } from '../../utils/image'

export function useCreateChat() {
  const { chat, user } = useContext(Context)

  const createNewChat = async (userId2) => {
    try {
      const dialog = await createChat(user.user.id, userId2)

      runInAction(() => {
        chat.refreshChats().then(() => {
          chat.setCurrentChat(dialog.id)
        })

        if (socket) {
          socket.emit('notifyNewChat', {
            dialogId: dialog.id,
            participantId: user.user.id,
            participantName: user.user.userName,
            participantAvatar: user.user.avatarUrl || DEFAULT_AVATAR,
            forUserId: userId2,
          })
        }

        console.log('Чат успешно создан')
      })
    } catch (error) {
      console.error('Ошибка создания чата', error)
    }
  }

  return createNewChat
}

export function useSidebarLogic() {
  const { chat, user, message } = useContext(Context)

  const sidebarRef = useRef(null)
  const userId2Ref = useRef(null)

  const [runTour, setRunTour] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [mate, setMate] = useState('')
  const [mateAvatar, setMateAvatar] = useState('')
  const [focus, setFocus] = useState(false)
  const [widthBlock, setWidthBlock] = useState(365)
  const [lastMessage, setLastMessage] = useState([])

  const MAX_WIDTH = 635
  const MIN_WIDTH = 340
  const createNewChat = useCreateChat()

  useEffect(() => {
    chat.loadChats()

    if (socket) {
      chat.setSocket(socket)
      message.setSocket(socket)
      user.setSocket(socket)

      if (user.user?.id) {
        socket.emit('onlineUser', user.user.id)
      }
    }

    return () => {
      if (socket) {
        socket.off('newChatNotification')
        socket.off('chatCreated')
      }
    }
  }, [chat, message, user, socket])

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg) => {
        if (!msg || !msg.dialogId) return
        runInAction(() => {
          setLastMessage((prev) => {
            const filtered = prev.filter(
              (m) => m && m.dialogId !== msg.dialogId
            )
            return [...filtered, msg]
          })
        })
      }

      socket.on('messageCreated', handleNewMessage)

      return () => {
        socket.off('messageCreated', handleNewMessage)
      }
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const visited = Cookies.get('visited')
      setRunTour(!(visited || user.user?.userName))
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [user.user?.userName])

  useEffect(() => {
    if (!chat.currentChat?.id) return

    message.loadMessages(chat.currentChat.id, user.user.id)

    const intervalId = setInterval(() => {
      message.loadMessages(chat.currentChat?.id, user.user.id)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [chat.currentChat?.id, message, user.user.id])

  async function showLastMessage() {
    try {
      const chatIds = chat.chats.map((c) => c.id)
      if (chatIds.length === 0) return

      const lastMessages = await getLastedMessage({ chatIds })
      runInAction(() => {
        setLastMessage(lastMessages)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function getUserInfo() {
    try {
      const participantIds = chat.chats.map((c) =>
        c.creatorId === user.user.id ? c.participantId : c.creatorId
      )
      if (participantIds.length === 0) return

      const data = await getInfoUsers({ chatIds: participantIds })
      runInAction(() => {
        participantIds.forEach((id) => {
          const userData = data.find((u) => u.id === id)
          if (userData) {
            const chatForId = chat.chats.find(
              (c) =>
                c.otherId === id ||
                (c.creatorId === user.user.id
                  ? c.participantId === id
                  : c.creatorId === id)
            )
            if (chatForId) {
              chat.updateChatAvatar(
                chatForId.id,
                userData.avatarUrl || DEFAULT_AVATAR
              )
              chat.updateChatStatus(chatForId.id, userData.status || 'offline')
            }
          }
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (chat.chats.length > 0) {
      showLastMessage()
      getUserInfo()
    }
  }, [chat.chats.length])

  async function handleUserSearch(e) {
    const value = e.target.value
    setUserSearch(value)
    try {
      if (value.trim() && value !== user.user.userName) {
        const data = await searchUser(value)
        runInAction(() => {
          setFoundUser(data)
          userId2Ref.current = data.id
          setMate(data.userName)
          setMateAvatar(data.avatarUrl)
        })
      } else {
        runInAction(() => {
          setFoundUser(null)
        })
      }
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error)
      runInAction(() => {
        setFoundUser(null)
      })
    }
  }

  function changeWidth(e) {
    const startX = e.clientX
    const startWidth = widthBlock

    const handleMouseMove = (moveEvent) => {
      runInAction(() => {
        const newWidth = startWidth + (moveEvent.clientX - startX)
        setWidthBlock(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)))
      })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const lastMessageMap = useMemo(() => {
    const messageText = {}
    const userIdMap = {}
    const time = {}
    const isReads = {}

    lastMessage.forEach((msg) => {
      if (!msg) return
      messageText[msg.dialogId] =
        msg.type === 'image' ? 'Изображение' : msg.text
      userIdMap[msg.dialogId] = msg.senderId
      time[msg.dialogId] = msg.timestamp
      isReads[msg.dialogId] = msg.isRead
    })

    return { messageText, userIdMap, time, isReads }
  }, [lastMessage])

  return {
    sidebarRef,
    userId2Ref,
    chat,
    runTour,
    userSearch,
    foundUser,
    mate,
    mateAvatar,
    focus,
    widthBlock,
    lastMessageMap,
    setFocus,
    setUserSearch,
    handleUserSearch,
    showLastMessage,
    changeWidth,
    createNewChat,
  }
}
