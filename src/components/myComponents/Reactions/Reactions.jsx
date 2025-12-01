import React from 'react'
import styles from './Reactions.module.scss'
import Avatar from '../Avatar/Avatar'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const Reactions = ({ onTouchStart, url, onClick, sender }) => {
  return (
    <span
      onTouchStart={onTouchStart}
      onClick={onClick}
      className={styles.reaction}
    >
      <img src={url} alt="reaction" className={styles.reactionImg} />

      <Avatar
        style={{ borderRadius: '50%' }}
        h="22px"
        w="22px"
        source={getAvatarSrc(sender)}
      />
    </span>
  )
}

export default Reactions
