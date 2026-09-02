export interface RewardConfig {
  pointsPerReferral: number;
  pointsToBdtRatio: number;
  minPointsToRedeem: number;
  programEnabled: boolean;
}

export interface ReferralTransaction {
  id: string;
  referrerName: string;
  referrerPhone: string;
  refereeName: string;
  refereePhone: string;
  packageSubscribed: string;
  pointsEarned: number;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

export interface TopReferrer {
  id: string;
  name: string;
  phone: string;
  totalReferrals: number;
  totalPoints: number;
  convertedCount: number;
}

export const rewardConfigData: RewardConfig = {
  pointsPerReferral: 200,
  pointsToBdtRatio: 1, // 1 point = 1 BDT discount
  minPointsToRedeem: 100,
  programEnabled: true,
};

export const referralTransactionsData: ReferralTransaction[] = [
  {
    id: 'rtx_01',
    referrerName: 'Rahim Uddin',
    referrerPhone: '01712-345678',
    refereeName: 'Kamal Pasha',
    refereePhone: '01799-112233',
    packageSubscribed: 'Home 20 Mbps',
    pointsEarned: 200,
    status: 'approved',
    date: '2026-09-01',
  },
  {
    id: 'rtx_02',
    referrerName: 'Sadia Islam',
    referrerPhone: '01811-987654',
    refereeName: 'Nusrat Jahan',
    refereePhone: '01855-443322',
    packageSubscribed: 'Home 30 Mbps',
    pointsEarned: 200,
    status: 'approved',
    date: '2026-08-29',
  },
  {
    id: 'rtx_03',
    referrerName: 'Anwar Hossain',
    referrerPhone: '01915-223344',
    refereeName: 'Farhan Kabir',
    refereePhone: '01977-889900',
    packageSubscribed: 'Starter 10 Mbps',
    pointsEarned: 150,
    status: 'pending',
    date: '2026-09-02',
  },
  {
    id: 'rtx_04',
    referrerName: 'Tanvir Ahmed',
    referrerPhone: '01610-887766',
    refereeName: 'Shakil Khan',
    refereePhone: '01622-334455',
    packageSubscribed: 'Home 20 Mbps',
    pointsEarned: 200,
    status: 'rejected',
    date: '2026-08-15',
  },
];

export const topReferrersData: TopReferrer[] = [
  {
    id: 'top_1',
    name: 'Rahim Uddin',
    phone: '01712-345678',
    totalReferrals: 12,
    totalPoints: 2400,
    convertedCount: 10,
  },
  {
    id: 'top_2',
    name: 'Sadia Islam',
    phone: '01811-987654',
    totalReferrals: 8,
    totalPoints: 1600,
    convertedCount: 7,
  },
  {
    id: 'top_3',
    name: 'Anwar Hossain',
    phone: '01915-223344',
    totalReferrals: 5,
    totalPoints: 950,
    convertedCount: 4,
  },
];
