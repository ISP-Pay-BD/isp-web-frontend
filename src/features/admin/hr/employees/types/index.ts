export interface EmployeeItem {
  id: string;
  name: string;
  phone: string;
  role: string;
  salaryBdt: number;
  joinedAt: string;
  status: 'active' | 'inactive';
  email?: string;
  area?: string;
  nid?: string;
}

export interface EmployeeFormData {
  name: string;
  phone: string;
  email: string;
  role: string;
  salaryBdt: number;
  area: string;
  nid: string;
  status: 'active' | 'inactive';
}
