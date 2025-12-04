import { action, makeAutoObservable, observable, runInAction } from 'mobx'
import { checkBlockedChat, deleteChat, getChats } from '../http/userApi'

export default class ChatsStore {
  _chats = []
  _loading = false
  selectedChatId = null
  isBlockedChat = false
  _socket = null

  constructor() {
    makeAutoObservable(this, {
      _chats: observable,
      _loading: observable,
      selectedChatId: observable,
      isBlockedChat: observable,
      handleDeleteChat: action,
      setSocket: action,
      updateChatStatus: action,
      updateChatAvatar: action,
      addNewChat: action,
      refreshChats: action,
      removeChat: action,
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

    this._socket.on('statusChange', (data) => {
      runInAction(() => {
        this._chats.forEach((chat) => {
          if (chat.otherId === data.userId) {
            chat.status = data.status
          }
        })
      })
    })

    this._socket.on('blockedChatResponse', (data) => {
      if (data.dialogId && this.selectedChatId === data.dialogId) {
        runInAction(() => {
          this.isBlockedChat = data.blocked
        })
      }
    })

    this._socket.on('unBlockedChatResponse', (data) => {
      if (data.dialogId && this.selectedChatId === data.dialogId) {
        runInAction(() => {
          this.isBlockedChat = data.blocked
        })
      }
    })

    this._socket.on('chatCreated', (chatData) => {
      runInAction(() => {
        const exists = this._chats.some((c) => c.id === chatData.id)
        if (!exists) {
          this._chats.push({
            id: chatData.id,
            chatName: chatData.chatName,
            avatarUrl: chatData.avatarUrl,
            otherId: chatData.otherId,
            status: chatData.status || 'offline',
          })
        }
      })
    })

    this._socket.on('newChatNotification', (data) => {
      runInAction(() => {
        const exists = this._chats.some((c) => c.id === data.dialogId)
        if (!exists) {
          this._chats.push({
            id: data.dialogId,
            chatName: data.participantName,
            avatarUrl: data.participantAvatar,
            otherId: data.participantId,
            status: data.status || 'offline',
          })
        }
      })
    })

    this._socket.on('chatDeleted', (data) => {
      runInAction(() => {
        this._chats = this._chats.filter((c) => c.id !== data.chatId)
        if (this.selectedChatId === data.chatId) {
          this.selectedChatId = null
        }
      })
    })
  }

  setChats(chats) {
    const map = new Map(this._chats.map((c) => [c.id, c]))
    chats.forEach((chat) => {
      const chatData = {
        id: chat.dialogId,
        chatName: chat.chatName,
        avatarUrl: chat.participantAvatar,
        otherId: chat.participantId,
        status: chat.status,
      }
      map.set(chatData.id, chatData)
    })
    this._chats = Array.from(map.values())
  }

  addNewChat(chatData) {
    const exists = this._chats.some((c) => c.id === chatData.id)
    if (!exists) {
      runInAction(() => {
        this._chats.push({
          id: chatData.id,
          chatName: chatData.chatName || chatData.participantName,
          avatarUrl: chatData.avatarUrl || chatData.participantAvatar || '',
          otherId: chatData.otherId || chatData.participantId,
          status: chatData.status || 'offline',
        })
      })
    }
  }

  removeChat(chatId) {
    runInAction(() => {
      this._chats = this._chats.filter((c) => c.id !== chatId)
      if (this.selectedChatId === chatId) {
        this.selectedChatId = null
      }
    })
  }

  updateChatStatus(chatId, status) {
    const chat = this._chats.find((c) => c.id === chatId)
    if (chat) {
      runInAction(() => {
        chat.status = status
      })
    }
  }

  updateChatAvatar(chatId, avatarUrl) {
    const chat = this._chats.find((c) => c.id === chatId)
    if (chat) {
      runInAction(() => {
        chat.avatarUrl = avatarUrl
      })
    }
  }

  setCurrentChat(id) {
    this.selectedChatId = id
    if (this._socket) {
      this._socket.emit(
        'onlineUser',
        this._chats.find((c) => c.id === id)?.otherId
      )
    }
  }

  get chats() {
    return this._chats
  }

  get currentChat() {
    return this.chats.find((c) => c.id === this.selectedChatId) || null
  }

  async handleDeleteChat(chatId) {
    try {
      await deleteChat(chatId)

      runInAction(() => {
        this._chats = this._chats.filter((c) => c.id !== chatId)
        if (this.selectedChatId === chatId) {
          this.selectedChatId = null
        }
      })

      window.location.reload()

      if (this._socket) {
        this._socket.emit('deleteChat', { chatId })
      }
    } catch (e) {
      console.log(e, 'Чат не удален')
    }
  }

  async loadChats() {
    if (this._loading) return
    this._loading = true
    try {
      const data = await getChats()
      runInAction(() => this.setChats(data))
    } catch (e) {
      console.error('Ошибка загрузки чатов', e)
    } finally {
      this._loading = false
    }
  }

  async refreshChats() {
    await this.loadChats()
  }
}
