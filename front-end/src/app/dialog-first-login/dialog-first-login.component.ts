import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { AuthHandlerService } from '../auth-handler/auth-handler.service';
import { PseudoValidator } from './validator/pseudo.validator';
import { DialogFirstLoginService } from './dialog-first-login.service';

@Component({
  selector: 'app-dialog-first-login',
  templateUrl: './dialog-first-login.component.html',
  styleUrls: ['./dialog-first-login.component.css'],
})
export class DialogFirstLoginComponent implements OnInit {
  userData = {
    login: '',
    pseudo: '',
    pp: File,
    doubleAuth: false,
  };
  selectedFile!: File;
  profilePic: string = this.data.pp;
  localProfilePicUrl: any = this.data.pp
  imageFile!: {
    link: string | ArrayBuffer | null;
    file: any;
    name: string;
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<DialogFirstLoginComponent>,
    private fb: FormBuilder,
    private firstLoginService: DialogFirstLoginService,
    private authHandlerService: AuthHandlerService
  ) {}

  onClose() {
    this.ref.close(this.userForm.value);
  }

  ngOnInit(): void {
    this.userData.login = this.data.login;
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
    doubleAuth: false,
    file: new FormControl(''),
    fileSource: new FormControl(''),
  });

  saveUser() {
    this.onClose();
  }

  get pseudo() {
    return this.userForm.get('pseudo');
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.userForm.patchValue({
        fileSource: file,
      });

      var reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.localProfilePicUrl = (<FileReader>event.target).result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
