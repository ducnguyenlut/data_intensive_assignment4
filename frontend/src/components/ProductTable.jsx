import { useState } from "react";
import ProductEditAlert from "../alert_ui/ProductEditAlert";
import { DB_NAMES } from "../config/dbNames";

export default function ProductTable({ dbName, products = [], onUpdate, onDBChange }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDBSelect = (db) => {
    setShowDropdown(false);
    onDBChange && onDBChange(db);
  };

  return (
    <div
      style={{
        marginTop: "30px",
        border: "1px solid #444",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#252421ff",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #444",
          backgroundColor: "#2e2c28",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0, color: "#ffcc00" }}>Products</h2>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0056b3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#007bff")
            }
          >
            {dbName.toUpperCase()} ▼
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "110%",
                backgroundColor: "#2e2c28",
                border: "1px solid #555",
                borderRadius: "4px",
                zIndex: 10,
                overflow: "hidden",
              }}
            >
              {DB_NAMES.map((db) => (
                <div
                  key={db}
                  onClick={() => handleDBSelect(db)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3e3c38")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2e2c28")
                  }
                >
                  {db.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      {products.length === 0 ? (
        <p style={{ color: "#ccc" }}>No products found in {dbName}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              backgroundColor: "#252421ff",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              color: "white",
            }}
          >
            <thead>
              <tr>
                {["ID", "Name", "Price (€)", "Stock", "Action"].map((header) => (
                  <th
                    key={header}
                    style={{
                      borderBottom: "1px solid #444",
                      padding: "8px",
                      textAlign: "left",
                      color: "#ffcc00",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#2e2c28" : "#35332f",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3e3c38")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#2e2c28" : "#35332f")
                  }
                >
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {p._id}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {p.name}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {p.price}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    <button
                      onClick={() => setEditingProduct(p)}
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0056b3")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#007bff")
                      }
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <ProductEditAlert
          product={editingProduct}
          onSave={(updated) => {
            onUpdate(updated);
            setEditingProduct(null);
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

    </div>
  );
}
