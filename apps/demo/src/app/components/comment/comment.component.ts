import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HighlightUsersPipe, IComment } from '@shared/data';

@Component({
  selector: 'umc-comment',
  standalone: true,
  imports: [CommonModule, DatePipe, HighlightUsersPipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
})
export class CommentComponent {
  @Input() comment!: IComment;
}
