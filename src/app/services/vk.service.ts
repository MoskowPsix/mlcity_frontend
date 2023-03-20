import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class VkService {
  private vk_access_token?: Observable<string>
  private vk_user_id?: Observable<number>

  constructor(private http: HttpClient, private userService: UserService, ) { 
    this.getAccessToken()
  }

  getAccessToken(){
    this.userService.getUser().pipe(
      //take(1),
      tap((user: any) => {
        this.vk_access_token = user.social_account.token
      }),
      tap((user: any) => {
        this.vk_user_id = user.social_account.provider_id
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
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.get?owner_id=-${group_id}&access_token=${this.vk_access_token}&count=${count}&filter=all&extended=1&v=5.131`, 'callback')
  }

  getPostGroup(group_id: number, post_id:number){
    return this.http.jsonp<any>(`https://api.vk.com/method/wall.getById?posts=-${group_id}_${post_id}&access_token=${this.vk_access_token}&v=5.131`, 'callback')
  }

  isLikedUserVKEvent(group_id: number, post_id:number){
    return this.http.jsonp<any>(`https://api.vk.com/method/likes.isLiked?user_id=${this.vk_user_id}&&owner_id=-${group_id}&&item_id=${post_id}&&type=post&access_token=${this.vk_access_token}&v=5.131`, 'callback')
  }

}
