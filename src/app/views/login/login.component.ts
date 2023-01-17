import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // loginForm = new FormGroup({
  //   email: new FormControl(),
  //   password: new FormControl(''),
  // });


  constructor(private authService: AuthService, private http: HttpClient, private formBuilder: FormBuilder) {

   }

  //  onSubmit(){


  //   this.http.post<any>(`${environment.BASE_URL}:${environment.PORT}/api/login`,this.signUpForm.value)
  //   .subscribe(res=>{
  //     alert('SIGNIN SUCCESFUL');
  //     signUpForm.reset()
  //     // this.router.navigate(["login"])
  //   },err=>{
  //     alert("Something went wrong")
  //   })
  
  
  //   // this.authService.login(this.loginForm.controls.password, this.loginForm.controls.email)//this.loginForm.value.email, this.loginForm.value.password);
  //  }

  ngOnInit() {
    const signUpForm = this.formBuilder.group({
      email: [""],
      password: [""]
    })
  }


}