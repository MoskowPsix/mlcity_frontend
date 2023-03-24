export interface IGetEvents {
    pagination?: boolean, // Если не отправлять, выведутся все ивенты
    page?: number, // если не отправлять, то будет 1 страница по умолчанию
    userId?: number
    favoriteUser?: boolean // если надо узнать есть ли ивент у переданного юзера в избранном. Отправляется совместоно с userId
    likedUser?: boolean // если надо узнать лайкал ли юзер ивент. Отправляется совместоно с userId
    statuses?: string  // какой статус(ы) выводить (смотри enums - statuses.ts)
    statusLast?: boolean // Выведет только последний статус определнного типа
    city?: string
    latitude?: string // широта массив типа [50.84330000000000,70.84330000000000]
    longitude?: string // долгота массив типа [50.84330000000000,70.84330000000000]
}

//Пример
// let queryParams = {
    //   pagination: true,
    //   page: 1,
    //   userId: this.userId,
    //   favoriteUser: true,
    //   likedUser: true,
    //   statuses: [Statuses.moderation, Statuses.publish].join(','),
    //   statusLast: true,
    //   city: this.city,
    //   latitude: [50.84330000000000,70.84330000000000].join(','),
    //   longitude:[50.84330000000000,70.84330000000000].join(',')
    // } 