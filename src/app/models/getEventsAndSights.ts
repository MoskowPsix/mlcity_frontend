export interface IGetEventsAndSights {
  pagination?: boolean // Если не отправлять, выведутся все ивенты
  page?: string // если не отправлять, то будет 1-я страница по умолчанию
  limit?: number // кол-во записей на страницу - по умолчанию 6
  userId?: number
  favoriteUser?: boolean // если надо узнать есть ли ивент у переданного юзера в избранном. Отправляется совместоно с userId
  likedUser?: boolean // если надо узнать лайкал ли юзер ивент. Отправляется совместоно с userId
  statuses?: string // какой статус(ы) выводить (смотри enums - statuses.ts)
  statusLast?: boolean // Выведет только последний статус определнного типа
  locationId?: number // ID региона, района или города
  location?: any[]
  latitude?: number // широта геопозиции
  longitude?: number // долгота геопозиции
  searchText?: string
  forEventPage?: boolean // для отправки координат для страницы мероприятия
  dateStart?: string // дата начала события / места - отправляется совместно с dateEnd
  dateEnd?: string // дата окончания события / места - отправляется совместно с dateStart
  eventTypes?: string // массив типвов событий
  sightTypes?: string // массив типвов мест
  radius?: number // радиус круга в котором выводить ивент / места
  eventIds?: string
  sightIds?: string
  orderBy?: string
  desc?: boolean
  columns?: string
  withFiles?: boolean
  withPrices?: boolean
  expired?: boolean //вместе с прошедшими ивентами
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
