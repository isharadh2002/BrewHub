# BrewHub Coffee Shop

A modern full-stack MERN application for a coffee shop with core features including:

- Menu browsing and online ordering
- Order tracking and loyalty program
- Staff order management and inventory tracking
- Admin dashboard for analytics and menu management
- Authentication with email/password and OAuth (Google, Facebook)

## Project Structure

```
brewhub/
├── client/                      # React frontend
│   └── src/
├── server/                      # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── README.md                    # This file
```

## Setup Instructions

### Backend

1. Go to the server folder:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with variables like:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. Start the server:
   ```
   npm run dev
   ```

### Frontend

1. Go to the client folder:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Start the frontend:
   ```
   npm start
   ```

---

## Running the Project

- Start backend and frontend servers separately or concurrently.

---

This is a minimal guide to get BrewHub running locally.
