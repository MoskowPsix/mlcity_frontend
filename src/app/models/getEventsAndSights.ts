export interface IGetEventsAndSights {
    pagination?: boolean, // Если не отправлять, выведутся все ивенты
    page?: number, // если не отправлять, то будет 1-я страница по умолчанию
    limit?: number // кол-во записей на страницу - по умолчанию 6
    userId?: number
    favoriteUser?: boolean // если надо узнать есть ли ивент у переданного юзера в избранном. Отправляется совместоно с userId
    likedUser?: boolean // если надо узнать лайкал ли юзер ивент. Отправляется совместоно с userId
    statuses?: string  // какой статус(ы) выводить (смотри enums - statuses.ts)
    statusLast?: boolean // Выведет только последний статус определнного типа
    city?: string
    region?: string // ОБласть - нужно передавать чтобы узнать точный город (Заречный есть и в пензе и в екб)
    latitudeBounds?: string // границы широты массив типа [50.84330000000000,70.84330000000000]
    longitudeBounds?: string // границы долготы массив типа [50.84330000000000,70.84330000000000]
    searchText?: string
    forEventPage?: boolean // для отправки координат для страницы мероприятия
    dateStart?: string // дата начала события / места - отправляется совместно с dateEnd
    dateEnd?: string // дата окончания события / места - отправляется совместно с dateStart
    eventTypes?: string // массив типвов событий 
    sightTypes?: string // массив типвов мест
}

//Пример
// let queryParams = {
    //   pagination: true,
    //   page: 1,
    //   limit: 50
    //   userId: this.userId,
    //   favoriteUser: true,
    //   likedUser: true,
    //   statuses: [Statuses.moderation, Statuses.publish].join(','),
    //   statusLast: true,
    //   city: this.city,
    //   latitude: [50.84330000000000,70.84330000000000].join(','),
    //   longitude:[50.84330000000000,70.84330000000000].join(',')
    //   longitude:[50.84330000000000,70.84330000000000].join(',')
    //   searchText: 'ghbdtn'
    // } 