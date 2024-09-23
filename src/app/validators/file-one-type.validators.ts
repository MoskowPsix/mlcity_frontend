import { FormControl, ValidationErrors } from '@angular/forms'

//Валидатор разрешеных типов расширений
export function fileOneTypeValidator(types: string[]): ValidationErrors | null {
  return function (control: FormControl) {
    const file = control.value
    let success = 0

    if (!file) return null
    if (file) {
      const extension = file.split('.').pop().toLowerCase()
      if (file.toLowerCase() === extension.toLowerCase()) {
        success++
      }
    }

    return success > 0 ? null : { requiredFileType: true }
  }
}
