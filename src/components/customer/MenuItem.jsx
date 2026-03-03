import { TAG_COLORS } from "../../data/constants";
import { fmt } from "../../utils/storage";

export default function MenuItem({ item, inCart, onAddToCart, onUpdateQty }) {
  return (
    <div
      style={{
        background: "#1a0a00",
        border: "1px solid #2d1200",
        borderRadius: "12px",
        marginBottom: "10px",
        overflow: "hidden",
        display: "flex",
        gap: "0",
      }}
    >
      <div
        style={{
          width: "90px",
          minHeight: "90px",
          background: "#2d1200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {item.image && item.image.startsWith("data:") ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          item.image
        )}
      </div>
      <div style={{ padding: "10px 12px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              fontSize: "14px",
              color: "#f5f0e8",
              lineHeight: "1.3",
            }}
          >
            {item.name}
          </div>
          <div
            style={{
              color: "#e8b86d",
              fontWeight: "700",
              fontSize: "14px",
              whiteSpace: "nowrap",
              marginLeft: "8px",
            }}
          >
            {fmt(item.price)}
          </div>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#7a5c30",
            marginTop: "4px",
            lineHeight: "1.4",
          }}
        >
          {item.desc}
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "6px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {item.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: TAG_COLORS[t] + "22",
                  color: TAG_COLORS[t],
                  border: `1px solid ${TAG_COLORS[t]}44`,
                  borderRadius: "10px",
                  padding: "1px 6px",
                  fontSize: "10px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {inCart ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => onUpdateQty(item.id, -1)}
                style={{
                  background: "#c17f2a",
                  border: "none",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                -
              </button>
              <span
                style={{
                  color: "#e8b86d",
                  fontWeight: "700",
                  fontSize: "14px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {inCart.qty}
              </span>
              <button
                onClick={() => onUpdateQty(item.id, 1)}
                style={{
                  background: "#c17f2a",
                  border: "none",
                  color: "#fff",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              style={{
                background: "#c17f2a",
                border: "none",
                color: "#fff",
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
