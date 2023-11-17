import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'um-user-mentions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-mentions.component.html',
  styleUrls: ['./user-mentions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMentionsComponent {}
