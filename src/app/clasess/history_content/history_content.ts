import { IEvent } from 'src/app/models/event'
import { IEventType } from 'src/app/models/event-type'
import { IFile } from 'src/app/models/file'
import { IPrice } from 'src/app/models/price'
import { ISight } from 'src/app/models/sight'
import { ISightType } from 'src/app/models/sight-type'

export class HistoryContent {
  origin!: any
  edited!: any
  name!: string
  description!: string
  materials!: string
  sponsor!: string
  files!: IFile[]
  types!: ISightType[] | IEventType[]
  prices!: IPrice[]

  compareAttributes(orig: any, edit: any): boolean {
    if (orig === edit) {
      return true
    }
    return false
  }
}
