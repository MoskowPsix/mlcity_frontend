import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-collapsed-text',
  templateUrl: './collapsed-text.component.html',
  styleUrls: ['./collapsed-text.component.scss'],
})
export class CollapsedTextComponent implements OnInit {
  textOpen: boolean = true;
  textClass: string = '';
  constructor() {}

  textOpenVariable() {
    this.textOpen = !this.textOpen;

    if (this.textOpen) {
      this.textClass = 'main-conteiner';
    } else {
      this.textClass = 'main-conteiner_collapsed';
    }
  }

  ngOnInit() {
    this.textOpenVariable();
  }
}
