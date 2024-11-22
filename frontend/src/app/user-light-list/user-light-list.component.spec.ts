import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLightListComponent } from './user-light-list.component';

describe('UserLightListComponent', () => {
  let component: UserLightListComponent;
  let fixture: ComponentFixture<UserLightListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLightListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
