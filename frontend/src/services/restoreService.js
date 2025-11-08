// services/restoreService.js
export const restoreDatabase = async (dbName) => {
  const response = await fetch(`http://localhost:2000/${dbName}/restore`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to restore database " + dbName);
  return response.json();
};

// Restore all DBs
export const restoreAllDatabases = async () => {
  const dbs = ["nosql"];
  const results = [];
  for (let db of dbs) {
    const res = await restoreDatabase(db);
    results.push(res.message);
  }
  return results;
};
