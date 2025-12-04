import { makeAutoObservable, observable, runInAction } from 'mobx'

export default class CurrentChat {
  _currentChatId = null
  _currentChatData = null
  _isChatVisible = false
  _isSidebarOpen = false

  constructor() {
    makeAutoObservable(this, {
      _currentChatId: observable,
      _currentChatData: observable,
      _isChatVisible: observable,
      _isSidebarOpen: observable,
    })
  }

  setCurrentChat(chatId, chatData = null) {
    runInAction(() => {
      this._currentChatId = chatId
      this._currentChatData = chatData
      this._isChatVisible = true
    })
  }

  toggleSidebar() {
    runInAction(() => {
      this._isSidebarOpen = !this._isSidebarOpen
    })
  }

  closeChat() {
    runInAction(() => {
      this._isChatVisible = false
      this._isSidebarOpen = false
    })
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
