# Fenmo - Expense Tracker

A lightweight, robust expense tracking application built with Next.js and TypeScript.

## 🚀 Live Demo
[INSERT YOUR VERCEL URL HERE]

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS
- **Backend:** Next.js API Routes (Route Handlers)
- **Language:** TypeScript

## 🧠 Design Decisions & Requirements
### Persistence Mechanism
For this assignment, I utilized an **In-Memory store** (Global variables) for the backend. 
- **Reasoning:** This ensures the application is "zero-configuration" and runs immediately for the reviewer without needing a database connection string or local SQLite setup. 
- **Focus**: This allowed me to implement a robust requestId system to prevent duplicate entries and enable preventing clicking of button when user clicks it more than 1 time  continuously until backend response is received, which provides more real-world value than standard database configuration.

- **Note:** In a production environment, I would swap this for a relational database like **PostgreSQL** or non relational like **Dynamo db** to ensure data persistence across server restarts.

### Idempotency & Reliability (Assignment 1 & 2)
The application is designed to handle network instability and duplicate submissions:
- **Client-Side:** Implemented a `loading` state lock and button disabling to prevent multiple clicks.
- **Server-Side:** Each request includes a unique `requestId`. The backend tracks processed IDs in a `Set` to ensure that retried requests (due to page reloads or network timeouts) do not result in duplicate expense entries.

### Validation
- **Frontend:** Prevents submission of zero or negative amounts using HTML5 attributes and React state checks.
- **Backend:** Validates incoming data objects to ensure data integrity.

## 🏃 How to Run Locally
1. Clone the repository: `git clone https://github.com/ianuj4231/fenmo.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. View the app at `http://localhost:3000`