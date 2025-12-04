import React, { useContext, useState } from 'react'
import { Image } from 'react-bootstrap'
import styles from './AvatarUploader.module.scss'
import { DEFAULT_AVATAR } from '../../../utils/image'
import { Context } from '../../../main'
import { updateProfile, uploadImage } from '../../../http/userApi'
import socket from '../../../Websoket/socket'
import { getAvatarSrc } from '../../../utils/getAvatarFunction'

const AvatarUploader = ({ avatarUrl, fileInputRef, setAvatarUrl }) => {
  const { user } = useContext(Context)
  const [avatar, setAvatar] = useState(null)
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await uploadImage(formData)
      const filePath = response.filePath
      setAvatar(filePath)
      const data = await updateProfile(null, filePath)
      setAvatarUrl(data.avatarUrl)
    } catch (e) {
      console.error('Ошибка при загрузке аватара:', e)
    }
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  console.log(getAvatarSrc(user.user.avatarUrl))

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarBox} onClick={handleClick}>
        <Image
          src={ import.meta.env.VITE_API_URL + avatar || getAvatarSrc(user.user.avatarUrl)}
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
