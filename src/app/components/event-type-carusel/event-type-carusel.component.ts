import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventTypeService } from 'src/app/services/event-type.service';

@Component({
  selector: 'app-event-type-carusel',
  templateUrl: './event-type-carusel.component.html',
  styleUrls: ['./event-type-carusel.component.scss'],
})
export class EventTypeCaruselComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();

  @Output() typeOutput = new EventEmitter();
  @ViewChild('wigetScroll') wigetScroll!: ElementRef;
  scroll?: any;
  clickAll: boolean = false;
  typesLoaded: boolean = true;
  types: any[] = [];
  @Input() type_id?: any;
  constructor(private eventTypeService: EventTypeService) {}

  scrollLeft() {
    this.wigetScroll.nativeElement.scrollTo({
      left: this.wigetScroll.nativeElement.scrollLeft - this.scroll,
      behavior: 'smooth',
    });
  }
  scrollRight() {
    this.wigetScroll.nativeElement.scrollTo({
      left: this.wigetScroll.nativeElement.scrollLeft + this.scroll,
      behavior: 'smooth',
    });
  }

  getTypesEvent() {
    this.eventTypeService
      .getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.types = response.types;
        response.types ? (this.typesLoaded = true) : (this.typesLoaded = false); //для скелетной анимации
      });
  }
  getTypeId(id: any) {
    this.type_id = id;
    if (id == 'all') {
      this.clickAll = true;
    } else {
      this.clickAll = false;
    }
    this.onTypeOutput();
    this.fixCenterElement(id);
  }
  onTypeOutput() {
    this.typeOutput.emit(this.type_id);
  }
  fixCenterElement(type_id: any) {
    var elem = this.wigetScroll.nativeElement.offsetWidth;
    let left = document.getElementById(type_id)!.offsetLeft;
    let right = elem - document.getElementById(type_id)!.offsetLeft;
    if (left > right) {
      this.wigetScroll.nativeElement.scrollTo({
        left: left - elem / 2,
        behavior: 'smooth',
      });
    } else if (right > left) {
      this.wigetScroll.nativeElement.scrollTo({
        right: right - elem / 2,
        behavior: 'smooth',
      });
    }
  }

  ngOnInit() {
    this.getTypesEvent();
    if (!this.scroll) {
      this.scroll = 300;
    }
    if (!this.type_id) {
      this.type_id = 'all';
    }
    // this.fixCenterElement(this.type_id)
    setTimeout(() => {
      this.fixCenterElement(this.type_id);
    }, 5000);
  }
}
