import { makeAutoObservable, observable, runInAction } from 'mobx'

export default class ReactionMessageStore {
  _reaction = {}

  constructor() {
    makeAutoObservable(this, {
      _reaction: observable,
    })
  }

  setReaction(reaction) {
    runInAction(() => {
      this._reaction = reaction
    })
  }
}
