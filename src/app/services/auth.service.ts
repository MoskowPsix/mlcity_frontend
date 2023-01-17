import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,) { }

  login(email: string, password: string): Observable<any> {
    const url = `${environment.BASE_URL}:${environment.PORT}/api/login`;
    return this.http.post<User>(url, {email, password});
  }

  signUp(email: string, password: string): Observable<User> {
    const url = `${environment.BASE_URL}:${environment.PORT}/api/register`;
    return this.http.post<User>(url, {email, password});
  }
//   login(username: string,password: string)): Observable<[email]> {
//     return this.http.get<IEvents[]>('https://fakestoreapi.com/products', {
//       params: new HttpParams({
//         fromObject: {limit: 15}
//       })
//     }).pipe(
//       delay(200),
//       retry(2),
//       tap(events => this.events = events),
//       catchError(this.errorHandler.bind(this))
//     )
//   }
// }
}