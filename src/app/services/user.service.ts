import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/user';
import { ISocialAccount } from '../models/social-account';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user:  BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(this.getUserFromLocalStorage())
  //private vkGroups: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  // vkGroupPosts: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(private http: HttpClient) { }

  getUser(): Observable<IUser | null> {
    return this.user.asObservable()
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}`)
  } 

  //инфо о методе  https://dev.vk.com/method/groups.get
  //https://api.vk.com/method/groups.get?user_ids=${this.socialAccount.provider_id}&access_token=${this.socialAccount.token}&extended=1&filter=moder
  //moder — ищем группы где юзер является администратором, редактором или модератором
  getVkGroups(provider_id: number, token: string){
    return this.http.jsonp<any>(`https://api.vk.com/method/groups.get?user_ids=${provider_id}&access_token=${token}&extended=1&filter=moder&v=5.131`, 'callback')
  }


  getVkPostsGroup(group_id: number, count:number, token: string){
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.get?owner_id=-${group_id}&access_token=${token}&count=${count}&filter=all&extended=1&v=5.131`, 'callback')
  }

  setUser(user: IUser) {
    //this.user.value = []
    this.user.next(user)
    this.setUserToLocalStorage(user)
  } 
  

  setUserToLocalStorage(user: IUser) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

   getUserFromLocalStorage() {
   // return this.user.next(JSON.parse(localStorage.getItem('auth_user')  || 'null'))
    return JSON.parse(localStorage.getItem('auth_user')  || 'null')
    //return this.user = localStorage.getItem('auth_user')
  }

  // Remove token
  removeUserFromLocalStorage() {
    localStorage.removeItem('auth_user')
    this.user.next(null)
    //this.user = []
  }
}

