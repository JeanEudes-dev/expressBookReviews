const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to wrap synchronous operations in a Promise
const getBooksAsync = () => {
  return new Promise((resolve) => {
    resolve(books);
  });
};

// User registration
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getBooksAsync();
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(allBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const filteredBooks = Object.values(books).filter(
      (b) => b.author.toLowerCase() === author
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found for this author." });
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const filteredBooks = Object.values(books).filter(
      (b) => b.title.toLowerCase() === title
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found with this title." });
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(filteredBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Get book review
public_users.get("/review/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (!book || !book.reviews) {
      return res.status(404).json({ message: "No reviews found for this book." });
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports.general = public_users;
