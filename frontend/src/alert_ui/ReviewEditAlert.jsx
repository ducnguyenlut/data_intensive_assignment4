import { useState } from "react";

export default function ReviewEditAlert({ review, onSave, onClose }) {
  const [user, setUser] = useState(review.user);
  const [product, setProduct] = useState(review.product);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...review, user, product, rating: Number(rating), comment });
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
        <h2>Edit Review</h2>

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
          <label>Rating:</label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            min="1"
            max="5"
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "5px", height: "80px" }}
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
