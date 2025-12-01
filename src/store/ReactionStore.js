import { makeAutoObservable, reaction } from 'mobx'

export default class ReactionMessageStore {
  constructor() {
    this._reaction = {}
    makeAutoObservable(this)
  }

  setReaction(reaction) {
    this._reaction = reaction
  }
}
