import { useState } from "react";

export default function CategoryEditAlert({ category, onSave, onClose }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [popularity, setPopularity] = useState(category.popularity);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...category, name, description, popularity: Number(popularity) });
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
          minWidth: "300px",
        }}
      >
        <h2>Edit Category</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "5px", height: "80px" }}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Popularity:</label>
          <input
            type="number"
            value={popularity}
            onChange={(e) => setPopularity(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose} style={{ padding: "5px 10px" }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: "5px 10px" }}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
