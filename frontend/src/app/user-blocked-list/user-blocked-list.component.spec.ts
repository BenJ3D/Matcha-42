import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UserBlockedListComponent} from './user-blocked-list.component';

describe('UserLightListComponent', () => {
  let component: UserBlockedListComponent;
  let fixture: ComponentFixture<UserBlockedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBlockedListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserBlockedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
