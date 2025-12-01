import React from 'react'
import styles from './SmallBtn.module.scss'

const SmallBtn = ({ url, onClick }) => {
  return (
    <button onClick={onClick} className={styles.btn}>
      <img src={url} alt="btn Image" />
    </button>
  )
}

export default SmallBtn
