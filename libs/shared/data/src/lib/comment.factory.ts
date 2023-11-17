import { rand, randPhrase, randRecentDate } from '@ngneat/falso';

import { DEFAULT_USERS } from './default-users';
import { IComment } from './interfaces';

export const commentFactory = (data?: Partial<IComment>): IComment => ({
  author: rand([...DEFAULT_USERS]),
  message: randPhrase(),
  taggedUsers: [],
  timestamp: randRecentDate().getTime(),
  ...data,
});
