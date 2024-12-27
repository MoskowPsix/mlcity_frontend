// export interface IEvents {
//     vkPost: string
//     vkIdPost: string

import { IOrganization } from './organization'

// }
export interface ISight {
  id: number
  name: string
  sponsor: string
  description: string
  address: string
  location: any[]
  latitude: number
  site?: string
  longitude: number
  location_id: number
  type?: number
  phone?: string
  status?: number
  files: any[]
  organization?: IOrganization
  types?: any[]
  likes?: any
  price?: string
  materials?: string
  vk_group_id?: number
  vk_post_id?: number
  comments?: any
  work_time?: any
  user_id?: any
}
