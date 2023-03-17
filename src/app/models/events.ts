
// export interface IEvents {
//     vkPost: string
//     vkIdPost: string
// }
export interface IEvents {
    id:number
    name: string
    sponsor: string
    description: string
    address: string
    coords: number[]
    type?: number
    status?: number
    files?: any[]
    price?: string
    materials?: string
    dateStart: Date
    dateEnd: Date
    date_start: Date
    date_end: Date
    vk_post_id?:number
}