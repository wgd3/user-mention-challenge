import { of } from 'rxjs';

import { Component, Renderer2, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { DEFAULT_USERS, IUser } from '@shared/data';

import { MentionService } from '../mention.service';
import { MentionMenuComponent } from './mention-menu.component';

@Component({
  template: `<um-mention-menu></um-mention-menu>`,
})
class TestHostComponent {}

describe('MentionMenuComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let menuComponent: MentionMenuComponent;
  let renderer: Renderer2;

  let spectator: SpectatorHost<MentionMenuComponent>;
  const createHost = createHostFactory({
    component: MentionMenuComponent,
    providers: [Renderer2],
  });

  beforeEach(() => {
    spectator = createHost(`<um-mention-menu></um-mention-menu>`, {
      providers: [
        mockProvider(MentionService, {
          matchingUsers$: of(DEFAULT_USERS),
        }),
        // mockProvider(Renderer2, {
        //   addClass: jest.fn(),
        // }),
      ],
    });
    fixture = spectator.hostFixture;
    menuComponent = spectator.component;

    renderer = spectator.inject(Renderer2 as Type<Renderer2>, true);

    fixture.detectChanges();
  });

  it('should create MentionMenuComponent', () => {
    expect(menuComponent).toBeTruthy();
  });

  it('should initialize and subscribe to matchingUsers$', fakeAsync(() => {
    tick();
    expect(menuComponent.matchingUsers).toEqual(DEFAULT_USERS);
  }));

  it('should grab focus for the menu on ArrowDown event', fakeAsync(() => {
    menuComponent.ngAfterViewInit();
    tick();

    spectator.keyboard.pressKey('ArrowDown', document, 'keydown');
    tick();

    const menuItems = spectator.queryAll('.mention-menu__list-item');
    expect(menuItems.length).toBeGreaterThan(0);

    const firstMenuItem = menuItems[0];
    expect(firstMenuItem.getAttribute('tabindex')).toBe('0');
    expect(firstMenuItem.classList.contains('highlight')).toBe(true);
  }));

  it('should remove highlight and tabindex on ArrowUp event', fakeAsync(() => {
    menuComponent.ngAfterViewInit();
    spectator.keyboard.pressKey('ArrowUp');
    tick();

    const firstMenuItem = menuComponent.mentionList?.nativeElement.children[0];
    expect(firstMenuItem.getAttribute('tabindex')).toBeNull();
    expect(firstMenuItem.classList.contains('highlight')).toBe(false);
  }));

  it('should select user on Enter event', fakeAsync(() => {
    const user: IUser = { userID: 1, name: 'JohnDoe' };

    menuComponent.userSelected.asObservable().subscribe((emitUser) => {
      expect(emitUser).toEqual(user);
    });

    menuComponent.ngAfterViewInit();
    menuComponent.matchingUsers = [user];
    spectator.keyboard.pressKey('ArrowDown');
    spectator.keyboard.pressEnter();
    tick();
  }));

  it('should handle other key events without changing tabindex or highlight', fakeAsync(() => {
    menuComponent.ngAfterViewInit();
    spectator.keyboard.pressKey('Space');
    tick();

    const firstMenuItem = menuComponent.mentionList?.nativeElement.children[0];
    expect(firstMenuItem.getAttribute('tabindex')).toBeNull();
    expect(firstMenuItem.classList.contains('highlight')).toBe(false);
  }));

  afterEach(() => {
    fixture.destroy();
  });
});
