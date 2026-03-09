const hasPositiveValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
};

const getInputStyle = (surface, border, text, isDisabled = false) => ({
  width: "100%",
  background: surface,
  border: `1px solid ${border}`,
  color: text,
  padding: "8px 10px",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
  fontSize: "13px",
  opacity: isDisabled ? 0.6 : 1,
  cursor: isDisabled ? "not-allowed" : "text",
});

const cardStyle = (border, bg, isInactive = false) => ({
  border: `1px solid ${border}`,
  borderRadius: "10px",
  padding: "12px",
  background: bg,
  opacity: isInactive ? 0.65 : 1,
});

const labelStyle = (muted) => ({
  display: "block",
  fontSize: "11px",
  color: muted,
  marginBottom: "4px",
});

export default function BillingConfigTab({
  settings,
  onAddBiller,
  onBillerFieldChange,
  onDeleteBiller,
  onToggleBiller,
  onSave,
  isSaving,
  saveState = "idle",
  showSaveButton = false,
  bg,
  surface,
  border,
  text,
  muted,
  accent,
}) {
  const customBillers = Array.isArray(settings.customBillers)
    ? settings.customBillers
    : [];
  const saveLabel =
    saveState === "saving"
      ? "Saving..."
      : saveState === "saved"
        ? "Saved"
        : "Save Billing Settings";
  const saveButtonColor = saveState === "saved" ? "#22c55e" : accent;

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
          No default billers. Add the billers you want to charge.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "700", color: text }}>
            Billers
          </div>
          <button
            onClick={onAddBiller}
            style={{
              background: accent + "22",
              border: `1px solid ${accent}`,
              color: accent,
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            + Add Biller
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {customBillers.map((biller) => {
            const disableAmount = hasPositiveValue(biller.percent);
            const disablePercent = hasPositiveValue(biller.amount);
            const isInactive = biller.active === false;

            return (
              <div key={biller.id} style={cardStyle(border, bg, isInactive)}>
                <label style={{ display: "block", marginBottom: "10px" }}>
                  <span style={labelStyle(muted)}>Biller Name</span>
                  <input
                    type="text"
                    value={biller.name}
                    onChange={(event) =>
                      onBillerFieldChange(biller.id, "name", event.target.value)
                    }
                    style={getInputStyle(surface, border, text)}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <label>
                    <span style={labelStyle(muted)}>Amount (N)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={biller.amount ?? ""}
                      disabled={disableAmount}
                      onChange={(event) =>
                        onBillerFieldChange(biller.id, "amount", event.target.value)
                      }
                      style={getInputStyle(surface, border, text, disableAmount)}
                    />
                  </label>

                  <label>
                    <span style={labelStyle(muted)}>Percent (%)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={biller.percent ?? ""}
                      disabled={disablePercent}
                      onChange={(event) =>
                        onBillerFieldChange(biller.id, "percent", event.target.value)
                      }
                      style={getInputStyle(surface, border, text, disablePercent)}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => onToggleBiller(biller.id, biller.name)}
                    style={{
                      background: isInactive ? "#f59e0b22" : "#22c55e22",
                      border: `1px solid ${isInactive ? "#f59e0b" : "#22c55e"}`,
                      color: isInactive ? "#f59e0b" : "#22c55e",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {isInactive ? "Deactivated" : "Active"}
                  </button>
                  <button
                    onClick={() => onDeleteBiller(biller.id, biller.name)}
                    style={{
                      background: "#ff444422",
                      border: "1px solid #ff4444",
                      color: "#ff4444",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {customBillers.length === 0 && (
          <div
            style={{
              marginTop: "12px",
              background: bg,
              border: `1px dashed ${border}`,
              borderRadius: "8px",
              padding: "10px 12px",
              color: muted,
              fontSize: "12px",
            }}
          >
            No billers yet.
          </div>
        )}

        {showSaveButton && (
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onSave}
              disabled={isSaving}
              style={{
                background: saveButtonColor,
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
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
