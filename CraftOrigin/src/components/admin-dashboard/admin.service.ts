import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import type {
  AdminActivityLog,
  AdminPermission,
  ArtistVerificationRequest,
  SystemSetting
} from './models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private mockLogs: AdminActivityLog[] = [
    {
      id: '1',
      admin_id: 'admin-1',
      action: 'USER_UPDATED',
      entity_type: 'USER',
      entity_id: 'user-1',
      details: { field: 'email' },
      ip_address: '192.168.1.1',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      admin_id: 'admin-1',
      action: 'ARTIST_VERIFIED',
      entity_type: 'ARTIST',
      entity_id: 'artist-1',
      details: null,
      ip_address: '192.168.1.1',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      admin_id: 'admin-1',
      action: 'ORDER_STATUS_CHANGED',
      entity_type: 'ORDER',
      entity_id: 'order-1',
      details: { from: 'PENDING', to: 'SHIPPED' },
      ip_address: null,
      created_at: new Date().toISOString()
    }
  ];

  private mockPermissions: AdminPermission[] = [
    {
      id: 'p1',
      admin_id: 'admin-1',
      permission: 'MANAGE_USERS',
      granted_by: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'p2',
      admin_id: 'admin-1',
      permission: 'VERIFY_ARTISTS',
      granted_by: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'p3',
      admin_id: 'admin-1',
      permission: 'MANAGE_ORDERS',
      granted_by: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'p4',
      admin_id: 'admin-1',
      permission: 'MANAGE_ARTWORKS',
      granted_by: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'p5',
      admin_id: 'admin-1',
      permission: 'VIEW_ANALYTICS',
      granted_by: null,
      created_at: new Date().toISOString()
    },
    {
      id: 'p6',
      admin_id: 'admin-1',
      permission: 'MANAGE_ADMINS',
      granted_by: null,
      created_at: new Date().toISOString()
    }
  ];

  private mockVerificationRequests: ArtistVerificationRequest[] = [
    {
      id: 'v1',
      artist_id: 'artist-1',
      artist_name: 'Jane Artist',
      documents_url: ['/docs/id.pdf', '/docs/portfolio.pdf'],
      status: 'PENDING',
      reviewed_by: null,
      review_notes: null,
      submitted_at: new Date(Date.now() - 172800000).toISOString(),
      reviewed_at: null,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'v2',
      artist_id: 'artist-2',
      artist_name: 'John Creator',
      documents_url: ['/docs/verification.pdf'],
      status: 'APPROVED',
      reviewed_by: 'admin-1',
      review_notes: 'Documents verified.',
      submitted_at: new Date(Date.now() - 259200000).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  private mockSettings: SystemSetting[] = [
    {
      key: 'maintenance_mode',
      value: false,
      description: 'When enabled, only admins can access the site.',
      updated_by: 'admin-1',
      updated_at: new Date().toISOString()
    },
    {
      key: 'max_upload_mb',
      value: 10,
      description: 'Maximum artwork upload size in MB.',
      updated_by: null,
      updated_at: new Date().toISOString()
    },
    {
      key: 'verification_required',
      value: true,
      description: 'Require artist verification before selling.',
      updated_by: 'admin-1',
      updated_at: new Date().toISOString()
    }
  ];

  getActivityLogs(): Observable<AdminActivityLog[]> {
    return of([...this.mockLogs]).pipe(delay(300));
  }

  getPermissions(): Observable<AdminPermission[]> {
    return of([...this.mockPermissions]).pipe(delay(300));
  }

  getVerificationRequests(): Observable<ArtistVerificationRequest[]> {
    return of([...this.mockVerificationRequests]).pipe(delay(300));
  }

  getSystemSettings(): Observable<SystemSetting[]> {
    return of([...this.mockSettings]).pipe(delay(300));
  }

  updateSystemSetting(key: string, value: unknown): Observable<SystemSetting> {
    const setting = this.mockSettings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updated_at = new Date().toISOString();
      setting.updated_by = 'admin-1';
      return of({ ...setting }).pipe(delay(200));
    }
    return of({ key, value, description: null, updated_by: 'admin-1', updated_at: new Date().toISOString() }).pipe(delay(200));
  }

  approveVerification(id: string, notes?: string): Observable<ArtistVerificationRequest> {
    const req = this.mockVerificationRequests.find(r => r.id === id);
    if (req) {
      req.status = 'APPROVED';
      req.review_notes = notes ?? req.review_notes;
      req.reviewed_at = new Date().toISOString();
      req.reviewed_by = 'admin-1';
      req.updated_at = req.reviewed_at;
      return of({ ...req }).pipe(delay(200));
    }
    return of(null as unknown as ArtistVerificationRequest).pipe(delay(200));
  }

  rejectVerification(id: string, notes?: string): Observable<ArtistVerificationRequest> {
    const req = this.mockVerificationRequests.find(r => r.id === id);
    if (req) {
      req.status = 'REJECTED';
      req.review_notes = notes ?? req.review_notes;
      req.reviewed_at = new Date().toISOString();
      req.reviewed_by = 'admin-1';
      req.updated_at = req.reviewed_at;
      return of({ ...req }).pipe(delay(200));
    }
    return of(null as unknown as ArtistVerificationRequest).pipe(delay(200));
  }
}
