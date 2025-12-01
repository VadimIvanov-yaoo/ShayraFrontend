import ChatLayout from '../pages/ChatLayout/ChatLayout.jsx'
import LoginPage from '../pages/LoginPage/LoginPage.jsx'

import { LOGIN_ROUTE, MAIN_ROUTE, REGISTRATION_ROUTE } from '../utils/consts.js'

export const authRouts = [{ path: MAIN_ROUTE, Component: ChatLayout }]

export const publicRouts = [{ path: LOGIN_ROUTE, Component: LoginPage }]
