import { Observable } from 'rxjs';

import { InjectionToken } from '@angular/core';

import { IUser } from './user.interface';

/**
 * InjectionToken used to provide users to the Directive in this library.
 * 
 * This token allows different sources to be used. Additionally, any consumer
 * could adapt this to use any data source as long as the output is an object
 * with the `userID` and `name` fields required by the `IUser` interface.
 * 
 * @example 
 * export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    {
      provide: USER_PROVIDER,
      useFactory: (userService: UserService) => userService.users$,
      deps: [UserService],
    },
  ],
};
 *
 * @example
 * export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    {
      provide: USER_PROVIDER,
      useFactory: (userService: NonStandardUserService) => userService.users$.pipe(
        map((users) => users.map(u => ({
            userID: u.someOtherNumericalIdentifier,
            name: `${u.firstName} ${u.lastName}`
        })))
      ),
      deps: [UserService],
    },
  ],
};
 * 
 */
export const USER_PROVIDER = new InjectionToken<Observable<Array<IUser>>>(
  'USER_PROVIDER'
);
