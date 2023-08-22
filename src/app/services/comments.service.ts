import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })
  export class CommentsService {

    // constructor(private http: HttpClient, private userService: UserService, ) { 
    //     this.getAccessToken()
    //   }
    
    //   getAccessToken(){
    //     this.userService.getUser().pipe(
    //       //take(1),
    //       tap((user: any) => {
    //         if (user) {
    //           this.vk_access_token = user.social_account.token
    //           this.vk_user_id = user.social_account.provider_id
    //         } else {
    //           this.getAccessToken()
    //         }
    //       })
    //     ).subscribe().unsubscribe();    
    //   }

    addCommentsEvent(text: string, event_id: number, isSight: boolean = false) {
        if (isSight) {
            return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/create?sightID${event_id}&user_id=&text=text`)
        } else {

        }
    }
  }