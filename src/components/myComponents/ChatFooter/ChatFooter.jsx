import React, { useContext, useState } from 'react'
import styles from './ChatFooter.module.scss'
import send from '../../../assets/images/icons/send.svg'
import clip from '../../../assets/images/icons/clip.svg'
import socket from '../../../Websoket/socket'
import { Context } from '../../../main'
import { uploadImage } from '../../../http/userApi'
import leoProfanity from 'leo-profanity'

const ChatFooter = ({ selectChat }) => {
  const [message, setMessage] = useState('')
  const { user, chat } = useContext(Context)
  const currentChat = chat.chats.find((c) => c.id == selectChat)

  leoProfanity.loadDictionary('ru')
  leoProfanity.add(leoProfanity.getDictionary('en'))
  leoProfanity.add([
    'дурак',
    'идиот',
    'террор',
    'idiot',
    'террорист',
    'терроризм',
    'террористический',
    'теракт',
    'террористка',
    'экстремизм',
    'экстремист',
    'экстремистский',
    'джихад',
    'шайтан',
    'фашизм',
    'нацизм',
    'ксенофобия',
    'бомба',
    'взрывчатка',
    'граната',
    'оружие',
    'пистолет',
    'автомат',
    'захват заложников',
    'диверсия',
    'головорез',
    'душегуб',
    'убийца',
    'насильник',
    'рецидивист',
    'наркобарон',
    'мародёр',
    'громила',
    'тротил',
    'схрон',
  ])

  if (!currentChat) return null

  const a = new Date()
  let formatDate = a.toString().substring(0, 21).toLocaleString()

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const data = await uploadImage(formData)
    const filePath = data.filePath

    socket.emit('newMessage', {
      type: 'image',
      content: filePath,
      senderId: user.user.id,
      dialogId: currentChat.id,
      time: new Date().toISOString(),
    })
  }

  async function sendMessage(e) {
    e.preventDefault()
    const cleanText = leoProfanity.clean(message)
    console.log(cleanText)
    if (message.trim() !== '') {
      socket.emit('newMessage', {
        type: 'text',
        text: cleanText.trim(),
        creatorName: currentChat.creatorName,
        participantName: currentChat.participantName,
        dialogId: currentChat.id,
        senderId: user.user.id,
        time: formatDate,
      })

      setMessage('')
    }
  }

  return (
    <div className={styles.footer}>
      <form className={styles.inputWrapper}>
        <label className={styles.sendBtn}>
          <img src={clip} alt="Attach" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
        <input
          className={styles.input}
          type="text"
          value={message}
          placeholder="Введите сообщение..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage} className={styles.sendBtn}>
          <img src={send} alt="Send" />
        </button>
      </form>
    </div>
  )
}

export default ChatFooter
