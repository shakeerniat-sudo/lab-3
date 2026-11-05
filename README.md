# Lab 3 – REST API, Query Parameters, Validation and Debugging

## Project Details

- **Name:** Jangli Mahammad Shakeer
- **Registration Number:** 252U1R5058
- **Section:** CSE AIDE-2A-106
- **Course:** Backend Development Fundamentals
- **Lab:** Lab 3 – REST API, Query Parameters, Validation and Debugging
- **Institution:** Aurora Deemed to be University

## Deployment URL

**Render URL:** https://lab-3-8m9a.onrender.com/books

## Project Description

This project implements RESTful API operations using Node.js, Express.js, and SQLite. It provides endpoints to create, retrieve, update, and delete book records.

It also supports searching, sorting, pagination, price filtering, input validation, and proper HTTP status codes.

The database contains 10 book records with details such as book ID, title, author, price, and number of pages.

## Technologies Used

- Node.js
- Express.js
- SQLite
- SQLite3
- JavaScript
- Postman
- Visual Studio Code
- Render

## Project Structure

```text
lab 3/
│
├── server.js
├── books.db
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
│
└── screenshots/
    ├── 01-render-deployment.png
    ├── 02-get-all-books.png
    ├── 03-get-book-by-id.png
    ├── 04-search-books.png
    ├── 05-sorting-ascending.png
    ├── 06-sorting-descending.png
    ├── 07-pagination.png
    ├── 08-price-filter.png
    ├── 09-combined-query.png
    ├── 10-post-success.png
    ├── 11-post-validation.png
    ├── 12-put-update.png
    └── 13-delete.png
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/shakeerniat-sudo/lab-3.git
```

### 2. Open the project folder

```bash
cd "lab 3"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3000
```

## API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Retrieve all books |
| GET | `/books/:bookId` | Retrieve a specific book |
| POST | `/books` | Add a new book |
| PUT | `/books/:bookId` | Update a book |
| DELETE | `/books/:bookId` | Delete a book |

## Query Parameters

### 1. Search Books

```text
GET /books?search_q=The
```

Searches for books using a partial title.

Expected matching books include:

- The Alchemist
- Think Like a Monk
- The Power of Now
- The 5 AM Club

### 2. Sorting

**Ascending order:**

```text
GET /books?order_by=price&order=ASC
```

Sorts books by price from lowest to highest.

**Descending order:**

```text
GET /books?order_by=price&order=DESC
```

Sorts books by price from highest to lowest.

### 3. Pagination

**First five books:**

```text
GET /books?limit=5&offset=0
```

Returns five records starting from the first record.

**Next five books:**

```text
GET /books?limit=5&offset=5
```

Returns the next five records.

### 4. Price Filtering

```text
GET /books?min_price=200&max_price=350
```

Retrieves books within the price range of ₹200 to ₹350.

Expected books:

- The Alchemist – ₹250
- Rich Dad Poor Dad – ₹300
- Wings of Fire – ₹200
- Ikigai – ₹350
- Zero to One – ₹320

### 5. Combined Query

```text
GET /books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0
```

Combines searching, price filtering, sorting, and pagination.

Expected matching books are sorted by price in ascending order, with a maximum of three records returned.

## Database Records

The database contains the following 10 books:

| ID | Title | Author | Price (₹) | Pages |
|---:|---|---|---:|---:|
| 1 | The Alchemist | Paulo Coelho | 250 | 208 |
| 2 | Atomic Habits | James Clear | 450 | 320 |
| 3 | Rich Dad Poor Dad | Robert Kiyosaki | 300 | 336 |
| 4 | Wings of Fire | A.P.J. Abdul Kalam | 200 | 180 |
| 5 | Ikigai | Hector Garcia | 350 | 194 |
| 6 | Think Like a Monk | Jay Shetty | 400 | 288 |
| 7 | Deep Work | Cal Newport | 500 | 304 |
| 8 | The Power of Now | Eckhart Tolle | 280 | 236 |
| 9 | Zero to One | Peter Thiel | 320 | 210 |
| 10 | The 5 AM Club | Robin Sharma | 380 | 336 |

## Request Body for POST and PUT

Select **Body → raw → JSON** in Postman.

### POST – Add a New Book

```json
{
  "title": "C++ Programming",
  "author": "Bjarne Stroustrup",
  "price": 600,
  "pages": 450
}
```

Expected status code: **201 Created**

### PUT – Update an Existing Book

```json
{
  "title": "The Alchemist Updated",
  "author": "Paulo Coelho",
  "price": 350,
  "pages": 220
}
```

Use:

```text
PUT /books/1
```

Expected status code: **200 OK**

## HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Book created successfully |
| 400 | Invalid input or query parameters |
| 404 | Book or route not found |
| 500 | Internal server error |

## Input Validation

The application validates:

- Book title must not be empty.
- Author name must not be empty.
- Price must be a valid non-negative number.
- Pages must be a positive integer.
- Book ID must be a valid positive integer.
- Sorting order must be ASC or DESC.
- Sorting column must be valid.
- Pagination values must be valid.
- Minimum price must not exceed maximum price.

## Postman Testing

All API endpoints are tested using Postman.

The tests include:

1. Retrieve all 10 books using GET.
2. Retrieve a specific book using its ID.
3. Search books using the title.
4. Sort books by price in ascending order.
5. Sort books by price in descending order.
6. Test pagination using limit and offset.
7. Filter books using minimum and maximum prices.
8. Combine multiple query parameters.
9. Add a new book using POST.
10. Test invalid input validation.
11. Update a book using PUT.
12. Delete a book using DELETE.
13. Test invalid IDs and missing records.

### Negative Testing Queries

**Invalid book ID:**

```text
GET /books/abc
```

Expected: 400 Bad Request.

**Book not found:**

```text
GET /books/9999
```

Expected: 404 Not Found.

**Invalid sorting column:**

```text
GET /books?order_by=wrong
```

Expected: 400 Bad Request.

**Invalid sorting order:**

```text
GET /books?order=INVALID
```

Expected: 400 Bad Request.

**Invalid pagination:**

```text
GET /books?limit=-5
```

Expected: 400 Bad Request.

**Invalid price range:**

```text
GET /books?min_price=500&max_price=200
```

Expected: 400 Bad Request.

## Screenshots

### 1. Render Deployment
<img width="1917" height="985" alt="render deployment" src="https://github.com/user-attachments/assets/3f371556-87c8-455c-a1af-277bb2fb49d6" />

### 2. GET All Books
<img width="1917" height="1078" alt="GET All Books" src="https://github.com/user-attachments/assets/8614159d-d550-4b67-b77b-434fa0d72762" />


### 3. GET Book by ID

<img width="1917" height="1073" alt="GET Book by ID" src="https://github.com/user-attachments/assets/624ea790-981c-4643-a00a-9b9bbccaf8ce" />


### 4. Search Books
<img width="1917" height="1078" alt="Search Books" src="https://github.com/user-attachments/assets/1952f3d9-4de4-48c1-b736-335716e8abe0" />


### 5. Sorting Ascending
<img width="1917" height="1055" alt="Sorting Ascending" src="https://github.com/user-attachments/assets/cea8c7eb-a784-428e-9b20-c2cbfe932b3b" />


### 6. Sorting Descending
<img width="1917" height="1077" alt="Sorting Descending" src="https://github.com/user-attachments/assets/1a27ba2b-d305-43ab-9a3e-b53a59db87d2" />


### 7. Pagination
<img width="1917" height="1077" alt="Pagination" src="https://github.com/user-attachments/assets/444ad942-2e8f-4b7f-b1ba-821d7b139251" />


### 8. Price Filtering
<img width="1917" height="1077" alt="Price Filtering" src="https://github.com/user-attachments/assets/3c407fbe-ade9-4ed6-a932-45e946d1ee40" />


### 9. Combined Query
<img width="1917" height="1078" alt="Combined Query" src="https://github.com/user-attachments/assets/0b9fdaa9-19c2-4c3a-83ac-fb3771ed2886" />


### 10. POST Successful Request
<img width="1916" height="1078" alt="POST Successful Request" src="https://github.com/user-attachments/assets/b468ffbc-04ad-4c76-a5da-0f9d0a03354f" />


### 11. POST Validation Error
<img width="1917" height="1078" alt="POST Validation Error" src="https://github.com/user-attachments/assets/faf521d4-4eba-42c9-a185-6130fc46673f" />


### 12. PUT Update Request
<img width="1917" height="1077" alt="PUT Update Request" src="https://github.com/user-attachments/assets/cbcb8644-e7f0-4cc0-a8d2-074da63e57b7" />


### 13. DELETE Request
<img width="1908" height="1078" alt="DELETE Request" src="https://github.com/user-attachments/assets/c505dccf-1d0b-4fa4-81cc-b2f4e2197de8" />


## Conclusion

This lab helped me understand REST API development using Node.js, Express.js, and SQLite. I implemented CRUD operations and learned how to use query parameters for searching, sorting, pagination, and price filtering.

I also understood input validation, HTTP status codes, database integration, and debugging techniques. Postman helped me test the API endpoints and verify their responses. Finally, I deployed the REST API using Render.

---

**End of Lab 3**
