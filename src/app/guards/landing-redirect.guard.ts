import { Injectable } from '@angular/core'
import { CanActivate, Router, UrlTree } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { FilterService } from '../services/filter.service'

@Injectable({ providedIn: 'root' })
export class LandingRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private filters: FilterService,
  ) {}

  canActivate(): UrlTree {
    const hasLocation =
      this.filters.getLocationLatitudeFromlocalStorage() &&
      this.filters.getLocationLongitudeFromlocalStorage() &&
      this.filters.getLocationFromlocalStorage()

    return this.router.parseUrl(this.authService.isAuthenticated() || hasLocation ? '/events' : '/home')
  }
}
