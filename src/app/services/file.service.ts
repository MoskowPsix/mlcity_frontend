import { Injectable } from '@angular/core'
import { IFile } from '../models/file'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`

  /** Абсолютный URL (в т.ч. storage мототрека http://localhost:8000/...) */
  isAbsoluteUrl(link: string | null | undefined): boolean {
    return !!link && /^https?:\/\//i.test(link)
  }

  checkLinkFile(file: IFile): string {
    if (file && this.isAbsoluteUrl(file.link)) {
      return file.link
    } else {
      return `${this.backendUrl}${file.link}`
    }
  }
  checkLinkString(string: string): string {
    if (this.isAbsoluteUrl(string)) {
      return string
    } else {
      return `${this.backendUrl}${string}`
    }
  }
}
