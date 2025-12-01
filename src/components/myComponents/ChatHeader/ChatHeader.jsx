import React, { useContext } from 'react'
import styles from './ChatHeader.module.scss'
import { Context } from '../../../main'
import { observer } from 'mobx-react'
import { DEFAULT_AVATAR, LEFT_ARROW } from '../../../utils/image'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const ChatHeader = observer(() => {
  const { currentChat } = useContext(Context)
  const currentChatData = currentChat.currentChatData

  const closeChat = () => {
    currentChat.closeChat()
  }

  return (
    <div className={styles.chatHeader}>
      <div className={styles.userInfoWrapper}>
        <button onClick={closeChat} className={styles.backBtn}>
          <img src={LEFT_ARROW} alt="leftArrow" />
        </button>
        <div>
          <img
            className={styles.chatAvatar}
            src={getAvatarSrc(currentChatData.avatarUrl || DEFAULT_AVATAR)}
            alt="avatar"
          />
        </div>

        <div className={styles.partnerInfo}>
          <span className={styles.partnerName}>{currentChatData.chatName}</span>
          <span
            className={
              currentChatData.status === 'online'
                ? styles.onlineClass
                : styles.offlineClass
            }
          >
            {currentChatData.status || 'offline'}
          </span>
        </div>
      </div>
    </div>
  )
})

export default ChatHeader
