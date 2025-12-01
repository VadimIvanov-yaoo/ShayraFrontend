import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Toast from 'react-bootstrap/Toast'
import { ToastContainer } from 'react-bootstrap'
function ContextualExample({
  toastTitle,
  toastDescription,
  variant,
  show,
  setShow,
}) {
  return (
    <Row>
      <Col xs={6}>
        <ToastContainer position="bottom-end">
          <Toast
            bg={variant.toLowerCase()}
            onClose={() => setShow(false)}
            show={show}
            // position="top-end"
            delay={3000}
            autohide
          >
            <Toast.Header style={{ background: '#28a745' }}>
              <strong className="me-auto">{toastTitle}</strong>
            </Toast.Header>
            <Toast.Body style={{ background: '#d4edda' }}>
              {toastDescription}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Col>
    </Row>
  )
}

export default ContextualExample
