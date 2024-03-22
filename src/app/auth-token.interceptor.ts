import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  //constructor(private tokenExtractor: HttpXsrfTokenExtractor) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = localStorage.getItem('auth-token');
    //const csrfToken = this.tokenExtractor.getToken() as string
    //JSONP юзает api vk, если принимать то будет ошибка
    if (authToken && req.method !== 'JSONP') {
      const cloned = req.clone({
        setHeaders: {
          // 'Content-Type': 'application/json',
          // 'X-XSRF-TOKEN': csrfToken,
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
