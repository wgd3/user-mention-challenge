import { of } from 'rxjs';

import { Overlay } from '@angular/cdk/overlay';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createDirectiveFactory,
  mockProvider,
  SpectatorDirective,
} from '@ngneat/spectator/jest';

import { MentionMenuComponent } from './mention-menu/mention-menu.component';
import { MentionUsersDirective } from './mention-users.directive';
import { MentionService } from './mention.service';
import { IUser } from './user.interface';

@Component({
  template: `<div
    mentionUsers
    contenteditable="true"
    (userMentioned)="onUserMentioned($event)"
  ></div>`,
})
class TestComponent {
  onUserMentioned(user: IUser) {}
}

describe('MentionUsersDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let directiveDebugElement: DebugElement;
  let mentionUsersDirective: MentionUsersDirective;
  let overlay: Overlay;
  let mentionService: MentionService;

  let spectator: SpectatorDirective<MentionUsersDirective>;
  const createDirective = createDirectiveFactory({
    directive: MentionUsersDirective,
    template: `<div
    mentionUsers
    contenteditable="true"
    (userMentioned)="onUserMentioned($event)"
  ></div>`,
    providers: [
      mockProvider(MentionService, {
        matchingUsers$: of([
          { userID: 1, name: 'Kevin' },
          { userID: 2, name: 'Jeff' },
          { userID: 3, name: 'Bryan' },
          { userID: 4, name: 'Gabbey' },
        ]),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createDirective();
    fixture = spectator.fixture;
    component = fixture.componentInstance;
    directiveDebugElement = spectator.debugElement;
    mentionUsersDirective = spectator.directive;

    overlay = spectator.inject(Overlay);
    mentionService = spectator.inject(MentionService);

    fixture.detectChanges();
  });
  it('should create an instance', () => {
    expect(mentionUsersDirective).toBeTruthy();
    expect(directiveDebugElement).toBeTruthy();
  });

  it('should open MentionMenuComponent when "@" symbol is entered', () => {
    const inputText = 'Hello @';

    // const inputSpy = jest.spyOn(mentionUsersDirective, 'onInput');
    // const serviceSpy = jest.spyOn(mentionService, 'filterUsers');

    triggerInputEvent(inputText);
    // expect(inputSpy).toHaveBeenCalled();
    // expect(serviceSpy).toHaveBeenCalledWith('');

    fixture.detectChanges();
    console.log(mentionUsersDirective['overlayRef']);
    expect(mentionUsersDirective['overlayRef']).toBeTruthy();
  });

  it('should close MentionMenuComponent when no "@" symbol is present', () => {
    const inputText = 'Hello world';

    triggerInputEvent(inputText);

    expect(mentionService.filterUsers).toHaveBeenCalledWith('');
    expect(mentionUsersDirective['overlayRef']).toBeFalsy();
  });

  it('should emit userMentioned event and insert username when user is selected', () => {
    const inputText = 'Hello @JohnDoe';

    triggerInputEvent(inputText);

    const mentionMenuComponent = TestBed.createComponent(MentionMenuComponent);
    const selectedUser: IUser = { userID: 1, name: 'JohnDoe' };
    mentionMenuComponent.componentInstance.userSelected.next(selectedUser);
    mentionMenuComponent.detectChanges();

    const emitSpy = jest.spyOn(component, 'onUserMentioned');

    // expect(component.onUserMentioned).toHaveBeenCalledWith(selectedUser);
    expect(mentionUsersDirective['insertUsername']).toHaveBeenCalled();
    expect(mentionUsersDirective['closeMentionMenu']).toHaveBeenCalled();
  });

  function triggerInputEvent(text: string) {
    const inputElement = directiveDebugElement.nativeElement;
    inputElement.textContent = text;
    // inputElement.triggerEventHandler('input', test);
    // inputElement.dispatchEvent(new InputEvent(text));
    spectator.typeInElement(text, inputElement);
    fixture.detectChanges();
  }
});
