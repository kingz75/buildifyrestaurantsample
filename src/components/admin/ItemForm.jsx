import { useState, useRef } from "react";
import { TAG_COLORS } from "../../data/constants";
import { getCategories } from "../../utils/storage";

export default function ItemForm({
  item,
  onSave,
  onCancel,
  bg,
  surface,
  border,
  text,
  accent,
  muted,
  categories,
}) {
  const menuCategories = categories || getCategories();
  const [form, setForm] = useState(
    item || {
      name: "",
      category: "Starters",
      price: "",
      desc: "",
      tags: [],
      image: "🍽️",
      available: true,
    },
  );
  const [imagePreview, setImagePreview] = useState(
    item?.image?.startsWith("data:") ? item.image : null,
  );
  const fileInputRef = useRef(null);

  const toggleTag = (t) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
    }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setForm({ ...form, image: emoji });
    setImagePreview(null);
  };

  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${accent}`,
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: "700",
          marginBottom: "16px",
          color: accent,
        }}
      >
        {item ? "Edit Item" : "Add New Item"}
      </div>

      {/* Image Upload Section */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: muted, marginBottom: "8px" }}>
          Item Image
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Image Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              border: `2px dashed ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              background: bg,
              fontSize: "36px",
            }}
          >
            {imagePreview ? (
              <img
                src={form.image}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : form.image.startsWith("data:") ? (
              <img
                src={form.image}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              form.image
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: accent + "22",
                border: `1px solid ${accent}`,
                color: accent,
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
              }}
            >
              📷 Upload Image
            </button>
            <button
              onClick={() => handleEmojiSelect("🍽️")}
              style={{
                background: "transparent",
                border: `1px solid ${border}`,
                color: muted,
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
              }}
            >
              Use Emoji
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <input
          placeholder="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{
            background: bg,
            border: `1px solid ${border}`,
            color: text,
            padding: "10px",
            borderRadius: "8px",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
        />
        <input
          placeholder="Price (₦)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={{
            background: bg,
            border: `1px solid ${border}`,
            color: text,
            padding: "10px",
            borderRadius: "8px",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
        />
      </div>
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        style={{
          width: "100%",
          background: bg,
          border: `1px solid ${border}`,
          color: text,
          padding: "10px",
          borderRadius: "8px",
          outline: "none",
          fontFamily: "inherit",
          fontSize: "13px",
          marginBottom: "10px",
        }}
      >
        {menuCategories
          .filter((c) => c !== "All")
          .map((c) => (
            <option key={c}>{c}</option>
          ))}
      </select>
      <textarea
        placeholder="Description"
        value={form.desc}
        onChange={(e) => setForm({ ...form, desc: e.target.value })}
        style={{
          width: "100%",
          background: bg,
          border: `1px solid ${border}`,
          color: text,
          padding: "10px",
          borderRadius: "8px",
          outline: "none",
          fontFamily: "inherit",
          fontSize: "13px",
          resize: "vertical",
          minHeight: "60px",
          boxSizing: "border-box",
          marginBottom: "10px",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {["Spicy", "Vegan", "Vegetarian", "Halal"].map((t) => (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            style={{
              background: form.tags.includes(t)
                ? TAG_COLORS[t] + "33"
                : "transparent",
              border: `1px solid ${form.tags.includes(t) ? TAG_COLORS[t] : border}`,
              color: form.tags.includes(t) ? TAG_COLORS[t] : muted,
              padding: "5px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onSave(form)}
          style={{
            background: accent,
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: `1px solid ${border}`,
            color: muted,
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
