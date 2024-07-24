import { IEvent } from 'src/app/models/event'
import { IEventType } from 'src/app/models/event-type'
import { File } from 'src/app/models/file'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'

export class HistoryContent {
  origin!: IEvent | ISight
  edited!: IEvent | ISight
  name!: string
  description!: string
  materials!: string
  sponsor!: string
  files!: File[]
  types!: ISightType[] | IEventType
  prices!: 
}
