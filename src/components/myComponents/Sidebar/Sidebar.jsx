import React, { useContext, useState } from 'react'
import { Container, Flex } from '../../UI/uiKit/uiKits.jsx'
import styles from './Sidebar.module.scss'
import Form from 'react-bootstrap/Form'
import ChatItem from '../ChatItem/ChatItem.jsx'
import UserBar from '../UserBar/UserBar'
import UserCard from '../userCard/userCard'
import JoyribeComponent from '../../UI/JoyribeComponent/JoyribeComponent'
import { observer } from 'mobx-react'
import { useSidebarLogic } from '../../../hooks/sideBarHooks/sideBarHooks'
import { Context } from '../../../main'

const Sidebar = observer(
  ({
    handleBlockedChat,
    handleUnBlockedChat,
    blockedChats,
    setIsVisible,
    setSelectChat,
    onChatSelect,
    isMenuOpen,
  }) => {
    const {
      sidebarRef,
      runTour,
      userSearch,
      foundUser,
      mate,
      focus,
      widthBlock,
      lastMessageMap,
      setFocus,
      handleUserSearch,
      showLastMessage,
      userId2Ref,
      changeWidth,
      mateAvatar,
      createNewChat,
    } = useSidebarLogic()

    const { chat, user, currentChat } = useContext(Context)

    return (
      <section
        className={`${styles.sidebar} ${isMenuOpen ? styles.close : ''}`}
        style={{ width: `${widthBlock}px` }}
      >
        <Container>
          <Flex column style={{ width: '100%', paddingRight: '20px' }}>
            <Flex
              style={{ width: '100%', gap: 20, margin: '15px' }}
              alignCenter
            >
              <div className="menuBtn" ref={sidebarRef}>
                <UserBar />
              </div>

              <Form.Control
                type="text"
                placeholder="Search"
                value={userSearch}
                style={{
                  borderRadius: '2rem',
                  maxWidth: '33rem',
                  minWidth: '1rem',
                  padding: '10px 20px',
                  marginRight: '5px',
                }}
                onChange={handleUserSearch}
                onFocus={() => setFocus(true)}
                onBlur={() => setTimeout(() => setFocus(false), 150)}
              />
            </Flex>
            {focus && (
              <div className={styles.resultBox}>
                <div className={styles.squareContent}>
                  {foundUser ? (
                    <UserCard
                      create={() => createNewChat(userId2Ref.current)}
                      mateName={mate}
                      mateAvatar={mateAvatar}
                    />
                  ) : (
                    <center>Ничего не найдено</center>
                  )}
                </div>
              </div>
            )}
            {chat.chats.map((item) => {
              const lastMsgText = lastMessageMap.messageText[item.id] || ''
              const userSenderId = lastMessageMap.userIdMap[item.id] || ''
              const timeMessage = lastMessageMap.time[item.id] || ''
              const isRead = lastMessageMap.isReads[item.id]
              // const isSelected = chat.currentChat?.id === item.id
              const isSelected = currentChat.currentChatId === item.id

              return (
                <ChatItem
                  key={item.id}
                  isRead={isRead}
                  chatId={item.id}
                  friendUserId={
                    item.creatorId === user.user.id
                      ? item.participantId
                      : item.creatorId
                  }
                  showLastMessage={showLastMessage}
                  lastMessageText={lastMsgText}
                  senderUserId={userSenderId}
                  timeMessage={timeMessage}
                  chatName={item.chatName}
                  avatarUrl={item.avatarUrl}
                  status={item.status}
                  onClick={() => {
                    onChatSelect(item.id)
                    setSelectChat(item.id)
                  }}
                  isSelected={isSelected}
                  style={{
                    background: isSelected ? 'rgba(51, 144, 236,1)' : '',
                    color: isSelected ? 'white' : '',
                  }}
                  setIsVisible={setIsVisible}
                  setSelectChat={setSelectChat}
                  blockedChat={blockedChats[item.id]}
                  handleBlockedChat={() => handleBlockedChat(item.id)}
                  handleUnBlockedChat={() => handleUnBlockedChat(item.id)}
                />
              )
            })}
          </Flex>
          <JoyribeComponent runTour={runTour} sidebarRef={sidebarRef} />
        </Container>
        <div onMouseDown={changeWidth} className={styles.customScroll}></div>
      </section>
    )
  }
)

export default Sidebar
