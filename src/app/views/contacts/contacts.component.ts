import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, filter, finalize, of, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import { MessagesAuth } from 'src/app/enums/messages-auth';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { SupportService } from 'src/app/services/support.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private supportService: SupportService,
    private ToastService: ToastService,
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService,
  ) {}
  contactForm!: FormGroup;
  userHaveEmailAndEmail:boolean = true
  selectedTypeModalValue:boolean = false;
  items:any[] = [

        { id: 1, name: 'Пожаловаться', value: 'Пожаловаться' },
        { id: 2, name: 'Сообщить об ошибке', value: 'Сообщить об ошибке' },
        { id: 3, name: 'Предложить идею', value: 'Предложить идею' },

  ];
  selectedDateItem:any =  { id: 1, name: 'Тип обращения', value: 'Тип обращения' }
  selectDateItem(event:any){
    this.selectedDateItem = event;
    this.setTypeValue(event)
    this.closeSelectDate()
  }
  openSelectDate(){
    this.selectedTypeModalValue = true;
  }
  closeSelectDate(){
    this.selectedTypeModalValue = false;
  }
  onSubmit() {
    if (this.contactForm.valid) {
      this.loadingService.showLoading()
      this.supportService
        .sendMailSupport(this.contactForm.value)
        .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            console.log(err);
            return of(EMPTY);
           
          }),
          finalize(()=>{
            this.loadingService.hideLoading()
          })
        )
        .subscribe(res => {
          this.ToastService.showToast('Вы успешно отправили обращение к нам, ожидайте ответа на свою электронную почту','success')
          this.contactForm.controls['text'].setValue('')
          this.contactForm.controls['type'].setValue('')
          this.router.navigate(['/home'])
        });
    } else {
    }
  }


  validForm(){
    if(this.contactForm.valid){
      return false
    } 
    else{
      return true
    }
  }

  ionViewWillEnter(){
    this.userService.getUser().subscribe((res:any)=>{
      if(res.name && res.email){
        this.userHaveEmailAndEmail = true
        this.contactForm.patchValue({
          email: res.email,
          name: res.name,
        })
      } else{
        this.userHaveEmailAndEmail = false
      }
     
    })
  }

  ionViewDidLeave(){
    
  }

  validateForm(){
    return this.contactForm.invalid;
  }

  setTypeValue(event:any){
    this.contactForm.controls['type'].setValue(event.value)
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
      type: new FormControl(''),
      text: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });
  }
}
