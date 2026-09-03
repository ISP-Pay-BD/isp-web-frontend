export interface RouterItem {
  id: string;
  name: string;
  ip: string;
  port: number;
  username: string;
  password?: string;
  model: string;
  status: 'online' | 'offline';
  users: number;
  uptime: string;
  area: string;
  cpuLoad?: number;
  freeRamMb?: number;
  totalRamMb?: number;
  freeHddMb?: number;
  totalHddMb?: number;
  boardName?: string;
  routerOsVersion?: string;
}

export const routers: RouterItem[] = [
  {
    id: 'rtr_1',
    name: 'Uttara Core CCR',
    ip: '103.15.20.1',
    port: 8728,
    username: 'admin',
    model: 'CCR1036-8G-2S+',
    status: 'online',
    users: 420,
    uptime: '45d 12h 34m',
    area: 'Uttara',
    cpuLoad: 18,
    freeRamMb: 3240,
    totalRamMb: 4096,
    freeHddMb: 480,
    totalHddMb: 512,
    boardName: 'CCR1036',
    routerOsVersion: 'v7.14.3',
  },
  {
    id: 'rtr_2',
    name: 'Mirpur POP RB4011',
    ip: '103.15.21.1',
    port: 8728,
    username: 'api_admin',
    model: 'RB4011iGS+RM',
    status: 'online',
    users: 280,
    uptime: '30d 8h 12m',
    area: 'Mirpur',
    cpuLoad: 24,
    freeRamMb: 768,
    totalRamMb: 1024,
    freeHddMb: 380,
    totalHddMb: 512,
    boardName: 'RB4011',
    routerOsVersion: 'v7.12.1',
  },
  {
    id: 'rtr_3',
    name: 'Dhanmondi Edge',
    ip: '103.15.22.1',
    port: 8728,
    username: 'netops',
    model: 'hAP ac3',
    status: 'offline',
    users: 0,
    uptime: '0m',
    area: 'Dhanmondi',
    cpuLoad: 0,
    freeRamMb: 0,
    totalRamMb: 256,
    freeHddMb: 0,
    totalHddMb: 128,
    boardName: 'RBD53iG-5HacD2HnD',
    routerOsVersion: 'v6.49.10',
  },
  {
    id: 'rtr_4',
    name: 'Bashundhara GPON RB5009',
    ip: '103.15.23.1',
    port: 8728,
    username: 'admin_bsh',
    model: 'RB5009UG+S+IN',
    status: 'online',
    users: 195,
    uptime: '22d 4h 50m',
    area: 'Bashundhara',
    cpuLoad: 12,
    freeRamMb: 850,
    totalRamMb: 1024,
    freeHddMb: 850,
    totalHddMb: 1024,
    boardName: 'RB5009',
    routerOsVersion: 'v7.15.1',
  },
  {
    id: 'rtr_5',
    name: 'CTG Main Core',
    ip: '103.15.24.1',
    port: 8728,
    username: 'ctg_admin',
    model: 'CCR2004-16G-2S+',
    status: 'online',
    users: 310,
    uptime: '60d 1h 15m',
    area: 'Chittagong',
    cpuLoad: 31,
    freeRamMb: 3100,
    totalRamMb: 4096,
    freeHddMb: 450,
    totalHddMb: 512,
    boardName: 'CCR2004',
    routerOsVersion: 'v7.14.1',
  },
  {
    id: 'rtr_6',
    name: 'Mohammadpur Edge RB2011',
    ip: '103.15.25.1',
    port: 8728,
    username: 'mhd_net',
    model: 'RB2011UiAS-RM',
    status: 'online',
    users: 88,
    uptime: '15d 6h 20m',
    area: 'Mohammadpur',
    cpuLoad: 42,
    freeRamMb: 72,
    totalRamMb: 128,
    freeHddMb: 60,
    totalHddMb: 128,
    boardName: 'RB2011',
    routerOsVersion: 'v6.49.8',
  },
];

export interface IpPoolItem {
  id: string;
  name: string;
  routerId: string;
  routerName?: string;
  defineBy: 'range' | 'cidr';
  startIp: string;
  endIp: string;
  cidr?: string;
  gateway: string;
  type: 'public' | 'private';
  used: number;
  total: number;
  status: 'active' | 'inactive';
}

export const ipPools: IpPoolItem[] = [
  {
    id: 'pool_1',
    name: 'Uttara Static Real IP',
    routerId: 'rtr_1',
    routerName: 'Uttara Core CCR',
    defineBy: 'range',
    startIp: '103.15.30.2',
    endIp: '103.15.30.254',
    cidr: '103.15.30.0/24',
    gateway: '103.15.30.1',
    type: 'public',
    used: 45,
    total: 253,
    status: 'active',
  },
  {
    id: 'pool_2',
    name: 'Mirpur Static Real IP',
    routerId: 'rtr_2',
    routerName: 'Mirpur POP RB4011',
    defineBy: 'range',
    startIp: '103.15.31.2',
    endIp: '103.15.31.254',
    cidr: '103.15.31.0/24',
    gateway: '103.15.31.1',
    type: 'public',
    used: 32,
    total: 253,
    status: 'active',
  },
  {
    id: 'pool_3',
    name: 'PPPoE Private Pool Uttara',
    routerId: 'rtr_1',
    routerName: 'Uttara Core CCR',
    defineBy: 'cidr',
    startIp: '10.10.1.2',
    endIp: '10.10.1.254',
    cidr: '10.10.1.0/24',
    gateway: '10.10.1.1',
    type: 'private',
    used: 180,
    total: 253,
    status: 'active',
  },
  {
    id: 'pool_4',
    name: 'Hotspot Guest Pool',
    routerId: 'rtr_3',
    routerName: 'Dhanmondi Edge',
    defineBy: 'cidr',
    startIp: '192.168.88.10',
    endIp: '192.168.88.250',
    cidr: '192.168.88.0/24',
    gateway: '192.168.88.1',
    type: 'private',
    used: 12,
    total: 241,
    status: 'active',
  },
  {
    id: 'pool_5',
    name: 'Corporate Fixed Block Mirpur',
    routerId: 'rtr_2',
    routerName: 'Mirpur POP RB4011',
    defineBy: 'cidr',
    startIp: '103.15.32.1',
    endIp: '103.15.32.62',
    cidr: '103.15.32.0/26',
    gateway: '103.15.32.1',
    type: 'public',
    used: 28,
    total: 62,
    status: 'active',
  },
];

