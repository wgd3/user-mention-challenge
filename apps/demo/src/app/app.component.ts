import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import {
  CommentService,
  ContentEditableControlValueAccessorDirective,
  DEFAULT_USERS,
  HighlightUsersPipe,
  IUser,
  UserService,
} from '@shared/data';
import {
  MentionMenuComponent,
  MentionService,
  MentionUsersDirective,
} from '@user-mentions';

import { CommentComponent } from './components/comment/comment.component';

type CommentFormType = {
  message: FormControl<string>;
};
@Component({
  selector: 'umc-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CommentComponent,
    ReactiveFormsModule,
    FormsModule,
    MentionUsersDirective,
    MentionMenuComponent,
    ContentEditableControlValueAccessorDirective,
    HighlightUsersPipe,
  ],
  providers: [MentionService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private commentService = inject(CommentService);
  private userService = inject(UserService);

  comments$ = this.commentService.comments$;
  users$: Observable<IUser[]> = this.userService.users$;

  commentFormHidden = true;

  commentForm = inject(FormBuilder).group<CommentFormType>({
    message: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  commentFormTaggedUsers: IUser[] = [];

  resetCommentForm() {
    this.commentForm.reset();
  }

  submitComment() {
    this.commentForm.updateValueAndValidity();
    if (this.commentForm.valid && this.commentForm.dirty) {
      const { message } = this.commentForm.value;
      if (!message?.length) {
        console.error(`Comment message is empty!`);
        return;
      }
      this.commentService.addComment({
        author: DEFAULT_USERS[0],
        timestamp: new Date().getTime(),
        message: message.trim(),
        taggedUsers: [...this.commentFormTaggedUsers],
      });

      this.commentFormTaggedUsers.forEach((u) =>
        alert(`User ${u.name} has been alerted!`)
      );
      this.commentFormTaggedUsers = [];
      this.commentForm.reset();
      this.commentFormHidden = true;
    } else {
      console.warn(`comment form is invalid`, this.commentForm);
    }
  }

  logUserSelection(user: IUser) {
    console.log(`AppComponent detected user selection`, user);
    if (!this.commentFormTaggedUsers.includes(user)) {
      this.commentFormTaggedUsers.push(user);
    }
    // MentionUsersDirective inserts this text via the browser API
    // and does not update the AbstractControl's value
    this.commentForm.updateValueAndValidity();
  }
}
