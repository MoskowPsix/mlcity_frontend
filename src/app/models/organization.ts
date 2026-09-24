import { IUser } from './user'

export interface IOrganization {
  id?: number
  name?: string
  types?: any
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
  /** Есть привязанные устройства хронометража mototrack (для sight-карточек) */
  has_mototrack?: boolean
}
