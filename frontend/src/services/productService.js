export async function fetchProducts(dbName) {
  const res = await fetch(`http://localhost:2000/${dbName}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function updateProduct(dbName, product) {
  const res = await fetch(`http://localhost:2000/${dbName}/products/${product._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}
