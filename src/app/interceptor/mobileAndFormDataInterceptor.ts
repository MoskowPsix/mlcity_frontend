import { inject, Injectable } from '@angular/core'
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Capacitor } from '@capacitor/core'
import { ToastService } from '../services/toast.service'
function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
@Injectable()
export class MobileAndFormDataInterceptor implements HttpInterceptor {
  platform: string = Capacitor.getPlatform()
  toastService: ToastService = inject(ToastService)
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let updatedRequest: any = req
    let boundary = '----WebKitFormBoundary' + generateGuid()
    if (this.platform == 'android') {
      if (req.method == 'POST' && req.body instanceof FormData) {
        updatedRequest = req.clone({
          setHeaders: {
            'Content-Type': `multipart/form-data;  boundary=----WebKitFormBoundaryxMEzBVV6qZxQarAI`,
          },
        })
      }
    }

    return next.handle(updatedRequest)
  }
}
