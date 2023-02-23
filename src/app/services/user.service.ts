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
  //BehaviorSubject обязательно нужны начальные значения
  private user:  BehaviorSubject<IUser | null> = new BehaviorSubject<IUser | null>(this.getUserFromLocalStorage())
  private socialAccount: BehaviorSubject<ISocialAccount | null> = new BehaviorSubject<ISocialAccount | null>(null);
  private vkGroups: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private vkGroupPosts: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  //private user:  Subject<IUser | null> = new ReplaySubject<IUser | null>(1)
  //private socialAccount: Subject<ISocialAccount> = new ReplaySubject<ISocialAccount>(1);

  constructor(private http: HttpClient) { }

  getUser(): Observable<IUser | null> {
    return this.user.asObservable()
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}`)
  } 

  setSocialAccountByUserId(id: number): Observable<void> {
    return this.http.get<ISocialAccount>(`${environment.BASE_URL}:${environment.PORT}/api/users/${id}/social-account`).pipe(
      map((account: ISocialAccount) => {
        return this.socialAccount.next(account) 
      })
     )
  } 

  getSocialAccount(): Observable<ISocialAccount | null>{
    return this.socialAccount.asObservable()
  }

  //инфо о методе  https://dev.vk.com/method/groups.get
  //https://api.vk.com/method/groups.get?user_ids=${this.socialAccount.provider_id}&access_token=${this.socialAccount.token}&extended=1&filter=moder
  //moder — ищем группы где юзер является администратором, редактором или модератором
  setVkGroups(provider_id: number, token: string): Observable<void>{
    return this.http.jsonp<any>(`https://api.vk.com/method/groups.get?user_ids=${provider_id}&access_token=${token}&extended=1&filter=moder&v=5.131`, 'callback').pipe(
      map((groups) => {
        return this.vkGroups.next(groups) 
      })
     )
  }

  getVkGroups(): Observable<any>{
    return this.vkGroups.asObservable()
  }

  setVkPostsByGroupIp(group_id: number, count:number, token: string): Observable<void>{
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.get?owner_id=-${group_id}&access_token=${token}&count=${count}&filter=all&extended=1&v=5.131`, 'callback').pipe(
      map((posts) => {
        return this.vkGroupPosts.next(posts) 
      })
     )
  }

  getVkPostsGroup(): Observable<any>{
    return this.vkGroupPosts.asObservable()
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

