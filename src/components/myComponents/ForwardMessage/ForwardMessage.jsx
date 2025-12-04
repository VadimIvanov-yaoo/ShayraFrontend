import React from 'react'
import styles from './ForwardMessage.module.scss'

const ForwardMessage = ({ text, originalSenderName, isForwarded }) => {
  if (!isForwarded) return null

  return (
    <div className={styles.forwardedBadge}>
      <div className={styles.topRow}>
        <span className={styles.icon}>↪️</span>
        <span className={styles.sender}>
          Переслано от {originalSenderName || 'Пользователя'}
        </span>
      </div>

      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}

export default ForwardMessage
