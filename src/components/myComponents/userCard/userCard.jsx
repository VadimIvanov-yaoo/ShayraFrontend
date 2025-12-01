import React, { useContext } from 'react'
import styles from './userCard.module.scss'
import Avatar from '../Avatar/Avatar'
import { Context } from '../../../main'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const UserCard = ({ mateAvatar, mateName, create }) => {
  return (
    <div onPointerDown={create} onClick={create} className={styles.userCard}>
      <div className={styles.cardContent}>
        <Avatar source={getAvatarSrc(mateAvatar)} h="42px" w="42px" />
        <span className={styles.userName}>{mateName}</span>
      </div>
    </div>
  )
}

export default UserCard
