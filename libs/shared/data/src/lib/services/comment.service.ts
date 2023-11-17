import { BehaviorSubject, map } from 'rxjs';

import { Injectable } from '@angular/core';

import { commentFactory } from '../comment.factory';
import { DEFAULT_USERS } from '../default-users';
import { IComment } from '../interfaces';

const sortCommentsDateAsc = (a: IComment, b: IComment): number => {
  return a.timestamp - b.timestamp;
};

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  /**
   * initialized as if a single user was making all the comments (worked by a single user)
   */
  private comments$$ = new BehaviorSubject<IComment[]>(
    Array.from({ length: 5 }).map(() =>
      commentFactory({ author: DEFAULT_USERS[0] })
    )
  );

  /**
   * expose comments sorted by date in ascending order
   */
  comments$ = this.comments$$
    .asObservable()
    .pipe(map((comments) => comments.sort(sortCommentsDateAsc)));

  addComment(comment: IComment) {
    console.log(`adding comment`, comment);
    this.comments$$.next([...this.comments$$.value, comment]);
  }
}
