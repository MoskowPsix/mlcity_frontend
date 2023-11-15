import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, delay, map, of, retry, takeUntil, tap } from 'rxjs';
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
import { MaskitoOptions,MaskitoElementPredicateAsync } from '@maskito/core';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()
  registerForm!: FormGroup
  modalForm!:FormGroup
  nameBusy:boolean = true
  emailBusy:boolean = true
  passwordConfirm:boolean = true
  busyName:string = ""
  busyEmail:string = ""
  busyPass: boolean = true
  submitResponce:boolean = false
  modalOpen:boolean = false
  busyNumber:boolean = true
  modalCount:number = 0

  @ViewChild('modal') modal!:IonModal


  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();

  readonly maskNumber:MaskitoOptions = {
    mask:[...Array(4).fill(/\d/)]
  }

  constructor(
    private toastService: ToastService,
    private authservice: AuthService,
    private loadingService: LoadingService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
  
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

    this.modalForm = new FormGroup({
      emailConfirmInput:new FormControl('',[Validators.required,Validators.minLength(4)])
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




  cancel() {
    this.modal.dismiss(null, 'cancel');
  }


   checkEmail() {
    this.busyEmail = this.registerForm.value.email;
    if (!this.registerForm.controls['email'].invalid) {
       this.authservice.checkEmail(this.registerForm.value.email).pipe(
        map((respons:any) => {
          
          this.emailBusy = respons.user_email
          console.log(respons)
         }),
         catchError((err) =>{
           return of(EMPTY) 
         }),
       ).subscribe()
    }
   }

   checkNumber(){
    this.authservice.checkNumber(this.registerForm.value.number).pipe(

      map((respons:any) =>{
        this.busyNumber = respons.user_number
      }),
      catchError((err) =>{
        return of(EMPTY)
      }),
      takeUntil(this.destroy$)

    ).subscribe()
   }


   checkPassword(){
    if(this.registerForm.value.password == this.registerForm.value.password_confirmation){
      this.busyPass = true 
  
    }else{
      this.busyPass = false
     
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



   confirmEmail(){
    // let inputModal:any = document.querySelector('.ModalInput')?.textContent
    // console.log(inputModal.length)
    // this.modalCount++;
    console.log(this.modalForm.value.emailConfirmInput)
  
    if(this.modalForm.value.emailConfirmInput.length == 4){
      console.log('4 символа')

      this.authservice.verfiEmail(+this.modalForm.value.emailConfirmInput).pipe(
        delay(100),
        retry(3),
        map((respons:any) => {
          this.cancel()
          if(respons.status === 'success'){
            this.modal
            this.router.navigate(['cabinet'])
            this.registerForm.reset()
            this.registerForm.enable()
           
          }
        })
      ).subscribe()

    }
   }

   loginAfterSocial(token: any){
    if (token.length >= 47){
      this.tokenService.setToken(token)
      // this.registerForm.disable()
      this.loadingService.showLoading()
      this.userService.getUserById().pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.positiveResponseAfterLogin(data)
        },
        error: err => {
          console.log(err)
          this.loadingService.hideLoading()

        }
      });
    }
  }

  positiveResponseAfterLogin(data:any){
    this.userService.setUser(data.user)
    this.loadingService.hideLoading()
    // this.registerForm.reset()
    // this.registerForm.enable()
    // this.router.navigate(['cabinet']);
  }


   async onSubmitReg(){

    await this.checkPassword()
    await this.checkEmail()
    await this.checkName()
    await this.SubmitPhone()
    await this.checkNumber()
   
    if (this.emailBusy && this.nameBusy && this.busyPass) {
    this.authservice.register(this.registerForm.value).pipe( 
      delay(100),
      retry(3),
      map((respons:any) => {
       
          this.submitResponce = true
          //this.confirmEmail();
          if (respons.status == 'success') {
            this.toastService.showToast('Вы успешно зарегестрировались!!!', 'success')
            respons.access_token ? this.loginAfterSocial(respons.access_token) : this.loginAfterSocial('no') 
          }
          // this.registerForm.disable();

         }),
        
      tap(() => {
        
      }),
      catchError((err) =>{
       
        this.toastService.showToast(err.message, 'warning')
        return of(EMPTY) 
      }),
      takeUntil(this.destroy$)
      ).subscribe(responce => {
 
        console.log(responce)
      })
    }
    console.log(this.registerForm)
   }


}
