import { useState } from "react";

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
  // Online charges props
  onlineCharges = { deliveryLocations: [], packagingFee: 0 },
  onOnlineChargesChange,
  onSaveOnlineCharges,
  isSavingOnlineCharges = false,
  onlineChargesSaveState = "idle",
  showOnlineChargesSaveButton = false,
  // Online billers props
  onlineBillersList = [],
  onAddOnlineBiller,
  onOnlineBillerFieldChange,
  onDeleteOnlineBiller,
  onToggleOnlineBiller,
  onSaveOnlineBillers,
  isSavingOnlineBillers = false,
  onlineBillersListSaveState = "idle",
  showOnlineBillersSaveButton = false,
  bg,
  surface,
  border,
  text,
  muted,
  accent,
  darkMode,
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

  const onlineSaveLabel =
    onlineChargesSaveState === "saving"
      ? "Saving..."
      : onlineChargesSaveState === "saved"
        ? "Saved"
        : "Save Online Charges";
  const onlineSaveButtonColor =
    onlineChargesSaveState === "saved" ? "#22c55e" : accent;

  const deliveryLocations = Array.isArray(onlineCharges.deliveryLocations)
    ? onlineCharges.deliveryLocations
    : [];

  const onlineBillersListList = Array.isArray(onlineBillersList) ? onlineBillersList : [];
  const onlineBillerSaveLabel =
    onlineBillersListSaveState === "saving"
      ? "Saving..."
      : onlineBillersListSaveState === "saved"
        ? "Saved"
        : "Save Online Charges";
  const onlineBillerSaveButtonColor =
    onlineBillersListSaveState === "saved" ? "#22c55e" : accent;

  const updateLocation = (index, field, value) => {
    const updated = deliveryLocations.map((loc, i) =>
      i === index ? { ...loc, [field]: field === "fee" ? value : value } : loc,
    );
    onOnlineChargesChange({ ...onlineCharges, deliveryLocations: updated });
  };

  const addLocation = () => {
    const newLoc = { id: `loc_${Date.now()}`, name: "", fee: 0 };
    onOnlineChargesChange({
      ...onlineCharges,
      deliveryLocations: [...deliveryLocations, newLoc],
    });
  };

  const removeLocation = (index) => {
    onOnlineChargesChange({
      ...onlineCharges,
      deliveryLocations: deliveryLocations.filter((_, i) => i !== index),
    });
  };

  const [activeSubTab, setActiveSubTab] = useState("dine-in"); // dine-in | online

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          borderBottom: `1px solid ${border}`,
          paddingBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: text,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Billing Configuration
        </div>
        <div style={{ display: "flex", gap: "4px", background: darkMode ? "#00000033" : "#0000000a", padding: "4px", borderRadius: "10px" }}>
          {[
            { id: "dine-in", label: "🍽️ Dine-in", icon: "🍽️" },
            { id: "online", label: "🛵 Online Order", icon: "🛵" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              style={{
                background: activeSubTab === t.id ? accent : "transparent",
                color: activeSubTab === t.id ? "#fff" : muted,
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === "dine-in" && (
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: text, marginBottom: "4px" }}>
              🍽️ Dine-in Billers
            </div>
            <div style={{ fontSize: "13px", color: muted }}>
              Manage additional charges like Service Charge, VAT, or Consumption Tax for in-house dining.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "700", color: text }}>
              Active Billers
            </div>
            <button
              onClick={onAddBiller}
              style={{
                background: accent,
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: `0 4px 6px ${accent}22`,
              }}
            >
              + Add New Biller
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {customBillers.map((biller) => {
              const disableAmount = hasPositiveValue(biller.percent);
              const disablePercent = hasPositiveValue(biller.amount);
              const isInactive = biller.active === false;

              return (
                <div key={biller.id} style={{
                  ...cardStyle(border, darkMode ? "#1a1a24" : "#f8fafc", isInactive),
                  padding: "16px",
                  border: `1px solid ${isInactive ? border : accent + "33"}`,
                  transition: "transform 0.2s",
                }}>
                  <label style={{ display: "block", marginBottom: "12px" }}>
                    <span style={labelStyle(muted)}>Biller Name</span>
                    <input
                      type="text"
                      value={biller.name}
                      onChange={(event) =>
                        onBillerFieldChange(biller.id, "name", event.target.value)
                      }
                      style={getInputStyle(surface, border, text)}
                      placeholder="e.g. Service Charge"
                    />
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <label>
                      <span style={labelStyle(muted)}>Flat Amount (₦)</span>
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
                      <span style={labelStyle(muted)}>Percentage (%)</span>
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
                      gap: "10px",
                      marginTop: "16px",
                      borderTop: `1px solid ${border}`,
                      paddingTop: "12px",
                    }}
                  >
                    <button
                      onClick={() => onToggleBiller(biller.id, biller.name)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${isInactive ? "#f59e0b" : "#22c55e"}`,
                        color: isInactive ? "#f59e0b" : "#22c55e",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {isInactive ? "Deactivated" : "Active"}
                    </button>
                    <button
                      onClick={() => onDeleteBiller(biller.id, biller.name)}
                      style={{
                        background: "transparent",
                        border: "1px solid #ff4444",
                        color: "#ff4444",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "12px",
                        fontWeight: "700",
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
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                color: muted,
                fontSize: "14px",
              }}
            >
              No dine-in billers configured.
            </div>
          )}

          {showSaveButton && (
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onSave}
                disabled={isSaving}
                style={{
                  background: saveButtonColor,
                  border: "none",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: isSaving ? "wait" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "700",
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: `0 4px 10px ${saveButtonColor}33`,
                }}
              >
                {saveLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "online" && (
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: text, marginBottom: "4px" }}>
              🛵 Online Order Charges
            </div>
            <div style={{ fontSize: "13px", color: muted }}>
              Set up delivery fees based on location and global packaging costs for online checkout.
            </div>
          </div>

          <div
            style={{
              background: darkMode ? "#ffffff05" : "#00000003",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              border: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "700", color: text, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              📦 Packaging
            </div>
            <div style={{ maxWidth: "300px" }}>
              <label>
                <span style={labelStyle(muted)}>Packaging Fee (₦)</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={onlineCharges.packagingFee || ""}
                  onChange={(e) =>
                    onOnlineChargesChange({
                      ...onlineCharges,
                      packagingFee: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  style={getInputStyle(surface, border, text)}
                />
              </label>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "700", color: text, display: "flex", alignItems: "center", gap: "8px" }}>
              📍 Delivery Locations
            </div>
            <button
              onClick={addLocation}
              style={{
                background: accent,
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: `0 4px 6px ${accent}22`,
              }}
            >
              + Add Location
            </button>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {deliveryLocations.map((loc, index) => (
              <div
                key={loc.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px auto",
                  gap: "12px",
                  alignItems: "end",
                  border: `1px solid ${border}`,
                  borderRadius: "14px",
                  padding: "16px",
                  background: darkMode ? "#1a1a24" : "#f8fafc",
                }}
              >
                <label>
                  <span style={labelStyle(muted)}>Area / Location Name</span>
                  <input
                    type="text"
                    value={loc.name}
                    onChange={(e) => updateLocation(index, "name", e.target.value)}
                    placeholder="e.g. Lekki Phase 1"
                    style={getInputStyle(surface, border, text)}
                  />
                </label>
                <label>
                  <span style={labelStyle(muted)}>Fee (₦)</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={loc.fee || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only allow positive numbers
                      if (val === "" || /^\d+$/.test(val)) {
                        updateLocation(index, "fee", val === "" ? 0 : Number(val));
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent non-numeric keys except allowed control keys
                      if (!/\d|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="0"
                    style={getInputStyle(surface, border, text)}
                  />
                </label>
                <button
                  onClick={() => removeLocation(index)}
                  style={{
                    background: "#00000000",
                    border: "1px solid #ff4444",
                    color: "#ff4444",
                    padding: "8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    height: "38px",
                    width: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {deliveryLocations.length === 0 && (
            <div
              style={{
                marginTop: "12px",
                background: bg,
                border: `1px dashed ${border}`,
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                color: muted,
                fontSize: "14px",
              }}
            >
              No delivery locations added. Customers will see "Free Delivery" or won't be able to pick options.
            </div>
          )}

          {showOnlineChargesSaveButton && (
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onSaveOnlineCharges}
                disabled={isSavingOnlineCharges}
                style={{
                  background: onlineSaveButtonColor,
                  border: "none",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: isSavingOnlineCharges ? "wait" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "700",
                  opacity: isSavingOnlineCharges ? 0.7 : 1,
                  boxShadow: `0 4px 10px ${onlineSaveButtonColor}33`,
                }}
              >
                {onlineSaveLabel}
              </button>
            </div>
          )}

          <div style={{ marginTop: "32px", borderTop: `1px solid ${border}`, paddingTop: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: "800", color: text, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                💳 Online Additional Charges
              </div>
              <div style={{ fontSize: "13px", color: muted }}>
                Configure Service Charge, VAT, or Consumption Tax for online orders.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "700", color: text }}>
                Active Charges
              </div>
              <button
                onClick={onAddOnlineBiller}
                style={{
                  background: accent,
                  border: "none",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: `0 4px 6px ${accent}22`,
                }}
              >
                + Add New Charge
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {onlineBillersList.map((biller) => {
                const disableAmount = hasPositiveValue(biller.percent);
                const disablePercent = hasPositiveValue(biller.amount);
                const isInactive = biller.active === false;

                return (
                  <div key={biller.id} style={{
                    ...cardStyle(border, darkMode ? "#1a1a24" : "#f8fafc", isInactive),
                    padding: "16px",
                    border: `1px solid ${isInactive ? border : accent + "33"}`,
                    transition: "transform 0.2s",
                  }}>
                    <label style={{ display: "block", marginBottom: "12px" }}>
                      <span style={labelStyle(muted)}>Charge Name</span>
                      <input
                        type="text"
                        value={biller.name}
                        onChange={(event) =>
                          onOnlineBillerFieldChange(biller.id, "name", event.target.value)
                        }
                        style={getInputStyle(surface, border, text)}
                        placeholder="e.g. Service Charge"
                      />
                    </label>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <label>
                        <span style={labelStyle(muted)}>Flat Amount (₦)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={biller.amount ?? ""}
                          disabled={disableAmount}
                          onChange={(event) =>
                            onOnlineBillerFieldChange(biller.id, "amount", event.target.value)
                          }
                          style={getInputStyle(surface, border, text, disableAmount)}
                        />
                      </label>

                      <label>
                        <span style={labelStyle(muted)}>Percentage (%)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={biller.percent ?? ""}
                          disabled={disablePercent}
                          onChange={(event) =>
                            onOnlineBillerFieldChange(biller.id, "percent", event.target.value)
                          }
                          style={getInputStyle(surface, border, text, disablePercent)}
                        />
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "16px",
                        borderTop: `1px solid ${border}`,
                        paddingTop: "12px",
                      }}
                    >
                      <button
                        onClick={() => onToggleOnlineBiller(biller.id, biller.name)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${isInactive ? "#f59e0b" : "#22c55e"}`,
                          color: isInactive ? "#f59e0b" : "#22c55e",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {isInactive ? "Deactivated" : "Active"}
                      </button>
                      <button
                        onClick={() => onDeleteOnlineBiller(biller.id, biller.name)}
                        style={{
                          background: "transparent",
                          border: "1px solid #ff4444",
                          color: "#ff4444",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {onlineBillersList.length === 0 && (
              <div
                style={{
                  marginTop: "12px",
                  background: bg,
                  border: `1px dashed ${border}`,
                  borderRadius: "12px",
                  padding: "32px",
                  textAlign: "center",
                  color: muted,
                  fontSize: "14px",
                }}
              >
                No online charges configured. Add Service Charge, VAT, or other fees for online orders.
              </div>
            )}

            {showOnlineBillersSaveButton && (
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={onSaveOnlineBillers}
                  disabled={isSavingOnlineBillers}
                  style={{
                    background: onlineBillerSaveButtonColor,
                    border: "none",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    cursor: isSavingOnlineBillers ? "wait" : "pointer",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    fontWeight: "700",
                    opacity: isSavingOnlineBillers ? 0.7 : 1,
                    boxShadow: `0 4px 10px ${onlineBillerSaveButtonColor}33`,
                  }}
                >
                  {onlineBillerSaveLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
