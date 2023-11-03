import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, map, of, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent  implements OnInit {
  private readonly destroy$ = new Subject<void>()
  registerForm!: FormGroup

  constructor(
    private authservice: AuthService
  ) { }

  
  onSubmitReg(){
   
  }



  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl(' ', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      retryPassword: new FormControl ('',[Validators.required,Validators.minLength(3)] ),
      name:new FormControl(' ',[Validators.required,Validators.minLength(3)] )
    });
  }



  checkName() {
  
    if(this.registerForm.value.name.length != " " && this.registerForm.value.name.length != "" ) {
      console.log(this.registerForm.controls['name'].invalid)
            if (!this.registerForm.controls['name'].invalid) {
                this.authservice.checkName(this.registerForm.value.name).pipe(
                  map((respons:any) => {
                  console.log(respons)
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
          console.log(respons)
        }),
        catchError((err) =>{
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe()
  }



  }


}
