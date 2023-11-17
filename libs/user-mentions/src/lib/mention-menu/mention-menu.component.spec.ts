import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionMenuComponent } from './mention-menu.component';

describe('MentionMenuComponent', () => {
  let component: MentionMenuComponent;
  let fixture: ComponentFixture<MentionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MentionMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MentionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
