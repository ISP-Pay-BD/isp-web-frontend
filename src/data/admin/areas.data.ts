import type { Area } from '../shared/types';

export const areas: Area[] = [
  {
    id: 'area_uttara',
    name: 'Uttara',
    subareas: [
      { id: 'sub_uttara_7', name: 'Sector 7' },
      { id: 'sub_uttara_11', name: 'Sector 11' },
      { id: 'sub_uttara_13', name: 'Sector 13' },
      { id: 'sub_uttara_4', name: 'Sector 4' },
    ],
  },
  {
    id: 'area_mirpur',
    name: 'Mirpur',
    subareas: [
      { id: 'sub_mirpur_10', name: 'Mirpur 10' },
      { id: 'sub_mirpur_11', name: 'Mirpur 11' },
      { id: 'sub_mirpur_12', name: 'Mirpur 12' },
      { id: 'sub_mirpur_1', name: 'Mirpur 1' },
    ],
  },
  {
    id: 'area_dhanmondi',
    name: 'Dhanmondi',
    subareas: [
      { id: 'sub_dhan_27', name: 'Road 27' },
      { id: 'sub_dhan_32', name: 'Road 32' },
      { id: 'sub_dhan_15', name: 'Road 15' },
    ],
  },
  {
    id: 'area_mohammadpur',
    name: 'Mohammadpur',
    subareas: [
      { id: 'sub_moh_1', name: 'Block A' },
      { id: 'sub_moh_2', name: 'Block C' },
    ],
  },
  {
    id: 'area_bashundhara',
    name: 'Bashundhara',
    subareas: [
      { id: 'sub_bash_r', name: 'Block R' },
      { id: 'sub_bash_g', name: 'Block G' },
    ],
  },
  {
    id: 'area_chittagong',
    name: 'Chittagong',
    subareas: [
      { id: 'sub_ctg_pahartali', name: 'Pahartali' },
      { id: 'sub_ctg_halishahar', name: 'Halishahar' },
      { id: 'sub_ctg_agrabad', name: 'Agrabad' },
    ],
  },
  {
    id: 'area_sylhet',
    name: 'Sylhet',
    subareas: [
      { id: 'sub_syl_zindabazar', name: 'Zindabazar' },
      { id: 'sub_syl_ambarkhana', name: 'Ambarkhana' },
    ],
  },
  {
    id: 'area_khulna',
    name: 'Khulna',
    subareas: [
      { id: 'sub_khl_sonadanga', name: 'Sonadanga' },
      { id: 'sub_khl_khalishpur', name: 'Khalishpur' },
    ],
  },
];

export function getAreaName(areaId: string): string {
  return areas.find((a) => a.id === areaId)?.name ?? 'Unknown';
}

export function getAreaById(areaId: string): Area | undefined {
  return areas.find((a) => a.id === areaId);
}