export type OltBrand =
  | 'Huawei' | 'ZTE' | 'BDCOM' | 'V_sol' | 'C_data' | 'Ecom'
  | 'ATOP' | 'Airmedia' | 'Avies' | 'Corelink' | 'DBC' | 'Dn_optic'
  | 'Fucascom' | 'Hsgq' | 'Tbs_pothon';

export interface OltDeviceItem {
  id: string;
  name: string;
  brand: OltBrand;
  ip: string;
  port: number;
  protocol: 'http' | 'https' | 'telnet' | 'snmp';
  username: string;
  loginKey?: string;
  snmpOid?: string;
  onuTotal: number;
  onuOnline: number;
  area: string;
  status: 'active' | 'disabled';
  ponPortsCount: number;
}

export type OnuStatus = 'online' | 'offline' | 'wire_down';

export interface OnuPortItem {
  id: string;
  oltId: string;
  ponPort: string;
  onuIndex: string;
  macAddress: string;
  vendor: string;
  distance: number;
  customerName: string | null;
  pppoeId: string | null;
  status: OnuStatus;
  rxPower: number | null;
  txPower: number | null;
  voltage: number | null;
  temperature: number | null;
  deregisterReason: string | null;
  lastSeen: string;
}

export interface OltDiagnostics {
  onlineCount: number;
  wireDownCount: number;
  powerOffCount: number;
  onus: OnuPortItem[];
}

export const oltDevices: OltDeviceItem[] = [
  {
    id: 'olt_1',
    name: 'Uttara GPON-01 (SmartAX)',
    brand: 'Huawei',
    ip: '10.0.1.10',
    port: 23,
    protocol: 'telnet',
    username: 'root',
    snmpOid: '1.3.6.1.2.1.1.1.0',
    onuTotal: 128,
    onuOnline: 118,
    area: 'Uttara',
    status: 'active',
    ponPortsCount: 8,
  },
  {
    id: 'olt_2',
    name: 'Mirpur GPON-01 (C320)',
    brand: 'ZTE',
    ip: '10.0.2.10',
    port: 80,
    protocol: 'http',
    username: 'admin',
    snmpOid: '1.3.6.1.2.1.1.1.0',
    onuTotal: 96,
    onuOnline: 90,
    area: 'Mirpur',
    status: 'active',
    ponPortsCount: 4,
  },
  {
    id: 'olt_3',
    name: 'Bashundhara EPON-01',
    brand: 'V_sol',
    ip: '10.0.3.10',
    port: 161,
    protocol: 'snmp',
    username: 'public',
    snmpOid: '1.3.6.1.4.1.37950',
    onuTotal: 64,
    onuOnline: 61,
    area: 'Bashundhara',
    status: 'active',
    ponPortsCount: 4,
  },
  {
    id: 'olt_4',
    name: 'Dhanmondi OLT-02',
    brand: 'BDCOM',
    ip: '10.0.4.10',
    port: 23,
    protocol: 'telnet',
    username: 'admin',
    snmpOid: '1.3.6.1.2.1.1.1.0',
    onuTotal: 48,
    onuOnline: 39,
    area: 'Dhanmondi',
    status: 'active',
    ponPortsCount: 4,
  },
];

