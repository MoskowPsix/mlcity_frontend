export interface IUser {
  id: number
  name: string
  email: string
  checkpoint_access?: boolean
  checkpoint_publish_override?: boolean
  checkpoint_shared?: boolean
  password?: string
  email_verified_at?: string
  token?: string
  avatar: string | null
  rfid_tag_number?: string | null
  roles?: string[]
  location?: any
  locationId?: number
  social_account?: {}
}
