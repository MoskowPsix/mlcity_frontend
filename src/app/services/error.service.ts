import {Injectable} from '@angular/core'
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  error: string = ''

  constructor () {

  }

  gettError(){
    return this.error
  }

  setError(error: string){
    this.error = error
  }
  
  clearError(){
    this.error = ''
  }
}
