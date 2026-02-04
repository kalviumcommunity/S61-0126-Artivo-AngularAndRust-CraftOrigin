export interface AdminDashboardStats {
  total_users: number;
  total_revenue: string; // Decimal is string in JSON usually
  total_orders: number;
  pending_verifications: number;
  active_artworks: number;
}

export interface RevenueTrend {
  period: string;
  revenue: string;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface UserRoleCount {
  role: string;
  count: number;
}

export interface TopEntity {
  id: string;
  name: string;
  value: string;
  count: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  recent_orders: Order[];
  new_artists: ArtistProfile[];
  new_artworks: ArtworkResponse[];
  revenue_trend: RevenueTrend[];
  orders_by_status: OrderStatusCount[];
  users_by_role: UserRoleCount[];
  top_artworks: TopEntity[];
  top_artists: TopEntity[];
}

export interface UserListDto {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  tribe_name: string;
  bio: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  social_links: any;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtworkResponse {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  artist_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  artist_name?: string; // Optional if joined
}

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: string;
  status: string;
  placed_at: string;
  updated_at: string;
}

export interface RevenueReportItem {
  period: string;
  category: string | null;
  artist_name: string | null;
  revenue: string;
  order_count: number;
}

// Keeping legacy types just in case, but mapped to new usage if possible or ignored
export interface AdminActivityLog extends AdminDashboardStats {} // Placeholder mapping if needed
export interface AdminPermission extends UserListDto {} // Mapping permissions to users
export interface ArtistVerificationRequest extends ArtistProfile {} // Mapping verification to profile
export interface SystemSetting extends Order {} // Mapping settings to orders
