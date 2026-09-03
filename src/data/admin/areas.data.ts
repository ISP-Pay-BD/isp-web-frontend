import type { Area } from '../shared/types';

export const areas: Area[] = [
  {
    id: 'area_uttara',
    name: 'Uttara',
    subareas: [
      { id: 'sub_uttara_7', name: 'Sector 7', areaCode: 'UTT-S7', status: 'active' },
      { id: 'sub_uttara_11', name: 'Sector 11', areaCode: 'UTT-S11', status: 'active' },
      { id: 'sub_uttara_13', name: 'Sector 13', areaCode: 'UTT-S13', status: 'active' },
      { id: 'sub_uttara_4', name: 'Sector 4', areaCode: 'UTT-S4', status: 'active' },
    ],
  },
  {
    id: 'area_mirpur',
    name: 'Mirpur',
    subareas: [
      { id: 'sub_mirpur_10', name: 'Mirpur 10', areaCode: 'MIR-M10', status: 'active' },
      { id: 'sub_mirpur_11', name: 'Mirpur 11', areaCode: 'MIR-M11', status: 'active' },
      { id: 'sub_mirpur_12', name: 'Mirpur 12', areaCode: 'MIR-M12', status: 'active' },
      { id: 'sub_mirpur_1', name: 'Mirpur 1', areaCode: 'MIR-M1', status: 'active' },
    ],
  },
  {
    id: 'area_dhanmondi',
    name: 'Dhanmondi',
    subareas: [
      { id: 'sub_dhan_27', name: 'Road 27', areaCode: 'DHA-R27', status: 'active' },
      { id: 'sub_dhan_32', name: 'Road 32', areaCode: 'DHA-R32', status: 'active' },
      { id: 'sub_dhan_15', name: 'Road 15', areaCode: 'DHA-R15', status: 'active' },
    ],
  },
  {
    id: 'area_mohammadpur',
    name: 'Mohammadpur',
    subareas: [
      { id: 'sub_moh_1', name: 'Block A', areaCode: 'MOH-BA', status: 'active' },
      { id: 'sub_moh_2', name: 'Block C', areaCode: 'MOH-BC', status: 'active' },
    ],
  },
  {
    id: 'area_bashundhara',
    name: 'Bashundhara',
    subareas: [
      { id: 'sub_bash_r', name: 'Block R', areaCode: 'BSH-BR', status: 'active' },
      { id: 'sub_bash_g', name: 'Block G', areaCode: 'BSH-BG', status: 'active' },
    ],
  },
  {
    id: 'area_chittagong',
    name: 'Chittagong',
    subareas: [
      { id: 'sub_ctg_pahartali', name: 'Pahartali', areaCode: 'CTG-PAH', status: 'active' },
      { id: 'sub_ctg_halishahar', name: 'Halishahar', areaCode: 'CTG-HAL', status: 'active' },
      { id: 'sub_ctg_agrabad', name: 'Agrabad', areaCode: 'CTG-AGR', status: 'active' },
    ],
  },
  {
    id: 'area_sylhet',
    name: 'Sylhet',
    subareas: [
      { id: 'sub_syl_zindabazar', name: 'Zindabazar', areaCode: 'SYL-ZIN', status: 'active' },
      { id: 'sub_syl_ambarkhana', name: 'Ambarkhana', areaCode: 'SYL-AMB', status: 'active' },
    ],
  },
  {
    id: 'area_khulna',
    name: 'Khulna',
    subareas: [
      { id: 'sub_khl_sonadanga', name: 'Sonadanga', areaCode: 'KHL-SON', status: 'active' },
      { id: 'sub_khl_khalishpur', name: 'Khalishpur', areaCode: 'KHL-KHA', status: 'active' },
    ],
  },
];

export function getAreaName(areaId: string): string {
  return areas.find((a) => a.id === areaId)?.name ?? 'Unknown';
}

export function getAreaById(areaId: string): Area | undefined {
  return areas.find((a) => a.id === areaId);
}
