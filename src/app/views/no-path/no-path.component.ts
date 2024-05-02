import { Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'
import { Router } from '@angular/router'

@Component({
  selector: 'app-no-path',
  templateUrl: './no-path.component.html',
  styleUrls: ['./no-path.component.scss'],
})
export class NoPathComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // window.open('/home', '_self');
    this.router.navigateByUrl('/home').then(() => {
      window.location.href = 'home'
    })
  }
}
