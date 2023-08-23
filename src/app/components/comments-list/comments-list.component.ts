import { Component, Input} from '@angular/core'
import { CommentsService } from '../../services/comments.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ToastService } from 'src/app/services/toast.service';
import { EMPTY, Subject, catchError, of, takeUntil, tap } from 'rxjs'
import { MessagesErrors } from 'src/app/enums/messages-errors';
import { MessagesComment } from 'src/app/enums/message-comment';
import { EventsService } from '../../services/events.service';
import { SightsService } from '../../services/sights.service';
import { UserService } from 'src/app/services/user.service';


@Component({
    selector: 'app-comments-list',
    templateUrl: './comments-list.component.html',
    styleUrls: ['./comments-list.component.scss'],
  })

  export class CommentsListComponent {

    constructor(
      private commentsService: CommentsService,
      private toastService: ToastService,
      private eventService: EventsService,
      private sightsService: SightsService,
      private userService: UserService
      ) { 
        this.getUser()
      }
      
    private readonly destroy$ = new Subject<void>()

    createCommentForm: FormGroup = new FormGroup({})
    @Input() isSight: boolean = false
    @Input() comments!: any
    @Input() event_id!: number

    prev_comment: any
    bottom_load_all_comments: boolean = false
    load_all_comments: boolean = false
    user_avatar: string = ''
    user_auth: boolean = false

    getUser(){
      this.userService.getUser().pipe(
        //take(1),
        tap((user: any) => {
          if (user) {
            this.user_avatar = user.avatar
            this.user_auth = true
          } else {
            this.user_auth = false
          }
        })
      ).subscribe().unsubscribe();    
    }

    show_all_comments() {
      this.prev_comment = this.comments
      this.load_all_comments = true
    }

    addComment() {
      if (this.createCommentForm.controls['new_comment'].value) {
        if (this.isSight) {
          this.commentsService.addCommentsSight(this.createCommentForm.controls['new_comment'].value, this.event_id).pipe(  
            catchError((err) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.toastService.showToast(MessagesErrors.CommentError, 'danger')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response: any) =>{
            this.createCommentForm.controls['new_comment'].reset()
            this.sightsService.getSightById(this.event_id).pipe(
              catchError((err) =>{
                this.createCommentForm.controls['new_comment'].reset()
                this.toastService.showToast(MessagesErrors.default, 'danger')
                return of(EMPTY) 
              }),
              takeUntil(this.destroy$)
            ).subscribe((response: any) =>{
              this.comments = response.comments
              this.show_all_comments()
            })
            this.toastService.showToast(MessagesComment.comment_ok, 'success')
          })
        } else {
          this.commentsService.addCommentsEvent(this.createCommentForm.controls['new_comment'].value, this.event_id).pipe(  
            catchError((err) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.toastService.showToast(MessagesErrors.CommentError, 'danger')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response: any) =>{
            console.log(response)
            this.createCommentForm.controls['new_comment'].reset()
            this.eventService.getEventById(this.event_id).pipe(
              catchError((err) =>{
                this.createCommentForm.controls['new_comment'].reset()
                this.toastService.showToast(MessagesErrors.default, 'danger')
                return of(EMPTY) 
              }),
              takeUntil(this.destroy$)
            ).subscribe((response: any) =>{
              this.comments = response.comments
              this.show_all_comments()
            })
            this.toastService.showToast(MessagesComment.comment_ok, 'success')
          })
        }
      } else {
        this.toastService.showToast(MessagesErrors.CommentsNoValue, 'danger')
      }
    }

    ngOnInit() {
      this.createCommentForm = new FormGroup({
        new_comment: new FormControl('',[Validators.required]),
      })
      if (this.comments.length > 3) {
        this.prev_comment = [this.comments[0], this.comments[1], this.comments[2]]
        this.bottom_load_all_comments = true
        this.load_all_comments = false
      } else if (this.comments.length) {
        this.show_all_comments()
        this.bottom_load_all_comments = false
      } else {
        this.bottom_load_all_comments = false
      }
    } 
  }