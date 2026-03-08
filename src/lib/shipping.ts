export interface ShippingEstimate {
  pincode: string;
  zone: string;
  transitMinDays: number;
  transitMaxDays: number;
  productionMinWeeks: number;
  productionMaxWeeks: number;
  shippingFee: number;
  freeShippingApplied: boolean;
  generatedAt: string;
}

export const SHIPPING_ESTIMATE_STORAGE_KEY = "babel_shipping_estimate";

const ZONE_CONFIG: Record<string, { zone: string; transitMinDays: number; transitMaxDays: number; fee: number }> = {
  "1": { zone: "North", transitMinDays: 3, transitMaxDays: 5, fee: 1490 },
  "2": { zone: "North", transitMinDays: 3, transitMaxDays: 5, fee: 1490 },
  "3": { zone: "West", transitMinDays: 4, transitMaxDays: 6, fee: 1590 },
  "4": { zone: "West", transitMinDays: 4, transitMaxDays: 6, fee: 1590 },
  "5": { zone: "Central", transitMinDays: 4, transitMaxDays: 7, fee: 1690 },
  "6": { zone: "South", transitMinDays: 3, transitMaxDays: 6, fee: 1490 },
  "7": { zone: "East", transitMinDays: 5, transitMaxDays: 8, fee: 1790 },
  "8": { zone: "North East", transitMinDays: 6, transitMaxDays: 10, fee: 2290 },
  "9": { zone: "Remote", transitMinDays: 6, transitMaxDays: 11, fee: 2490 },
};

export const normalizePincode = (value: string) => value.replace(/\D/g, "").slice(0, 6);

export const isValidIndianPincode = (value: string) => /^\d{6}$/.test(value);

export const calculateShippingEstimate = (pincode: string, subtotal: number): ShippingEstimate | null => {
  const clean = normalizePincode(pincode);
  if (!isValidIndianPincode(clean)) return null;

  const config = ZONE_CONFIG[clean[0]] ?? { zone: "India", transitMinDays: 5, transitMaxDays: 8, fee: 1790 };
  const freeShippingApplied = subtotal >= 30000;
  const shippingFee = freeShippingApplied ? 0 : config.fee;

  return {
    pincode: clean,
    zone: config.zone,
    transitMinDays: config.transitMinDays,
    transitMaxDays: config.transitMaxDays,
    productionMinWeeks: 8,
    productionMaxWeeks: 12,
    shippingFee,
    freeShippingApplied,
    generatedAt: new Date().toISOString(),
  };
};

