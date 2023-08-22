import { Component, Input} from '@angular/core'


@Component({
    selector: 'app-comments-list',
    templateUrl: './comments-list.component.html',
    styleUrls: ['./comments-list.component.scss'],
  })

  export class CommentsListComponent {

    @Input() isSight: boolean = false
    @Input() comments!: any

    prev_comment: any
    bottom_load_all_comments: boolean = false
    load_all_comments: boolean = false

    show_all_comments() {
      this.prev_comment = this.comments
      this.load_all_comments = true
    }

    addComment() {
      
    }

    ngOnInit() {
      if (this.comments.length > 3) {
        this.prev_comment = [this.comments[0], this.comments[1], this.comments[2]]
        this.bottom_load_all_comments = true
        this.load_all_comments = false
      } else {
        this.show_all_comments()
        this.bottom_load_all_comments = true
      }
    } 
  }