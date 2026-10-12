/** zapi service areas (`areas`) and their sub-areas (`sub_areas`, user_id = parent area id). */
export interface ServiceArea {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  subareaCount: number;
  totalCustomers: number;
  activeCustomers: number;
}

export interface SubArea {
  id: string;
  areaId: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface AreaSummary {
  totalAreas: number;
  activeAreas: number;
  inactiveAreas: number;
  totalSubareas: number;
  areasWithoutSubareas: number;
}

/** Create/update body for both areas and sub-areas (backend field names). */
export interface AreaPayload {
  area_name: string;
  area_code: string;
  status: 'active' | 'inactive';
}
