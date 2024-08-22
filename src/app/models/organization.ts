import { IUser } from './user'

export interface IOrganization {
  id?: number
  name?: string
  avatar?: string
  inn?: number
  ogrn?: number
  kpp?: number
  user_id?: number
  number?: number
  description?: string
  user?: IUser
  users?: IUser[]
}
