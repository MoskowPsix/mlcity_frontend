export interface IUser {
    id: number
    name: string
    email:string
    password?: string
    token?: string
    avatar: string | null
    roles?: string[]
    social_account?: {}
  }