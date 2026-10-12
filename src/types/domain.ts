/**
 * Customer and area entity types: the shape `admin.adapter` maps the API's customer
 * rows into. (The dummy datasets these once described are gone — everything is live.)
 */

export type CustomerStatus = 'active' | 'expired' | 'suspended';
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
