import { makeAutoObservable } from 'mobx'

export default class CurrentChat {
  constructor() {
    this._currentChatId = null
    this._currentChatData = null
    this._isChatVisible = false
    this._isSidebarOpen = false

    makeAutoObservable(this)
  }

  setCurrentChat(chatId, chatData = null) {
    this._currentChatId = chatId
    this._currentChatData = chatData
    this._isChatVisible = true
  }

  toggleSidebar() {
    this._isSidebarOpen = !this._isSidebarOpen
    console.log(this.isSidebarOpen)
  }
  closeChat() {
    this._isChatVisible = false
    this._isSidebarOpen = false
  }

  get currentChatId() {
    return this._currentChatId
  }
  get currentChatData() {
    return this._currentChatData
  }

  get isChatVisible() {
    return this._isChatVisible
  }

  get isSidebarOpen() {
    return this._isSidebarOpen
  }
}
