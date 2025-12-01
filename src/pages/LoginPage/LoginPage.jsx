import React, { useContext, useState } from 'react'
import Input, {
  Flex,
  Container,
  Text,
} from '../../components/UI/uiKit/uiKits.jsx'
import clsx from 'clsx'
import Button from '../../components/myComponents/Button/Button.jsx'
import logo from '../../assets/images/logo2SM.png'
import { login, registration } from '../../http/userApi'
import { observer } from 'mobx-react'
import { Context } from '../../main'
import { useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { MAIN_ROUTE } from '../../utils/consts'
import styles from './LoginPage.module.scss'
import { FormLogin } from './LoginValidation'
import { zodResolver } from '@hookform/resolvers/zod'

const LoginPage = observer(() => {
  const { user } = useContext(Context)
  const navigate = useNavigate()
  const [isAuth, setIsAuth] = useState(true)
  const [invalidData, setInvalidData] = useState(false)

  const form = useForm({
    resolver: zodResolver(FormLogin),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data) {
    const { email, password } = data
    let s = email.split('@')
    console.log(s[1])

    setInvalidData(false)

    try {
      let result
      if (isAuth) {
        result = await login(email, password)
      } else {
        result = await registration(email, password)
      }

      user.setUser(result)
      user.setIsAuth(true)
      navigate(MAIN_ROUTE)
    } catch (e) {
      setInvalidData(true)
      alert(e.response?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <Container>
      <Flex
        column
        alignCenter
        justifyCenter
        gap="medium"
        className={styles.wrapper}
      >
        <img className={styles.logo} src={logo} alt="logo" />

        <Text as="h1" className={clsx('fw-bold', styles.title)}>
          Shayra
        </Text>

        <Text opacity={0.6} className={styles.subtitle}>
          {isAuth
            ? 'Авторизуйтесь, чтобы использовать приложение'
            : 'Создайте аккаунт, чтобы начать'}
        </Text>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className={styles.form}
        >
          <Controller
            control={form.control}
            name="email"
            render={({ field }) => (
              <Input
                className={styles.input}
                id="email"
                label="Email"
                type="email"
                {...field}
              />
            )}
          />
          {form.formState.errors.email && (
            <p className={styles.error}>
              {form.formState.errors.email.message}
            </p>
          )}

          <Controller
            control={form.control}
            name="password"
            render={({ field }) => (
              <Input
                className={styles.input}
                id="password"
                label="Password"
                type="password"
                {...field}
              />
            )}
          />
          {form.formState.errors.password && (
            <p className={styles.error}>
              {form.formState.errors.password.message}
            </p>
          )}

          {/* AUTH SWITCH */}
          <Flex gap="small" className={styles.switchAuth}>
            {isAuth ? (
              <>
                <span>Нет аккаунта?</span>
                <span className={styles.link} onClick={() => setIsAuth(false)}>
                  Создать аккаунт
                </span>
              </>
            ) : (
              <>
                <span>Уже есть аккаунт?</span>
                <span className={styles.link} onClick={() => setIsAuth(true)}>
                  Войти
                </span>
              </>
            )}
          </Flex>

          <Button
            style={{ width: '100%', borderRadius: '0.4rem' }}
            color="blue"
            padding="paddingLarge"
            type="submit"
          >
            {isAuth ? 'Вход' : 'Зарегистрироваться'}
          </Button>
        </form>
      </Flex>
    </Container>
  )
})

export default LoginPage
