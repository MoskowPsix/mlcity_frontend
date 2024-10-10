import { Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service'
import { FilterService } from 'src/app/services/filter.service'

@Component({
  selector: 'app-no-path',
  templateUrl: './no-path.component.html',
  styleUrls: ['./no-path.component.scss'],
})
export class NoPathComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private filters: FilterService,
  ) {}

  ngOnInit() {
    // window.open('/home', '_self');
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/events').then(() => {
        window.location.href = 'events'
      })
    } else if (
      this.filters.getLocationLatitudeFromlocalStorage() &&
      this.filters.getLocationLongitudeFromlocalStorage() &&
      this.filters.getLocationFromlocalStorage()
    ) {
      this.router.navigateByUrl('/events').then(() => {
        window.location.href = 'events'
      })
    } else {
      this.router.navigateByUrl('/home').then(() => {
        window.location.href = 'home'
      })
    }
  }
}
