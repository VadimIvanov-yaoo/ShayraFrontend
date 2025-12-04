import { makeAutoObservable, observable, runInAction } from 'mobx'
import {
  getMessage,
  getMessageReaction,
  readMessageChange,
} from '../http/userApi'

export default class MessageStore {
  _messagesCache = new Map()
  _currentDialogId = null
  _loadingDialogs = new Set()
  _socket = null

  constructor() {
    makeAutoObservable(this, {
      _messagesCache: observable,
      _currentDialogId: observable,
      _loadingDialogs: observable,
    })
  }

  setSocket(socket) {
    this._socket = socket
    if (socket) {
      this._setupSocketListeners()
    }
  }

  _setupSocketListeners() {
    if (!this._socket) return

    this._socket.on('messageCreated', (message) => {
      this._addMessageToCache(message)
    })

    this._socket.on('reaction', (reaction) => {
      this._updateReactionInCache(reaction)
    })

    this._socket.on('deleteReaction', (data) => {
      this._deleteReactionFromCache(data)
    })
  }

  _addMessageToCache(message) {
    runInAction(() => {
      let messages = this._messagesCache.get(message.dialogId)
      if (!messages) {
        messages = [message]
        this._messagesCache.set(message.dialogId, messages)
        return
      }

      const exists = messages.some((m) => m.id === message.id)
      if (!exists) {
        // Бинарный поиск для вставки в отсортированный массив
        let low = 0
        let high = messages.length - 1

        while (low <= high) {
          const mid = Math.floor((low + high) / 2)
          if (messages[mid].id < message.id) {
            low = mid + 1
          } else {
            high = mid - 1
          }
        }

        messages.splice(low, 0, message)
      }
    })
  }

  _updateReactionInCache(reaction) {
    runInAction(() => {
      const messages = this._messagesCache.get(reaction.dialogId)
      if (!messages) return

      const message = messages.find((m) => m.id === reaction.messageId)
      if (!message) return

      if (!message.reactions) message.reactions = []

      const index = message.reactions.findIndex(
        (r) =>
          r.messageId === reaction.messageId && r.userId === reaction.userId
      )

      if (index !== -1) {
        if (reaction.emojiId === null) {
          message.reactions.splice(index, 1)
        } else {
          message.reactions[index] = reaction
        }
      } else if (reaction.emojiId !== null) {
        message.reactions.push(reaction)
      }
    })
  }

  _deleteReactionFromCache(data) {
    runInAction(() => {
      const messages = this._messagesCache.get(data.dialogId)
      if (!messages) return

      const message = messages.find((m) => m.id === data.messageId)
      if (!message || !message.reactions) return

      message.reactions = message.reactions.filter(
        (r) => r.userId !== data.userId
      )
    })
  }

  setCurrentDialog(dialogId) {
    runInAction(() => {
      this._currentDialogId = dialogId
    })
  }

  get messages() {
    if (!this._currentDialogId) return []
    return this._messagesCache.get(this._currentDialogId) || []
  }

  get isLoading() {
    return this._loadingDialogs.has(this._currentDialogId)
  }

  async loadMessages(dialogId, userId) {
    if (!dialogId || !userId) return

    if (this._loadingDialogs.has(dialogId)) return

    runInAction(() => {
      this._loadingDialogs.add(dialogId)
      this._currentDialogId = dialogId
    })

    try {
      await readMessageChange(dialogId, userId)
      const messages = await getMessage(dialogId)

      const messagesWithReactions = await Promise.all(
        messages.map(async (msg) => {
          const reactions = await getMessageReaction(msg.id, msg.dialogId)
          return { ...msg, reactions: reactions || [] }
        })
      )

      console.log(messages)

      runInAction(() => {
        const sortedMessages = messagesWithReactions.sort((a, b) => a.id - b.id)
        this._messagesCache.set(dialogId, sortedMessages)
        this._loadingDialogs.delete(dialogId)
      })
    } catch (error) {
      runInAction(() => {
        this._loadingDialogs.delete(dialogId)
      })
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  clearDialogCache(dialogId) {
    runInAction(() => {
      this._messagesCache.delete(dialogId)
    })
  }

  addMessage(message) {
    this._addMessageToCache(message)
  }
}
