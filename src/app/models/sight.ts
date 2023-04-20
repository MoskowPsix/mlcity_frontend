
// export interface IEvents {
//     vkPost: string
//     vkIdPost: string
// }
export interface ISight {
    id:number
    name: string
    sponsor: string
    description: string
    address: string
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
    vk_group_id?:number
    vk_post_id?:number
}