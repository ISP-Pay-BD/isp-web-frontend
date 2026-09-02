export interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  amountBdt: number;
  vendor: string;
  note?: string;
}

export interface ExpenseFormData {
  category: string;
  amountBdt: number;
  vendor: string;
  date: string;
  note?: string;
}
