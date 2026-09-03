/**
 * Shared entity types for static dummy data.
 * Used across all src/data/* files.
 */

export type CustomerStatus = 'active' | 'expired' | 'suspended';
export type PaymentMethod = 'bkash' | 'nagad' | 'cash' | 'bank' | 'sslcommerz';
export type PaymentStatus = 'completed' | 'pending' | 'failed';
export type TicketStatus = 'open' | 'pending' | 'closed';
export type ConnectionType = 'pppoe' | 'hotspot' | 'static';

export interface ConnectionDetails {
  connectionType?: string;
  cableRequirement?: string;
  fiberCode?: string;
  numberOfCore?: string;
  coreColor?: string;
  clientType?: string;
  billingStatus?: string;
  otc?: string;
  routerUsername?: string;
  routerPassword?: string;
}

export interface PppoeDetails {
  name: string;
  password: string;
  service: string;
  profile: string;
  disabled: boolean;
  lastLoggedOut?: string;
  lastCallerId?: string;
}

export interface OltDetails {
  name: string;
  onuId: string;
  status: string;
  rxPower: string;
  macAddress: string;
  callId: string;
  matchedId: string;
  description: string;
  lastSeen?: string;
  reason?: string;
}

export interface BandwidthUsage {
  date: string;
  downloadMb: number;
  uploadMb: number;
}

export interface Customer {
  id: string;
  name: string;
  username: string;
  phone: string;
  email?: string;
  packageId: string;
  packageName: string;
  packagePrice?: number;
  areaId: string;
  areaName: string;
  subAreaName?: string;
  subAreaCode?: string;
  resellerId?: string;
  status: CustomerStatus;
  expiryDate: string;
  balanceBdt: number;
  connectionType: ConnectionType;
  macAddress?: string;
  ipAddress?: string;
  online: boolean;
  createdAt: string;
  nidNumber?: string;
  code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  routerId?: string;
  routerName?: string;
  connectionDetails?: ConnectionDetails;
  pppoeDetails?: PppoeDetails;
  oltDetails?: OltDetails;
  bandwidthUsage?: BandwidthUsage[];
}

export interface Package {
  id: string;
  name: string;
  speedMbps: number;
  priceBdt: number;
  validityDays: number;
  type: 'home' | 'corporate' | 'hotspot';
  visible: boolean;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amountBdt: number;
  method: PaymentMethod;
  status: PaymentStatus;
  invoiceNo: string;
  paidAt: string;
  note?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  customerName: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  body: string;
  sentAt: string;
}

export interface SubArea {
  id: string;
  name: string;
  areaCode: string;
  status: 'active' | 'inactive';
}

export interface Area {
  id: string;
  name: string;
  subareas: SubArea[];
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  expiredCustomers: number;
  todayCollectionBdt: number;
  monthlyCollectionBdt: number;
  onlineUsers: number;
  chartData: { date: string; collection: number; newCustomers: number }[];
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  salaryBdt: number;
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  customers: number;
  status: 'active' | 'trial' | 'suspended';
  primaryColor: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  titleBn?: string;
  body: string;
  publishedAt: string;
  pinned: boolean;
}

export interface RouterDevice {
  id: string;
  name: string;
  mac: string;
  ip: string;
  connectedAt: string;
}
