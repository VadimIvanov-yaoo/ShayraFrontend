import React, { useContext, useState, useRef } from 'react'
import styles from './ChatItem.module.scss'
import { Context } from '../../../main'
import { observer } from 'mobx-react'
import { CHECKED, NOT_CHECKED } from '../../../utils/image'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const ChatItem = observer(
  ({
    timeMessage,
    avatarUrl,
    status,
    senderUserId,
    lastMessageText,
    isSelected,
    style,
    isRead,
    chatName,
    onClick,
    chatId,
    blockedChat,
    handleBlockedChat,
    handleUnBlockedChat,
  }) => {
    const { user, chat, currentChat } = useContext(Context)
    const [isOpen, setIsOpen] = useState(false)
    const touchTimer = useRef(null)
    const longPressTriggered = useRef(false)
    const isBlocked = blockedChat?.blocked || false

    function handleClick() {
      if (longPressTriggered.current) {
        longPressTriggered.current = false
        return
      }
      setIsOpen(false)
      onClick()
      currentChat.setCurrentChat(chatId, {
        chatName,
        avatarUrl,
        status,
        lastMessageText,
        senderUserId,
        timeMessage,
      })
    }

    function handleTouchStart() {
      longPressTriggered.current = false
      touchTimer.current = setTimeout(() => {
        setIsOpen(true)
        longPressTriggered.current = true
      }, 1000)
    }

    function handleTouchEnd() {
      clearTimeout(touchTimer.current)
    }

    function handleTouchMove() {
      clearTimeout(touchTimer.current)
    }

    function formatMessageTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
      <div
        style={style}
        onClick={handleClick}
        onContextMenu={(event) => {
          event.preventDefault()
          setIsOpen(true)
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={styles.chatItem}
      >
        {isOpen && isSelected && (
          <div className={styles.managementChat}>
            <button
              onClick={isBlocked ? handleUnBlockedChat : handleBlockedChat}
              className={styles.menuBtn}
            >
              {isBlocked ? 'Разблокировать' : 'Заблокировать'}
            </button>

            <button
              onClick={() => {
                chat.handleDeleteChat(chatId)
                currentChat.closeChat()
              }}
              style={{ color: 'red' }}
              className={styles.menuBtn}
            >
              Удалить чат
            </button>
          </div>
        )}

        <div className="d-flex align-items-center" style={{ gap: '15px' }}>
          <div className={styles.avatarWrapper}>
            <img
              className={styles.avatar}
              src={getAvatarSrc(avatarUrl)}
              alt="avatar"
            />
            {status === 'online' && <div className={styles.status} />}
          </div>

          <div className={styles.userInfo}>
            <div>
              <h5>{chatName}</h5>
              <span
                style={
                  senderUserId !== user.user.id && !isSelected
                    ? { fontWeight: 'bold', color: 'black' }
                    : null
                }
                className={styles.lastMessage}
              >
                {senderUserId === user.user.id && 'Вы: '}
                {lastMessageText}
              </span>
            </div>

            <div className={styles.messageStatusWrapper}>
              <div className={styles.messageInfo}>
                <span className={styles.time}>
                  {formatMessageTime(timeMessage)}
                </span>
                {senderUserId === user.user.id && (
                  <img
                    className={styles.messageStatus}
                    src={isRead ? CHECKED : NOT_CHECKED}
                    alt=""
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default ChatItem
