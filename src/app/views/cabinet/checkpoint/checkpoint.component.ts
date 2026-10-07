import { Component, OnInit } from '@angular/core'
import { IUser } from 'src/app/models/user'
import { CheckpointService } from 'src/app/services/checkpoint.service'
import { UserService } from 'src/app/services/user.service'

@Component({
  selector: 'app-checkpoint-status',
  templateUrl: './checkpoint.component.html',
  styleUrls: ['./checkpoint.component.scss'],
})
export class CheckpointStatusComponent implements OnInit {
  user: IUser | null = null
  competitions: any[] = []
  loadError = ''
  loaded = false

  constructor(private userService: UserService, private checkpoint: CheckpointService) {}

  ngOnInit() {
    this.user = this.userService.getUserFromLocalStorage()
    this.checkpoint.competitions().subscribe({
      next: (rows) => {
        this.competitions = rows || []
        this.loaded = true
        if (this.user && this.competitions.some((row) => row.shared)) {
          this.user = { ...this.user, checkpoint_shared: true }
          this.userService.setUser(this.user)
        }
      },
      error: () => {
        this.loaded = true
        this.loadError = 'Список соревнований сейчас недоступен'
      },
    })
  }
  formatDate(value: string) {
    const match = (value || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    return match ? `${match[3]}.${match[2]}.${match[1]}` : ''
  }
}
