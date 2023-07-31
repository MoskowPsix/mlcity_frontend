import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { UserService } from './user.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VkService {
  private vk_access_token?: Observable<string>
  private vk_user_id?: Observable<number>
  private vk_service_key:string = environment.vkontakteServiceKey

  constructor(private http: HttpClient, private userService: UserService, ) { 
    this.getAccessToken()
  }

  getAccessToken(){
    this.userService.getUser().pipe(
      //take(1),
      tap((user: any) => {
        if (user) {
          this.vk_access_token = user.social_account.token
          this.vk_user_id = user.social_account.provider_id
        } else {
          this.getAccessToken()
        }
      })
    ).subscribe().unsubscribe();    
  }

    //инфо о методе  https://dev.vk.com/method/groups.get
  //https://api.vk.com/method/groups.get?user_ids=${this.socialAccount.provider_id}&access_token=${this.socialAccount.token}&extended=1&filter=moder
  //moder — ищем группы где юзер является администратором, редактором или модератором
  getGroups(){
    return this.http.jsonp<any>(`https://api.vk.com/method/groups.get?user_ids=${this.vk_user_id}&access_token=${this.vk_access_token}&extended=1&filter=moder&v=5.131`, 'callback')
  }


  getPostsGroup(group_id: number, count:number){
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.get?owner_id=${group_id}&access_token=${this.vk_access_token}&count=${count}&filter=all&extended=1&v=5.131`, 'callback')
  }

  getPostsMyPage(count:number){
    
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.get?owner_id=${this.vk_user_id}&access_token=${this.vk_access_token}&count=${count}&filter=all&extended=1&v=5.131`, 'callback')
  }

  getPostGroup(group_id: number, post_id:number){
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.getById?posts=-${group_id}_${post_id}&access_token=${this.vk_access_token}&v=5.131`, 'callback')
  }

  isLikedUserVKEvent(group_id: number, post_id:number){
    return this.http.jsonp<any>(`https://api.vk.com/method/likes.isLiked?user_id=${this.vk_user_id}&&owner_id=-${group_id}&&item_id=${post_id}&&type=post&access_token=${this.vk_access_token}&v=5.131`, 'callback')
  }

  serachCity(query: string, count:number = 100){
    return this.http.jsonp<any>(`https://api.vk.com/method/database.getCities?access_token=${this.vk_service_key}&country_id=1&q=${query}&need_all=1&count=${count}&v=5.131`, 'callback')
  }

}
