import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-not-logued',
  templateUrl: './dialog-not-logued.component.html',
  styleUrls: ['./dialog-not-logued.component.css']
})
export class DialogNotLoguedComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogNotLoguedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router) { }

    goToLogin() {
      this.router.navigate(['/auth']);
      this.onCancel();
    }

    onCancel() {
      this.dialogRef.close()
    }
}
