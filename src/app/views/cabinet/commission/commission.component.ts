import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { maskitoDateOptionsGenerator } from '@maskito/kit'
import { forkJoin, from, of } from 'rxjs'
import { catchError, concatMap, map } from 'rxjs/operators'
import { CheckpointService } from 'src/app/services/checkpoint.service'
import { ToastService } from 'src/app/services/toast.service'

interface ImportBatchFile {
  file: File
  ok: boolean
  rows: any[]
  errors: { row: number; message: string }[]
  message: string
  needsMapping: boolean
  headers: string[]
  mapping: Record<string, string>
  checking: boolean
}

@Component({ selector: 'app-commission', templateUrl: './commission.component.html', styleUrls: ['./commission.component.scss'] })
export class CommissionComponent implements OnInit {
  eventId = 0
  competition: any
  checkpointDisabled = false
  groups: any[] = []
  participants: any[] = []
  groupName = ''
  memberEmail = ''
  members: any[] = []
  selectedGroupId: number | null = null
  participant: any = this.emptyParticipant()
  birthText = ''
  birthPicker: Date | null = null
  readonly defaultBirth = new Date(2000, 0, 1)
  readonly birthMask = maskitoDateOptionsGenerator({
    mode: 'dd/mm/yyyy',
    separator: '.',
    min: new Date(1900, 0, 1),
    max: new Date(),
  })
  editingParticipantId?: number
  importFiles: ImportBatchFile[] = []
  importReady = false
  importChecking = false
  dragOver = false
  readonly importFields = [
    { key: 'last_name', label: 'Фамилия' },
    { key: 'first_name', label: 'Имя' },
    { key: 'middle_name', label: 'Отчество' },
    { key: 'birth_date', label: 'Дата рождения' },
    { key: 'city', label: 'Город' },
    { key: 'group_name', label: 'Группа' },
    { key: 'start_number', label: 'Стартовый номер' },
    { key: 'rfid', label: 'RFID' },
  ]
  private readonly headerFields: Record<string, string> = {
    last_name: 'last_name',
    first_name: 'first_name',
    middle_name: 'middle_name',
    birth_date: 'birth_date',
    city: 'city',
    group_name: 'group_name',
    start_number: 'start_number',
    rfid: 'rfid',
    фамилия: 'last_name',
    имя: 'first_name',
    отчество: 'middle_name',
    'дата рождения': 'birth_date',
    город: 'city',
    группа: 'group_name',
    'стартовый номер': 'start_number',
    номер: 'start_number',
  }

