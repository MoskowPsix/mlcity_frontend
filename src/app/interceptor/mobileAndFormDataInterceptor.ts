import { Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Capacitor } from '@capacitor/core'

@Injectable()
export class MobileAndFormDataInterceptor implements HttpInterceptor {
  platform: string = Capacitor.getPlatform()

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let updatedRequest: any = req
    alert('я работаю')
    if (this.platform == 'android') {
      if (req.method == 'POST' && req.body instanceof FormData) {
        updatedRequest = req.clone({
          setHeaders: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }
    }

    return next.handle(updatedRequest)
  }
}
