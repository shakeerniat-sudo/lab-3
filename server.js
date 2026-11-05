
const express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to your existing database
const dbPath = path.join(__dirname, "books.db");

let db;

// Validate book ID
const getValidBookId = (value) => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
};

// Validate book details
const validateBook = (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Invalid request body.";
    }

    const { title, author, price, pages } = body;

    if (typeof title !== "string" || title.trim() === "") {
        return "Title is required.";
    }

    if (typeof author !== "string" || author.trim() === "") {
        return "Author is required.";
    }

    if (
        price === undefined ||
        price === null ||
        price === "" ||
        typeof price === "boolean" ||
        !Number.isFinite(Number(price))
    ) {
        return "Price must be a valid number.";
    }

    if (Number(price) < 0 || !Number.isInteger(Number(price))) {
        return "Price must be a non-negative integer.";
    }

    if (
        pages === undefined ||
        pages === null ||
        pages === "" ||
        typeof pages === "boolean" ||
        !Number.isInteger(Number(pages)) ||
        Number(pages) <= 0
    ) {
        return "Pages must be a positive integer.";
    }

    return null;
};

// Initialize database
const initializeDBAndServer = async () => {
    try {
        // Check whether the database file exists
        if (!fs.existsSync(dbPath)) {
            throw new Error("books.dbnot found. Put it inside the lab3 folder.");
        }

        db = await sqlite.open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Check existing table
        const table = await db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='book'"
        );

        if (!table) {
            throw new Error("The book table does not exist in your database.");
        }

        console.log("Database connected successfully.");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database error:", error.message);
        process.exit(1);
    }
};

// GET /books
// Search, sorting, price filtering and pagination
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        if (typeof search_q !== "string") {
            return res.status(400).json({
                message: "search_q must be a string."
            });
        }

        const allowedColumns = [
            "id", "title", "author", "price", "pages"
        ];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid order_by column."
            });
        }

        const sortOrder = String(order).toUpperCase();

        if (!["ASC", "DESC"].includes(sortOrder)) {
            return res.status(400).json({
                message: "Order must be ASC or DESC."
            });
        }

        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (
            !Number.isSafeInteger(pageLimit) ||
            pageLimit <= 0 ||
            !Number.isSafeInteger(pageOffset) ||
            pageOffset < 0
        ) {
            return res.status(400).json({
                message: "Invalid limit or offset."
            });
        }

        const conditions = [];
        const values = [];

        // Search by title
        if (search_q.trim() !== "") {
            conditions.push("title LIKE ?");
            values.push(`%${search_q.trim()}%`);
        }

        // Minimum price
        if (min_price !== undefined) {
            const min = Number(min_price);

            if (
                typeof min_price !== "string" ||
                min_price.trim() === "" ||
                !Number.isFinite(min) ||
                min < 0
            ) {
                return res.status(400).json({
                    message: "Invalid minimum price."
                });
            }

            conditions.push("price >= ?");
            values.push(min);
        }

        // Maximum price
        if (max_price !== undefined) {
            const max = Number(max_price);

            if (
                typeof max_price !== "string" ||
                max_price.trim() === "" ||
                !Number.isFinite(max) ||
                max < 0
            ) {
                return res.status(400).json({
                    message: "Invalid maximum price."
                });
            }

            conditions.push("price <= ?");
            values.push(max);
        }

        if (
            min_price !== undefined &&
            max_price !== undefined &&
            Number(min_price) > Number(max_price)
        ) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price."
            });
        }

        let sql = "SELECT * FROM book";

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += ` ORDER BY ${order_by} ${sortOrder}`;
        sql += " LIMIT ? OFFSET ?";

        values.push(pageLimit, pageOffset);

        const books = await db.all(sql, values);

        return res.status(200).json({
            message: "Books retrieved successfully.",
            count: books.length,
            data: books
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to retrieve books."
        });
    }
});

// GET /books/:bookId
// Get one book
app.get("/books/:bookId", async (req, res) => {
    try {
        const bookId = getValidBookId(req.params.bookId);

        if (!bookId) {
            return res.status(400).json({
                message: "Invalid book ID."
            });
        }

        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        return res.status(200).json(book);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to retrieve book."
        });
    }
});

// POST /books
// Create a new book
app.post("/books", async (req, res) => {
    try {
        const validationError = validateBook(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const { title, author, price, pages } = req.body;

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [title.trim(), author.trim(), Number(price), Number(pages)]
        );

        const newBook = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [result.lastID]
        );

        return res.status(201).json({
            message: "Book created successfully.",
            data: newBook
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to add book."
        });
    }
});

// PUT /books/:bookId
// Update a book
app.put("/books/:bookId", async (req, res) => {
    try {
        const bookId = getValidBookId(req.params.bookId);

        if (!bookId) {
            return res.status(400).json({
                message: "Invalid book ID."
            });
        }

        const validationError = validateBook(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const existingBook = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        if (!existingBook) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        const { title, author, price, pages } = req.body;

        await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [title.trim(), author.trim(), Number(price), Number(pages), bookId]
        );

        const updatedBook = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [bookId]
        );

        return res.status(200).json({
            message: "Book updated successfully.",
            data: updatedBook
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to update book."
        });
    }
});

// DELETE /books/:bookId
// Delete a book
app.delete("/books/:bookId", async (req, res) => {
    try {
        const bookId = getValidBookId(req.params.bookId);

        if (!bookId) {
            return res.status(400).json({
                message: "Invalid book ID."
            });
        }

        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        return res.status(200).json({
            message: "Book deleted successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to delete book."
        });
    }
});

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Start application
initializeDBAndServer();
