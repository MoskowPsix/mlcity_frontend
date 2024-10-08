import { Component, OnInit, HostListener } from '@angular/core'
import { RulesModalCheckService } from 'src/app/services/rules-modal-check.service'
import { Input } from '@angular/core'
import { Subject, takeUntil } from 'rxjs'
@Component({
  selector: 'app-create-rules-modal',
  templateUrl: './create-rules-modal.component.html',
  styleUrls: ['./create-rules-modal.component.scss'],
})
export class CreateRulesModalComponent implements OnInit {
  constructor(private rulesModalCheckService: RulesModalCheckService) {}
  mobile: boolean = false
  userReadRules: boolean = false
  openModal: boolean = false
  private readonly destroy$ = new Subject<void>()
  @Input() agreement_id: any
  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    if (window.innerWidth < 900) {
      this.mobile = true
    } else if (window.innerWidth > 900) {
      this.userReadRules = false
      this.mobile = false
    } else {
      this.mobile = false
    }
  }

  closeModalFunc() {
    let accept = {
      agreement_id: 0,
    }
    accept.agreement_id = this.agreement_id
    this.rulesModalCheckService
      .setAgreements(accept)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.openModal = false
      })
  }

  userReadRulesFnc(event: any) {
    this.userReadRules = !event.target.checked
  }

  ngOnInit() {
    this.mobileOrNote()
    this.rulesModalCheckService.getSightOrEvent(this.agreement_id)
    this.rulesModalCheckService
      .getAgreements()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.message == 'user dont accept this agreement') {
          this.openModal = true
        } else {
          this.openModal = false
        }
      })
  }

  onResize(event: any) {
    this.mobileOrNote()
  }
}
