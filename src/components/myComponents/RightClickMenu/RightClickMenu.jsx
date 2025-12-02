  import React from 'react'
  import ListGroup from 'react-bootstrap/ListGroup'
  import styles from './RightClickMenu.module.scss'
  import { CLOWN, HAND_UP, HEART } from '../../../utils/image'
  import clsx from 'clsx'

  const RightClickMenu = ({
    setReaction,
    isOwnMessage,
    drop,
    messageId,
    handleCopy,
  }) => {
    const emojiData = [
      {
        id: 1,
        url: HEART,
      },

      {
        id: 2,
        url: HAND_UP,
      },

      {
        id: 3,
        url: CLOWN,
      },
    ]

    return (
      <ListGroup>
        <ListGroup.Item style={{ fontSize: '14px' }}>
          <div className={styles.emojiWrapper}>
            {emojiData.map((item, index) => (
              <button
                className={styles.emoji}
                onClick={() => setReaction(messageId, item.id)}
                id={item.id}
                key={index}
              >
                <img src={item.url} alt="" />
              </button>
            ))}
          </div>
        </ListGroup.Item>

        {isOwnMessage && (
          <ListGroup.Item className={clsx(styles.groupItem)}>
            Переслать
          </ListGroup.Item>
        )}
        <ListGroup.Item onClick={handleCopy} className={clsx(styles.groupItem)}>
          Скопировать
        </ListGroup.Item>
        {isOwnMessage && (
          <ListGroup.Item
            className={clsx(styles.groupItem, styles.deleteItem)}
            onClick={() => drop(messageId)}
          >
            Удалить
          </ListGroup.Item>
        )}
      </ListGroup>
    )
  }

  export default RightClickMenu
