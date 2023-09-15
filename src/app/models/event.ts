
// export interface IEvents {
//     vkPost: string
//     vkIdPost: string
// }
export interface IEvent {
    id:number
    name: string
    sponsor: string
    description: string
    address: string
    location: any[]
    latitude: number
    longitude: number
    favorites_users_exists?:boolean
    liked_users_exists?:boolean
    type?: number
    status?: number
    files?: any[]
    types?: any[]
    likes?: any
    price?: string
    materials?: string
    dateStart: Date
    dateEnd: Date
    date_start: Date
    date_end: Date
    vk_group_id?:number
    vk_post_id?:number
    comments?:any
}