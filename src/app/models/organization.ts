import { IUser } from './user'

export interface IOrganization {
  id?: number
  name?: string
  types?: string
  avatar?: string
  files?: any
  afisha7_id: number
  location_id?: number
  inn?: number
  ogrn?: number
  kpp?: number
  user_id?: number
  number?: number
  description?: string
  user?: IUser
  users?: IUser[]
  vk_post_id:number,
  vk_group_id:number
}
