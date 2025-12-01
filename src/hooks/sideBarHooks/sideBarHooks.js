import { createChat, getInfoUsers } from '../../http/userApi'
import { Context } from '../../main'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getLastedMessage, searchUser } from '../../http/userApi'
import Cookies from 'js-cookie'
import socket from '../../Websoket/socket'
import { runInAction } from 'mobx'
import { DEFAULT_AVATAR } from '../../utils/image'

export function useCreateChat() {
  const { chat, user } = useContext(Context)

  async function createNewChat(userId2) {
    try {
      const dialog = await createChat(user.user.id, userId2)

      runInAction(() => {
        const exists = chat.chats.some((n) => n.id === dialog.id)
        if (!exists) {
          chat.chats.push(dialog)
          console.log('Успешно создан')
        } else {
          console.log('Чат уже существует')
        }
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
  const [userAvatars, setUserAvatars] = useState([])
  const [userStatus, setUserStatus] = useState([])

  const MAX_WIDTH = 635
  const MIN_WIDTH = 340

  const createNewChat = useCreateChat()

  const chatIds = useMemo(() => chat.chats.map((c) => c.id), [chat.chats])

  useEffect(() => {
    chat.loadChats()
  }, [chat])

  useEffect(() => {
    if (chat.chats.length > 0) {
      showLastMessage()
    }
  }, [chat.chats])

  useEffect(() => {
    if (!chatIds.length) return
    getUserInfo()
  }, [chatIds])

  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (msg) => {
      if (!msg || !msg.dialogId) return
      setLastMessage((prev) => {
        const filtered = prev.filter((m) => m && m.dialogId !== msg.dialogId)
        return [...filtered, msg]
      })
    }

    socket.on('messageCreated', handleNewMessage)

    return () => {
      socket.off('messageCreated', handleNewMessage)
    }
  }, [socket])

  useEffect(() => {
    function showJoyribe() {
      if (!sidebarRef.current) return
      const visited = Cookies.get('visited')
      setRunTour(!(visited || user.user?.userName))
    }
    const timeoutId = setTimeout(showJoyribe, 400)
    return () => clearTimeout(timeoutId)
  }, [user.user?.userName])

  useEffect(() => {
    if (chat.currentChat?.id) {
      message.loadMessages(chat.currentChat.id, user.user.id)
      setInterval(() => {
        message.loadMessages(chat.currentChat?.id, user.user.id)
      }, 3000)
    }
  }, [chat.currentChat?.id])

  async function showLastMessage() {
    try {
      const lastMessages = await getLastedMessage({ chatIds })
      setLastMessage(lastMessages)
    } catch (error) {
      console.error(error)
    }
  }

  async function getUserInfo() {
    try {
      const participantIds = chat.chats.map((chatItem) =>
        chatItem.creatorId === user.user.id
          ? chatItem.participantId
          : chatItem.creatorId
      )

      const data = await getInfoUsers({ chatIds: participantIds })
      const avatarsById = {}
      const userStatus = {}

      participantIds.forEach((id) => {
        const userData = data.find((u) => u.id === id)
        avatarsById[id] = userData?.avatarUrl || DEFAULT_AVATAR
        userStatus[id] = userData?.status || null
      })

      setUserAvatars(avatarsById)
      setUserStatus(userStatus)
    } catch (error) {
      console.error(error)
    }
  }

  async function handleUserSearch(e) {
    const value = e.target.value
    setUserSearch(value)

    try {
      if (value.trim() && value !== user.user.userName) {
        const data = await searchUser(value)
        setFoundUser(data)
        userId2Ref.current = data.id
        setMate(data.userName)
        setMateAvatar(data.avatarUrl)
      } else {
        setFoundUser(null)
      }
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error)
      setFoundUser(null)
    }
  }

  function changeWidth(e) {
    const startX = e.clientX
    const startWidth = widthBlock

    const handleMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidth = startWidth + delta
      setWidthBlock(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)))
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
      if (msg) {
        if (msg.type === 'image') {
          messageText[msg.dialogId] = 'Изображение'
        } else {
          messageText[msg.dialogId] = msg.text
        }
        time[msg.dialogId] = msg.timestamp
        userIdMap[msg.dialogId] = msg.senderId
        isReads[msg.dialogId] = msg.isRead
      }
    })

    return { messageText, userIdMap, time, isReads }
  }, [lastMessage])

  return {
    sidebarRef,
    userId2Ref,
    userAvatars,
    chatIds,
    userStatus,

    runTour,
    userSearch,
    foundUser,
    mate,
    mateAvatar,
    focus,
    widthBlock,
    lastMessage,
    lastMessageMap,

    setFocus,
    setUserSearch,

    handleUserSearch,
    showLastMessage,
    changeWidth,
    createNewChat,
  }
}
