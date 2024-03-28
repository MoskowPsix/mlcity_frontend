import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, filter, of, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { MessagesAuth } from 'src/app/enums/messages-auth';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { SupportService } from 'src/app/services/support.service';
 


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private supportService:SupportService
  ) {}
  contactForm!:FormGroup

  onSubmit(){
    if(this.contactForm.valid){
      console.log(this.contactForm.value)
      this.supportService.sendMailSupport(this.contactForm.value).pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.log(err)
          return of(EMPTY)
        })
      ).subscribe(ress =>{
        console.log(ress)
      })
    } 
    else
    {
      console.log('no')
    }
    console.log(this.contactForm.value.name)
  }

  ngOnInit() {
    this.contactForm = new FormGroup(
      {
        email: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),

        name: new FormControl('',[
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]),
        text: new FormControl('',[
          Validators.required,
          Validators.minLength(3),
        ])

      }
    )
  }
}
