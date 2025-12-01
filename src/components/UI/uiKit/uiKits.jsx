import React, { useState } from 'react'
import clsx from 'clsx'
import styles from './ui.module.scss'

export const Flex = ({
  children,
  className,
  column,
  alignCenter,
  justifyCenter,
  justifyBetween,
  justifyAround,
  alignEnd,
  gap,
  style,
  ...props
}) => {
  return (
    <div
      style={style}
      className={clsx(
        column ? styles.flexColumn : styles.flex,
        alignCenter && styles.alignCenter,
        alignEnd && styles.alignEnd,
        justifyCenter && styles.justifyCenter,
        justifyBetween && styles.justifyBetween,
        justifyAround && styles.justifyAround,
        gap === 'small' && styles.gapSmall,
        gap === 'medium' && styles.gapMedium,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const Container = ({ children, className, ...props }) => {
  return (
    <div className={clsx(styles.container, className)} {...props}>
      {children}
    </div>
  )
}

const Input = ({
  label,
  style,
  placeholder,
  value,
  onChange,
  type = 'text',
  id,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={styles.inputWrapper}>
      <input
        style={style}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(styles.input, (isFocused || value) && styles.filled)}
        placeholder={placeholder}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  )
}
export default Input

export const Text = ({ style, children, as = 'span', className, ...props }) => {
  const Tag = as
  return (
    <Tag style={style} className={clsx(styles.text, className)} {...props}>
      {children}
    </Tag>
  )
}

export const Section = ({ url, children, ...props }) => {
  return <section className={clsx(styles.section)}> {children}</section>
}
