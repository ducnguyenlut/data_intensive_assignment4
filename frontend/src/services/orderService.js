export async function fetchOrders(dbName) {
  const res = await fetch(`http://localhost:2000/${dbName}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function updateOrder(dbName, order) {
  const res = await fetch(`http://localhost:2000/${dbName}/orders/${order._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}