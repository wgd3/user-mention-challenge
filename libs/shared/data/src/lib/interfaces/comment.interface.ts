import { IUser } from './user.interface';

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
