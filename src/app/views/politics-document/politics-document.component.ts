import { Component, OnInit } from '@angular/core'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-politics-document',
  templateUrl: './politics-document.component.html',
  styleUrls: ['./politics-document.component.scss'],
})
export class PoliticsDocumentComponent implements OnInit {
  constructor() {}
  host: string = environment.BACKEND_URL
  port: string = environment.BACKEND_PORT

  firstFunction(){
    console.log('First Function')
  }

  ngOnInit() {}
}
