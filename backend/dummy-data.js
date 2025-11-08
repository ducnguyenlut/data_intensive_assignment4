// Collections: users, products, categories, orders, reviews

const users = [
  // replicated
  { _id: 1, name: "Alice", email: "alice@shopmail.com", age: 25 },
  { _id: 2, name: "Bob", email: "bob@shopmail.com", age: 30 },
  { _id: 3, name: "Carol", email: "carol@shopmail.com", age: 22 },
  { _id: 4, name: "David", email: "david@shopmail.com", age: 28 },
  { _id: 5, name: "Eve", email: "eve@shopmail.com", age: 35 },
  // fragmented
  { _id: 6, name: "Frank", email: "frank@shopmail.com", age: 40 },
  { _id: 7, name: "Grace", email: "grace@shopmail.com", age: 21 },
  { _id: 8, name: "Hank", email: "hank@shopmail.com", age: 33 },
  { _id: 9, name: "Ivy", email: "ivy@shopmail.com", age: 27 },
  { _id: 10, name: "Jack", email: "jack@shopmail.com", age: 29 }
];

const products = [
  // replicated
  { _id: 1, name: "Laptop", price: 1000, stock: 120 },
  { _id: 2, name: "Phone", price: 600, stock: 200 },
  { _id: 3, name: "Shirt", price: 25, stock: 350 },
  { _id: 4, name: "Shoes", price: 80, stock: 210 },
  { _id: 5, name: "Book", price: 20, stock: 500 },
  // fragmented
  { _id: 6, name: "Tablet", price: 300, stock: 150 },
  { _id: 7, name: "Jacket", price: 50, stock: 320 },
  { _id: 8, name: "Notebook", price: 10, stock: 700 },
  { _id: 9, name: "Basketball", price: 30, stock: 250 },
  { _id: 10, name: "Vacuum Cleaner", price: 180, stock: 80 }
];

const categories = [
  { _id: 1, name: "Electronics", description: "Devices like phones and laptops", popularity: 95 },
  { _id: 2, name: "Clothing", description: "Men and women fashion wear", popularity: 88 },
  { _id: 3, name: "Books", description: "Printed and digital books", popularity: 80 },
  { _id: 4, name: "Sports", description: "Sportswear and equipment", popularity: 70 },
  { _id: 5, name: "Home", description: "Home decor and furniture", popularity: 85 },
  { _id: 6, name: "Office", description: "Office supplies and stationery", popularity: 60 },
  { _id: 7, name: "Kitchen", description: "Cooking and dining tools", popularity: 77 },
  { _id: 8, name: "Outdoors", description: "Camping and hiking gear", popularity: 68 },
  { _id: 9, name: "Beauty", description: "Skincare and cosmetics", popularity: 90 },
  { _id: 10, name: "Toys", description: "Children’s toys and games", popularity: 75 }
];

const orders = [
  { _id: 1, user: "Alice", product: "Laptop", quantity: 1 },
  { _id: 2, user: "Bob", product: "Phone", quantity: 2 },
  { _id: 3, user: "Carol", product: "Shirt", quantity: 1 },
  { _id: 4, user: "David", product: "Shoes", quantity: 1 },
  { _id: 5, user: "Eve", product: "Book", quantity: 3 },
  { _id: 6, user: "Frank", product: "Tablet", quantity: 1 },
  { _id: 7, user: "Grace", product: "Jacket", quantity: 2 },
  { _id: 8, user: "Hank", product: "Notebook", quantity: 4 },
  { _id: 9, user: "Ivy", product: "Basketball", quantity: 1 },
  { _id: 10, user: "Jack", product: "Vacuum Cleaner", quantity: 1 }
];

const reviews = [
  { _id: 1, user: "Alice", product: "Laptop", rating: 5, comment: "Fantastic performance!" },
  { _id: 2, user: "Bob", product: "Phone", rating: 4, comment: "Works great!" },
  { _id: 3, user: "Carol", product: "Shirt", rating: 3, comment: "Good quality." },
  { _id: 4, user: "David", product: "Shoes", rating: 5, comment: "Very comfortable!" },
  { _id: 5, user: "Eve", product: "Book", rating: 4, comment: "Nice story." },
  { _id: 6, user: "Frank", product: "Tablet", rating: 3, comment: "Decent for the price." },
  { _id: 7, user: "Grace", product: "Jacket", rating: 5, comment: "Perfect for winter!" },
  { _id: 8, user: "Hank", product: "Notebook", rating: 4, comment: "Good paper quality." },
  { _id: 9, user: "Ivy", product: "Basketball", rating: 5, comment: "Bounces well!" },
  { _id: 10, user: "Jack", product: "Vacuum Cleaner", rating: 5, comment: "Cleans efficiently!" }
];

module.exports = { users, products, categories, orders, reviews };