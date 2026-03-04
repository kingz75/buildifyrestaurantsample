export const DEFAULT_BILLING_SETTINGS = Object.freeze({
  serviceChargeAmount: 0,
  serviceChargePercent: 0,
  vatAmount: 0,
  vatPercent: 0,
  taxAmount: 0,
  taxPercent: 0,
});

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumItemsSubtotal = (items = []) =>
  items.reduce(
    (sum, item) => sum + toNumber(item?.price) * toNumber(item?.qty),
    0,
  );

export const normalizeBillingSettings = (settings = {}) => ({
  ...DEFAULT_BILLING_SETTINGS,
  ...Object.fromEntries(
    Object.entries(settings || {}).map(([key, value]) => [key, toNumber(value)]),
  ),
});

const calculateCharge = (subtotal, amount, percent) =>
  toNumber(amount) + subtotal * (toNumber(percent) / 100);

export const calculateBillBreakdown = (subtotalInput, settingsInput) => {
  const subtotal = Math.max(0, toNumber(subtotalInput));
  const settings = normalizeBillingSettings(settingsInput);

  const serviceCharge = calculateCharge(
    subtotal,
    settings.serviceChargeAmount,
    settings.serviceChargePercent,
  );
  const vat = calculateCharge(subtotal, settings.vatAmount, settings.vatPercent);
  const tax = calculateCharge(subtotal, settings.taxAmount, settings.taxPercent);
  const total = subtotal + serviceCharge + vat + tax;

  return {
    subtotal,
    serviceCharge,
    vat,
    tax,
    total,
    settings,
  };
};

export const getOrderBreakdown = (
  order,
  fallbackSettings = DEFAULT_BILLING_SETTINGS,
) => {
  const subtotal =
    typeof order?.subtotal !== "undefined"
      ? toNumber(order.subtotal)
      : sumItemsSubtotal(order?.items);

  if (order?.billingBreakdown) {
    const serviceCharge = toNumber(order.billingBreakdown.serviceCharge);
    const vat = toNumber(order.billingBreakdown.vat);
    const tax = toNumber(order.billingBreakdown.tax);
    const calculatedTotal = subtotal + serviceCharge + vat + tax;
    const total =
      typeof order.total !== "undefined" ? toNumber(order.total) : calculatedTotal;

    return {
      subtotal,
      serviceCharge,
      vat,
      tax,
      total,
      settings: normalizeBillingSettings(
        order.billingSettingsSnapshot || fallbackSettings,
      ),
    };
  }

  const computed = calculateBillBreakdown(
    subtotal,
    order?.billingSettingsSnapshot || fallbackSettings,
  );

  return {
    ...computed,
    total:
      typeof order?.total !== "undefined" ? toNumber(order.total) : computed.total,
  };
};

export const sumOrderBreakdowns = (
  orders = [],
  fallbackSettings = DEFAULT_BILLING_SETTINGS,
) =>
  orders.reduce(
    (acc, order) => {
      const breakdown = getOrderBreakdown(order, fallbackSettings);
      return {
        subtotal: acc.subtotal + breakdown.subtotal,
        serviceCharge: acc.serviceCharge + breakdown.serviceCharge,
        vat: acc.vat + breakdown.vat,
        tax: acc.tax + breakdown.tax,
        total: acc.total + breakdown.total,
      };
    },
    { subtotal: 0, serviceCharge: 0, vat: 0, tax: 0, total: 0 },
  );
