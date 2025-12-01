import { $host, $authHost } from './index.js'
import { jwtDecode } from 'jwt-decode'

let date = new Date()

export const registration = async (email, password) => {
  const { data } = await $host.post('api/user/registration', {
    email,
    password,
  })
  localStorage.setItem('token', data.token)
  return jwtDecode(data.token)
}

export const login = async (email, password) => {
  const { data } = await $host.post('api/user/login', {
    email,
    password,
  })
  localStorage.setItem('token', data.token)
  if (!document.cookie) document.cookie = `visitedDate=${date}, path=/`
  return jwtDecode(data.token)
}
export const check = async () => {
  const { data } = await $authHost.get('api/user/auth')
  return data
}

export const updateProfile = async (userName, avatarUrl) => {
  console.log(userName, avatarUrl, 'Это даннеы')
  const { data } = await $authHost.put('api/user/profile', {
    userName,
    avatarUrl,
  })
  return data
}

export const getChats = async () => {
  const { data } = await $authHost.get('api/chat/getChats')
  return data
}

export const searchUser = async (userName) => {
  const { data } = await $authHost.get('api/user/search', {
    params: { userName },
  })
  return data
}

export const createChat = async (userId1, userId2) => {
  const { data } = await $authHost.post('api/chat/newChat', {
    userId1,
    userId2,
  })
  return data
}

export const getMessage = async (dialogId) => {
  const { data } = await $authHost.get('api/chat/getMessage', {
    params: { dialogId },
  })
  return data
}

export const uploadImage = async (formData) => {
  const { data } = await $authHost.post('api/chat/uploadImage', formData)
  return data
}

export const getPartnerInfo = async (id) => {
  const { data } = await $authHost.get('api/chat/partner', {
    params: { id },
  })
  return data
}

export const getLastedMessage = async (chatIds) => {
  const { data } = await $authHost.post('api/chat/lastedMessage', chatIds)
  return data
}

export const getInfoUsers = async (chatIds) => {
  const { data } = await $authHost.post('api/user/getUsersInfo', chatIds)
  return data
}

export const deleteMessage = async (messageId) => {
  const { data } = await $authHost.delete('api/chat/deleteMessage', {
    data: { id: messageId },
  })
  return data
}

export const readMessageChange = async (dialogId, userId) => {
  const { data } = await $authHost.put('api/chat/readMessage', {
    dialogId,
    userId,
  })
  return data
}

export const getMessageReaction = async (messageId, dialogId) => {
  const { data } = await $authHost.get('api/chat/getReaction', {
    params: {
      messageId,
      dialogId,
    },
  })
  return data
}

export const deleteChat = async (chatId) => {
  const { data } = await $authHost.delete('api/chat/deleteChat', {
    data: { chatId: chatId },
  })
  return data
}

export const blockedChat = async (dialogId, userId) => {
  const { data } = await $authHost.post('api/chat/blockedChat', {
    dialogId,
    userId,
  })

  return data
}

export const unBlockChat = async (dialogId, userId) => {
  const { data } = await $authHost.delete('api/chat/unBlockChat', {
    data: { dialogId: dialogId, userId: userId },
  })
  return data
}

export const checkBlockedChat = async (dialogId, userId) => {
  console.log(dialogId, userId, 'Данные пришли')
  const { data } = await $authHost.post('api/chat/checkBlocked', {
    dialogId,
    userId,
  })

  return data
}
