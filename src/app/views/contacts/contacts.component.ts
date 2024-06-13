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
    private supportService: SupportService,
    private ToastService: ToastService
  ) {}
  contactForm!: FormGroup;

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      this.supportService
        .sendMailSupport(this.contactForm.value)
        .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            console.log(err);
            return of(EMPTY);
            this.ToastService.showToast(err, 'success');
          })
        )
        .subscribe(ress => {
          console.log(ress);
          this.ToastService.showToast('Вы успешно отправили обращение к нам, ждите ответа на свою электронную почту в течении 2 дней','success')
          this.contactForm.reset()
        
        });
    } else {
      console.log('no');
    }
    console.log(this.contactForm.value.name);
  }


  validForm(){
    if(this.contactForm.valid){
      return false
    } 
    else{
      return true
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit() {
    this.contactForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      text: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });
  }
}
