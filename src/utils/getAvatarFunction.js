import { DEFAULT_AVATAR } from './image'

export const getAvatarSrc = (avatarUrl) => {
  if (!avatarUrl) return DEFAULT_AVATAR
  const isDefault = avatarUrl.includes('/')
  return isDefault ? avatarUrl : import.meta.env.VITE_API_URL + avatarUrl
}
