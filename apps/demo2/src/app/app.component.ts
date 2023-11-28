import { BehaviorSubject } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

export interface IUser {
  userID: number;
  name: string;
}

export interface IComment {
  message: string;

  /**
   * stored as milliseconds since epoch
   */
  timestamp: number;

  /**
   * Whole user object for easier reference to name
   */
  author: IUser;

  /**
   * list of userIDs from tagged users in the `message` text
   */
  taggedUsers: IUser[];
}

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  users = [
    { userID: 1, name: 'Kevin' },
    { userID: 2, name: 'Jeff' },
    { userID: 3, name: 'Bryan' },
    { userID: 4, name: 'Gabbey' },
  ];

  taggedUsers: IUser[] = [];
  showUserMenu = false;
  textareaControl = new FormControl('');
  userTaggingForm!: FormGroup;
  filteredUsers = new BehaviorSubject<IUser[]>([...this.users]);

  commentFormHidden = true;

  comments$ = new BehaviorSubject<IComment[]>([]);

  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.userTaggingForm = this.fb.group({
      textarea: this.textareaControl,
    });

    this.textareaControl.valueChanges.subscribe((value) => {
      console.log(value);
      this.handleTextareaChanges(value);
    });
  }

  handleTextareaChanges(value: string | null): void {
    if (!value) {
      return;
    }
    const triggerPattern = /(?:^|\s)@(\w*)$/;
    const match = value.match(triggerPattern);

    if (match) {
      // Trigger pattern found, show user menu and filter users
      const filterText = match[1] || ''; // Extract the filter text
      console.log(`filtering users with ${filterText}`);
      this.filteredUsers.next(this.filterUsers(filterText));
      this.showUserMenu = true;
    } else {
      // Trigger pattern not found, hide user menu
      this.showUserMenu = false;
    }

    // Check for tagged users that are no longer present in the textarea
    const removedUsers = this.taggedUsers.filter(
      (user) => value.indexOf(`@${user.name}`) === -1
    );

    // Update the taggedUsers array
    removedUsers.forEach((removedUser) => {
      const index = this.taggedUsers.indexOf(removedUser);
      if (index !== -1) {
        this.taggedUsers.splice(index, 1);
      }
    });
  }

  filterUsers(filterText: string): any[] {
    // Implement user filtering logic based on the filterText
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }

  onUserSelect(user: any): void {
    // Logic when a user is selected from the menu
    const currentValue = this.textareaControl.value ?? '';

    // Find the position of "@" in the current textarea value
    const atIndex = currentValue.lastIndexOf('@');

    // Get the text before "@" (excluding "@") and after "@"
    const textBeforeAt = currentValue.substring(0, atIndex);
    const textAfterAt = currentValue.substring(atIndex + 1 + user.name.length);

    // Construct the updated textarea value with the selected user's name
    const updatedValue = `${textBeforeAt}@${user.name} ${textAfterAt}`;

    // Set the updated value to the textarea control
    this.textareaControl.setValue(updatedValue);

    // Add the selected user to the taggedUsers array
    this.taggedUsers.push(user);

    // Hide the user menu
    this.showUserMenu = false;

    // Set focus back to the textarea
    this.textareaControl.markAsDirty(); // Ensure the control is considered dirty
    const textareaElement = document.getElementById('new-comment');
    if (textareaElement) {
      textareaElement.focus();
    }
  }

  resetCommentForm() {
    this.userTaggingForm.reset();
    this.taggedUsers = [];
  }

  submitComment() {
    this.comments$.next([
      ...this.comments$.value,
      {
        message: this.textareaControl.value ?? '',
        taggedUsers: [...this.taggedUsers],
        timestamp: new Date().getTime(),
        author: this.users[0],
      },
    ]);
    this.taggedUsers.forEach((user) =>
      alert(`User ${user.name} has been alerted`)
    );
    this.resetCommentForm();
    this.commentFormHidden = true;
  }
}
