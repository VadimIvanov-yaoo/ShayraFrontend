// import { action, makeAutoObservable } from 'mobx'
// import { checkBlockedChat, deleteChat, getChats } from '../http/userApi'
//
// export default class ChatsStore {
//   _chats = []
//   _loading = false
//   selectedChatId = null
//   isBlockedChat = false
//
//   constructor() {
//     makeAutoObservable(this, {
//       handleDeleteChat: action,
//     })
//   }
//
//   setChats(chats) {
//     this._chats = chats.map((chat) => ({
//       id: chat.dialogId,
//       chatName: chat.chatName,
//       avatarUrl: chat.participantAvatar,
//       otherId: chat.otherId,
//       status: chat.status,
//     }))
//   }
//
//   setCurrentChat(id) {
//     this.selectedChatId = id
//   }
//
//   get chats() {
//     return this._chats
//   }
//
//   get currentChat() {
//     return this.chats.find((c) => c.id === this.selectedChatId) || null
//   }
//
//   async handleDeleteChat(chatId) {
//     try {
//       const deleteDialog = await deleteChat(chatId)
//       console.log('Чат удален', chatId)
//       window.location.reload()
//     } catch (e) {
//       console.log(e, 'Чат не удален')
//     }
//   }
//
//   async loadChats() {
//     this._loading = true
//     try {
//       const data = await getChats()
//       this.setChats(data)
//     } catch (e) {
//       console.error('Ошибка загрузки чатов', e)
//     } finally {
//       this._loading = false
//       setTimeout(() => this.loadChats(), 2700)
//     }
//   }
// }


import { action, makeAutoObservable, runInAction } from 'mobx'
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
    const map = new Map(this._chats.map((c) => [c.id, c]))
    chats.forEach((chat) => {
      const chatData = {
        id: chat.dialogId,
        chatName: chat.chatName,
        avatarUrl: chat.participantAvatar,
        otherId: chat.otherId,
        status: chat.status,
      }
      map.set(chatData.id, chatData)
    })
    this._chats = Array.from(map.values())
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
      await deleteChat(chatId)
      runInAction(() => {
        this._chats = this._chats.filter((c) => c.id !== chatId)
        if (this.selectedChatId === chatId) this.selectedChatId = null
      })
      window.location.reload()
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
      setTimeout(() => this.loadChats(), 2700)
    }
  }
}
