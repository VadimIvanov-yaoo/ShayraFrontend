import React, { useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Text } from '../../UI/uiKit/uiKits'
import styles from './Message.module.scss'
import { Context } from '../../../main'
import { check, deleteMessage, getMessageReaction } from '../../../http/userApi'
import { observer } from 'mobx-react'
import {
  CHECKED,
  CLOWN,
  DEFAULT_AVATAR,
  HAND_UP,
  HEART,
  NOT_CHECKED,
} from '../../../utils/image'
import RightClickMenu from '../RightClickMenu/RightClickMenu'
import socket from '../../../Websoket/socket'
import Reactions from '../Reactions/Reactions'

const Message = observer(
  ({
    message,
    isOwnMessage,
    handleClose,
    menuPosition,
    setMenuPosition,
    activeMessageId,
    setActiveMessageId,
    setShow,
    selectChat,
  }) => {
    const { reaction, user, message: messageStore } = useContext(Context)
    const { id, text, timestamp, imgPath, isRead, dialogId } = message
    const messageRef = useRef(null)
    const isImage = !!imgPath
    const [emoji, setEmoji] = useState(null)
    const touchTimer = useRef(null)
    const longPressTriggered = useRef(false)

    const { chat } = useContext(Context)
    const currentChat = chat.chats.find((c) => c.id == selectChat)
    const localDate = new Date(timestamp).toLocaleString()
    const formatDate = localDate.substring(11, 17)

    const reactionMap = {
      1: HEART,
      2: HAND_UP,
      3: CLOWN,
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
      if (messageRef.current) {
        const rect = messageRef.current.getBoundingClientRect()
        const menuWidth = 160
        const viewportWidth = window.innerWidth

        if (isOwnMessage) {
          setMenuPosition({
            top: rect.top + window.scrollY + 10,
            left: rect.left + window.scrollX - menuWidth,
          })
        } else {
          const leftPosition = rect.right + window.scrollX
          if (leftPosition + menuWidth > viewportWidth) {
            setMenuPosition({
              top: rect.top + window.scrollY + 10,
              left: rect.left + window.scrollX - menuWidth,
            })
          } else {
            setMenuPosition({
              top: rect.top + window.scrollY + 10,
              left: leftPosition + 5,
            })
          }
        }
        setActiveMessageId(id)
      }
    }

    useEffect(() => {
      const handleUpdatedCount = async () => {
        const data = await getMessageReaction(id, dialogId)
        setEmoji(data)
        reaction.setReaction(data)
      }

      const handleReaction = async () => {
        const data = await getMessageReaction(id, dialogId)
        setEmoji(data)
        reaction.setReaction(data)
      }

      const handleDeleteReaction = async () => {
        const data = await getMessageReaction(id, dialogId)
        setEmoji(data)
        reaction.setReaction(data)
      }

      socket.on('updatedCount', handleUpdatedCount)
      socket.on('reaction', handleReaction)
      socket.on('deleteReaction', handleDeleteReaction)

      return () => {
        socket.off('updatedCount', handleUpdatedCount)
        socket.off('reaction', handleReaction)
        socket.off('deleteReaction', handleDeleteReaction)
      }
    }, [id, dialogId, reaction])

    const dropMessage = async () => {
      try {
        messageStore.deleteMessage(id)
        setShow(true)
        await deleteMessage(id)
      } catch (e) {
        alert('Сообщение не удалено')
        console.log(e)
      } finally {
        handleClose()
      }
    }

    async function setReaction(messageId, emojiId) {
      const userId = user.user.id
      try {
        socket.emit('newReaction', {
          messageId: messageId,
          emojiId: emojiId,
          userId: userId,
        })
      } catch (e) {
        console.error(e)
      }
    }

    useEffect(() => {
      const fetchReactions = async () => {
        const data = await getMessageReaction(message.id, message.dialogId)
        setEmoji(data)
        reaction.setReaction(data)
      }
      fetchReactions()
    }, [])

    const menu = menuPosition && activeMessageId === id && (
      <div
        style={{
          position: 'absolute',
          top: menuPosition.top,
          left: menuPosition.left,
          zIndex: 1000,
        }}
        onClick={handleClose}
      >
        <RightClickMenu
          setReaction={setReaction}
          isOwnMessage={isOwnMessage}
          messageId={id}
          drop={dropMessage}
        />
      </div>
    )
    const handleTouchStart = () => {
      longPressTriggered.current = false
      touchTimer.current = setTimeout(() => {
        handleContextMenu({ preventDefault: () => {} })
        longPressTriggered.current = true
      }, 1000)
    }

    const handleTouchEnd = () => {
      clearTimeout(touchTimer.current)
    }

    const handleTouchMove = () => {
      clearTimeout(touchTimer.current)
    }

    const handleClick = () => {
      if (!longPressTriggered.current) {
        handleClose()
      }
      longPressTriggered.current = false
    }

    return (
      <>
        <div
          className={styles.messageWrapper}
          ref={messageRef}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <div className={styles.message}>
            {isImage ? (
              <img
                className={styles.imgMessage}
                src={import.meta.env.VITE_API_URL + imgPath}
                alt=""
              />
            ) : (
              <Text className={styles.messageText}>{text}</Text>
            )}
          </div>

          <div
            className={`${styles.messageFooter} ${
              !emoji || emoji.length === 0 ? styles.noReaction : ''
            }`}
          >
            {emoji && emoji.length > 0 && (
              <div className={styles.reactionWrapper}>
                {emoji
                  .filter((item) => item.messageId === message.id)
                  .map((item, index) => {
                    const reactionOwner = item.userId === user.user.id
                    const userAvatar =
                      item.userId === user.user.id
                        ? user.user.avatarUrl
                        : currentChat.avatarUrl

                    console.log(item.userId)
                    return (
                      <Reactions
                        key={index}
                        url={reactionMap[item.emojiId]}
                        sender={userAvatar}
                        onClick={() =>
                          reactionOwner ? setReaction(id, null) : null
                        }
                        onTouchStart={() =>
                          reactionOwner ? setReaction(id, null) : null
                        }
                      />
                    )
                  })}
              </div>
            )}

            <div className={styles.footerLeft}>
              <Text className={styles.time}>{formatDate}</Text>
              {isOwnMessage && (
                <img
                  className={styles.status}
                  src={isRead ? CHECKED : NOT_CHECKED}
                  alt=""
                />
              )}
            </div>
          </div>
        </div>

        {menu && ReactDOM.createPortal(menu, document.body)}
      </>
    )
  }
)

export default Message
