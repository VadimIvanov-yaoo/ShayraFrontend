import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'

function ModalWindow({ show, handleClose, header, body, footer }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>{header}</Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>{footer}</Modal.Footer>
    </Modal>
  )
}

export default ModalWindow
