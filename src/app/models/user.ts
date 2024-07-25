export interface IUser {
  id: number
  name: string
  email: string
  password?: string
  email_verified_at?: string
  token?: string
  avatar: string | null
  roles?: string[]
  location?: any
  locationId?: number
  social_account?: {}
}