export const oltDiagnostics: Record<string, OltDiagnostics> = {
  olt_1: {
    onlineCount: 118,
    wireDownCount: 6,
    powerOffCount: 4,
    onus: [
      { id: 'onu_1_1', oltId: 'olt_1', ponPort: 'PON1', onuIndex: '1', macAddress: 'C4:3D:C7:AA:11:01', vendor: 'HWTC', distance: 1240, customerName: 'Rahman Telecom', pppoeId: 'rahman_01', status: 'online', rxPower: -18.2, txPower: 2.1, voltage: 3.3, temperature: 42, deregisterReason: null, lastSeen: '2026-09-03 14:22:00' },
      { id: 'onu_1_2', oltId: 'olt_1', ponPort: 'PON1', onuIndex: '2', macAddress: 'C4:3D:C7:AA:11:02', vendor: 'HWTC', distance: 890, customerName: 'Kabir IT', pppoeId: 'kabir_it', status: 'online', rxPower: -16.5, txPower: 2.3, voltage: 3.3, temperature: 40, deregisterReason: null, lastSeen: '2026-09-03 14:21:55' },
      { id: 'onu_1_3', oltId: 'olt_1', ponPort: 'PON1', onuIndex: '3', macAddress: 'C4:3D:C7:AA:11:03', vendor: 'HWTC', distance: 2100, customerName: null, pppoeId: null, status: 'offline', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'LOSi/OFFLINE', lastSeen: '2026-09-02 08:15:00' },
      { id: 'onu_1_4', oltId: 'olt_1', ponPort: 'PON1', onuIndex: '4', macAddress: 'C4:3D:C7:AA:11:04', vendor: 'HWTC', distance: 560, customerName: 'Nodi Enterprise', pppoeId: 'nodi_ent', status: 'online', rxPower: -14.8, txPower: 2.5, voltage: 3.4, temperature: 38, deregisterReason: null, lastSeen: '2026-09-03 14:22:10' },
      { id: 'onu_1_5', oltId: 'olt_1', ponPort: 'PON2', onuIndex: '5', macAddress: 'C4:3D:C7:AA:21:01', vendor: 'HWTC', distance: 1580, customerName: 'Shafi Com', pppoeId: 'shafi_com', status: 'online', rxPower: -19.1, txPower: 1.8, voltage: 3.2, temperature: 44, deregisterReason: null, lastSeen: '2026-09-03 14:20:30' },
      { id: 'onu_1_6', oltId: 'olt_1', ponPort: 'PON2', onuIndex: '6', macAddress: 'C4:3D:C7:AA:21:02', vendor: 'HWTC', distance: 3200, customerName: null, pppoeId: null, status: 'wire_down', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'LOS', lastSeen: '2026-09-01 22:10:00' },
      { id: 'onu_1_7', oltId: 'olt_1', ponPort: 'PON2', onuIndex: '7', macAddress: 'C4:3D:C7:AA:21:03', vendor: 'HWTC', distance: 780, customerName: 'Al-Razzaq Net', pppoeId: 'razzaq_net', status: 'online', rxPower: -15.3, txPower: 2.4, voltage: 3.3, temperature: 39, deregisterReason: null, lastSeen: '2026-09-03 14:22:05' },
      { id: 'onu_1_8', oltId: 'olt_1', ponPort: 'PON3', onuIndex: '8', macAddress: 'C4:3D:C7:AA:31:01', vendor: 'HWTC', distance: 1920, customerName: 'Digital Hub', pppoeId: 'digi_hub', status: 'online', rxPower: -20.4, txPower: 1.5, voltage: 3.1, temperature: 46, deregisterReason: null, lastSeen: '2026-09-03 14:19:50' },
      { id: 'onu_1_9', oltId: 'olt_1', ponPort: 'PON3', onuIndex: '9', macAddress: 'C4:3D:C7:AA:31:02', vendor: 'HWTC', distance: 440, customerName: 'Bismillah ISP', pppoeId: 'bismillah', status: 'online', rxPower: -13.2, txPower: 2.8, voltage: 3.4, temperature: 37, deregisterReason: null, lastSeen: '2026-09-03 14:22:12' },
      { id: 'onu_1_10', oltId: 'olt_1', ponPort: 'PON4', onuIndex: '10', macAddress: 'C4:3D:C7:AA:41:01', vendor: 'HWTC', distance: 2650, customerName: null, pppoeId: null, status: 'offline', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'Dying Gasp', lastSeen: '2026-09-02 14:30:00' },
    ],
  },
  olt_2: {
    onlineCount: 90,
    wireDownCount: 4,
    powerOffCount: 2,
    onus: [
      { id: 'onu_2_1', oltId: 'olt_2', ponPort: 'PON1', onuIndex: '1', macAddress: 'ZTE:GF:12:34:01', vendor: 'ZTE', distance: 1100, customerName: 'Sathi Cable', pppoeId: 'sathi_cable', status: 'online', rxPower: -17.6, txPower: 1.9, voltage: 3.3, temperature: 41, deregisterReason: null, lastSeen: '2026-09-03 14:21:45' },
      { id: 'onu_2_2', oltId: 'olt_2', ponPort: 'PON1', onuIndex: '2', macAddress: 'ZTE:GF:12:34:02', vendor: 'ZTE', distance: 2300, customerName: null, pppoeId: null, status: 'wire_down', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'LOS', lastSeen: '2026-09-01 18:45:00' },
      { id: 'onu_2_3', oltId: 'olt_2', ponPort: 'PON2', onuIndex: '3', macAddress: 'ZTE:GF:12:34:03', vendor: 'ZTE', distance: 670, customerName: 'Galaxy Net', pppoeId: 'galaxy_net', status: 'online', rxPower: -14.1, txPower: 2.6, voltage: 3.4, temperature: 38, deregisterReason: null, lastSeen: '2026-09-03 14:22:08' },
      { id: 'onu_2_4', oltId: 'olt_2', ponPort: 'PON2', onuIndex: '4', macAddress: 'ZTE:GF:12:34:04', vendor: 'ZTE', distance: 1850, customerName: 'Pallabi WiFi', pppoeId: 'pallabi_wifi', status: 'online', rxPower: -19.8, txPower: 1.6, voltage: 3.2, temperature: 45, deregisterReason: null, lastSeen: '2026-09-03 14:20:55' },
      { id: 'onu_2_5', oltId: 'olt_2', ponPort: 'PON3', onuIndex: '5', macAddress: 'ZTE:GF:12:34:05', vendor: 'ZTE', distance: 950, customerName: 'Islam Telecom', pppoeId: 'islam_tel', status: 'online', rxPower: -15.9, txPower: 2.2, voltage: 3.3, temperature: 40, deregisterReason: null, lastSeen: '2026-09-03 14:21:30' },
      { id: 'onu_2_6', oltId: 'olt_2', ponPort: 'PON4', onuIndex: '6', macAddress: 'ZTE:GF:12:34:06', vendor: 'ZTE', distance: 3100, customerName: null, pppoeId: null, status: 'offline', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'Power Off', lastSeen: '2026-09-02 20:00:00' },
    ],
  },
  olt_3: {
    onlineCount: 61,
    wireDownCount: 2,
    powerOffCount: 1,
    onus: [
      { id: 'onu_3_1', oltId: 'olt_3', ponPort: 'PON1', onuIndex: '1', macAddress: 'VSOL:00:AA:BB:01', vendor: 'V-Sol', distance: 1350, customerName: 'Block C Network', pppoeId: 'block_c', status: 'online', rxPower: -18.7, txPower: 1.7, voltage: 3.2, temperature: 43, deregisterReason: null, lastSeen: '2026-09-03 14:20:00' },
      { id: 'onu_3_2', oltId: 'olt_3', ponPort: 'PON1', onuIndex: '2', macAddress: 'VSOL:00:AA:BB:02', vendor: 'V-Sol', distance: 780, customerName: 'NRB Broadband', pppoeId: 'nrb_bb', status: 'online', rxPower: -14.3, txPower: 2.5, voltage: 3.4, temperature: 38, deregisterReason: null, lastSeen: '2026-09-03 14:22:15' },
      { id: 'onu_3_3', oltId: 'olt_3', ponPort: 'PON2', onuIndex: '3', macAddress: 'VSOL:00:AA:BB:03', vendor: 'V-Sol', distance: 2800, customerName: null, pppoeId: null, status: 'wire_down', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'LOS', lastSeen: '2026-09-02 12:00:00' },
      { id: 'onu_3_4', oltId: 'olt_3', ponPort: 'PON3', onuIndex: '4', macAddress: 'VSOL:00:AA:BB:04', vendor: 'V-Sol', distance: 1600, customerName: 'Rangpur Digital', pppoeId: 'rangpur_dig', status: 'online', rxPower: -17.2, txPower: 2.0, voltage: 3.3, temperature: 41, deregisterReason: null, lastSeen: '2026-09-03 14:21:10' },
    ],
  },
  olt_4: {
    onlineCount: 39,
    wireDownCount: 5,
    powerOffCount: 4,
    onus: [
      { id: 'onu_4_1', oltId: 'olt_4', ponPort: 'PON1', onuIndex: '1', macAddress: 'BD:CM:11:22:01', vendor: 'BDCOM', distance: 980, customerName: 'Dhanmondi Net', pppoeId: 'dhan_net', status: 'online', rxPower: -16.1, txPower: 2.1, voltage: 3.3, temperature: 39, deregisterReason: null, lastSeen: '2026-09-03 14:22:00' },
      { id: 'onu_4_2', oltId: 'olt_4', ponPort: 'PON1', onuIndex: '2', macAddress: 'BD:CM:11:22:02', vendor: 'BDCOM', distance: 1420, customerName: 'Life Cable', pppoeId: 'life_cable', status: 'online', rxPower: -18.9, txPower: 1.6, voltage: 3.2, temperature: 44, deregisterReason: null, lastSeen: '2026-09-03 14:20:40' },
      { id: 'onu_4_3', oltId: 'olt_4', ponPort: 'PON2', onuIndex: '3', macAddress: 'BD:CM:11:22:03', vendor: 'BDCOM', distance: 3500, customerName: null, pppoeId: null, status: 'offline', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'LOSi/OFFLINE', lastSeen: '2026-09-01 09:20:00' },
      { id: 'onu_4_4', oltId: 'olt_4', ponPort: 'PON2', onuIndex: '4', macAddress: 'BD:CM:11:22:04', vendor: 'BDCOM', distance: 2100, customerName: null, pppoeId: null, status: 'wire_down', rxPower: null, txPower: null, voltage: null, temperature: null, deregisterReason: 'Dying Gasp', lastSeen: '2026-09-02 16:45:00' },
      { id: 'onu_4_5', oltId: 'olt_4', ponPort: 'PON3', onuIndex: '5', macAddress: 'BD:CM:11:22:05', vendor: 'BDCOM', distance: 650, customerName: 'Azizpur WiFi', pppoeId: 'azizpur', status: 'online', rxPower: -13.8, txPower: 2.7, voltage: 3.4, temperature: 36, deregisterReason: null, lastSeen: '2026-09-03 14:22:18' },
    ],
  },
};

