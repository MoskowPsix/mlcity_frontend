import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { MaskitoOptions,MaskitoElementPredicateAsync } from '@maskito/core';

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
  busyName:string = ""
  busyEmail:string = ""
  busyPass: boolean = true
  submitResponce:boolean = true

  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();


  constructor(
    private toastService: ToastService,
    private authservice: AuthService
  ) { }


  
  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      password_confirmation: new FormControl ('',[Validators.required,Validators.minLength(8)] ),
      name:new FormControl('',[Validators.required,Validators.minLength(3), Validators.maxLength(50)] ),
      number: new FormControl('',[Validators.minLength(10),Validators.minLength(10)]),
      avatar: new FormControl('')
    });
  
    this.OpenPassword('reg_password');
    this.OpenPasswordConfirm('confirm_password',event);

  

  }

  

  checkName() {
    this.busyName = this.registerForm.value.name;
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
    this.busyEmail = this.registerForm.value.email;
    if (!this.registerForm.controls['email'].invalid) {
       this.authservice.checkEmail(this.registerForm.value.mail).pipe(
        map((respons:any) => {
          
          this.emailBusy = respons.user_email
          console.log(respons)
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
      this.busyPass = true 
      console.log(this.busyPass)   
    }else{
      this.busyPass = false
      console.log(this.busyPass)
    }
   }
  

   OpenPassword(input:string){
    let passwordInput:any = document.getElementById("reg_password")
    let img:any = document.getElementById("eye_img")
    if(passwordInput.type == 'password'){
      img.src = "../assets/icons/eye_open.svg"
      passwordInput.type = 'text'
     
      
    } 
    else if (passwordInput.type == 'text'){
      passwordInput.type ='password'
      img.src = "../assets/icons/eye_closed.svg"
    }
    
   }


   SubmitPhone(){
      let clearPhone:string = this.registerForm.value.number
      let newStr = clearPhone.replace(/\+7|\s|\-|\(|\)/g, '')
      this.registerForm.value.number = newStr
      console.log(this.registerForm.value.number)
       
   }

   
   OpenPasswordConfirm(input:string,event:any){
    


    let passwordInput:any = document.getElementById(input)
    let img:any = document.getElementById("eye_img_confirm")
    if(passwordInput.type === 'password'){
      passwordInput.type = 'text'
      img.src = "../assets/icons/eye_open.svg"
      
    } 
    else if (passwordInput.type === 'text'){
      passwordInput.type ='password'
      img.src = "../assets/icons/eye_closed.svg"
    }

    
   }

   openModal(){

   }



   onSubmitReg(){
    this.checkPassword()
    this.checkEmail()
    this.checkName()
    this.SubmitPhone();
    if (this.emailBusy && this.nameBusy && this.busyPass) {
    this.authservice.register(this.registerForm.value).pipe( 
      delay(100),
      retry(3),
      map((respons:any) => {
          this.submitResponce = true
          if (respons.status == 'success') {
            this.toastService.showToast('Вы успешно зарегестрировались!!!', 'success')
          }
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
