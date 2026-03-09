export const DEFAULT_BILLING_SETTINGS = Object.freeze({
  customBillers: [],
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

const normalizeCustomBillers = (customBillers = []) =>
  (Array.isArray(customBillers) ? customBillers : []).map((biller, index) => ({
    id: String(biller?.id || `biller_${index}`),
    name: String(biller?.name || "").trim() || `Biller ${index + 1}`,
    amount: toNumber(biller?.amount),
    percent: toNumber(biller?.percent),
    active: biller?.active !== false,
  }));

export const normalizeBillingSettings = (settings = {}) => ({
  customBillers: normalizeCustomBillers(settings?.customBillers),
});

const calculateCharge = (subtotal, amount, percent) =>
  toNumber(amount) + subtotal * (toNumber(percent) / 100);

export const calculateBillBreakdown = (subtotalInput, settingsInput) => {
  const subtotal = Math.max(0, toNumber(subtotalInput));
  const settings = normalizeBillingSettings(settingsInput);

  const serviceCharge = 0;
  const vat = 0;
  const tax = 0;
  const customBillerCharges = settings.customBillers
    .filter((biller) => biller.active)
    .map((biller) => ({
      ...biller,
      value: calculateCharge(subtotal, biller.amount, biller.percent),
    }));
  const customBillerTotal = customBillerCharges.reduce(
    (sum, biller) => sum + toNumber(biller.value),
    0,
  );
  const total = subtotal + serviceCharge + vat + tax + customBillerTotal;

  return {
    subtotal,
    serviceCharge,
    vat,
    tax,
    customBillerCharges,
    customBillerTotal,
    total,
    settings,
  };
};

export const getOrderBreakdown = (
  order,
  fallbackSettings = DEFAULT_BILLING_SETTINGS,
) => {
  const isPaidOrder =
    String(order?.paymentStatus || "").toLowerCase() === "paid";
  const subtotal =
    typeof order?.subtotal !== "undefined"
      ? toNumber(order.subtotal)
      : sumItemsSubtotal(order?.items);

  if (order?.billingBreakdown && isPaidOrder) {
    const serviceCharge = toNumber(order.billingBreakdown.serviceCharge);
    const vat = toNumber(order.billingBreakdown.vat);
    const tax = toNumber(order.billingBreakdown.tax);
    const customBillerCharges = (Array.isArray(order.billingBreakdown.customBillers)
      ? order.billingBreakdown.customBillers
      : []
    ).map((biller, index) => ({
      id: String(biller?.id || `biller_${index}`),
      name: String(biller?.name || "").trim() || `Biller ${index + 1}`,
      amount: toNumber(biller?.amount),
      percent: toNumber(biller?.percent),
      active: biller?.active !== false,
      value: toNumber(biller?.value),
    }));
    const customBillerTotal = customBillerCharges.reduce(
      (sum, biller) => sum + toNumber(biller.value),
      0,
    );
    const calculatedTotal = subtotal + serviceCharge + vat + tax + customBillerTotal;
    const total =
      typeof order.total !== "undefined" ? toNumber(order.total) : calculatedTotal;

    return {
      subtotal,
      serviceCharge,
      vat,
      tax,
      customBillerCharges,
      customBillerTotal,
      total,
      settings: normalizeBillingSettings(order.billingSettingsSnapshot || fallbackSettings),
    };
  }

  const useLiveFallbackForUnpaid = fallbackSettings !== DEFAULT_BILLING_SETTINGS;
  const settingsForComputation = isPaidOrder
    ? order?.billingSettingsSnapshot || fallbackSettings
    : useLiveFallbackForUnpaid
      ? fallbackSettings
      : order?.billingSettingsSnapshot || fallbackSettings;
  const computed = calculateBillBreakdown(
    subtotal,
    settingsForComputation,
  );

  return {
    ...computed,
    total:
      isPaidOrder && typeof order?.total !== "undefined"
        ? toNumber(order.total)
        : computed.total,
  };
};

export const sumOrderBreakdowns = (
  orders = [],
  fallbackSettings = DEFAULT_BILLING_SETTINGS,
) => {
  const aggregated = orders.reduce(
    (acc, order) => {
      const breakdown = getOrderBreakdown(order, fallbackSettings);

      breakdown.customBillerCharges.forEach((biller) => {
        const key = `${biller.id}::${biller.name}`;
        const existing = acc.customBillerMap.get(key) || {
          ...biller,
          value: 0,
        };
        existing.value += toNumber(biller.value);
        acc.customBillerMap.set(key, existing);
      });

      return {
        subtotal: acc.subtotal + breakdown.subtotal,
        serviceCharge: acc.serviceCharge + breakdown.serviceCharge,
        vat: acc.vat + breakdown.vat,
        tax: acc.tax + breakdown.tax,
        customBillerMap: acc.customBillerMap,
        customBillerTotal: acc.customBillerTotal + breakdown.customBillerTotal,
        total: acc.total + breakdown.total,
      };
    },
    {
      subtotal: 0,
      serviceCharge: 0,
      vat: 0,
      tax: 0,
      customBillerMap: new Map(),
      customBillerTotal: 0,
      total: 0,
    },
  );
  return {
    subtotal: aggregated.subtotal,
    serviceCharge: aggregated.serviceCharge,
    vat: aggregated.vat,
    tax: aggregated.tax,
    customBillerCharges: Array.from(aggregated.customBillerMap.values()),
    customBillerTotal: aggregated.customBillerTotal,
    total: aggregated.total,
  };
};
