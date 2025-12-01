import React from 'react'
import styles from './Avatar.module.scss'
import clsx from 'clsx'
import { DEFAULT_AVATAR } from '../../../utils/image'

const Avatar = ({ className, source, w, h, ...props }) => {
  return (
    <img
      height={h}
      width={w}
      className={clsx(className, styles.avatar)}
      src={source ? source : DEFAULT_AVATAR}
      alt="Avatar"
      {...props}
    />
  )
}

export default Avatar
