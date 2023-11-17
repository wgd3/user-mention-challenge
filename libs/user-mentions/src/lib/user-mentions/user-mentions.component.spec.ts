import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMentionsComponent } from './user-mentions.component';

describe('UserMentionsComponent', () => {
  let component: UserMentionsComponent;
  let fixture: ComponentFixture<UserMentionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMentionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMentionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
