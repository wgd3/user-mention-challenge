import { firstValueFrom } from 'rxjs';

import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { UserService } from '../services';

@Pipe({
  name: 'highlightUsers',
  standalone: true,
})
export class HighlightUsersPipe implements PipeTransform {
  private userService = inject(UserService);

  // needed to retain data-* attributes in generated <span> elements
  private sanitizer = inject(DomSanitizer);

  async transform(
    value: string,
    className: string = 'username-tag'
  ): Promise<SafeHtml> {
    const users = await firstValueFrom(this.userService.users$);
    const returnParts: SafeHtml[] = value
      .split(' ')
      .reduce((acc: SafeHtml[], curr) => {
        const matchedUser = users.find((u) => u.name === curr.slice(1));
        if (curr.startsWith('@') && matchedUser) {
          const userEl = `<span class="${className}">@${matchedUser.name}</span>`;
          acc.push(this.sanitizer.bypassSecurityTrustHtml(userEl));
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

    return returnParts.join(' ');
  }
}