export interface HotspotProfileItem {
  id: string;
  name: string;
  speedMbps: number;
  rateLimit: string;
  priceBdt: number;
  sellingPriceBdt: number;
  validityHours: number;
  validityFormatted: string;
  sharedUsers: number;
  addressPool: string;
  parentQueue: string;
  expiredMode: 'remove' | 'notice' | 'remove_record';
  lockUser: boolean;
  activeUsers: number;
  status: 'active' | 'inactive';
}

export const hotspotProfiles: HotspotProfileItem[] = [
  {
    id: 'hs_1',
    name: 'Cafe 2Mbps 1-Day',
    speedMbps: 2,
    rateLimit: '2M/2M',
    priceBdt: 20,
    sellingPriceBdt: 25,
    validityHours: 24,
    validityFormatted: '1 Day',
    sharedUsers: 1,
    addressPool: 'hs-pool-1',
    parentQueue: 'default',
    expiredMode: 'remove',
    lockUser: true,
    activeUsers: 18,
    status: 'active',
  },
  {
    id: 'hs_2',
    name: 'Hotel Premium 5Mbps',
    speedMbps: 5,
    rateLimit: '5M/5M',
    priceBdt: 50,
    sellingPriceBdt: 60,
    validityHours: 24,
    validityFormatted: '24 Hours',
    sharedUsers: 2,
    addressPool: 'hs-pool-1',
    parentQueue: 'default',
    expiredMode: 'remove_record',
    lockUser: false,
    activeUsers: 34,
    status: 'active',
  },
  {
    id: 'hs_3',
    name: 'Conference 10Mbps Blast',
    speedMbps: 10,
    rateLimit: '10M/10M',
    priceBdt: 100,
    sellingPriceBdt: 120,
    validityHours: 8,
    validityFormatted: '8 Hours',
    sharedUsers: 1,
    addressPool: 'hs-pool-2',
    parentQueue: 'high-priority',
    expiredMode: 'remove',
    lockUser: true,
    activeUsers: 7,
    status: 'active',
  },
  {
    id: 'hs_4',
    name: 'Monthly Pass 3Mbps',
    speedMbps: 3,
    rateLimit: '3M/3M',
    priceBdt: 300,
    sellingPriceBdt: 350,
    validityHours: 720,
    validityFormatted: '30 Days',
    sharedUsers: 1,
    addressPool: 'hs-pool-1',
    parentQueue: 'default',
    expiredMode: 'notice',
    lockUser: true,
    activeUsers: 52,
    status: 'active',
  },
];

