import React, { useContext, useEffect, useState } from 'react'
import ChatHeader from '../ChatHeader/ChatHeader'
import ChatFooter from '../ChatFooter/ChatFooter'
import styles from './ChatView.module.scss'
import ChatLayoutMessage from '../ChatLayoutMessage/ChatLayoutMessage'
import { Context } from '../../../main'
import { checkBlockedChat } from '../../../http/userApi'
import socket from '../../../Websoket/socket'

const ChatView = ({
  setSelectChat,
  setShow,
  setIsVisible,
  scrollToBottom,
  selectChat,
  blockedChats,
}) => {
  const { user } = useContext(Context)
  const chatStatus = blockedChats[String(selectChat)]
  const isBlocked = chatStatus?.blocked
  const userBlocked = chatStatus?.userBlocked

  return (
    <div className={styles.chat}>
      <ChatHeader
        setSelectChat={setSelectChat}
        setIsVisible={setIsVisible}
        selectChat={selectChat}
      />

      {!isBlocked ? (
        <div className={styles.chatWrapper}>
          <ChatLayoutMessage
            selectChat={selectChat}
            setShow={setShow}
            scrollToBottom={scrollToBottom}
          />
          <ChatFooter selectChat={selectChat} />
        </div>
      ) : (
        <div className={styles.blockedNotice}>
          <p style={{ color: 'red', textAlign: 'center' }}>
            {userBlocked === user.user.id
              ? 'Вы заблокировали данный чат'
              : 'Данный чат заблокирован собеседником'}
          </p>
        </div>
      )}
    </div>
  )
}
export default ChatView
