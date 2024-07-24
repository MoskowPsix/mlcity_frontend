import { FileType } from './file-type'

export interface File {
  id: number
  name: string
  link: string
  local: number
  event_id: number
  created_at: Date
  updated_at: Date
  file_types: FileType[]
}
