import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePhotoComponent } from './change-photo.component';

describe('ChangePhotoComponent', () => {
  let component: ChangePhotoComponent;
  let fixture: ComponentFixture<ChangePhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePhotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
