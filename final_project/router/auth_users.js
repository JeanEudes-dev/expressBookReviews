const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// Checks if username is valid (i.e., if it’s not already registered)
const isValid = (username) => {
    return !users.some(user => user.username === username);
}

// Authenticates user by checking if username and password match the records
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful!", token });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    // Check for JWT token in the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const username = decoded.username;

        // Find the book by ISBN and add or update the review
        const book = Object.values(books).find(b => b.isbn === isbn);
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Add or update the review under the user’s name
        if (!book.reviews) book.reviews = {};
        book.reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully.", book });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
},

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check for JWT token in the Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY);
      const username = decoded.username;

      // Find the book by ISBN
      const book = Object.values(books).find(b => b.isbn === isbn);
      if (!book) {
          return res.status(404).json({ message: "Book not found." });
      }

      // Check if the review exists
      if (book.reviews && book.reviews[username]) {
          delete book.reviews[username]; // Delete the review
          return res.status(200).json({ message: "Review deleted successfully.", book });
      } else {
          return res.status(404).json({ message: "Review not found." });
      }
  } catch (error) {
      return res.status(401).json({ message: "Invalid token." });
  }
}));


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
