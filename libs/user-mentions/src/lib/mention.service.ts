import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { USER_PROVIDER } from './tokens';
import { IUser } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class MentionService {
  private users$ = inject(USER_PROVIDER);

  private filter$$ = new BehaviorSubject<string | null>(null);

  matchingUsers$: Observable<IUser[]> = combineLatest({
    users: this.users$,
    filter: this.filter$$.asObservable(),
  }).pipe(
    tap(({ users, filter }) => console.log({ users, filter })),
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
    console.log(`[MentionService] filtering users with: ${pattern}`);
    if (!pattern.trim().length) {
      this.filter$$.next(null);
    } else {
      this.filter$$.next(pattern);
    }
  }
}
