import { mockDelay } from '../delay';
import {
  customers,
  getCustomerById,
  expiredCustomers,
} from '@/data/admin/customers.data';

export async function listCustomers() {
  await mockDelay();
  return customers;
}

export async function getCustomer(id: string) {
  await mockDelay();
  const customer = getCustomerById(id);
  if (!customer) throw new Error('Customer not found');
  return customer;
}

export async function listExpiredCustomers() {
  await mockDelay();
  return expiredCustomers;
}
