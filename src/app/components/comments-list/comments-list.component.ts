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
    @Input() input_panel: boolean = true


    prev_comment: any
    bottom_load_all_comments: boolean = true
    load_all_comments: boolean = false
    user_avatar: string = ''
    user_auth: boolean = false
    comment_id!: any
    user_id!: number 

    getUser(){
      this.userService.getUser().pipe(
        //take(1),
        tap((user: any) => {
          if (user) {
            this.user_avatar = user.avatar
            this.user_id = user.id
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

    date(date_cr: any, date_upd: any) {
      if (date_cr === date_upd) {
        return new Date(date_cr).toLocaleString()
      } else {
        return 'Изменено ' + new Date(date_upd).toLocaleString()
      }
    }

    addCommentAnswer() {
      if (this.createCommentForm.controls['new_comment'].value) {
        if (this.isSight) {
          this.commentsService.addCommentsSight(this.createCommentForm.controls['new_comment'].value, this.event_id, this.comment_id).pipe(  
            catchError((err) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.toastService.showToast(MessagesErrors.CommentError, 'danger')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response: any) =>{
            this.createCommentForm.controls['new_comment'].reset()
            this.commentsService.getCommentId(this.comment_id).pipe( ////
              catchError((err) =>{
                this.createCommentForm.controls['new_comment'].reset()
                this.toastService.showToast(MessagesErrors.default, 'danger')
                return of(EMPTY) 
              }),
              takeUntil(this.destroy$)
            ).subscribe((response: any) =>{
              this.createCommentForm.controls['new_comment'].reset()
            let count: number = 0
            this.prev_comment.forEach((element: { id: any; }) => {
              if (element.id === response.comment.comment_id){
                this.prev_comment[count].comments.push(response.comment)
              }
              count = count + 1
            });
            })
            this.toastService.showToast(MessagesComment.comment_ok, 'success')
          })
        } else {
          this.commentsService.addCommentsEvent(this.createCommentForm.controls['new_comment'].value, this.event_id, this.comment_id).pipe(  
            catchError((err) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.toastService.showToast(MessagesErrors.CommentError, 'danger')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response: any) =>{
            this.createCommentForm.controls['new_comment'].reset()
            let count: number = 0
            this.prev_comment.forEach((element: { id: any; }) => {
              if (element.id === response.comment.comment_id){
                this.prev_comment[count].comments.push(response.comment)
              }
              count = count + 1
            });

            this.toastService.showToast(MessagesComment.comment_ok, 'success')
          })
        }
      } else {
        this.toastService.showToast(MessagesErrors.CommentsNoValue, 'danger')
      }
    }


    updateComment(id: number) {
      this.commentsService.updateCommentId(id, this.createCommentForm.controls['update_comment'].value).pipe(  
        catchError((err) =>{
          console.log(err)
          this.toastService.showToast(MessagesErrors.CommentError, 'danger')
          this.createCommentForm.controls['update_comment'].reset()
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe((response: any) =>{
        this.createCommentForm.controls['update_comment'].reset()
          let count: number = 0
          this.prev_comment.forEach((element: { id: any; }) => {
            if (element.id === id){
              this.prev_comment[count] = response.comment
            }
            count = count + 1
          })
        this.toastService.showToast(MessagesComment.comment_ok, 'success')
      })
    }

    deleteComment(id: number) {
      this.commentsService.deleteCommentId(id).pipe(  
        catchError((err) =>{
          console.log(err)
          this.toastService.showToast(MessagesErrors.CommentError, 'danger')
          return of(EMPTY) 
        }),
        takeUntil(this.destroy$)
      ).subscribe((response: any) =>{
          let count: number = 0
          this.prev_comment.forEach((element: { id: any; }) => {
            if (element.id === id){
              this.prev_comment[count].text = 'Коментарий удалён.'
            }
            count = count + 1
          })
        this.toastService.showToast('Комментарий удалён', 'success')
      })
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
              this.sightsService.getSightById(this.event_id).pipe( ////
                catchError((err) =>{
                  this.createCommentForm.controls['new_comment'].reset()
                  this.toastService.showToast(MessagesErrors.default, 'danger')
                  return of(EMPTY) 
                }),
                takeUntil(this.destroy$)
              ).subscribe((response: any) =>{
                //this.prev_comment.comments = response;
                this.comments = response.comments
                //this.load_all_comments = true
                this.show_all_comments()
                //this.ngOnInit()
            })
            this.toastService.showToast(MessagesComment.comment_ok, 'success')
            })
        } else if (!this.isSight) {
          this.commentsService.addCommentsEvent(this.createCommentForm.controls['new_comment'].value, this.event_id).pipe(  
            catchError((err) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.toastService.showToast(MessagesErrors.CommentError, 'danger')
              return of(EMPTY) 
            }),
            takeUntil(this.destroy$)
          ).subscribe((response: any) =>{
              this.createCommentForm.controls['new_comment'].reset()
              this.eventService.getEventById(this.event_id).pipe( ////
                catchError((err) =>{
                  this.createCommentForm.controls['new_comment'].reset()
                  this.toastService.showToast(MessagesErrors.default, 'danger')
                  return of(EMPTY) 
                }),
                takeUntil(this.destroy$)
              ).subscribe((response: any) =>{
                //this.prev_comment.comments = response;
                this.comments = response.comments
                //this.load_all_comments = true
                this.show_all_comments()
                //this.ngOnInit()
            })
            this.toastService.showToast(MessagesComment.comment_ok, 'success')
            })
        }
      } else {
          this.toastService.showToast(MessagesErrors.CommentsNoValue, 'danger')
      }
    }

    setUpdateCommentForm(text: any) {
      this.createCommentForm.patchValue({update_comment: text});
    }

    showAnswer(comment_id: number) {
      this.comment_id = comment_id
    }

    ngOnInit() {
      //console.log(this.comments)
      this.createCommentForm = new FormGroup({
        new_comment: new FormControl('',[Validators.required]),
        update_comment: new FormControl('',[Validators.required])
      })
      if (this.comments.length > 3 ) {
        this.prev_comment = [this.comments[0], this.comments[1], this.comments[2]]
        this.bottom_load_all_comments = true
        this.load_all_comments = false
      } else if (this.comments.length ) {
        this.show_all_comments()
        this.bottom_load_all_comments = false
      } else {
        this.bottom_load_all_comments = false
      }
    } 
  }