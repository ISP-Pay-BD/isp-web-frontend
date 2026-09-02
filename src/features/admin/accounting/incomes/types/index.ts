export interface IncomeItem {
  id: string;
  date: string;
  category: string;
  amountBdt: number;
  method: string;
  note?: string;
  invoiceNo?: string;
  bankAccount?: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
}
