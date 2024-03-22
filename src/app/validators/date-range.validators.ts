import { AbstractControl, ValidationErrors } from '@angular/forms';

// Валидатор, чтобы определить что дата начала меньше даты окончания и наоборот
export function dateRangeValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.get('dateStart')?.value || !control.get('dateEnd')?.value)
    return null;

  const from = new Date(control.get('dateStart')?.value.slice(0, 19));
  const to = new Date(control.get('dateEnd')?.value.slice(0, 19));
  let invalid = false;
  if (from && to) {
    invalid = from.getTime() > to.getTime();

    if (invalid) {
      return { dateInvalid: true };
    }
  }

  return null;
}
