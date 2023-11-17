import { filter, Subject, Subscription, take, tap } from 'rxjs';

import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    Directive, ElementRef, EventEmitter, HostListener, inject, Injector, OnDestroy, Output,
    Renderer2
} from '@angular/core';
import { IUser } from '@shared/data';

import { MentionMenuComponent } from './mention-menu/mention-menu.component';
import { MentionService } from './mention.service';

interface IMenuPosition {
  top: number;
  left: number;
}

@Directive({
  selector: '[umMentionUsers], [mentionUsers]',
  standalone: true,
})
export class MentionUsersDirective implements OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private mentionService = inject(MentionService);
  private overlay = inject(Overlay);
  private injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;

  private destroy$ = new Subject();
  private teardownEvents: Subscription[] = [];

  @Output() userMentioned = new EventEmitter<IUser>();

  @HostListener('input') onInput() {
    const text = this.el.nativeElement.innerText;
    const match = text.match(/(?:^|\s)@(\w*)$/);
    console.log(`[MentionUserDirection] match`, match);
    if (match) {
      const searchString = match[1];
      this.mentionService.filterUsers(searchString);

      if (!this.overlayRef) {
        const menuPosition = this.getPopupPosition();
        this.openMentionMenu(menuPosition);
      }
    } else {
      if (this.overlayRef) {
        this.mentionService.filterUsers('');
        this.closeMentionMenu();
      }
    }
  }

  ngOnDestroy(): void {
    this.teardownEvents.forEach((sub) => sub.unsubscribe());
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  private openMentionMenu(menuPosition: IMenuPosition) {
    console.log(`opening mention menu!`);
    const overlayConfig = this.createOverlayConfig(menuPosition);
    this.overlayRef = this.overlay.create(overlayConfig);

    const portalInjector = this.createInjector();

    const portal = new ComponentPortal(
      MentionMenuComponent,
      null,
      portalInjector
    );
    const compRef = this.overlayRef.attach(portal);

    this.teardownEvents.push(
      // watch for background clicks
      this.overlayRef.backdropClick().subscribe(() => {
        this.closeMentionMenu();
        this.returnFocusToInput();
      })
    );

    this.teardownEvents.push(
      // watch for the escape key
      this.overlayRef
        .keydownEvents()
        .pipe(
          filter((evt) => evt.code === 'Escape'),
          take(1)
        )
        .subscribe(() => {
          this.closeMentionMenu();
          this.returnFocusToInput();
        })
    );

    this.teardownEvents.push(
      compRef.instance.userSelected
        .asObservable()
        .pipe(
          tap((selectedUser) => {
            this.userMentioned.emit(selectedUser);
          })
        )
        .subscribe((selectedUser) => {
          this.closeMentionMenu();
          this.returnFocusToInput();

          // IMPORTANT - to accomodate a bug/behavior related to safari
          // and `window.getSelection` this method call must come
          // _after_ focus has been returned to the contenteditable element
          this.insertUsername(selectedUser.name);
        })
    );
  }

  private closeMentionMenu() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }

  /**
   * Utility method for generating an OverlayConfig on demand.
   *
   * This config uses the GlobalPositionStrategy to
   * position the MentionMenuComponent in an absolute location instead of relative to the host element.
   *
   * @see https://material.angular.io/cdk/overlay/api#GlobalPositionStrategy
   *
   * @param menuPosition coordinates for the location in the host element where the "@" symbol is
   * @returns configuration for the Overlay
   */
  private createOverlayConfig(menuPosition: IMenuPosition): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .global()
        .left(`${menuPosition.left}px`)
        .top(`${menuPosition.top}px`),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
  }

  private createInjector(): Injector {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injectionTokens = new WeakMap<any, any>([
      [MentionService, this.mentionService],
      [OverlayRef, this.overlayRef],
    ]);
    return Injector.create({
      parent: this.injector,
      providers: Object.keys(injectionTokens).map((key) => ({
        provide: key,
        useValue: injectionTokens.get(key),
      })),
    });
  }

  private getPopupPosition(): IMenuPosition {
    const selection = window.getSelection();
    if (!selection) {
      // Handle the case where the selection object is null
      return { top: 0, left: 0 };
    }
    const range = selection.getRangeAt(0).cloneRange();
    const rect = range.getBoundingClientRect();

    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  /**
   * Returns focus to the <p> element this directive is attached to.
   */
  private returnFocusToInput() {
    this.renderer.selectRootElement(this.el.nativeElement, true).focus();
  }

  private insertUsername(username: string) {
    const commentElement = this.el.nativeElement;
    const elContent = commentElement.textContent;

    // Find the position of the '@' symbol that triggered the menu
    const match = commentElement.innerText.match(/(?:^|\s)@(\w*)$/);
    // console.log(`[MentionUserDirection :: insertUsername] match`, match);

    if (match) {
      // index = caret position before matched group, adds count of characters to the last '@'
      const atSymbolPosition = match.index + match[0].lastIndexOf('@');

      // Set the cursor position to the end of the '@' symbol
      const cursorPosition = atSymbolPosition + 1;

      // if a user searched while menu was open, this represents that
      const searchTerm: string = match[1];

      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);

        const anchorNode = selection.anchorNode;

        if (anchorNode) {
          // all text prior to the '@' symbol that triggered the menu
          const prefix = elContent.substring(0, atSymbolPosition);

          // all text after the '@' trigger, excluding any search term that was used
          const suffix = elContent.substring(
            cursorPosition + searchTerm.length,
            elContent.length
          );

          anchorNode.textContent = prefix + `@${username}` + suffix;

          // reset caret position to end of the line
          range.setStart(anchorNode, atSymbolPosition + 1 + username.length);
          range.collapse(true);
          console.log(range);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        console.dir(selection);
        console.warn(`couldn't find selection`);
      }
    }
  }
}
