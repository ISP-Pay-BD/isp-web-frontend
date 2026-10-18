import { camelizeKeys, num, str } from '@/lib/api/case';
import type {
  EngineCatalogItem,
  EngineInstance,
  TenantAdminOption,
} from '../types';

type Raw = Record<string, unknown>;

function isPlainObject(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function strOrNull(value: unknown): string | null {
  const s = str(value);
  return s === '' ? null : s;
}

/** Map one backend instance (already camelized or snake_case) to the UI type. */
export function toEngineInstance(value: unknown): EngineInstance {
  const r = camelizeKeys<Raw>(value) ?? {};
  // `config` is opaque tenant JSON — keep its original keys (not camelized).
  const rawConfig = isPlainObject(value) ? (value as Raw).config : undefined;
  return {
    id: str(r.id),
    tenantId: str(r.tenantId),
    tenantName: str(r.tenantName),
    pluginId: str(r.pluginId),
    engineKey: str(r.engineKey),
    name: str(r.name),
    status: str(r.status) === 'enabled' ? 'enabled' : 'disabled',
    config: isPlainObject(rawConfig) ? rawConfig : {},
    enabledAt: strOrNull(r.enabledAt),
    disabledAt: strOrNull(r.disabledAt),
    updatedAt: strOrNull(r.updatedAt),
  };
}

export function toEngineCatalogItem(value: unknown): EngineCatalogItem {
  const raw = isPlainObject(value) ? value : {};
  const r = camelizeKeys<Raw>(raw);
  const summary = isPlainObject(r.instancesSummary) ? r.instancesSummary : null;
  return {
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    category: str(r.category, 'General'),
    description: str(r.description),
    imageUrl: strOrNull(r.imageUrl),
    priceBdt: num(r.priceBdt),
    priceType: strOrNull(r.priceType),
    billingCycle: strOrNull(r.billingCycle),
    published: r.published === true || r.published === 1 || r.published === '1',
    createdAt: str(r.createdAt),
    updatedAt: str(r.updatedAt),
    installs: r.installs === null || r.installs === undefined ? null : num(r.installs),
    instance: isPlainObject(raw.instance) ? toEngineInstance(raw.instance) : null,
    instancesSummary: summary
      ? { enabled: num(summary.enabled), disabled: num(summary.disabled) }
      : null,
  };
}

export function toTenantAdminOption(value: unknown): TenantAdminOption {
  const r = camelizeKeys<Raw>(value) ?? {};
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    organizationName: str(r.organizationName),
  };
}

export function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => str(v)).filter(Boolean) : [];
}
