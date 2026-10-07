import { Component, OnInit } from '@angular/core'
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
    const hasLocation =
      this.filters.getLocationLatitudeFromlocalStorage() &&
      this.filters.getLocationLongitudeFromlocalStorage() &&
      this.filters.getLocationFromlocalStorage()

    const destination = this.authService.isAuthenticated() || hasLocation ? '/events' : '/home'
    void this.router.navigateByUrl(destination, { replaceUrl: true })
  }
}
