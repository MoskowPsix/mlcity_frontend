import { IUser } from './user'

export interface IOrganisation {
  name: string
  inn?: number
  ogrn?: number
  kpp?: number
  user_id?: number
  number?: number
  description?: string
  user?: IUser
  users?: IUser[]
}
