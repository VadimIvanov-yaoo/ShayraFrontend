import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './ChatLayoutMessage.module.scss'
import { Container } from '../../UI/uiKit/uiKits'
import { Context } from '../../../main'
import { observer } from 'mobx-react'
import Message from '../Message/Message'
import socket from '../../../Websoket/socket'

const ChatLayoutMessage = observer(
  ({ blockedChats, selectChat, setShow, scrollToBottom }) => {
    const { currentChat, message, user, chat } = useContext(Context)
    const [activeMessageId, setActiveMessageId] = useState(null)
    const [menuPosition, setMenuPosition] = useState(null)

    useEffect(() => {
      const handleMessage = (msg) => {
        if (msg.dialogId === chat.currentChat.id) {
          message.addMessage(msg)
          setTimeout(() => {
            if (scrollToBottom.current) {
              scrollToBottom.current.scrollTop =
                scrollToBottom.current.scrollHeight
            }
          }, 0)
        }
      }

      socket.on('messageCreated', handleMessage)
      return () => {
        socket.off('messageCreated', handleMessage)
      }
    }, [chat.currentChat?.id])

    const handleClose = () => {
      setMenuPosition(null)
    }

    return (
      <div onClick={handleClose} ref={scrollToBottom} className={styles.chat}>
        <Container>
          <div className={styles.chatsWrapper}>
            {message.messages &&
              message.messages.map((item) => {
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
                        handleClose={() => {
                          setMenuPosition(null)
                          setActiveMessageId(null)
                        }}
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
