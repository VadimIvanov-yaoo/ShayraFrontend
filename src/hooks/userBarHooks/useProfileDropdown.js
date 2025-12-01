import { useContext, useRef, useState } from 'react'
import { Context } from '../../main'

export const useProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [show, setShow] = useState(false)
  const dropdownRef = useRef(null)
  const { user } = useContext(Context)

  const toggleDropdown = () => setIsOpen(!isOpen)
  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  const [name, setName] = useState(user.user.userName)

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false)
    }
  }

  return {
    isOpen,
    toggleDropdown,
    dropdownRef,
    show,
    handleShow,
    handleClose,
    name,
    setName,
    handleClickOutside,
  }
}
