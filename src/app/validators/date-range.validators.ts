import { AbstractControl, ValidationErrors } from "@angular/forms"

 // Валидатор, чтобы определить что дата начала меньше даты окончания и наоборот
 export function dateRangeValidator(control : AbstractControl): ValidationErrors | null {
  if (!control.get('dateStart')?.value || !control.get('dateEnd')?.value)
    return null

  const from = new Date(control.get("dateStart")?.value)
  const to = new Date(control.get("dateEnd")?.value)
  let invalid = false
  console.log('from: ' + from + 'to: ' + to)
  if (from && to) {
    invalid = from.getTime() > to.getTime()

    if (invalid){
      return { dateInvalid: true }
    }      
  }

  return null
}