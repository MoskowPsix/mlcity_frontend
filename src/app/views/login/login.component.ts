import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });


  constructor(private authService: AuthService){}

   onSubmitLogin(){
    this.authService.login(this.loginForm.value.email!,this.loginForm.value.password!).subscribe({
      next: data => {
        console.log(data)
        // TokenService.getToken()
      },
      error: err => {
        console.log(err.error.message) ;
      }
    });
 }

  ngOnInit() {
   
  }


}