import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

import { DEFAULT_USERS } from '../default-users';
import { IUser } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users$$ = new BehaviorSubject<IUser[]>([...DEFAULT_USERS]);
  users$ = this.users$$.asObservable();
}
