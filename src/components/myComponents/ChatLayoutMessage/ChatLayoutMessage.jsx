import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import styles from './ChatLayoutMessage.module.scss'
import { Container } from '../../UI/uiKit/uiKits'
import { Context } from '../../../main'
import { observer } from 'mobx-react'
import Message from '../Message/Message'
import socket from '../../../Websoket/socket'
import { Spinner } from 'react-bootstrap'

const ChatLayoutMessage = observer(
  ({ blockedChats, selectChat, setShow, scrollToBottom }) => {
    const { message, user, chat } = useContext(Context)
    const [activeMessageId, setActiveMessageId] = useState(null)
    const [menuPosition, setMenuPosition] = useState(null)
    const loadingRef = useRef(false)

    const handleNewMessage = useCallback(
      (msg) => {
        if (msg.dialogId === chat.currentChat?.id) {
          const messages = message.messages
          const exists = messages.some((m) => m.id === msg.id)
          if (!exists) {
            setTimeout(() => {
              if (scrollToBottom.current) {
                scrollToBottom.current.scrollTop =
                  scrollToBottom.current.scrollHeight
              }
            }, 100)
          }
        }
      },
      [chat.currentChat?.id, message.messages, scrollToBottom]
    )

    useEffect(() => {
      socket.on('messageCreated', handleNewMessage)
      return () => {
        socket.off('messageCreated', handleNewMessage)
      }
    }, [handleNewMessage])

    useEffect(() => {
      const currentChatId = chat.currentChat?.id
      const userId = user.user?.id

      if (currentChatId && userId && !loadingRef.current) {
        loadingRef.current = true
        message.loadMessages(currentChatId, userId).finally(() => {
          loadingRef.current = false
        })
      }
    }, [chat.currentChat?.id, user.user?.id, message])

    const handleClose = () => {
      setMenuPosition(null)
      setActiveMessageId(null)
    }

    if (!chat.currentChat?.id) {
      return (
        <div ref={scrollToBottom} className={styles.chat}>
          <Container>
            <div className={styles.chatsWrapper}>
              <div className={styles.emptyChat}>
                Выберите чат для начала общения
              </div>
            </div>
          </Container>
        </div>
      )
    }

    return (
      <div onClick={handleClose} ref={scrollToBottom} className={styles.chat}>
        <Container>
          <div className={styles.chatsWrapper}>
            {message.messages.map((item) => {
              const isOwnMessage = item.senderId === user.user.id
              const messageClass = isOwnMessage
                ? styles.interlocutorBlock
                : styles.userBox

              return (
                <div key={item.id} className={styles.messageWrapper}>
                  <div className={messageClass}>
                    <Message
                      selectChat={selectChat}
                      message={item}
                      isOwnMessage={isOwnMessage}
                      handleClose={handleClose}
                      menuPosition={menuPosition}
                      setMenuPosition={setMenuPosition}
                      activeMessageId={activeMessageId}
                      setActiveMessageId={setActiveMessageId}
                      setShow={setShow}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </div>
    )
  }
)

export default ChatLayoutMessage
