import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, map } from 'rxjs';
import { AuthHandlerService } from 'src/app/auth-handler/auth-handler.service';

export class PseudoValidator {
  static createValidator(authHandlerService: AuthHandlerService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null > => {
      return authHandlerService.checkIfPseudoExists(control.value)
      .pipe(
        map((res: {pseudoAlreadyExists: boolean}) => 
        res ? { pseudoAlreadyExists: true } : null)
      )
    }
  }
}