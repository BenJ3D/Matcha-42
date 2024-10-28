import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  show(message: string, action: string = 'Close', config?: MatSnackBarConfig): void {
    const defaultConfig: MatSnackBarConfig = {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    };

    this.snackBar.open(message, action, defaultConfig);
  }

  showWithAction(message: string, action: string, onAction: () => void, config?: MatSnackBarConfig): void {
    const defaultConfig: MatSnackBarConfig = {
      duration: 0,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    };
    const snackBarRef = this.snackBar.open(message, action, defaultConfig);

    snackBarRef.onAction().subscribe(() => {
      onAction();
    });
}
