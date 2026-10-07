import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CheckpointService } from 'src/app/services/checkpoint.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'

@Component({
  selector: 'app-checkpoint-invite',
  templateUrl: './checkpoint-invite.component.html',
  styleUrls: ['./checkpoint-access.component.scss'],
})
export class CheckpointInviteComponent implements OnInit {
  message = 'Открываю комиссию…'

  constructor(private route: ActivatedRoute, private router: Router, private checkpoint: CheckpointService, private toast: ToastService, private userService: UserService) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') || ''
    this.checkpoint.acceptInvite(token).subscribe({
      next: (res) => {
        const stored = this.userService.getUserFromLocalStorage()
        if (stored) this.userService.setUser({ ...stored, checkpoint_shared: true })
        this.router.navigate(['/cabinet/events', res.event_id, 'commission'])
      },
      error: (error) => {
        if (error?.status === 404) {
          this.router.navigate(['/cabinet/checkpoint'])
          return
        }
        this.message = error?.error?.message || 'Не удалось открыть приглашение'
        this.toast.showToast(this.message, 'danger')
      },
    })
  }
}