export interface HotspotUserItem {
  id: string;
  username: string;
  profileId: string;
  profileName: string;
  server: string;
  macAddress: string;
  ipAddress: string;
  uptime: string;
  bytesInMb: number;
  bytesOutMb: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
  comment?: string;
  pin: string;
}

export const hotspotUsers: HotspotUserItem[] = [
  {
    id: 'hsu_1',
    username: 'cafe_guest_812',
    profileId: 'hs_1',
    profileName: 'Cafe 2Mbps 1-Day',
    server: 'hotspot1',
    macAddress: 'BC:A8:A6:45:12:89',
    ipAddress: '192.168.88.15',
    uptime: '2h 15m',
    bytesInMb: 145,
    bytesOutMb: 420,
    status: 'active',
    createdAt: '2026-09-02T14:30:00',
    comment: 'Counter-01 sale',
    pin: '849201',
  },
  {
    id: 'hsu_2',
    username: 'hotel_guest_104',
    profileId: 'hs_2',
    profileName: 'Hotel Premium 5Mbps',
    server: 'hotspot1',
    macAddress: 'DC:A9:04:88:21:4F',
    ipAddress: '192.168.88.16',
    uptime: '6h 40m',
    bytesInMb: 890,
    bytesOutMb: 2450,
    status: 'active',
    createdAt: '2026-09-02T10:10:00',
    comment: 'Room 304 guest',
    pin: '192837',
  },
  {
    id: 'hsu_3',
    username: 'conf_vip_003',
    profileId: 'hs_3',
    profileName: 'Conference 10Mbps Blast',
    server: 'hotspot2',
    macAddress: '78:4F:43:91:EE:A0',
    ipAddress: '192.168.89.20',
    uptime: '1h 05m',
    bytesInMb: 310,
    bytesOutMb: 880,
    status: 'active',
    createdAt: '2026-09-02T15:00:00',
    comment: 'Workshop hall A',
    pin: '445566',
  },
  {
    id: 'hsu_4',
    username: 'monthly_3m_091',
    profileId: 'hs_4',
    profileName: 'Monthly Pass 3Mbps',
    server: 'hotspot1',
    macAddress: '50:3E:AA:12:44:91',
    ipAddress: '192.168.88.45',
    uptime: '14d 2h',
    bytesInMb: 14500,
    bytesOutMb: 42300,
    status: 'active',
    createdAt: '2026-08-19T11:00:00',
    comment: 'Shop #12 pass',
    pin: '332211',
  },
  {
    id: 'hsu_5',
    username: 'cafe_guest_790',
    profileId: 'hs_1',
    profileName: 'Cafe 2Mbps 1-Day',
    server: 'hotspot1',
    macAddress: '64:D1:54:33:90:1B',
    ipAddress: '192.168.88.99',
    uptime: '24h 00m',
    bytesInMb: 320,
    bytesOutMb: 950,
    status: 'expired',
    createdAt: '2026-09-01T12:00:00',
    comment: 'Expired session',
    pin: '908172',
  },
];

export interface HotspotReportItem {
  id: string;
  date: string;
  username: string;
  profileName: string;
  priceBdt: number;
  soldBy: string;
  routerName: string;
  paymentMethod: string;
}

export const hotspotReports: HotspotReportItem[] = [
  { id: 'hr_1', date: '2026-09-02', username: 'cafe_guest_812', profileName: 'Cafe 2Mbps 1-Day', priceBdt: 25, soldBy: 'Reception', routerName: 'Uttara Core CCR', paymentMethod: 'Cash' },
  { id: 'hr_2', date: '2026-09-02', username: 'hotel_guest_104', profileName: 'Hotel Premium 5Mbps', priceBdt: 60, soldBy: 'FrontDesk', routerName: 'Uttara Core CCR', paymentMethod: 'bKash' },
  { id: 'hr_3', date: '2026-09-02', username: 'conf_vip_003', profileName: 'Conference 10Mbps Blast', priceBdt: 120, soldBy: 'Sales Rep', routerName: 'Mirpur POP RB4011', paymentMethod: 'Nagad' },
  { id: 'hr_4', date: '2026-09-01', username: 'guest_batch_101', profileName: 'Cafe 2Mbps 1-Day', priceBdt: 25, soldBy: 'Reception', routerName: 'Uttara Core CCR', paymentMethod: 'Cash' },
  { id: 'hr_5', date: '2026-09-01', username: 'guest_batch_102', profileName: 'Cafe 2Mbps 1-Day', priceBdt: 25, soldBy: 'Reception', routerName: 'Uttara Core CCR', paymentMethod: 'Cash' },
  { id: 'hr_6', date: '2026-08-31', username: 'monthly_3m_091', profileName: 'Monthly Pass 3Mbps', priceBdt: 350, soldBy: 'Admin', routerName: 'Uttara Core CCR', paymentMethod: 'Bank Transfer' },
];

