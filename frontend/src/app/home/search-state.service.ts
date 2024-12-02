// search-state.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SearchStateService {
  private searchFormState: any = null;

  setState(state: any) {
    this.searchFormState = state;
  }

  getState(): any {
    return this.searchFormState;
  }

  clearState() {
    this.searchFormState = null;
  }
}
