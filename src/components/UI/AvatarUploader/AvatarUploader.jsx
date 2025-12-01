import React, { useContext } from 'react'
import { Image } from 'react-bootstrap'
import styles from './AvatarUploader.module.scss'
import { DEFAULT_AVATAR } from '../../../utils/image'
import { Context } from '../../../main'
import { updateProfile, uploadImage } from '../../../http/userApi'
import socket from '../../../Websoket/socket'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const AvatarUploader = ({ avatarUrl, fileInputRef, setAvatarUrl }) => {
  const { user } = useContext(Context)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      const imageUrl = await uploadImage(formData)
      const filePath = imageUrl.filePath

      const data = await updateProfile(null, filePath)
      setAvatarUrl(data.avatarUrl)
    }
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarBox} onClick={handleClick}>
        <Image
          src={getAvatarSrc(user.user.avatarUrl)}
          className={styles.avatarImg}
          alt="avatar"
          fluid
        />
        <div className={styles.uploadOverlay}>Загрузить</div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
    </div>
  )
}

export default AvatarUploader
