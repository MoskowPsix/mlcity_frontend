import { IFileType } from './file_type'

export interface IFile {
  id: number
  name: string
  link: string
  local: number
  event_id: number
  created_at: Date
  updated_at: Date
  file_types: IFileType[]
}
