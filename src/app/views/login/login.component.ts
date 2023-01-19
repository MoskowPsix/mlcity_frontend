import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';
// import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService, ToastService]
})
export class LoginComponent implements OnInit {
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });


  constructor(private authService: AuthService, private toastService: ToastService){}
   onSubmitLogin(){
    this.toastService.showToast('test toast', 'success')
    this.authService.login(this.loginForm.value as User).subscribe({
      next: data => {
        console.log(data)
        // TokenService.getToken()
      },
      error: err => {
        console.log(err.error.message) ;
      }
    });
 }

  ngOnInit() {}


}