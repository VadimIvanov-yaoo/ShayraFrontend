import { makeAutoObservable } from 'mobx'
import {
  getMessage,
  getMessageReaction,
  readMessageChange,
} from '../http/userApi'

export default class MessageStore {
  messages = []

  constructor() {
    makeAutoObservable(this)
  }

  setMessages(messages) {
    this.messages = messages
  }

  addMessage(message) {
    const exists = this.messages.some((m) => m.id === message.id)
    if (!exists) {
      this.messages.push(message)
    }
  }
  deleteMessage(messageId) {
    this.messages = this.messages.filter((msg) => msg.id !== messageId)
  }

  async loadMessages(dialogId, userId) {
    if (!dialogId) return
    try {
      readMessageChange(dialogId, userId)
      const messages = await getMessage(dialogId)

      const messagesWithReactions = await Promise.all(
        messages.map(async (msg) => {
          const reactions = await getMessageReaction(msg.id, msg.dialogId)
          return { ...msg, reactions }
        })
      )

      this.setMessages(messagesWithReactions)
    } catch (e) {
      console.error('Ошибка при получении сообщений', e)
    }
  }
}
