
// export interface IEvents {
//     vkPost: string
//     vkIdPost: string
// }
export interface IEvents {
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
}