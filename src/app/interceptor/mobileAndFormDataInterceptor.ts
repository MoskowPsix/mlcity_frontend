import { inject, Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Capacitor } from '@capacitor/core'
import { ToastService } from '../services/toast.service'
@Injectable()
export class MobileAndFormDataInterceptor implements HttpInterceptor {
  platform: string = Capacitor.getPlatform()
  toastService: ToastService = inject(ToastService)
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let updatedRequest: any = req

    if (this.platform == 'android') {
      if (req.method == 'POST' && req.body instanceof FormData) {
        updatedRequest = req.clone({
          setHeaders: {
        
          },
        })
      }
    }

    return next.handle(updatedRequest)
  }
}
