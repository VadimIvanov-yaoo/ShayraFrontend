import { z } from 'zod'

const domainsEmail = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'mail.ru',
  'yandex.ru',
  'bk.ru',
  'inbox.ru',
  'proton.me',
]

export const FormLogin = z.object({
  email: z
    .string()
    .trim()
    .min(1, {
      message: 'Email обязателен к заполнению',
    })
    .max(200, {
      message: 'Максимальная длина Email - 200 символов',
    })
    .email('Некорректная почта')
    .refine(
      (emailStr) => {
        const domain = domainsEmail.some(
          (email) => emailStr.split('@')[1] === email.toLowerCase()
        )
        return domain
      },
      { message: 'Недопустимый домен почты' }
    ),

  password: z.string().trim().min(6, {
    message: 'Минимальная длинна пароля 6 символов',
  }),
})
