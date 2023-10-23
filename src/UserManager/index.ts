import { readFileSync } from 'node:fs'
import path, { resolve } from 'node:path'

interface IUser {
  uuid: string
  username: string
  password: string
  isBan: boolean
}

interface UserData {
  users: Array<IUser>
}

class UserManager {
  static userData: UserData

  static read(): void {
    try {
      UserManager.userData = JSON.parse(readFileSync(path.join(resolve(), 'data', 'user', 'users.json')).toString())
    } catch (error) {
      UserManager.userData = {
        users: []
      }
    }
  }

  static login(username: string, password: string): IUser | null {
    UserManager.read()

    const user = UserManager.userData.users.find((u) => u.username === username)

    if (user) {
      if (user.username === username && user.password === password) {
        return user
      }
    }

    return null
  }
}

export type { IUser, UserData }
export { UserManager }
