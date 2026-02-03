import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import type { SystemSetting } from '../models';

@Component({
  selector: 'app-admin-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css']
})
export class SystemSettingsComponent implements OnInit {
  settings: SystemSetting[] = [];
  loading = true;
  savingKey: string | null = null;
  editValue: Record<string, string> = {};

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getSystemSettings().subscribe({
      next: (list) => {
        this.settings = list;
        list.forEach(s => {
          this.editValue[s.key] = this.stringify(s.value);
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  private stringify(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return String(v);
  }

  parseValue(key: string): unknown {
    const raw = this.editValue[key];
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const n = Number(raw);
    if (!Number.isNaN(n) && String(n) === raw) return n;
    return raw;
  }

  save(setting: SystemSetting): void {
    this.savingKey = setting.key;
    const value = this.parseValue(setting.key);
    this.admin.updateSystemSetting(setting.key, value).subscribe({
      next: (updated) => {
        const idx = this.settings.findIndex(s => s.key === setting.key);
        if (idx !== -1) this.settings[idx] = updated;
        this.editValue[setting.key] = this.stringify(updated.value);
        this.savingKey = null;
      },
      error: () => (this.savingKey = null)
    });
  }
}
