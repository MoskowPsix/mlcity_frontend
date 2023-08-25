import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
  })
  export class CommentsService {
    private user_id?: Observable<number>

    constructor(private http: HttpClient) { }

    addCommentsEvent(text: string, event_id: number, comment_id: any = ' ') {
      const params = {
        text: text,
        eventID: event_id,
        commentID: comment_id
      }
      return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/create`, params)
    }
    addCommentsSight(text: string, sight_id: number, comment_id: any = ' ') {
      const params = {
        text: text,
        sightID: sight_id,
        commentID: comment_id
      }
      console.log(this.user_id, 'sight')
      return this.http.post<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/create`, params)
    }
    getCommentId(id: number) {
      return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/${id}`)
    }
    updateCommentId(id: number, text: any) {
      const params = {
        text: text
      }
      return this.http.put<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/${id}/update`, params)
    }
    deleteCommentId(id: number) {
      return this.http.delete<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/comment/${id}/delete`)
    }
  }