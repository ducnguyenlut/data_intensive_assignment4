export async function fetchReviews(dbName) {
  const res = await fetch(`http://localhost:2000/${dbName}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function updateReview(dbName, review) {
  const res = await fetch(`http://localhost:2000/${dbName}/reviews/${review._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
}
