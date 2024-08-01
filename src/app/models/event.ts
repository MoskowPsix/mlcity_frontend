// export interface IEvents {
//     vkPost: string
//     vkIdPost: string

import { IPlace } from './place'

// }
export interface IEvent {
  id: number
  name: string
  sponsor: string
  description: string
  address: string
  statuses?: any[]
  files?: any[]
  types?: any[]
  likes?: any
  price?: any
  materials?: string
  date_start: Date
  date_end: Date
  vk_group_id?: number
  vk_post_id?: number
  comments?: any
}
