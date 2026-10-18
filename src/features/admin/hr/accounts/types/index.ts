/** One row of `/v1/employee-accounts` for a pay month (web EmployeeAccounts ledger). */
export interface EmployeeAccountItem {
  employeeId: string;
  employeeName: string;
  designation: string;
  mobile: string;
  status: string;
  salary: number;
  advance: number;
  paid: number;
  balance: number;
  month: string;
  year: number;
}
