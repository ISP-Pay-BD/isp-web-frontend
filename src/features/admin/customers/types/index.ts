/** Real backend shapes for the admin customer screens (zapi reseller customers API). */

export type CustomerStatus = 'active' | 'expired' | 'suspended';
export type ConnectionType = 'pppoe' | 'static';

export interface Customer {
  id: string;
  name: string;
  /** PPPoE username (user_router_data.pppoe_secret) — empty when none is linked. */
  username: string;
  phone: string;
  email?: string;
  address?: string;
  packageId: string;
  packageName: string;
  packagePrice: number | null;
  areaId: string;
  areaName: string;
  subAreaId?: string;
  subAreaName?: string;
  routerId?: string;
  routerName?: string;
  /** Derived: expired (will_expire passed) > suspended (account disconnected / inactive) > active. */
  status: CustomerStatus;
  accountStatus: 'active' | 'inactive';
  subscriptionStatus: string;
  connStatus: 'conn' | 'disconn';
  /** Live session flag from users.activity (online_status). */
  online: boolean;
  /** Raw `will_expire` (Y-m-d H:i:s) or null. */
  expiryDate: string | null;
  balanceBdt: number;
  connectionType: ConnectionType;
  /** connection_details.connection_type (utp / fiber / radio). */
  lineType?: string;
  clientType?: string;
  billingStatus?: string;
  paymentSummary?: string;
  paymentSummaryKind?: 'paid' | 'due' | 'expired' | 'inactive';
  createdAt?: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomerPayment {
  id: string;
  invoiceNo: string;
  amountBdt: number;
  method: string;
  status: string;
  month: string;
  paidAt: string | null;
  receivedBy: string;
}

export interface CustomerUsageDay {
  date: string;
  downloadMb: number;
  uploadMb: number;
}

export interface CustomerOnu {
  available: boolean;
  oltName: string;
  onuId: string;
  status: string;
  rx: string;
  mac: string;
  description: string;
  lastSeen: string;
  reason: string;
}

export interface CustomerDetail extends Customer {
  nidNumber?: string;
  nidVerified: boolean;
  ipAddress?: string;
  macAddress?: string;
  bandwidth?: string;
  pppoe: {
    name: string;
    /** Only returned to staff roles; '' when masked. */
    password: string;
    service: string;
    profile: string;
    uptime: string;
    address: string;
    callerId: string;
    lastLoggedOut: string;
    lastCallerId: string;
    disabled: boolean | null;
  };
  connection: {
    lineType?: string;
    cableRequirement?: string;
    fiberCode?: string;
    numberOfCore?: string;
    coreColor?: string;
    clientType?: string;
    billingStatus?: string;
    otc?: string;
    otcStatus?: string;
    routerUsername?: string;
    onuMac?: string;
    vendorName?: string;
    connectedBy?: string;
  };
  onu: CustomerOnu | null;
  macBinding: { isBound: boolean; mac: string };
  usage: CustomerUsageDay[];
  payments: CustomerPayment[];
  paymentsSummary: { totalCount: number; successfulAmount: number; pendingAmount: number; failedAmount: number };
}

export interface CustomerSession {
  routerOnline: boolean;
  available: boolean;
  uptime: string;
  address: string;
  callerId: string;
  rxMbps: number | null;
  txMbps: number | null;
}

export interface CustomerSummary {
  total: number;
  online: number;
  offline: number;
  expired: number;
  disconnected: number;
  due7: number;
  expiredToday: number;
  expired7: number;
  expiredOver30: number;
  inactive: number;
  newThisMonth: number;
}

/** Server-side list filters (sent as query params). */
export interface CustomerListFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'expired' | 'new';
  connection?: 'online' | 'offline';
  connStatus?: 'conn' | 'disconn';
  expiry?: string;
  areaId?: string;
  packageId?: string;
  routerId?: string;
  accessType?: ConnectionType;
}

export interface CustomerListParams extends CustomerListFilters {
  page?: number;
  perPage?: number;
}

export interface SelectOption {
  id: string;
  name: string;
}

export interface PackageOption extends SelectOption {
  price: number | null;
  bandwidth: string;
  mikrotikProfile?: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  entity: string;
  details: string;
  actor: string;
  router: string;
  ipAddress: string;
  createdAt: string | null;
}

export interface FreeRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerExpiry: string | null;
  resellerName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string | null;
}

export interface ImportResult {
  rowCount: number;
  createdCount: number;
  errorCount: number;
  warningCount: number;
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

export interface KycDocument {
  id: string;
  docType: string;
  docNumber: string | null;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'pending' | 'verified' | 'rejected';
  note: string | null;
  uploadedByName: string | null;
  verifiedByName: string | null;
  verifiedAt: string | null;
  createdAt: string | null;
}

export interface CustomerGroup {
  id: string;
  name: string;
  parentName: string | null;
  billingMode: 'consolidated' | 'individual';
  note: string | null;
  memberCount: number;
  createdAt: string | null;
}

export interface CustomerGroupMember {
  id: string;
  name: string;
  mobile: string;
  status: string;
  willExpire: string | null;
  addedAt: string | null;
}
