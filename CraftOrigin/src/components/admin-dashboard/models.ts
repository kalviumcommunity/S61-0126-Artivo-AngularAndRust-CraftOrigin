export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export type AdminPermissionType =
  | 'MANAGE_USERS'
  | 'VERIFY_ARTISTS'
  | 'MANAGE_ORDERS'
  | 'MANAGE_ARTWORKS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_ADMINS';

export interface AdminPermission {
  id: string;
  admin_id: string;
  permission: AdminPermissionType;
  granted_by: string | null;
  created_at: string;
}

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ArtistVerificationRequest {
  id: string;
  artist_id: string;
  artist_name?: string;
  documents_url: string[];
  status: VerificationStatus;
  reviewed_by: string | null;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}
