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
        if (!chat.chats.some((c) => c.id === dialog.id)) {
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
  const intervalRef = useRef(null)

  const [runTour, setRunTour] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [mate, setMate] = useState('')
  const [mateAvatar, setMateAvatar] = useState('')
  const [focus, setFocus] = useState(false)
  const [widthBlock, setWidthBlock] = useState(365)
  const [lastMessage, setLastMessage] = useState([])
  const [userAvatars, setUserAvatars] = useState({})
  const [userStatus, setUserStatus] = useState({})

  const MAX_WIDTH = 635
  const MIN_WIDTH = 340
  const createNewChat = useCreateChat()

  const chatIds = useMemo(() => chat.chats.map((c) => c.id), [chat.chats])

  useEffect(() => {
    chat.loadChats()
  }, [chat])

  useEffect(() => {
    if (chat.chats.length > 0) showLastMessage()
  }, [chat.chats])

  useEffect(() => {
    if (chatIds.length > 0) getUserInfo()
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
    const timeoutId = setTimeout(() => {
      const visited = Cookies.get('visited')
      setRunTour(!(visited || user.user?.userName))
    }, 400)
    return () => clearTimeout(timeoutId)
  }, [user.user?.userName])

  useEffect(() => {
    if (!chat.currentChat?.id) return
    message.loadMessages(chat.currentChat.id, user.user.id)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      message.loadMessages(chat.currentChat?.id, user.user.id)
    }, 3000)

    return () => clearInterval(intervalRef.current)
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
      const participantIds = chat.chats.map((c) =>
        c.creatorId === user.user.id ? c.participantId : c.creatorId
      )
      const data = await getInfoUsers({ chatIds: participantIds })
      const avatarsById = {}
      const statusById = {}
      participantIds.forEach((id) => {
        const userData = data.find((u) => u.id === id)
        avatarsById[id] = userData?.avatarUrl || DEFAULT_AVATAR
        statusById[id] = userData?.status || null
      })
      setUserAvatars(avatarsById)
      setUserStatus(statusById)
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
      const newWidth = startWidth + (moveEvent.clientX - startX)
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