export interface NetworkTopologyItem {
  oltId: string;
  oltName: string;
  ponPort: string;
  splitter: string;
  onuId: string;
  customerName: string;
  rxPowerDbm: number;
  txPowerDbm: number;
  status: 'online' | 'offline';
  zone: string;
  mac: string;
}

export const networkTopologyData: NetworkTopologyItem[] = [
  { oltId: 'olt_1', oltName: 'Uttara GPON-01', ponPort: 'PON 1/1', splitter: 'Splitter S1 (1:8)', onuId: 'ONU-UT-01', customerName: 'Rashedul Karim', rxPowerDbm: -19.4, txPowerDbm: 2.3, status: 'online', zone: 'Sector 3', mac: '48:57:02:11:A3:8F' },
  { oltId: 'olt_1', oltName: 'Uttara GPON-01', ponPort: 'PON 1/1', splitter: 'Splitter S1 (1:8)', onuId: 'ONU-UT-02', customerName: 'Fahim Hasan', rxPowerDbm: -21.1, txPowerDbm: 2.1, status: 'online', zone: 'Sector 3', mac: '48:57:02:11:A4:9A' },
  { oltId: 'olt_1', oltName: 'Uttara GPON-01', ponPort: 'PON 1/1', splitter: 'Splitter S1 (1:8)', onuId: 'ONU-UT-03', customerName: 'Shahriar Kabir', rxPowerDbm: -28.9, txPowerDbm: 1.8, status: 'offline', zone: 'Sector 3', mac: '48:57:02:11:B2:10' },
  { oltId: 'olt_1', oltName: 'Uttara GPON-01', ponPort: 'PON 1/2', splitter: 'Splitter S2 (1:16)', onuId: 'ONU-UT-04', customerName: 'Sadia Sultana', rxPowerDbm: -18.2, txPowerDbm: 2.5, status: 'online', zone: 'Sector 7', mac: '48:57:02:11:C5:77' },
  { oltId: 'olt_1', oltName: 'Uttara GPON-01', ponPort: 'PON 1/2', splitter: 'Splitter S2 (1:16)', onuId: 'ONU-UT-05', customerName: 'Anowar Hossain', rxPowerDbm: -20.5, txPowerDbm: 2.2, status: 'online', zone: 'Sector 7', mac: '48:57:02:11:C6:12' },
  { oltId: 'olt_2', oltName: 'Mirpur GPON-01', ponPort: 'PON 1/1', splitter: 'Splitter M1 (1:8)', onuId: 'ONU-MP-01', customerName: 'Nazmul Haque', rxPowerDbm: -22.3, txPowerDbm: 2.0, status: 'online', zone: 'Mirpur 10', mac: '20:0B:C7:99:41:22' },
  { oltId: 'olt_2', oltName: 'Mirpur GPON-01', ponPort: 'PON 1/1', splitter: 'Splitter M1 (1:8)', onuId: 'ONU-MP-02', customerName: 'Zahidul Islam', rxPowerDbm: -27.5, txPowerDbm: 1.9, status: 'offline', zone: 'Mirpur 10', mac: '20:0B:C7:99:42:33' },
  { oltId: 'olt_2', oltName: 'Mirpur GPON-01', ponPort: 'PON 1/2', splitter: 'Splitter M2 (1:16)', onuId: 'ONU-MP-03', customerName: 'Tanvir Ahmed', rxPowerDbm: -19.8, txPowerDbm: 2.4, status: 'online', zone: 'Mirpur 2', mac: '20:0B:C7:99:50:88' },
  { oltId: 'olt_3', oltName: 'Bashundhara EPON-01', ponPort: 'PON 1/1', splitter: 'Splitter B1 (1:8)', onuId: 'ONU-BS-01', customerName: 'Mehedi Hasan', rxPowerDbm: -17.9, txPowerDbm: 2.6, status: 'online', zone: 'Block C', mac: 'E0:67:B3:12:78:90' },
  { oltId: 'olt_3', oltName: 'Bashundhara EPON-01', ponPort: 'PON 1/1', splitter: 'Splitter B1 (1:8)', onuId: 'ONU-BS-02', customerName: 'Sumon Mia', rxPowerDbm: -18.7, txPowerDbm: 2.4, status: 'online', zone: 'Block D', mac: 'E0:67:B3:12:79:11' },
];

export interface NetworkMapNodeItem {
  id: string;
  type: 'core' | 'pop' | 'olt' | 'splitter' | 'client';
  level: 'Root' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5+';
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline';
  ip?: string;
  deviceModel?: string;
  connectedCount?: number;
  zone: string;
}

