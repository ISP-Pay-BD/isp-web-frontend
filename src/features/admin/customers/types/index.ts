import type { Customer, CustomerStatus, ConnectionType } from '@/data/shared/types';

export type { Customer, CustomerStatus, ConnectionType };

export interface CustomerFiltersState {
  search: string;
  status: string;
  areaId: string;
  packageId: string;
  connectionType: string;
}
