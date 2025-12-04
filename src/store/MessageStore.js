import { action, makeAutoObservable, observable, runInAction } from 'mobx'
import {
  getMessage,
  getMessageReaction,
  readMessageChange,
} from '../http/userApi'

export default class MessageStore {
  messages = []
  lastRequestId = 0
  _socket = null

  constructor() {
    makeAutoObservable(this, {
      messages: observable,
      lastRequestId: observable,
      setSocket: action,
    })
  }

  setSocket(socket) {
    this._socket = socket
    if (socket) {
      this.setupSocketListeners()
    }
  }

  setupSocketListeners() {
    if (!this._socket) return

    this._socket.on('messageCreated', (message) => {
      runInAction(() => {
        const exists = this.messages.some((m) => m.id === message.id)
        if (!exists) {
          this.messages.push(message)
          this.sortMessages()
        }
      })
    })

    this._socket.on('deleteReaction', (data) => {
      runInAction(() => {
        const message = this.messages.find((m) => m.id === data.messageId)
        if (message && message.reactions) {
          message.reactions = message.reactions.filter(
            (r) => r.userId !== data.userId
          )
        }
      })
    })

    this._socket.on('reactionCreated', (reaction) => {
      runInAction(() => {
        const message = this.messages.find((m) => m.id === reaction.messageId)
        if (message) {
          if (!message.reactions) message.reactions = []
          const exists = message.reactions.some(
            (r) =>
              r.id === reaction.id ||
              (r.messageId === reaction.messageId &&
                r.userId === reaction.userId)
          )
          if (!exists) {
            message.reactions.push(reaction)
          }
        }
      })
      this._socket.on('chatDeleted', (data) => {
        runInAction(() => {
          this.messages = this.messages.filter(
            (msg) => msg.dialogId !== data.chatId
          )
        })
      })
    })

    this._socket.on('reactionUpdated', (reaction) => {
      runInAction(() => {
        const message = this.messages.find((m) => m.id === reaction.messageId)
        if (message && message.reactions) {
          const index = message.reactions.findIndex(
            (r) =>
              r.messageId === reaction.messageId && r.userId === reaction.userId
          )
          if (index !== -1) {
            message.reactions[index] = reaction
          } else {
            message.reactions.push(reaction)
          }
        }
      })
    })
  }

  setMessages(messages) {
    runInAction(() => {
      this.messages = messages
      this.sortMessages()
    })
  }

  addMessage(message) {
    runInAction(() => {
      const exists = this.messages.some((m) => m.id === message.id)
      if (!exists) {
        this.messages.push(message)
        this.sortMessages()
      }
    })
  }

  updateMessageStatus(messageId, isRead) {
    runInAction(() => {
      const message = this.messages.find((m) => m.id === messageId)
      if (message) {
        message.isRead = isRead
      }
    })
  }

  deleteMessage(messageId) {
    runInAction(() => {
      this.messages = this.messages.filter((msg) => msg.id !== messageId)
    })
  }

  sortMessages() {
    this.messages.sort(
      (a, b) =>
        new Date(a.time || a.timestamp) - new Date(b.time || b.timestamp)
    )
  }

  async loadMessages(dialogId, userId) {
    if (!dialogId) return
    const currentRequestId = ++this.lastRequestId
    try {
      await readMessageChange(dialogId, userId)
      const messages = await getMessage(dialogId)
      if (currentRequestId !== this.lastRequestId) return

      const messagesWithReactions = await Promise.all(
        messages.map(async (msg) => {
          const reactions = await getMessageReaction(msg.id, msg.dialogId)
          return { ...msg, reactions: reactions || [] }
        })
      )

      if (currentRequestId !== this.lastRequestId) return
      runInAction(() => {
        this.setMessages(messagesWithReactions)
      })
    } catch (e) {
      console.error('Ошибка при получении сообщений', e)
    }
  }
}
