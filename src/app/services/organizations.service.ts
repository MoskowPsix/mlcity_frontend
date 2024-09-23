import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UserService } from './user.service'
import { IUser } from '../models/user'
@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  constructor(
    private http: HttpClient,
   
  ) {}
 
}
