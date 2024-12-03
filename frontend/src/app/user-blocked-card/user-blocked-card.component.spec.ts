import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UserBlockedCardComponent} from './user-blocked-card.component';

describe('UserCardComponent', () => {
  let component: UserBlockedCardComponent;
  let fixture: ComponentFixture<UserBlockedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBlockedCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserBlockedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
