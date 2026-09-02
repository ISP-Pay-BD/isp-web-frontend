/**
 * Central export for all static dummy data.
 * Features/components → mockFetch() only. Handlers/tests may import @/data directly.
 */

export * from './shared/constants';
export * from './shared/types';
export * from './shared/generators';

export * as usersData from './users';
export * as marketingData from './marketing';
export * as customerData from './customer';
export * as adminData from './admin';
export * as platformData from './platform';
export * as employeeData from './employee';

export { dataCatalog, dataStats } from './catalog';

// Convenience re-exports
export { demoUsers, demoUserCredentials } from './users';
export { landingData, pricingPlans, pluginsMarketplace } from './marketing/landing.data';
export { paygCalculator, pricingTiers, calculatePaygMonthly } from './marketing/pricing.data';
export { landingSections, landingFaqExtended, landingTestimonialsExtended } from './marketing/sections.data';
export { pluginsMarketplaceFull } from './marketing/plugins.data';
export { customers, getCustomerById, expiredCustomers, activeCustomers, onlineCustomers } from './admin/customers.data';
export { packages, popPackages } from './admin/packages.data';
export { areas } from './admin/areas.data';
export { customerPayments, getPaymentsByCustomerId } from './admin/customer-payments.data';
export { adminDashboardStats, customerDashboardStats } from './admin/dashboard.data';
export { supportTickets, getTicketById, adminSupportStats } from './customer/support.data';
export { newsItems, getNewsById } from './customer/news.data';
export { tenants, platformRevenue } from './platform/tenants.data';