export const networkMapNodes: NetworkMapNodeItem[] = [
  { id: 'node_core', type: 'core', level: 'Root', name: 'Uttara Core NOC', lat: 23.8759, lng: 90.3795, status: 'online', ip: '103.15.20.1', deviceModel: 'CCR1036-8G-2S+', connectedCount: 420, zone: 'Uttara' },
  { id: 'node_pop1', type: 'pop', level: 'L1', name: 'Mirpur POP Distribution', lat: 23.8067, lng: 90.3683, status: 'online', ip: '103.15.21.1', deviceModel: 'RB4011iGS+RM', connectedCount: 280, zone: 'Mirpur' },
  { id: 'node_pop2', type: 'pop', level: 'L1', name: 'Dhanmondi Edge POP', lat: 23.7465, lng: 90.3760, status: 'offline', ip: '103.15.22.1', deviceModel: 'hAP ac3', connectedCount: 0, zone: 'Dhanmondi' },
  { id: 'node_olt1', type: 'olt', level: 'L2', name: 'Uttara GPON OLT-01', lat: 23.8680, lng: 90.3920, status: 'online', ip: '10.0.1.10', deviceModel: 'Huawei MA5800', connectedCount: 118, zone: 'Uttara Sector 3' },
  { id: 'node_olt2', type: 'olt', level: 'L2', name: 'Mirpur GPON OLT-01', lat: 23.8150, lng: 90.3720, status: 'online', ip: '10.0.2.10', deviceModel: 'ZTE C320', connectedCount: 90, zone: 'Mirpur 10' },
  { id: 'node_s1', type: 'splitter', level: 'L3', name: 'Splitter S1 (1:8) Sector 3', lat: 23.8710, lng: 90.3850, status: 'online', deviceModel: '1:8 PLC', connectedCount: 8, zone: 'Uttara' },
  { id: 'node_s2', type: 'splitter', level: 'L3', name: 'Splitter M1 (1:8) Mirpur 10', lat: 23.8120, lng: 90.3650, status: 'online', deviceModel: '1:8 PLC', connectedCount: 8, zone: 'Mirpur' },
  { id: 'node_c1', type: 'client', level: 'L4', name: 'Client: Rashedul Karim', lat: 23.8730, lng: 90.3820, status: 'online', ip: '103.15.30.15', deviceModel: 'Huawei HG8310M', zone: 'Uttara' },
  { id: 'node_c2', type: 'client', level: 'L4', name: 'Client: Fahim Hasan', lat: 23.8700, lng: 90.3870, status: 'online', ip: '103.15.30.16', deviceModel: 'ZTE F601', zone: 'Uttara' },
  { id: 'node_c3', type: 'client', level: 'L5+', name: 'Client: Sub-distribution Hub', lat: 23.8090, lng: 90.3630, status: 'online', ip: '103.15.31.22', deviceModel: 'Mikrotik hEX', zone: 'Mirpur' },
];

export const smsMessages = Array.from({ length: 25 }, (_, i) => ({
  id: `sms_${i + 1}`,
  to: `017${String(10000000 + i).slice(-8)}`,
  message: ['Your bill ৳1200 is due on Oct 1.', 'Your connection expired. Renew now.', 'Payment received. Thank you!', 'Welcome to Demo ISP!'][i % 4]!,
  status: (i % 7 === 0 ? 'failed' : 'delivered') as 'delivered' | 'failed' | 'pending',
  sentAt: `2026-09-0${(i % 2) + 1}T${String(10 + (i % 8)).padStart(2, '0')}:00:00`,
}));

export const smsTemplates = [
  { id: 'tpl_1', name: 'Expiry Reminder', body: 'Dear {name}, your connection expires on {date}. Pay ৳{amount} to renew.' },
  { id: 'tpl_2', name: 'Payment Received', body: 'Payment ৳{amount} received. TrxID: {trxid}. Valid till {date}.' },
  { id: 'tpl_3', name: 'Welcome SMS', body: 'Welcome {name}! Username: {username}. Support: 01700-000000' },
  { id: 'tpl_4', name: 'Expired Notice', body: 'Your internet is disconnected. Pay ৳{amount} via bKash to restore.' },
  { id: 'tpl_5', name: 'Maintenance Alert', body: 'Scheduled maintenance on {date} {time}. Brief outage expected.' },
];

export const voiceSmsCampaigns = [
  { id: 'vs_1', name: 'Expiry voice blast', recipients: 45, status: 'completed', sentAt: '2026-09-01T08:00:00' },
  { id: 'vs_2', name: 'Payment reminder', recipients: 120, status: 'scheduled', sentAt: '2026-09-03T09:00:00' },
];

export const whatsappThreads = Array.from({ length: 12 }, (_, i) => ({
  id: `wa_${i + 1}`,
  phone: `017${String(10000000 + i * 7).slice(-8)}`,
  name: ['Rahim Uddin', 'Jamal Islam', 'Nadia Begum', 'Karim Ahmed', 'Farhana Khan'][i % 5]!,
  lastMessage: ['When will my line be fixed?', 'Payment done via bKash', 'Need speed upgrade', 'Router not working'][i % 4]!,
  unread: i % 4 === 0 ? 1 : 0,
  updatedAt: `2026-09-0${(i % 2) + 1}T${String(14 + (i % 5)).padStart(2, '0')}:00:00`,
}));

export const whatsappTemplates = [
  { id: 'wtp_1', name: 'payment_received', body: 'Payment ৳{{amount}} received. Valid till {{date}}.' },
  { id: 'wtp_2', name: 'expiry_reminder', body: 'Hi {{name}}, your plan expires {{date}}.' },
];

