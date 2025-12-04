import React, { useState, useContext } from 'react'
import { Modal, Button, Form, ListGroup } from 'react-bootstrap'
import { Context } from '../../../main'
import styles from './ForwardMessageModal.module.scss'

const ForwardMessageModal = ({ show, onHide, message, onForward }) => {
  const { chat } = useContext(Context)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleForward = () => {
    if (selectedChatId && message) {
      onForward(message, selectedChatId)
      onHide()
    }
  }

  const filteredChats = chat.chats.filter((c) =>
    c.chatName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Переслать сообщение</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.messagePreview}>
          {message?.imgPath ? (
            <img
              src={import.meta.env.VITE_API_URL + message.imgPath}
              alt="Пересылаемое изображение"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.previewText}>{message?.text}</div>
          )}
        </div>

        <Form.Control
          type="text"
          placeholder="Поиск чатов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        <div className={styles.chatsList}>
          {filteredChats.map((c) => (
            <div
              key={c.id}
              className={`${styles.chatItem} ${selectedChatId === c.id ? styles.selected : ''}`}
              onClick={() => setSelectedChatId(c.id)}
            >
              <img
                src={c.avatarUrl || '/default-avatar.png'}
                alt={c.chatName}
                className={styles.chatAvatar}
              />
              <div className={styles.chatInfo}>
                <div className={styles.chatName}>{c.chatName}</div>
                <div className={styles.chatStatus}>{c.status}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleForward}
          disabled={!selectedChatId}
        >
          Переслать
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ForwardMessageModal
