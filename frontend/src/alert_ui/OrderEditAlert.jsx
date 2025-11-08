import { useState } from "react";

export default function OrderEditAlert({ order, onSave, onClose }) {
  const [user, setUser] = useState(order.user);
  const [product, setProduct] = useState(order.product);
  const [quantity, setQuantity] = useState(order.quantity);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...order, user, product, quantity: Number(quantity) });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#252421ff",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "320px",
        }}
      >
        <h2>Edit Order</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>User:</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Product:</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "5px 10px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "5px 10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}