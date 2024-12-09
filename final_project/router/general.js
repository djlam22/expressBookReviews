const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

//  Task 6
//  Register a new user
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get book lists
const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

//  Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const bookList = await getBooks(); 
    res.json(bookList); // Neatly format JSON output
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN
const getByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
};

// Task 11: Get book details based on ISBN using Promise callbacks and async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const book = books[isbn]; // Get the book by ISBN key

        if (!book) {
            return res.status(404).json({ message: `ISBN ${isbn} not found` });
        }

        res.json(book); // Return the book details
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving book details based on ISBN" });
    }
});


// Task 12: Get book details based on author using Promise callbacks and async/await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const booksByAuthor = Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase());

        if (booksByAuthor.length === 0) {
            return res.status(404).json({ message: `No books found for author ${author}` });
        }

        res.json(booksByAuthor); // Return all books by the specified author
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving books based on author" });
    }
});


// Task 13: Get book details based on title using Axios and async/await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const booksByTitle = Object.values(books).filter((book) => book.title.toLowerCase() === title.toLowerCase());

        if (booksByTitle.length === 0) {
            return res.status(404).json({ message: `No books found with title "${title}"` });
        }

        res.json(booksByTitle); // Return all books with the specified title
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving books based on title" });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result.reviews),
        error => res.status(error.status).json({message: error.message})
    );
});

module.exports.general = public_users;