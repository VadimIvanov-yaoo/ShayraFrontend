import { action, makeAutoObservable, observable, runInAction } from 'mobx'

export default class UserStore {
  _isAuth = false
  _user = {}
  _socket = null

  constructor() {
    makeAutoObservable(this, {
      _isAuth: observable,
      _user: observable,
      setSocket: action,
      updateUserStatus: action,
      updateUserAvatar: action,
    })
  }

  setSocket(socket) {
    this._socket = socket
  }

  setIsAuth(bool) {
    runInAction(() => {
      this._isAuth = bool
    })
  }

  setUser(user) {
    runInAction(() => {
      this._user = user
    })
  }

  updateUserStatus(status) {
    runInAction(() => {
      if (this._user) {
        this._user.status = status
      }
    })
  }

  updateUserAvatar(avatarUrl) {
    runInAction(() => {
      if (this._user) {
        this._user.avatarUrl = avatarUrl
      }
    })
  }

  get isAuth() {
    return this._isAuth
  }

  get user() {
    return this._user
  }
}
