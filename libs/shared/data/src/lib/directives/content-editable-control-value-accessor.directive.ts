import { ContentObserver } from '@angular/cdk/observers';
import {
    Directive, ElementRef, forwardRef, HostListener, inject, OnInit, Renderer2
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[contenteditable][formControlName]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(
        () => ContentEditableControlValueAccessorDirective
      ),
      multi: true,
    },
  ],
})
export class ContentEditableControlValueAccessorDirective
  implements ControlValueAccessor, OnInit
{
  private elRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private observer = inject(ContentObserver);

  private onChange!: (value: string) => void;
  private onTouched!: () => void;

  @HostListener('input')
  registerInputChange() {
    const newValue = this.elRef.nativeElement.innerText;
    console.log(`Got a new value: ${newValue}`);
    this.onChange(newValue);
  }

  @HostListener('blur')
  registerBlur() {
    this.onTouched();
  }

  @HostListener('change')
  registerValueChange() {
    const newValue = this.elRef.nativeElement.innerText;
    console.log(`[value change] Got a new value: ${newValue}`);
    this.onChange(newValue);
  }

  /**
   * `MentionUsersDirective` updates the textContent of this host element
   * via native DOM API and thus the inserted usernames are not detected
   * as "change" events by the FormControl. This observer subscription
   * ensures _all_ changes to the contenteditable host are reflected
   */
  ngOnInit(): void {
    this.observer.observe(this.elRef.nativeElement).subscribe(() => {
      this.registerValueChange();
    });
  }

  writeValue(val: string | null): void {
    if (!val || !val.trim().length) {
      val = '';
    }
    this.renderer.setProperty(this.elRef.nativeElement, 'innerText', val);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // console.log(`setting disabled state: ${isDisabled}`);
    this.renderer.setAttribute(
      this.elRef.nativeElement,
      'contenteditable',
      `${!isDisabled}`
    );
  }
}
