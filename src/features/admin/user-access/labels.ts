import type { useLocale } from '@/i18n/locale-context';
import type { PermissionSectionDef } from './types';

export type Translate = ReturnType<typeof useLocale>['t'];

/** Role names the access screens know about; anything else keeps the label the API sent. */
export function roleLabel(t: Translate, role: string, fallback?: string): string {
  switch (role) {
    case 'all':
      return t('admin.userAccess.role.all', 'All Roles');
    case 'admin':
      return t('admin.userAccess.role.admin', 'Admin');
    case 'resellerAdmin':
      return t('admin.userAccess.role.reseller', 'Reseller / POP');
    case 'employee':
      return t('admin.userAccess.role.employee', 'Employee');
    case 'user':
      return t('admin.userAccess.role.customer', 'Customer');
    default:
      return fallback ?? role;
  }
}

export function categoryLabel(t: Translate, id: string): string {
  switch (id) {
    case 'all':
      return t('admin.userAccess.category.all', 'All Modules');
    case 'core':
      return t('admin.userAccess.category.core', 'Customer & Ops');
    case 'finance':
      return t('admin.userAccess.category.finance', 'Billing & Accounting');
    case 'network':
      return t('admin.userAccess.category.network', 'Network & Infra');
    case 'hr':
      return t('admin.userAccess.category.hr', 'Staff & Payroll');
    case 'system':
      return t('admin.userAccess.category.system', 'System & Messaging');
    default:
      return id;
  }
}

/** Short human labels for permission actions; unknown actions keep the label the catalogue sent. */
export function actionLabel(t: Translate, key: string, fallback: string): string {
  switch (key) {
    case 'read':
      return t('admin.userAccess.action.read', 'View');
    case 'create':
      return t('admin.userAccess.action.create', 'Create');
    case 'update':
      return t('admin.userAccess.action.update', 'Edit');
    case 'delete':
      return t('admin.userAccess.action.delete', 'Delete');
    case 'update_subscription':
      return t('admin.userAccess.action.updateSubscription', 'Update Subscription');
    case 'update_conn':
      return t('admin.userAccess.action.updateConn', 'Update Connection');
    case 'free_customer_create':
      return t('admin.userAccess.action.freeCustomerCreate', 'Free User Create');
    case 'self_recharge':
      return t('admin.userAccess.action.selfRecharge', 'Self Recharge');
    case 'daily_payment_generate':
      return t('admin.userAccess.action.dailyPaymentGenerate', 'Daily Bill Generate');
    case 'invoice':
      return t('admin.userAccess.action.invoice', 'Invoice Download');
    case 'send_msg':
      return t('admin.userAccess.action.sendMsg', 'Send Message');
    case 'restore':
      return t('admin.userAccess.action.restore', 'Restore');
    case 'delete_forever':
      return t('admin.userAccess.action.deleteForever', 'Delete Forever');
    case 'empty':
      return t('admin.userAccess.action.empty', 'Empty Trash');
    case 'sync':
      return t('admin.userAccess.action.sync', 'Sync Users');
    case 'payment':
      return t('admin.userAccess.action.payment', 'Online Payment');
    case 'renew':
      return t('admin.userAccess.action.renew', 'Renew Subscription');
    case 'chat':
      return t('admin.userAccess.action.chat', 'Access AI');
    case 'ai':
      return t('admin.userAccess.action.ai', 'AI Auto-reply');
    case 'utility':
      return t('admin.userAccess.action.utility', 'Utility Templates');
    case 'authentication':
      return t('admin.userAccess.action.authentication', 'Auth OTP');
    case 'marketing':
      return t('admin.userAccess.action.marketing', 'Marketing Campaigns');
    default:
      return fallback;
  }
}

/** Module name for a permission section: the sidebar's wording where the module has a menu entry. */
export function sectionLabel(t: Translate, section: PermissionSectionDef): string {
  const fb = section.label;
  switch (section.key) {
    case 'area':
      return t('nav.areas', fb);
    case 'packages':
      return t('nav.packages', fb);
    case 'customer':
      return t('nav.customers', fb);
    case 'employee':
      return t('admin.userAccess.section.employee', fb);
    case 'employee_attendance':
      return t('nav.hr-attendance', fb);
    case 'advance_salary':
      return t('nav.hr-advance', fb);
    case 'Resellers':
      return t('nav.pop', fb);
    case 'customer_payment':
      return t('nav.customers-payments', fb);
    case 'employee_payment':
      return t('nav.hr-salaries', fb);
    case 'inventory_purchess':
      return t('admin.userAccess.section.inventoryPurchase', fb);
    case 'bandwidth_buy':
      return t('nav.bandwidth-buy', fb);
    case 'bandwidth_sell':
      return t('nav.bandwidth-sell', fb);
    case 'network':
      return t('nav.network', fb);
    case 'hotspot':
      return t('nav.hotspot', fb);
    case 'olt':
      return t('nav.olt', fb);
    case 'accounting':
      return t('nav.accounting', fb);
    case 'support_ticket':
      return t('nav.support', fb);
    case 'referral':
      return t('admin.userAccess.section.referral', fb);
    case 'recycle_bin':
      return t('nav.recycle-bin', fb);
    case 'sms_message':
      return t('nav.sms', fb);
    case 'reports':
      return t('nav.reports', fb);
    case 'software_settings':
      return t('admin.userAccess.section.softwareSettings', fb);
    case 'routers':
      return t('admin.userAccess.section.routers', fb);
    case 'profile_update':
      return t('admin.userAccess.section.profileUpdate', fb);
    case 'password_change':
      return t('admin.userAccess.section.passwordChange', fb);
    case 'ai_chat':
      return t('nav.ai-chat', fb);
    case 'whatsapp_business':
      return t('nav.whatsapp', fb);
    case 'payment':
      return t('admin.userAccess.section.paymentRecords', fb);
    case 'subscription':
      return t('nav.subscription', fb);
    default:
      return fb;
  }
}

/** True when the query matches the module (shown or API name, key) or any of its actions. */
export function sectionMatches(t: Translate, section: PermissionSectionDef, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const has = (text: string) => text.toLowerCase().includes(q);
  return (
    has(sectionLabel(t, section)) ||
    has(section.label) ||
    has(section.key) ||
    Object.entries(section.actions).some(([key, label]) => has(label) || has(actionLabel(t, key, label)))
  );
}
