import { Subscription } from 'rxjs';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { IUser } from '@shared/data';

import { MentionService } from '../mention.service';

@Component({
  selector: 'um-mention-menu',
  templateUrl: './mention-menu.component.html',
  styleUrl: './mention-menu.component.scss',
  standalone: true,
})
export class MentionMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  private mentionService = inject(MentionService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @ViewChild('mentionUserList', { static: false }) mentionList:
    | ElementRef
    | undefined;

  matchingUsers: IUser[] = [];
  private subscription: Subscription | undefined;

  @Output() userSelected = new EventEmitter<IUser>();

  ngOnInit() {
    // TODO: make this async!!
    this.subscription = this.mentionService.matchingUsers$.subscribe(
      (users) => {
        this.matchingUsers = users;
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    // move focus to the menu for keyboard interactions
    this.grabFocusForMenu();
  }

  private grabFocusForMenu() {
    console.log(`grabbing menu focus`, this.mentionList);
    if (this.matchingUsers.length > 0 && this.mentionList) {
      console.log(`viewchild`, this.mentionList);
      this.renderer.setAttribute(
        this.mentionList.nativeElement.children[0],
        'tabindex',
        '0'
      );
      this.renderer.addClass(
        this.mentionList.nativeElement.children[0],
        'highlight'
      );
      this.mentionList.nativeElement.children[0].focus();
    }
  }

  private removeHighlightAndTabIndex() {
    const items = this.mentionList?.nativeElement.children;
    for (let i = 0; i < items.length; i++) {
      this.renderer.removeAttribute(items[i], 'tabindex');
      this.renderer.removeClass(items[i], 'highlight');
    }
  }

  selectUser(user: IUser) {
    this.userSelected.emit(user);
  }

  onKeyDown(event: KeyboardEvent) {
    console.log(`kbd evt`, event);
    const items = this.mentionList?.nativeElement.children;
    let currentIndex = Array.from(items).indexOf(document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        this.removeHighlightAndTabIndex();
        currentIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        this.removeHighlightAndTabIndex();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Tab':
        this.removeHighlightAndTabIndex();
        currentIndex = (currentIndex + 1) % items.length;
        break;
      case 'Enter':
        // prevent a newline/br from being created!!
        event.preventDefault();
        if (this.matchingUsers.length > 0) {
          this.selectUser(this.matchingUsers[currentIndex]);
        }
        break;
    }

    this.renderer.setAttribute(items[currentIndex], 'tabindex', '0');
    this.renderer.addClass(items[currentIndex], 'highlight');
    items[currentIndex].focus();
  }
}
