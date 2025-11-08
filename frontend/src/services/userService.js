export async function fetchUsers(dbName) {
  const res = await fetch(`http://localhost:2000/${dbName}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function insertUser(dbName, user) {
  const res = await fetch(`http://localhost:2000/${dbName}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to insert user");
  return res.json();
}


export async function updateUser(dbName, user) {
  const res = await fetch(`http://localhost:2000/${dbName}/users/${user._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

// Delete a user by _id
export async function deleteUser(dbName, user) {
  const res = await fetch(`http://localhost:2000/${dbName}/users/${user._id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}