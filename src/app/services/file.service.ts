import { Injectable } from '@angular/core'
import { IFile } from '../models/file'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}
  backendUrl: string = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}`
  checkLinkFile(file: IFile): string {
    if (file && file.link.includes('https')) {
      return file.link
    } else {
      return `${this.backendUrl}${file.link}`
    }
  }
}
