import { useState } from "react";
import ReviewEditAlert from "../alert_ui/ReviewEditAlert";
import { DB_NAMES } from "../config/dbNames";

export default function ReviewTable({ dbName, reviews = [], onUpdate, onDBChange }) {
  const [editingReview, setEditingReview] = useState(null);
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
        <h2 style={{ margin: 0, color: "#ffcc00" }}>Reviews</h2>

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
      {reviews.length === 0 ? (
        <p style={{ color: "#ccc" }}>No reviews found in {dbName}</p>
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
                {["ID", "User", "Product", "Rating", "Comment", "Action"].map(
                  (header) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, index) => (
                <tr
                  key={r._id}
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
                    {r._id}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {r.user}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {r.product}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {r.rating}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    {r.comment}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #444" }}>
                    <button
                      onClick={() => setEditingReview(r)}
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

      {editingReview && (
        <ReviewEditAlert
          review={editingReview}
          onSave={(updated) => {
            onUpdate(updated);
            setEditingReview(null);
          }}
          onClose={() => setEditingReview(null)}
        />
      )}
    </div>
  );
}
