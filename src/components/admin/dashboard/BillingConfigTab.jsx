const BILLING_FIELDS = [
  {
    id: "serviceCharge",
    label: "Service Charge",
    amountKey: "serviceChargeAmount",
    percentKey: "serviceChargePercent",
  },
  { id: "vat", label: "VAT", amountKey: "vatAmount", percentKey: "vatPercent" },
  { id: "tax", label: "Tax", amountKey: "taxAmount", percentKey: "taxPercent" },
];

const hasPositiveValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

export default function BillingConfigTab({
  settings,
  onFieldChange,
  onSave,
  isSaving,
  bg,
  surface,
  border,
  text,
  muted,
  accent,
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        Billing Configuration
      </div>

      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "13px", color: muted, marginBottom: "16px" }}>
          Configure fixed amount and percentage for service charge, VAT, and tax.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {BILLING_FIELDS.map((field) => (
            (() => {
              const amountValue = settings[field.amountKey] ?? "";
              const percentValue = settings[field.percentKey] ?? "";
              const disableAmount = hasPositiveValue(percentValue);
              const disablePercent = hasPositiveValue(amountValue);

              return (
                <div
                  key={field.id}
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: "10px",
                    padding: "12px",
                    background: bg,
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      marginBottom: "10px",
                      color: text,
                    }}
                  >
                    {field.label}
                  </div>

                  <label style={{ display: "block", marginBottom: "10px" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: muted,
                        marginBottom: "4px",
                      }}
                    >
                      Fixed Amount (N)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountValue}
                      disabled={disableAmount}
                      onChange={(event) =>
                        onFieldChange(field.amountKey, event.target.value)
                      }
                      style={{
                        width: "100%",
                        background: surface,
                        border: `1px solid ${border}`,
                        color: text,
                        padding: "8px 10px",
                        borderRadius: "8px",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: "13px",
                        opacity: disableAmount ? 0.6 : 1,
                        cursor: disableAmount ? "not-allowed" : "text",
                      }}
                    />
                  </label>

                  <label style={{ display: "block" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: muted,
                        marginBottom: "4px",
                      }}
                    >
                      Percentage (%)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={percentValue}
                      disabled={disablePercent}
                      onChange={(event) =>
                        onFieldChange(field.percentKey, event.target.value)
                      }
                      style={{
                        width: "100%",
                        background: surface,
                        border: `1px solid ${border}`,
                        color: text,
                        padding: "8px 10px",
                        borderRadius: "8px",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: "13px",
                        opacity: disablePercent ? 0.6 : 1,
                        cursor: disablePercent ? "not-allowed" : "text",
                      }}
                    />
                  </label>
                </div>
              );
            })()
          ))}
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{
              background: accent,
              border: "none",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: isSaving ? "wait" : "pointer",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: "600",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save Billing Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
