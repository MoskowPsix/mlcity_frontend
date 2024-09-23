import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { NavigationService } from '../services/navigation.service'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private navigationService: NavigationService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // return this.authService.isAuthenticated()
    if (this.authService.getAuthState() && this.authService.isAuthEmail()) {
      this.navigationService.modalAuthEmail.next(false)
      return true
    } else if (this.authService.getAuthState()) {
      // this.navigationService.modalAuthEmail.next(true)
      return true
    } else {
      this.navigationService.modalAuthEmail.next(false)
      this.router.navigate(['login'])
      return false
    }
  }
}
