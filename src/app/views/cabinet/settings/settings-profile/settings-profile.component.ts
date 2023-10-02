import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { env } from 'process';
import { EMPTY, Subject, Subscription, catchError, takeUntil, of, tap } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { fileTypeValidator } from 'src/app/validators/file-type.validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.scss'],
})
export class SettingsProfileComponent  implements OnInit {
  
  private readonly destroy$ = new Subject<void>()
  subscription_2!: Subscription
  user!: any
  resetForm: FormGroup = new FormGroup({})
  formData: FormData = new FormData()
  avatar: string = ''
  avatar_url!: string
  

  constructor(
    private userService: UserService,
    private toastService: ToastService
    ) { }


  getUser(){
    this.subscription_2 =  this.userService.getUser().subscribe((user: any) => {
      this.user = user;
      this.avatar_url = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}${this.user.avatar}`
    })
  }

  createFormData(){
    console.log(this.formData.get('avatar'))
    this.formData.append('new_name',this.resetForm.value.new_name)
    
    
    return this.formData
  }

  onSubmit(){
    
    if (this.resetForm.status=='VALID'){
      let user: FormData = this.createFormData()

      this.userService.changeName(user).pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          //this.resetForm.controls['new_name'].reset()
        }),
        catchError((err)=>{
          this.toastService.showToast('Убедитесь что поле Имя не пустое', 'danger')
          return of(EMPTY)
        }),
      ).subscribe((response:any)=>{
        if (response.status=='success'){
          this.userService.setUser(response.user)
          this.getUser()
          console.log(response)
          this.toastService.showToast('Данные обновлены!','success')
        }
      })
    }
  }

  onFileSelected(event: any){
    const file: File = event.target.files[0]
    if (file){
      this.formData.append('avatar', file, file.name)
    //   console.log(this.resetForm)
    }
  }

  ngOnInit() {
    this.getUser()
    this.resetForm = new FormGroup({
      new_name: new FormControl(this.user.name,[Validators.minLength(1)]),
    })
  }

}
