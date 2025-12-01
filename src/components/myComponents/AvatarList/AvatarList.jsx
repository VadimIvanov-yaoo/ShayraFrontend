import React from 'react'
import styles from './AvatarList.module.scss'
import Avatar from '../Avatar/Avatar'
import { KID_AVATAR, MAN_AVATAR, WOMAN_AVATAR } from '../../../utils/image'

const AvatarList = ({ setAvatarUrl, avatarUrl }) => {
  const avatarsData = [
    {
      id: 1,
      url: MAN_AVATAR,
    },
    {
      id: 2,
      url: KID_AVATAR,
    },
    {
      id: 3,
      url: WOMAN_AVATAR,
    },
  ]

  function handleSelect(id, url) {
    setAvatarUrl(url)
  }
  return (
    <div className={styles.avatarWrapper}>
      {avatarsData.map(({ id, url }) => (
        <button
          key={id}
          onClick={() => handleSelect(id, url)}
          className={styles.btn}
        >
          <Avatar
            className={`${styles.btn} ${avatarUrl === url ? styles.active : ''}`}
            source={url}
            w="128px"
            h="128px"
          />
        </button>
      ))}
    </div>
  )
}

export default AvatarList
