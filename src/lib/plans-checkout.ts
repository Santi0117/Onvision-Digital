/**
 * Planes cobrables por mensualidad (Onvo).
 * Los montos van en unidad menor: CRC ₡15.000 → 1_500_000; USD $130 → 13000.
 * Misma tabla que mi-portafolio / Onvision Digital.
 */
export type CheckoutCurrency = "CRC" | "USD";

export type MonthlyCheckoutPlan = {
  id: string;
  description: string;
  currency: CheckoutCurrency;
  /** Unidad menor de la moneda (céntimos / centavos). */
  unitAmount: number;
};

export const MONTHLY_CHECKOUT_PLANS: Record<string, MonthlyCheckoutPlan> = {
  "web-standard": {
    id: "web-standard",
    description: "Mensualidad · Página estándar — Onvision Digital",
    currency: "CRC",
    unitAmount: 1_500_000,
  },
  "web-pro": {
    id: "web-pro",
    description: "Mensualidad · Página Pro — Onvision Digital",
    currency: "CRC",
    unitAmount: 2_500_000,
  },
  "shop-standard": {
    id: "shop-standard",
    description: "Mensualidad · E-commerce estándar — Onvision Digital",
    currency: "CRC",
    unitAmount: 2_200_000,
  },
  "shop-pro": {
    id: "shop-pro",
    description: "Mensualidad · E-commerce Pro — Onvision Digital",
    currency: "CRC",
    unitAmount: 3_000_000,
  },
  "software-saas": {
    id: "software-saas",
    description: "Mensualidad · Software SaaS — Onvision Digital",
    currency: "USD",
    unitAmount: 13_000,
  },
  "mobile-app": {
    id: "mobile-app",
    description: "Mensualidad · App móvil — Onvision Digital",
    currency: "USD",
    unitAmount: 15_000,
  },
};

/** Orden de checkoutId por pestaña de Planes. */
export const CHECKOUT_IDS_BY_GROUP = {
  web: ["web-standard", "web-pro"],
  shop: ["shop-standard", "shop-pro"],
  software: ["software-saas"],
  mobile: ["mobile-app"],
} as const;

export type CheckoutGroupKey = keyof typeof CHECKOUT_IDS_BY_GROUP;

export function getMonthlyCheckoutPlan(
  id: string,
): MonthlyCheckoutPlan | null {
  return MONTHLY_CHECKOUT_PLANS[id] ?? null;
}
