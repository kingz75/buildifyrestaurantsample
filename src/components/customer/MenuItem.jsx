import { TAG_COLORS } from "../../data/constants";
import { fmt } from "../../utils/storage";

export default function MenuItem({
  item,
  inCart,
  onAddToCart,
  onUpdateQty,
  selectedTag,
  onTagClick
}) {
  const hasImage = item?.image && String(item.image).length > 5;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        marginBottom: "12px",
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          width: "100px",
          minHeight: "100px",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {item?.image && String(item.image).startsWith("data:") ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          item?.image || "🍽️"
        )}
      </div>
      <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
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
                color: "#1a1a1a",
                lineHeight: "1.3",
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                color: "#c17f2a",
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
              fontSize: "12px",
              color: "#64748b",
              marginTop: "4px",
              lineHeight: "1.4",
            }}
          >
            {item.desc}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "8px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {item.tags?.map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick && onTagClick(t);
                }}
                style={{
                  background: selectedTag === t ? TAG_COLORS[t] : TAG_COLORS[t] + "11",
                  color: selectedTag === t ? "#fff" : TAG_COLORS[t],
                  border: `1px solid ${selectedTag === t ? "transparent" : TAG_COLORS[t] + "44"}`,
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {inCart ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => onUpdateQty(item.id, -1)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "#1a1a1a",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                }}
              >
                -
              </button>
              <span
                style={{
                  color: "#1a1a1a",
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
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
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
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 4px rgba(193, 127, 42, 0.2)",
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
