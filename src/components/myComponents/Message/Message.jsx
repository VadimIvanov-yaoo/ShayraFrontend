  import React, { useContext, useEffect, useRef, useState } from 'react'
  import ReactDOM from 'react-dom'
  import { Text } from '../../UI/uiKit/uiKits'
  import styles from './Message.module.scss'
  import { Context } from '../../../main'
  import { deleteMessage, getMessageReaction } from '../../../http/userApi'
  import { observer } from 'mobx-react'
  import {
    CHECKED,
    CLOWN,
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
      const { reaction, user, message: messageStore, chat } = useContext(Context)
      const { id, text, timestamp, imgPath, isRead, dialogId } = message
      const messageRef = useRef(null)
      const messageTextRef = useRef(null)
      const menuRef = useRef(null)
      const isImage = !!imgPath
      const [emoji, setEmoji] = useState(null)
      const currentChat = chat.chats.find((c) => c.id == selectChat)
      const localDate = new Date(timestamp).toLocaleString()
      const formatDate = localDate.substring(11, 17)
      const reactionMap = { 1: HEART, 2: HAND_UP, 3: CLOWN }
      const touchTimer = useRef(null)
      const longPressTriggered = useRef(false)
      const menuOpenedByTouch = useRef(false)

      const handleContextMenu = (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!messageRef.current) return

        const rect = messageRef.current.getBoundingClientRect()
        const menuWidth = 160
        const viewportWidth = window.innerWidth
        let left = rect.right + window.scrollX + 5

        if (isOwnMessage || left + menuWidth > viewportWidth) {
          left = rect.left + window.scrollX - menuWidth
        }

        setMenuPosition({
          top: rect.top + window.scrollY + 10,
          left,
        })
        setActiveMessageId(id)
      }

      const handleCopy = () => {
        navigator.clipboard.writeText(messageTextRef.current.innerText)
      }

      useEffect(() => {
        const update = async () => {
          const data = await getMessageReaction(id, dialogId)
          setEmoji(data)
          reaction.setReaction(data)
        }

        socket.on('updatedCount', update)
        socket.on('reaction', update)
        socket.on('deleteReaction', update)

        return () => {
          socket.off('updatedCount', update)
          socket.off('reaction', update)
          socket.off('deleteReaction', update)
        }
      }, [id, dialogId, reaction])

      const dropMessage = async () => {
        try {
          messageStore.deleteMessage(id)
          setShow(true)
          await deleteMessage(id)
        } catch (e) {
          alert('Сообщение не удалено')
        } finally {
          handleClose()
        }
      }

      async function setReaction(messageId, emojiId) {
        const userId = user.user.id
        socket.emit('newReaction', { messageId, emojiId, userId })
      }

      const handleTouchStart = () => {
        longPressTriggered.current = false
        menuOpenedByTouch.current = false

        touchTimer.current = setTimeout(() => {
          handleContextMenu({ preventDefault: () => {} })
          longPressTriggered.current = true
          menuOpenedByTouch.current = true
        }, 600)
      }

      const handleTouchEnd = () => {
        clearTimeout(touchTimer.current)
      }

      const handleTouchMove = () => {
        clearTimeout(touchTimer.current)
      }

      useEffect(() => {
        const fetchReactions = async () => {
          const data = await getMessageReaction(id, dialogId)
          setEmoji(data)
          reaction.setReaction(data)
        }
        fetchReactions()
      }, [])

      useEffect(() => {
        const handleClickOutside = (e) => {
          if (
            menuRef.current &&
            !menuRef.current.contains(e.target) &&
            messageRef.current &&
            !messageRef.current.contains(e.target) &&
            !menuOpenedByTouch.current
          ) {
            handleClose()
          }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)

        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
          document.removeEventListener('touchstart', handleClickOutside)
        }
      }, [handleClose])

      const menu = menuPosition && activeMessageId === id && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: menuPosition.top,
            left: menuPosition.left,
            zIndex: 1000,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <RightClickMenu
            setReaction={setReaction}
            isOwnMessage={isOwnMessage}
            handleCopy={handleCopy}
            messageId={id}
            drop={dropMessage}
          />
        </div>
      )

      return (
        <>
          <div
            className={styles.messageWrapper}
            ref={messageRef}
            onClick={(e) => {
              if (e.button === 0) handleContextMenu(e)
            }}
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
                <Text ref={messageTextRef} className={styles.messageText}>
                  {text}
                </Text>
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
                    .filter((item) => item.messageId === id)
                    .map((item, index) => {
                       const reactionOwner = item.userId === user.user.id
                      const userAvatar = reactionOwner
                        ? user.user.avatarUrl
                        : currentChat.avatarUrl

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
