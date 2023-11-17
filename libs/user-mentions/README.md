# user-mentions

## Usage

In your application you will need to provide a value for the `USER_PROVIDER` token. This value should be an Observable array of any data structure that extends the `IUser` interface also in this library.

Angular 17+

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: USER_PROVIDER,
      useFactory: (userService: UserService) => userService.users$,
      deps: [UserService],
    },
  ],
};
```

Angular < 17

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [],
  providers: [
    {
      provide: USER_PROVIDER,
      useFactory: (userService: UserService) => userService.users$,
      deps: [UserService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

With users provided, you can now import the Directive and use it in your application! It has been tested only on `<div>` elements with a `contenteditable` attribute:

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MentionUsersDirective],
  providers: [],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
```

```html
<div contenteditable="true" mentionUsers (userMentioned)="handleUserMention($event)"></div>
```

The `userMentioned` output is an EventEmitter that outputs `IUser` objects upon selection.

## Adapting This Library

There is a simple interface `IUser` in this library.

```typescript
export interface IUser {
  userID: number;
  name: string;
}
```

For consumers who have a user service with a different schema for their users, the Injection Token can be used like so:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    {
      provide: USER_PROVIDER,
      useFactory: (userService: NonStandardUserService) =>
        userService.users$.pipe(
          map((users) =>
            users.map((u) => ({
              userID: u.someOtherNumericalIdentifier,
              name: `${u.firstName} ${u.lastName}`,
            }))
          )
        ),
      deps: [UserService],
    },
  ],
};
```
