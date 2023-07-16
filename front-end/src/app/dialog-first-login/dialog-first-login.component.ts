import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Validators,
  FormControl,
  FormBuilder,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { AuthHandlerService } from '../auth-handler/auth-handler.service';
import { Observable, map } from 'rxjs';
import { PseudoValidator } from './validator/pseudo.validator';

@Component({
  selector: 'app-dialog-first-login',
  templateUrl: './dialog-first-login.component.html',
  styleUrls: ['./dialog-first-login.component.css'],
})
export class DialogFirstLoginComponent implements OnInit {
  userData = {
    pseudo: '',
    pp: '',
    doubleAuth: false,
  };
  selectedFile!: File;
  profilePic!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<DialogFirstLoginComponent>,
    private fb: FormBuilder,
    private authHandlerService: AuthHandlerService
  ) {
  }

  onClose() {
    this.ref.close(this.userForm.value);
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  userForm: FormGroup = this.fb.group({
    pseudo: [
      null,
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
        Validators.pattern('[a-zA-Z1-9]*'),
      ],
      PseudoValidator.createValidator(this.authHandlerService),
    ],
    twoFa: false,
  });

  saveUser() {
    console.log(this.userForm.value);
    this.onClose();
  }

  get pseudo() {
    return this.userForm.get('pseudo');
  }

  // userFormControl = new FormGroup({
  //   pseudo: new FormControl(this.userData.pseudo, [
  //     Validators.required,
  //     Validators.minLength(4),
  //     Validators.maxLength(16),
  //   ]),
  // });

  // pseudoFormControl = new FormControl('', [
  //   Validators.required,
  //   Validators.minLength(1),
  // ]);
}
