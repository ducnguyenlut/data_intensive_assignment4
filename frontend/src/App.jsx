import { useState, useEffect } from "react";
import "./App.css";

import { fetchUsers, updateUser, deleteUser, insertUser } from "./services/userService";
import { fetchProducts, updateProduct } from "./services/productService";
import { fetchCategories, updateCategory } from "./services/categoryService";
import { fetchOrders, updateOrder } from "./services/orderService";
import { fetchReviews, updateReview } from "./services/reviewService";
import { restoreAllDatabases } from "./services/restoreService";

import UserTable from "./components/UserTable";
import ProductTable from "./components/ProductTable";
import CategoryTable from "./components/CategoryTable";
import OrderTable from "./components/OrderTable";
import ReviewTable from "./components/ReviewTable";

export default function App() {
  const [selectedDB, setSelectedDB] = useState("");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [orderDB, setOrderDB] = useState("");
  const [userDB, setUserDB] = useState("");
  const [productDB, setProductDB] = useState("");
  const [categoryDB, setCategoryDB] = useState("");
  const [reviewDB, setReviewDB] = useState("");

  // 🟢 Auto-load nosql at first render
  useEffect(() => {
    handleSelectDB("nosql");
  }, []);

  const handleSelectDB = async (dbName) => {
    setSelectedDB(dbName);
    setOrderDB(dbName);
    setUserDB(dbName);
    setProductDB(dbName);
    setCategoryDB(dbName);
    setReviewDB(dbName);

    try {
      const [u, p, c, o, r] = await Promise.all([
        fetchUsers(dbName),
        fetchProducts(dbName),
        fetchCategories(dbName),
        fetchOrders(dbName),
        fetchReviews(dbName),
      ]);
      // console.log("Fetched users:", u); // 👈 log users array
      setUsers(u);
      setProducts(p);
      setCategories(c);
      setOrders(o);
      setReviews(r);
    } catch (err) {
      console.error("Error loading data:", err);
      setUsers([]);
      setProducts([]);
      setCategories([]);
      setOrders([]);
      setReviews([]);
    }
  };


  const handleRestoreDB = async () => {
  try {
    // 1️⃣ Clear all tables immediately
    setUsers([]);
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setReviews([]);

    // 2️⃣ Wait 0.5s
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3️⃣ Call restore API
    const messages = await restoreAllDatabases();
    console.log(messages);

    // 4️⃣ Reload all data for UI
    await handleSelectDB("nosql"); // reload nosql by default for all tables

    alert("All databases restored successfully!");
  } catch (err) {
    console.error("Failed to restore:", err);
    alert("Failed to restore all databases");
  }
};


  // 🔵 Update helpers
  const _updateUser = async (o) => {
    const saved = await updateUser(userDB, o);
    setUsers((prev) => prev.map((x) => (x._id === saved._id ? saved : x)));
  };

  // Delete user
  const _deleteUser = async (o) => {
    await deleteUser(userDB, o);
    setUsers(prev => prev.filter(x => x._id !== o._id));
  };

  // Insert user
  const _insertUser = async (o) => {
    const newUser = await insertUser(userDB, o); 
    setUsers((prev) => [...prev, newUser]);
  };


  const _updateProduct = async (o) => {
    const saved = await updateProduct(productDB, o);
    setProducts((prev) => prev.map((x) => (x._id === saved._id ? saved : x)));
  };

  const _updateCategory = async (o) => {
    const saved = await updateCategory(categoryDB, o);
    setCategories((prev) => prev.map((x) => (x._id === saved._id ? saved : x)));
  };

  const _updateOrder = async (o) => {
    const saved = await updateOrder(orderDB, o);
    setOrders((prev) => prev.map((x) => (x._id === saved._id ? saved : x)));
  };

  const _updateReview = async (o) => {
    const saved = await updateReview(reviewDB, o);
    setReviews((prev) => prev.map((x) => (x._id === saved._id ? saved : x)));
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ color: "white" }}> Duc Nguyen - Assignment 4</h1>
      <div style={{ marginBottom: "20px" }}>
        <button
          style={{ padding: "10px 20px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
          onClick={handleRestoreDB}
        >
          Restore All Databases
        </button>
      </div>

      <UserTable
        dbName={userDB}
        users={users}
        onUpdate={_updateUser}
        onDBChange={async (o) => {
          setUserDB(o);
          const data = await fetchUsers(o);
          setUsers(data);
        }}
        onDelete={_deleteUser}
        onInsert={_insertUser}
      />

      <ProductTable
        dbName={productDB}
        products={products}
        onUpdate={_updateProduct}
        onDBChange={async (o) => {
          setProductDB(o);
          const data = await fetchProducts(o);
          setProducts(data);
        }}
      />

      <CategoryTable
        dbName={categoryDB}
        categories={categories}
        onUpdate={_updateCategory}
        onDBChange={async (o) => {
          setCategoryDB(o);
          const data = await fetchCategories(o);
          setCategories(data);
        }}
      />

      <OrderTable
        dbName={orderDB}
        orders={orders}
        onUpdate={_updateOrder}
        onDBChange={async (o) => {
          setOrderDB(o);
          const data = await fetchOrders(o);
          setOrders(data);
        }}
      />

      <ReviewTable
        dbName={reviewDB}
        reviews={reviews}
        onUpdate={_updateReview}
        onDBChange={async (o) => {
          setReviewDB(o);
          const data = await fetchReviews(o);
          setReviews(data);
        }}
      />
    </div>
  );
}
