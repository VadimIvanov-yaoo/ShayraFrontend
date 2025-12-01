import { action, makeAutoObservable } from 'mobx'
import { checkBlockedChat, deleteChat, getChats } from '../http/userApi'

export default class ChatsStore {
  _chats = []
  _loading = false
  selectedChatId = null
  isBlockedChat = false

  constructor() {
    makeAutoObservable(this, {
      handleDeleteChat: action,
    })
  }

  setChats(chats) {
    this._chats = chats.map((chat) => ({
      id: chat.dialogId,
      chatName: chat.chatName,
      avatarUrl: chat.participantAvatar,
      otherId: chat.otherId,
      status: chat.status,
    }))
  }

  setCurrentChat(id) {
    this.selectedChatId = id
  }

  get chats() {
    return this._chats
  }

  get currentChat() {
    return this.chats.find((c) => c.id === this.selectedChatId) || null
  }

  async handleDeleteChat(chatId) {
    try {
      const deleteDialog = await deleteChat(chatId)
      console.log('Чат удален', chatId)
      window.location.reload()
    } catch (e) {
      console.log(e, 'Чат не удален')
    }
  }

  async loadChats() {
    this._loading = true
    try {
      const data = await getChats()
      this.setChats(data)
    } catch (e) {
      console.error('Ошибка загрузки чатов', e)
    } finally {
      this._loading = false
      setTimeout(() => this.loadChats(), 2700)
    }
  }
}
