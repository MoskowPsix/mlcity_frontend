import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()
  registerForm!: FormGroup
  nameBusy:boolean = true
  emailBusy:boolean = true
  passwordConfirm:boolean = true

  constructor(
    private toastService: ToastService,
    private authservice: AuthService
  ) { }


  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password_confirmation: new FormControl ('',[Validators.required,Validators.minLength(3)] ),
      name:new FormControl('',[Validators.required,Validators.minLength(3)] ),
      number: new FormControl('',[Validators.minLength(10),Validators.minLength(10)]),
    });
  }

  

  checkName() {
    if(this.registerForm.value.name.length != " " && this.registerForm.value.name.length != "" ) {
      console.log(this.registerForm.controls['name'].invalid)
            if (!this.registerForm.controls['name'].invalid) {
                this.authservice.checkName(this.registerForm.value.name).pipe(
                  map((respons:any) => {
                    this.nameBusy = respons.user_name;
                  }),
                  catchError((err) =>{
                    return of(EMPTY) 
                  }),
                  takeUntil(this.destroy$)
                ).subscribe()
            }
        }
    
  }

   checkEmail() {
    if (!this.registerForm.controls['email'].invalid) {
       this.authservice.checkEmail(this.registerForm.value.mail).pipe(
        map((respons:any) => {
          if(respons){

          }else if(!respons){
            this.emailBusy = false;
          }
         }),
         catchError((err) =>{
           return of(EMPTY) 
         }),
         takeUntil(this.destroy$)
       ).subscribe()
    }
   }

   checkPassword(){
    if(this.registerForm.value.password == this.registerForm.value.password_confirmation){
      console.log('password ok');
    }
    else{
      console.log('password dont ok')
    }
   }
  

   onSubmitReg(){
    this.checkEmail();
    this.checkName();
    this.checkPassword();
    if (this.emailBusy && this.nameBusy) {
    this.authservice.register(this.registerForm.value).pipe( 
      delay(100),
      retry(3),
      map((respons:any) => {
          
         }),
      tap(() => {
        
      }),
      catchError((err) =>{
        this.toastService.showToast(err.message, 'warning')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
      ).subscribe()
    }
    console.log(this.registerForm)
   }


}
