import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'
import { getAuthenticatedUserInfo, login, logout, signUp } from '../../services/auth'

export type Credentials = {
  email: string,
  password: string,
  name: string
}

export const loginUser = async (credentials: Credentials) => {
  const user = await login(credentials.email, credentials.password)
  setGlobal({ session: { userInfo: user, isLoggedIn: true } })
  return user
}

export const signUpUser = async (credentials: Credentials) => {
  await signUp(credentials.email, credentials.password, credentials.name)
  return getAuthUserInfo()
}

export const getAuthUserInfo = async () => {
  try {
    const user = await getAuthenticatedUserInfo()
    setGlobal({ session: { userInfo: user, isLoggedIn: true } })
    return user
  } catch (error) {
    Alert.alert('Error', error.message, [])
  }
}

export const logoutUser = async () => {
  try {
    await logout()
    setGlobal({ session: { userInfo: {}, isLoggedIn: false } })
    RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
  } catch (error) {
    Alert.alert('Error', error.message, [])
  }
}
