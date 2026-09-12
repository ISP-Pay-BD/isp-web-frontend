export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },

  // Customer Portal
  customer: {
    dashboard: '/v1/customer/dashboard',
    user: '/v1/customer/user',
    userUsage: '/v1/customer/user/usage',
    wifi: '/v1/customer/router-control/wifi',
    wifiReboot: '/v1/customer/router-control/reboot',
    quickFixPing: '/v1/customer/quick-fix/ping',
    supportTickets: '/v1/customer/support-tickets',
    supportTicketDetail: (id: string | number) => `/v1/customer/support-tickets/${id}`,
    supportTicketMessages: (id: string | number) => `/v1/customer/support-tickets/${id}/messages`,
    subscriptions: '/v1/customer/subscriptions',
    subscriptionRenew: '/v1/customer/subscriptions/renew',
    payments: '/v1/customer/payments',
    paymentCheckout: '/v1/customer/payments/checkout',
    rewards: '/v1/customer/rewards',
    rewardClaim: '/v1/customer/rewards/claim',
    referral: '/v1/customer/referral',
    announcements: '/v1/customer/announcements',
  },

  // Admin Core & Customers
  admin: {
    dashboard: '/v1/admin/dashboard',
    customers: '/v1/admin/customers',
    customerDetail: (id: string | number) => `/v1/admin/customers/${id}`,
    customerRecharge: (id: string | number) => `/v1/admin/customers/${id}/recharge`,
    customerSyncPppoe: (id: string | number) => `/v1/admin/customers/${id}/sync-pppoe`,
    customerBindMac: (id: string | number) => `/v1/admin/customers/${id}/bind-mac`,
    customerImport: '/v1/admin/customers/import',
    customerExport: '/v1/admin/customers/export',
    bulkRecharge: '/v1/admin/customers/bulk-recharge',
    bulkDelete: '/v1/admin/customers/bulk-delete',

    // Areas & Subareas
    areas: '/v1/admin/areas',
    areaDetail: (id: string | number) => `/v1/admin/areas/${id}`,
    subareas: '/v1/admin/subareas',
    subareaDetail: (id: string | number) => `/v1/admin/subareas/${id}`,

    // Billing & Payments
    payments: '/v1/admin/payments',
    paymentCollect: '/v1/admin/payments/collect',
    invoices: '/v1/admin/invoices',
    invoiceDetail: (id: string | number) => `/v1/admin/invoices/${id}`,
    resellers: '/v1/admin/resellers',
    resellerDetail: (id: string | number) => `/v1/admin/resellers/${id}`,
    resellerFunding: '/v1/admin/resellers/funding',
    resellerRecharge: '/v1/admin/resellers/recharge',

    // HR & Employees
    employees: '/v1/admin/employees',
    employeeDetail: (id: string | number) => `/v1/admin/employees/${id}`,
    employeeAttendance: '/v1/admin/employees/attendance',
    employeeSalary: '/v1/admin/employees/salary',
    employeeAdvanceLoans: '/v1/admin/employees/advance-loans',

    // Support Tickets
    tickets: '/v1/admin/support-tickets',
    ticketDetail: (id: string | number) => `/v1/admin/support-tickets/${id}`,
    ticketMessages: (id: string | number) => `/v1/admin/support-tickets/${id}/messages`,
    ticketAssign: (id: string | number) => `/v1/admin/support-tickets/${id}/assign`,

    // SMS & Communication
    smsBroadcast: '/v1/admin/sms/broadcast',
    smsTemplates: '/v1/admin/sms/templates',
    voiceSms: '/v1/admin/sms/voice',
    smsHistory: '/v1/admin/sms/history',

    // Accounting
    accounts: '/v1/admin/accounting/accounts',
    journalEntries: '/v1/admin/accounting/journal-entries',
    balanceSheet: '/v1/admin/accounting/balance-sheet',
    transactions: '/v1/admin/accounting/transactions',

    // Network & MikroTik
    routers: '/v1/admin/network/routers',
    routerDetail: (id: string | number) => `/v1/admin/network/routers/${id}`,
    routerSessions: (id: string | number) => `/v1/admin/network/routers/${id}/sessions`,
    ipPools: '/v1/admin/network/ip-pools',

    // Packages
    packages: '/v1/admin/packages',
    packageDetail: (id: string | number) => `/v1/admin/packages/${id}`,

    // OLT & Fiber
    olts: '/v1/admin/olt',
    oltDetail: (id: string | number) => `/v1/admin/olt/${id}`,

    // Hotspot
    hotspots: '/v1/admin/hotspots',
    hotspotVouchers: '/v1/admin/hotspots/vouchers',

    // Inventory
    inventoryItems: '/v1/admin/inventory/items',
    inventoryPurchases: '/v1/admin/inventory/purchases',

    // Reports
    reportsBtrc: '/v1/admin/reports/btrc',
    reportsRevenue: '/v1/admin/reports/revenue',
    reportsBilling: '/v1/admin/reports/billing',

    // WhatsApp & AI
    whatsappSettings: '/v1/admin/whatsapp/settings',
    whatsappTemplates: '/v1/admin/whatsapp/templates',
    aiInternal: '/v1/ai/query',

    // User Access & Permissions
    customAccess: '/v1/admin/user-access/custom-access',
    permissionMatrix: '/v1/admin/user-access/permission-matrix',
  },

  // Employee Portal
  employee: {
    dashboard: '/v1/employee/dashboard',
    payslips: '/v1/employee/payslips',
    payslipDetail: (id: string | number) => `/v1/employee/payslips/${id}`,
    advanceSalary: '/v1/employee/advance-salary',
    attendance: '/v1/employee/attendance',
    attendanceCheckIn: '/v1/employee/attendance/check-in',
    attendanceCheckOut: '/v1/employee/attendance/check-out',
    tasks: '/v1/employee/tasks',
  },

  // Platform Super-Admin
  platform: {
    dashboard: '/v1/platform/dashboard',
    tenants: '/v1/platform/tenants',
    tenantDetail: (id: string | number) => `/v1/platform/tenants/${id}`,
    tenantStatus: (id: string | number) => `/v1/platform/tenants/${id}/status`,
    admins: '/v1/platform/admins',
    revenue: '/v1/platform/revenue',
    plugins: '/v1/platform/plugins',
  },
} as const;
