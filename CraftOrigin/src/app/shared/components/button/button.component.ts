import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shared-button',
  standalone: false,
  template: `
    <button
      type="button"
      class="ui-button"
      [disabled]="disabled"
      (click)="clicked.emit()"
    >
      {{ label }}
    </button>
  `,
  styles: [`
    .ui-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      border: 1px solid var(--color-primary, #f97316);
      background: var(--color-primary, #f97316);
      color: var(--color-primary-foreground, #fff);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    }
    .ui-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    }
    .ui-button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: none;
    }
    .ui-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
  @Input() label = 'Click';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}
