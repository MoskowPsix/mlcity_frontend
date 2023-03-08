import { Injectable } from '@angular/core'; 
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'; 

@Injectable() export class XsrfInterceptor implements HttpInterceptor {
     intercept(req: HttpRequest<any>, next: HttpHandler) {
    
        const xsrfToken = localStorage.getItem('auth_token'); 
        
        if (xsrfToken){ 
            const cloned = req.clone({ headers: req.headers.set('X-XSRF-TOKEN', xsrfToken) }); 
            return next.handle(cloned); 
        } else { 
            return next.handle(req); 
        } 
    } 
    
}