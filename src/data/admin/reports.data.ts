export interface BtrcReportSubscriber {
  sl: number;
  clientName: string;
  mobile: string;
  email: string;
  packageName: string;
  bandwidthMbps: number;
  priceBdt: number;
  area: string;
  connectionType: 'PPPoE' | 'Static IP' | 'Hotspot';
  clientType: 'Home' | 'Corporate' | 'SME';
  address: string;
  activationDate: string;
  status: 'active' | 'inactive';
}

export interface BtrcSummary {
  totalSubscribers: number;
  totalBandwidthGbps: number;
  totalRevenueBdt: number;
  homeSubscribers: number;
  corporateSubscribers: number;
}

export const btrcSummary: BtrcSummary = {
  totalSubscribers: 450,
  totalBandwidthGbps: 4.8,
  totalRevenueBdt: 425000,
  homeSubscribers: 410,
  corporateSubscribers: 40,
};

export const btrcSubscribers: BtrcReportSubscriber[] = [
  {
    sl: 1,
    clientName: 'Md. Shahidul Islam',
    mobile: '01712345001',
    email: 'shahidul@gmail.com',
    packageName: 'Thunder 20M (Bufferless)',
    bandwidthMbps: 20,
    priceBdt: 800,
    area: 'Sector 3, Uttara',
    connectionType: 'PPPoE',
    clientType: 'Home',
    address: 'House 14, Road 2, Sector 3, Uttara, Dhaka',
    activationDate: '2024-03-15',
    status: 'active',
  },
  {
    sl: 2,
    clientName: 'Nusrat Jahan',
    mobile: '01812345002',
    email: 'nusrat.j@yahoo.com',
    packageName: 'Blaze 30M Standard',
    bandwidthMbps: 30,
    priceBdt: 1050,
    area: 'Sector 7, Uttara',
    connectionType: 'PPPoE',
    clientType: 'Home',
    address: 'House 45, Road 18, Sector 7, Uttara, Dhaka',
    activationDate: '2023-11-10',
    status: 'active',
  },
  {
    sl: 3,
    clientName: 'Alpha Tech Solutions Ltd.',
    mobile: '01912345003',
    email: 'noc@alphatechbd.net',
    packageName: 'Dedicated 50M Corporate Duplex',
    bandwidthMbps: 50,
    priceBdt: 12500,
    area: 'Banani C/A',
    connectionType: 'Static IP',
    clientType: 'Corporate',
    address: 'Plot 72, Block D, Road 11, Banani, Dhaka',
    activationDate: '2023-01-20',
    status: 'active',
  },
  {
    sl: 4,
    clientName: 'Kabir Chowdhury',
    mobile: '01612345004',
    email: 'kabir.c@outlook.com',
    packageName: 'Express 15M Economy',
    bandwidthMbps: 15,
    priceBdt: 600,
    area: 'Mirpur 10',
    connectionType: 'PPPoE',
    clientType: 'Home',
    address: 'Block C, Section 10, Mirpur, Dhaka',
    activationDate: '2024-06-01',
    status: 'active',
  },
  {
    sl: 5,
    clientName: 'Prime Garments Merchandising',
    mobile: '01712345005',
    email: 'it@primegarments.com',
    packageName: 'Dedicated 100M Fiber Link',
    bandwidthMbps: 100,
    priceBdt: 24000,
    area: 'Uttara Sector 1',
    connectionType: 'Static IP',
    clientType: 'Corporate',
    address: 'Road 5, Sector 1, Uttara, Dhaka',
    activationDate: '2022-08-14',
    status: 'active',
  },
  {
    sl: 6,
    clientName: 'Farhana Akhter',
    mobile: '01812345006',
    email: 'farhana.ak@gmail.com',
    packageName: 'Thunder 20M (Bufferless)',
    bandwidthMbps: 20,
    priceBdt: 800,
    area: 'Sector 4, Uttara',
    connectionType: 'PPPoE',
    clientType: 'Home',
    address: 'House 8, Road 9, Sector 4, Uttara, Dhaka',
    activationDate: '2024-01-10',
    status: 'inactive',
  },
];
