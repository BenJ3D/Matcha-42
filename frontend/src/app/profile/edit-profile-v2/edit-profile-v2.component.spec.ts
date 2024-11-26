import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileV2Component } from './edit-profile-v2.component';

describe('EditProfileV2Component', () => {
  let component: EditProfileV2Component;
  let fixture: ComponentFixture<EditProfileV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
