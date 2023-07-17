import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dialog-first-login',
  templateUrl: './dialog-first-login.component.html',
  styleUrls: ['./dialog-first-login.component.css'],
})
export class DialogFirstLoginComponent implements OnInit {
  myData = {
    login: '',
    pp: '',
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.myData.login = this.data.login;
    this.myData.pp = this.data.pp;
  }
}
