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

// export function pseudoValidator(authHandlerService: AuthHandlerService): AsyncValidatorFn {
//   return (control: AbstractControl) => {
//     return authHandlerService.getAllPseudos().pipe(
//       map((pseudos: any) => {
//         console.log("jesuisla ", control.value)
//         const pseudo = pseudos.find((pseudo: any) => pseudo == control.value);

//         return pseudo ? { pseudoExists: true } : null;
//       })
//     );
//   };
// }

// export function PseudoValidator(service: AuthHandlerService): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     return service.checkIfPseudoAvailable(control.value).pipe(
//       map((res) => {
//         return res ? { pseudoExists: true } : null;
//       })
//     );
//   };
// }