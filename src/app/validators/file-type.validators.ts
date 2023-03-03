import { FormControl, ValidationErrors } from "@angular/forms";

 //Валидатор разрешеных типов расширений
export function fileTypeValidator(types: string[]): ValidationErrors | null {
  return function (control: FormControl) {
    const file = control.value
    let success = 0

    if (!file)
      return null
    types.forEach((type: string) => {
      if (file) {
        const extension = file.split('.').pop().toLowerCase()
        if (type.toLowerCase() === extension.toLowerCase()){
          success++
        }  
      }     
    })    
    
    return success > 0 ? null : { requiredFileType: true } 
  };
}