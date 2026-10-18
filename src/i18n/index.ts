export { locales, defaultLocale, localeLabels, isAppLocale, type AppLocale } from './config';

import en from './messages/en.json';
import bnBase from './messages/bn.json';
import bnCustomerHome from './messages/bn/customer-home.json';
import bnCustomerDashboard from './messages/bn/customer-dashboard.json';
import bnCustomerPayments from './messages/bn/customer-payments.json';
import bnCustomerRouter from './messages/bn/customer-router.json';
import bnCustomerSupport from './messages/bn/customer-support.json';
import bnCustomerAccount from './messages/bn/customer-account.json';
import bnEmployee from './messages/bn/employee.json';
import bnAdmin from './messages/bn/admin.json';
import bnAdminSupport from './messages/bn/admin-support.json';
import bnAdminOps from './messages/bn/admin-ops.json';
import bnShared from './messages/bn/shared.json';
import bnMore1 from './messages/bn/admin-more-1.json';
import bnMore2 from './messages/bn/admin-more-2.json';
import bnMore3 from './messages/bn/admin-more-3.json';
import bnMore4 from './messages/bn/admin-more-4.json';
import bnMore5 from './messages/bn/admin-more-5.json';
import bnMore6 from './messages/bn/admin-more-6.json';
import bnMore7 from './messages/bn/admin-more-7.json';
import bnMore8 from './messages/bn/admin-more-8.json';
import bnMore9 from './messages/bn/admin-more-9.json';
import bnMore10 from './messages/bn/admin-more-10.json';
import bnMore11 from './messages/bn/admin-more-11.json';
import bnMore12 from './messages/bn/admin-more-12.json';
import bnMore13 from './messages/bn/admin-more-13.json';
import bnMore14 from './messages/bn/admin-more-14.json';
import bnMore15 from './messages/bn/admin-more-15.json';
import bnMore16 from './messages/bn/admin-more-16.json';
import bnMore17 from './messages/bn/admin-more-17.json';
import type { AppLocale } from './config';

type Tree = { [key: string]: string | Tree };

function merge(target: Tree, source: Tree): Tree {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];
    target[key] =
      typeof value === 'object' && typeof existing === 'object' ? merge(existing, value) : (value as string | Tree);
  }
  return target;
}

/**
 * Bangla is split into one file per area (`messages/bn/*.json`) so screens can be translated independently;
 * each file nests under its own top-level key (`customer`, `employee`, `admin`, `common`…).
 * English is the fallback written at the call site: `t('customer.pay.title', 'Pay your bill')`.
 */
const bn = [bnCustomerHome, bnCustomerDashboard, bnCustomerPayments, bnCustomerRouter, bnCustomerSupport, bnCustomerAccount, bnEmployee, bnAdmin, bnAdminSupport, bnAdminOps, bnMore1, bnMore2, bnMore3, bnMore4, bnMore5, bnMore6, bnMore7, bnMore8, bnMore9, bnMore10, bnMore11, bnMore12, bnMore13, bnMore14, bnMore15, bnMore16, bnMore17, bnShared].reduce<Tree>(
  (acc, part) => merge(acc, part as Tree),
  structuredClone(bnBase) as Tree,
);

export const messages = { en: en as Tree, bn } as const;

export type Messages = typeof en;

export type TranslateVars = Record<string, string | number>;

export function interpolate(message: string, vars?: TranslateVars): string {
  return vars ? message.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)) : message;
}

/** Simple nested key lookup: `marketing.hero.title`. Returns the path itself when the key is missing. */
export function getMessage(locale: AppLocale, path: string): string {
  const parts = path.split('.');
  let node: unknown = messages[locale];
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === 'string' ? node : path;
}
