import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import { IUser, UserService } from '@shared/data';

@Injectable({
  providedIn: 'root',
})
export class MentionService {
  private users$ = inject(UserService).users$;

  private filter$$ = new BehaviorSubject<string | null>(null);

  matchingUsers$: Observable<IUser[]> = combineLatest({
    users: this.users$,
    filter: this.filter$$.asObservable(),
  }).pipe(
    // make the search case-insensitive
    map(({ users, filter }) =>
      filter
        ? users.filter((u) =>
            u.name.toLowerCase().includes(filter.toLowerCase())
          )
        : users
    ),
    // only return the first 5 results
    map((users) => users.slice(0, 5))
  );

  filterUsers(pattern: string) {
    if (!pattern.trim().length) {
      this.filter$$.next(pattern);
    } else {
      this.filter$$.next(null);
    }
  }
}
