import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { Container, Flex, Section } from '../../components/UI/uiKit/uiKits.jsx'
import Sidebar from '../../components/myComponents/Sidebar/Sidebar.jsx'
import ChatView from '../../components/myComponents/ChatView/ChatView.jsx'
import { Context } from '../../main'
import { observer } from 'mobx-react-lite'
import socket from '../../Websoket/socket'
import Toast from '../../components/myComponents/Toast/Toast'
import { checkBlockedChat } from '../../http/userApi'

const ChatLayout = observer(() => {
  const { chat, user, currentChat } = useContext(Context)
  const [selectChat, setSelectChat] = useState(null)
  const [show, setShow] = useState(false)
  const scrollToBottom = useRef(null)
  const [blockedChats, setBlockedChats] = useState({})
  const lastMessageRef = useRef(null)

  const scrollToBottomFunc = useCallback(() => {
    if (scrollToBottom.current) {
      setTimeout(() => {
        scrollToBottom.current.scrollTop = scrollToBottom.current.scrollHeight
      }, 100)
    }
  }, [])

  useEffect(() => {
    const userId = user.user.id
    socket.emit('onlineUser', userId)
    const timer = setInterval(() => socket.emit('onlineUser', userId), 10000)
    return () => clearInterval(timer)
  }, [user.user.id])

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.dialogId === selectChat) {
        scrollToBottomFunc()
      }
    }

    socket.on('messageCreated', handleNewMessage)

    return () => {
      socket.off('messageCreated', handleNewMessage)
    }
  }, [selectChat, scrollToBottomFunc])

  useEffect(() => {
    if (selectChat) {
      scrollToBottomFunc()
    }
  }, [selectChat, scrollToBottomFunc])

  useEffect(() => {
    if (!selectChat) return

    const fetchBlocked = async () => {
      try {
        const result = await checkBlockedChat(selectChat, user.user.id)
        setBlockedChats((prev) => ({
          ...prev,
          [String(selectChat)]: {
            blocked: result.blocked,
            userBlocked: result.userBlocked,
          },
        }))
      } catch (e) {
        console.error('Ошибка проверки блокировки:', e)
      }
    }

    fetchBlocked()
  }, [selectChat, user.user.id])

  useEffect(() => {
    const onBlocked = (data) => {
      setBlockedChats((prev) => ({
        ...prev,
        [String(data.dialogId)]: {
          ...prev[String(data.dialogId)],
          blocked: true,
          userBlocked: data.userBlocked,
        },
      }))
    }

    const onUnblocked = (data) => {
      setBlockedChats((prev) => ({
        ...prev,
        [String(data.dialogId)]: {
          ...prev[String(data.dialogId)],
          blocked: false,
        },
      }))
    }

    socket.on('blockedChatResponse', onBlocked)
    socket.on('unBlockedChatResponse', onUnblocked)

    return () => {
      socket.off('blockedChatResponse', onBlocked)
      socket.off('unBlockedChatResponse', onUnblocked)
    }
  }, [])

  const handleBlockedChat = (chatId) => {
    socket.emit('blockedChat', { dialogId: chatId, userId: user.user.id })
  }

  const handleUnBlockedChat = (chatId) => {
    socket.emit('unBlockedChat', { dialogId: chatId, userId: user.user.id })
  }

  const handleChatSelect = (chatId) => {
    chat.setCurrentChat(chatId)
    setSelectChat(chatId)

    currentChat.setCurrentChat(chatId)
    currentChat.toggleSidebar(true)

    setTimeout(() => {
      scrollToBottomFunc()
    }, 310)
  }

  return (
    <Section>
      <Container style={{ height: '100%' }}>
        <Flex style={{ height: '100%' }}>
          <Sidebar
            isMenuOpen={currentChat.isSidebarOpen}
            selectChat={selectChat}
            setSelectChat={setSelectChat}
            onChatSelect={handleChatSelect}
            blockedChats={blockedChats}
            handleBlockedChat={handleBlockedChat}
            handleUnBlockedChat={handleUnBlockedChat}
          />

          {currentChat.isChatVisible && selectChat && (
            <ChatView
              selectChat={selectChat}
              setShow={setShow}
              scrollToBottom={scrollToBottom}
              blockedChats={blockedChats}
              onScrollToBottom={scrollToBottomFunc}
            />
          )}
        </Flex>

        <Toast
          toastTitle="Удаление"
          toastDescription="Сообщение удалено успешно"
          show={show}
          setShow={setShow}
          variant="Success"
        />
      </Container>
    </Section>
  )
})

export default ChatLayout
