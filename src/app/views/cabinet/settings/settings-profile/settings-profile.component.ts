import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { time } from 'console';
import { env } from 'process';
import { EMPTY, Subject, Subscription, catchError, takeUntil, of, tap } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
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
  avatarLoad: boolean = false
  avatar_url!: string
  previewPhotoUrl!: string
  
  

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private loadingService: LoadingService
    ) { }


  getUser(){
    this.subscription_2 =  this.userService.getUser().subscribe((user: any) => {
      this.user = user;
      this.avatar_url = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}${this.user.avatar}`
      this.avatarLoad = true
    })
  }

  createFormData(){
    this.formData.append('new_name',this.resetForm.value.new_name)
    return this.formData
  }

  onSubmit(){
    
    if (this.resetForm.status=='VALID'){
      let user: FormData = this.createFormData()
      this.loadingService.showLoading()
      this.userService.changeName(user).pipe(
        takeUntil(this.destroy$),
        catchError((err)=>{
          this.toastService.showToast('Убедитесь что поле Имя не пустое', 'danger')
          return of(EMPTY)
        }),
      ).subscribe((response:any)=>{
        if (response.status=='success'){
          this.userService.setUser(response.user)
          this.getUser()
          this.previewPhotoUrl = ''
          this.loadingService.hideLoading()
          this.toastService.showToast('Данные обновлены!','success')
        }
      })
    }
  }

  onFileSelected(event: any){
    const file: File = event.target.files[0]
    if (file){
      this.formData.append('avatar', file, file.name)
      this.previewPhoto(file)
    }
  }

  previewPhoto(file: File){
    const reader: FileReader = new FileReader();
    reader.onload = () => {
      this.previewPhotoUrl = reader.result as string;
    }
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.getUser()
    this.resetForm = new FormGroup({
      new_name: new FormControl(this.user.name,[Validators.minLength(1)]),
    })


  }

}
