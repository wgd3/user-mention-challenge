import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { UserService } from '@shared/data';
import { USER_PROVIDER } from '@user-mentions';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    {
      provide: USER_PROVIDER,
      useFactory: (userService: UserService) => userService.users$,
      deps: [UserService],
    },
  ],
};