export const walletData = {
  balanceBdt: 12500,
  currency: 'BDT',
  lowBalanceAlertBdt: 2000,
  transactions: [
    { id: 'wtx_1', type: 'topup', amountBdt: 10000, date: '2026-08-01', note: 'Wallet top-up via bKash' },
    { id: 'wtx_2', type: 'debit', amountBdt: -2500, date: '2026-08-15', note: 'SMS pack — 5000 credits' },
    { id: 'wtx_3', type: 'debit', amountBdt: -1200, date: '2026-08-20', note: 'WhatsApp API credits' },
    { id: 'wtx_4', type: 'topup', amountBdt: 5000, date: '2026-09-01', note: 'Manual top-up' },
  ],
};

export const popResellers = [
  { id: 'pop_uttara', name: 'Demo POP Uttara', balanceBdt: 85000, customers: 320, status: 'active', contact: '01711000001', area: 'Uttara' },
  { id: 'pop_mirpur', name: 'Demo POP Mirpur', balanceBdt: 42000, customers: 180, status: 'active', contact: '01711000002', area: 'Mirpur' },
  { id: 'pop_dhanmondi', name: 'Demo POP Dhanmondi', balanceBdt: 28000, customers: 95, status: 'active', contact: '01711000003', area: 'Dhanmondi' },
  { id: 'pop_chittagong', name: 'Demo POP Chittagong', balanceBdt: 65000, customers: 210, status: 'active', contact: '01711000004', area: 'Chittagong' },
];

export const popTransactions = [
  { id: 'ptx_1', popId: 'pop_uttara', popName: 'Demo POP Uttara', type: 'credit', amountBdt: 50000, date: '2026-09-01', note: 'Funding from admin' },
  { id: 'ptx_2', popId: 'pop_uttara', popName: 'Demo POP Uttara', type: 'debit', amountBdt: -12000, date: '2026-09-02', note: 'Customer collections remitted' },
  { id: 'ptx_3', popId: 'pop_mirpur', popName: 'Demo POP Mirpur', type: 'credit', amountBdt: 30000, date: '2026-08-28', note: 'Funding' },
  { id: 'ptx_4', popId: 'pop_chittagong', popName: 'Demo POP Chittagong', type: 'debit', amountBdt: -8500, date: '2026-09-01', note: 'Package purchase' },
];

export const inventoryItems = [
  { id: 'inv_1', name: 'ONU XPON Huawei', sku: 'ONU-HW-001', stock: 45, unit: 'pcs', reorderAt: 10, costBdt: 1200 },
  { id: 'inv_2', name: 'ONU XPON ZTE', sku: 'ONU-ZTE-001', stock: 32, unit: 'pcs', reorderAt: 10, costBdt: 1100 },
  { id: 'inv_3', name: 'Fiber Cable 100m', sku: 'FIB-100', stock: 12, unit: 'roll', reorderAt: 5, costBdt: 3500 },
  { id: 'inv_4', name: 'MikroTik hAP ac2', sku: 'RTR-HAP2', stock: 8, unit: 'pcs', reorderAt: 3, costBdt: 6500 },
  { id: 'inv_5', name: 'RJ45 Connector', sku: 'RJ45-100', stock: 500, unit: 'pcs', reorderAt: 100, costBdt: 3 },
  { id: 'inv_6', name: 'Patch Cord 3m', sku: 'PATCH-3M', stock: 85, unit: 'pcs', reorderAt: 20, costBdt: 80 },
];

export const purchaseOrders = [
  { id: 'po_1', vendor: 'Tech Distribution BD', items: 3, totalBdt: 85000, status: 'received', date: '2026-08-28' },
  { id: 'po_2', vendor: 'Fiber World Ltd', items: 2, totalBdt: 42000, status: 'pending', date: '2026-09-01' },
];

export const recycleBinItems = [
  { id: 'rb_1', type: 'customer', label: 'Deleted User user_099', deletedAt: '2026-08-30T10:00:00', deletedBy: 'admin@demo.isppaybd.com' },
  { id: 'rb_2', type: 'package', label: 'Old Home 3 Mbps', deletedAt: '2026-08-25T14:00:00', deletedBy: 'admin@demo.isppaybd.com' },
  { id: 'rb_3', type: 'payment', label: 'Duplicate payment pay_0042', deletedAt: '2026-08-20T09:00:00', deletedBy: 'admin@demo.isppaybd.com' },
];

export const btrcReportRows = [
  { month: '2026-08', subscribers: 1250, newConnections: 45, disconnections: 12, revenueBdt: 1285000 },
  { month: '2026-07', subscribers: 1217, newConnections: 38, disconnections: 15, revenueBdt: 1198000 },
  { month: '2026-06', subscribers: 1194, newConnections: 42, disconnections: 10, revenueBdt: 1150000 },
];

export const rewardsProgram = {
  enabled: true,
  pointsPerReferral: 200,
  pointsPerRenewal: 50,
  redemptionRate: 1,
  activeMembers: 340,
};

export const softwareSettings = {
  appName: 'Demo ISP Network',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  expiryGraceDays: 3,
  autoDisconnect: true,
  smsEnabled: true,
  whatsappEnabled: true,
  maintenanceMode: false,
};

export const userAccessRoles = [
  { id: 'role_admin', name: 'Full Admin', users: 2, permissions: 85 },
  { id: 'role_support', name: 'Support Only', users: 3, permissions: 12 },
  { id: 'role_accounts', name: 'Accounts', users: 1, permissions: 24 },
  { id: 'role_reseller', name: 'POP Reseller', users: 4, permissions: 18 },
];
