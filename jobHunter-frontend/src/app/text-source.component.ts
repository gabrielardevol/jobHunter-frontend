import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-source',
  imports: [],
  template: `
    <p>
      text-source works!
    </p>
  `,
  styles: ``
})
export class TextSourceComponent {
  @Input() entity!: 'offer' | 'response';
  @Input() entityId!: string;

}
