import { Component, OnInit } from '@angular/core';
import { EMPTY, Subject, catchError, of, takeUntil } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { IEvent } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { SightsService } from 'src/app/services/sights.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {

  private readonly destroy$ = new Subject<void>()

  event: any

  constructor(
    private sightService: SightsService,
    private eventService: EventsService,
    private toastService: ToastService,
    ) { }

  getEvents() {
    this.eventService.getEventsFavorites().pipe(  
      catchError((err) =>{
        console.log(err)
        this.toastService.showToast(MessagesErrors.CommentError, 'danger')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
    ).subscribe((response: any) =>{
        console.log(response) // Перебрать массив и установить тип каждому
        })
    }

    getSights() {
      this.sightService.getSightsFavorites().pipe(  
        catchError((err) =>{
          console.log(err)
          this.toastService.showToast(MessagesErrors.CommentError, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe((response: any) =>{
          console.log(response) // Перебрать массив и установить тип каждому
          })
      }

  ngOnInit() {
   
  }
}

