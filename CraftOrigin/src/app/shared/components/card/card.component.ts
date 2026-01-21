import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-card',
  standalone: false,
  template: `
    <div class="ui-card">
      <div class="ui-card__header" *ngIf="title || subtitle">
        <h4 class="ui-card__title" *ngIf="title">{{ title }}</h4>
        <p class="ui-card__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="ui-card__body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .ui-card {
      background: var(--color-card, #fff);
      color: var(--color-foreground, #111);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 14px;
      padding: 1.25rem;
      box-shadow: 0 10px 20px rgba(0,0,0,0.06);
    }
    .ui-card__header {
      margin-bottom: 0.75rem;
    }
    .ui-card__title {
      margin: 0;
      font-weight: 700;
      font-size: 1rem;
    }
    .ui-card__subtitle {
      margin: 0.15rem 0 0;
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.9rem;
    }
    .ui-card__body {
      font-size: 0.95rem;
      line-height: 1.5;
    }
  `]
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