  constructor(private route: ActivatedRoute, private router: Router, public checkpoint: CheckpointService, private toast: ToastService) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'))
    this.load()
  }
  load() {
    this.checkpoint.commission(this.eventId).subscribe({
      next: (data) => { this.competition = data.competition; this.groups = data.groups; this.participants = data.participants; this.members = data.members || []; this.checkpointDisabled = false },
      error: (error) => {
        if (this.deny(error)) return
        this.checkpoint.settings(this.eventId).subscribe({
          next: (event) => { this.competition = event; this.checkpointDisabled = !event.checkpoint_enabled },
          error: (settingsError) => {
            if (this.deny(settingsError)) return
            this.router.navigate(['/cabinet/events'])
          },
        })
      },
    })
  }
  private deny(error: any) {
    const message = String(error?.error?.message || '')
    if (error?.status !== 403 || !message.includes('Нет доступа к Checkpoint')) return false
    this.router.navigate(['/cabinet/checkpoint/access'], { replaceUrl: true })
    return true
  }
  enableCheckpoint() { this.checkpoint.updateSettings(this.eventId, true).subscribe({ next: () => this.load(), error: () => this.toast.showToast('Не удалось включить Checkpoint', 'danger') }) }
  grantMember() {
    const email = this.memberEmail.trim()
    if (!email) return
    this.checkpoint.grantMember(this.eventId, email).subscribe({
      next: (res) => {
        this.memberEmail = ''
        this.load()
        if (res.status === 'invited') {
          this.toast.showToast(res.mail_sent ? 'Письмо отправлено. Доступ включится после регистрации' : 'Приглашение записано, письмо не ушло. После регистрации с этой почтой доступ включится сам', 'success')
        } else {
          this.toast.showToast(res.mail_sent ? 'Комиссия открыта' : 'Комиссия открыта, письмо не ушло', 'success')
        }
      },
      error: (error) => this.toast.showToast(error?.error?.message || 'Не удалось открыть комиссию', 'danger'),
    })
  }
  memberTitle(member: any) {
    return this.memberHasName(member) ? member.name : member.email
  }
  memberHasName(member: any) {
    const name = String(member?.name || '').trim()
    return !!name && name.toLowerCase() !== String(member?.email || '').trim().toLowerCase()
  }
  memberInitial(member: any) {
    return String(this.memberTitle(member) || '?').trim().charAt(0).toUpperCase()
  }
  revokeMember(member: any) {
    this.checkpoint.revokeMember(this.eventId, member.id).subscribe({
      next: () => this.load(),
      error: () => this.toast.showToast('Не удалось закрыть доступ', 'danger'),
    })
  }
  emptyParticipant() { return { last_name: '', first_name: '', middle_name: '', birth_date: '', city: '', group_id: null, start_number: '', rfid: '' } }
  syncBirthFromText() {
    const text = (this.birthText || '').trim()
    if (!text) {
      this.participant.birth_date = ''
      this.birthPicker = null
      return
    }
    const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    const iso = match ? this.partsToIso(match[1], match[2], match[3]) : null
    this.participant.birth_date = iso || ''
    this.birthPicker = iso ? this.isoToDate(iso) : this.birthPicker
  }
  onBirthPicked(value: Date | null) {
    if (!value) {
      this.clearBirth()
      return
    }
    const day = String(value.getDate()).padStart(2, '0')
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const year = String(value.getFullYear())
    this.birthText = `${day}.${month}.${year}`
    this.birthPicker = value
    this.participant.birth_date = this.partsToIso(day, month, year) || ''
  }
  applyBirth(value: string) {
    const match = (value || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) {
      this.clearBirth()
      return
    }
    this.birthText = `${match[3]}.${match[2]}.${match[1]}`
    this.participant.birth_date = `${match[1]}-${match[2]}-${match[3]}`
    this.birthPicker = this.isoToDate(this.participant.birth_date)
  }
  clearBirth() {
    this.birthText = ''
    this.birthPicker = null
    this.participant.birth_date = ''
  }
  formatBirth(value: string) {
    const match = (value || '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    return match ? `${match[3]}.${match[2]}.${match[1]}` : (value || '')
  }
  private partsToIso(dayText: string, monthText: string, yearText: string) {
    if (dayText.length < 1 || monthText.length < 1 || yearText.length !== 4) return null
    const day = Number(dayText)
    const month = Number(monthText)
    const year = Number(yearText)
    const currentYear = new Date().getFullYear()
    if (month < 1 || month > 12 || day < 1 || year < 1900 || year > currentYear) return null
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  private isoToDate(iso: string) {
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  saveGroup() {
    const name = this.groupName.trim(); if (!name) return
    this.checkpoint.createGroup(this.eventId, { name, sort_order: this.groups.length }).subscribe({ next: () => { this.groupName = ''; this.load() }, error: () => this.toast.showToast('Не удалось сохранить группу', 'danger') })
  }
  saveExistingGroup(group: any) { this.checkpoint.updateGroup(this.eventId, group.id, { name: group.name, sort_order: group.sort_order }).subscribe({ next: () => this.load(), error: () => this.toast.showToast('Не удалось обновить группу', 'danger') }) }
  deleteGroup(group: any) { this.checkpoint.removeGroup(this.eventId, group.id).subscribe({ next: () => this.load(), error: (error) => this.toast.showToast(error?.error?.message || 'Группу с участниками удалить нельзя', 'danger') }) }
  participantsInGroup(group: any) { return group.participants_count ?? this.participants.filter((row) => row.group_id === group.id).length }
  previewRows(file: ImportBatchFile): any[] { return file.rows.slice(0, 5) }
  get importRowCount() { return this.importFiles.reduce((sum, file) => sum + file.rows.length, 0) }
  get importFailed() {
    return this.importFiles.length > 0 && !this.importChecking && !this.importReady && this.importFiles.some((item) => !item.needsMapping || item.errors.length > 0)
  }
  saveParticipant() {
    const text = this.birthText.trim()
    if (text) {
      const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
      const iso = match ? this.partsToIso(match[1], match[2], match[3]) : null
      if (!iso) {
        this.toast.showToast('Дата рождения в формате дд.мм.гггг', 'danger')
        return
      }
      this.participant.birth_date = iso
    } else {
      this.participant.birth_date = ''
    }
    const request = this.editingParticipantId ? this.checkpoint.updateParticipant(this.eventId, this.editingParticipantId, this.participant) : this.checkpoint.createParticipant(this.eventId, this.participant)
    request.subscribe({ next: () => { this.participant = this.emptyParticipant(); this.clearBirth(); this.editingParticipantId = undefined; this.load() }, error: () => this.toast.showToast('Проверьте обязательные поля и уникальность номера', 'danger') })
  }
  editParticipant(row: any) {
    this.participant = { ...row, birth_date: row.birth_date || '', group_id: row.group_id || null, rfid: row.rfid || '', middle_name: row.middle_name || '', city: row.city || '' }
    this.editingParticipantId = row.id
    this.applyBirth(row.birth_date || '')
  }
  cancelEdit() { this.participant = this.emptyParticipant(); this.clearBirth(); this.editingParticipantId = undefined }
  deleteParticipant(row: any) { this.checkpoint.removeParticipant(this.eventId, row.id).subscribe(() => this.load()) }
  get filteredParticipants() { return this.selectedGroupId ? this.participants.filter((row) => row.group_id === this.selectedGroupId) : this.participants }
  downloadTemplate() { this.checkpoint.template(this.eventId).subscribe((blob) => { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'checkpoint-participants.xlsx'; link.click(); URL.revokeObjectURL(link.href) }) }
  downloadPackage() {
    this.checkpoint.exportPackage(this.eventId).subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `checkpoint-${this.eventId}.json`
        link.click()
        URL.revokeObjectURL(link.href)
      },
      error: () => this.toast.showToast('Не удалось скачать пакет', 'danger'),
    })
  }
  onDragOver(event: DragEvent) {
    event.preventDefault()
    this.dragOver = true
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault()
    this.dragOver = false
  }
  onDrop(event: DragEvent) {
    event.preventDefault()
    this.dragOver = false
    this.queueFiles(event.dataTransfer?.files)
  }
  onFilesPicked(event: Event) {
    const input = event.target as HTMLInputElement
    this.queueFiles(input.files)
    input.value = ''
  }
  confirmImport() {
    if (!this.importReady || this.importChecking) return
    const files = this.importFiles.filter((item) => item.ok)
    from(files).pipe(concatMap((item) => this.checkpoint.import(this.eventId, item.file, this.mappingPayload(item)))).subscribe({
      complete: () => {
        this.importFiles = []
        this.importReady = false
        this.load()
        this.toast.showToast('Стартовый список импортирован', 'success')
      },
      error: (error) => this.toast.showToast(error?.error?.message || 'Импорт остановлен, часть файлов могла не записаться', 'danger'),
    })
  }
  private queueFiles(list: FileList | null | undefined) {
    const files = Array.from(list || [])
    if (!files.length) return
    this.importReady = false
    this.importChecking = true
    this.importFiles = files.map((file) => ({ file, ok: false, rows: [], errors: [], message: '', needsMapping: false, headers: [], mapping: {}, checking: false }))
    const allowed = /\.(xlsx|csv|txt)$/i
    const rejected = this.importFiles.filter((item) => !allowed.test(item.file.name))
    rejected.forEach((item) => {
      item.message = 'Нужен файл xlsx или csv'
    })
    const accepted = this.importFiles.filter((item) => allowed.test(item.file.name))
    if (!accepted.length) {
      this.importChecking = false
      return
    }
    forkJoin(accepted.map((item) => this.checkpoint.preview(this.eventId, item.file).pipe(
      map((data) => ({ item, data, error: null as any })),
      catchError((error) => of({ item, data: null as any, error })),
    ))).subscribe((results) => {
      results.forEach(({ item, data, error }) => this.readPreview(item, data, error))
      this.markCrossFileDuplicates()
      this.importChecking = false
      this.importReady = this.importFiles.length > 0 && this.importFiles.every((item) => item.ok)
    })
  }
  private readPreview(item: ImportBatchFile, data: any, error: any) {
    if (error) {
      item.ok = false
      const rows = error?.error?.errors
      item.errors = Array.isArray(rows) ? rows : []
      item.message = item.errors.length ? 'Есть ошибки в строках' : (error?.error?.message || 'Файл не подошёл')
      return
    }
    if (data?.mapping_required) {
      item.needsMapping = true
      item.headers = data.headers || []
      item.mapping = this.guessMapping(item.headers)
      item.ok = false
      item.message = 'Сопоставьте колонки файла с полями бланка'
      return
    }
    if (!data?.rows?.length) {
      item.message = 'В файле нет участников'
      return
    }
    item.ok = true
    item.errors = []
    item.rows = data.rows
    item.message = `Строк: ${data.rows.length}`
  }
  mappingReady(item: ImportBatchFile) {
    const values = Object.values(this.cleanMapping(item.mapping))
    return ['last_name', 'first_name', 'start_number'].every((field) => values.includes(field))
  }
  applyMapping(item: ImportBatchFile) {
    if (!this.mappingReady(item) || item.checking) {
      this.toast.showToast('Укажите фамилию, имя и стартовый номер', 'danger')
      return
    }
    item.checking = true
    this.checkpoint.preview(this.eventId, item.file, this.mappingPayload(item)).subscribe({
      next: (data) => {
        item.checking = false
        this.readPreview(item, data, null)
        if (item.ok) item.needsMapping = false
        this.markCrossFileDuplicates()
        this.importReady = this.importFiles.length > 0 && this.importFiles.every((file) => file.ok)
      },
      error: (error) => {
        item.checking = false
        this.readPreview(item, null, error)
        this.importReady = false
      },
    })
  }
  private mappingPayload(item: ImportBatchFile) {
    const mapping = this.cleanMapping(item.mapping)
    return Object.keys(mapping).length ? mapping : undefined
  }
  private cleanMapping(mapping: Record<string, string>) {
    const clean: Record<string, string> = {}
    Object.entries(mapping || {}).forEach(([header, field]) => {
      if (field) clean[header] = field
    })
    return clean
  }
  private guessMapping(headers: string[]) {
    const mapping: Record<string, string> = {}
    headers.forEach((header) => {
      const field = this.headerFields[header.trim().toLowerCase()]
      if (field) mapping[header] = field
    })
    return mapping
  }
  private markCrossFileDuplicates() {
    const seen = new Map<string, string>()
    this.importFiles.forEach((item) => {
      if (!item.ok) return
      item.rows.forEach((row) => {
        const number = String(row.start_number)
        const previous = seen.get(number)
        if (!previous) {
          seen.set(number, item.file.name)
          return
        }
        item.ok = false
        item.message = 'Стартовый номер повторяется в другом файле'
        item.errors.push({ row: row.line, message: `Номер ${number} уже есть в ${previous}` })
      })
    })
  }
}
