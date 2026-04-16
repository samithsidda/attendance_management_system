# Attendance Management System

A full-stack, role-based Attendance Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js). 

## Features

- **Role-Based Access Control**: Separate dashboards and permissions for Admin, Faculty, and Student roles.
- **Secure Authentication**: JWT-based authentication with protected routes.
- **Attendance Tracking**:
  - Faculty can mark daily attendance for assigned subjects.
  - Students can view their personal attendance history.
- **Reporting & Analytics**:
  - Admin and Faculty can generate daily, monthly, and percentage-based reports. data for active subjects.
* **Deep Analytics Engine**: Real-time aggregated statistics using MongoDB Pipelines.
* **Charting Visualizations**: Built-in Pie, Bar, and Line charts using `react-chartjs-2`.
* **Defaulter Tracking**: Rapid identification of students falling under precise attendance percentage thresholds (e.g., < 75%).

## 🛠️ Technology Stack
* **Frontend:** React.js, Vite, UI Tokens, `react-router-dom`, `axios`, `react-chartjs-2`, `react-hot-toast`
* **Backend:** Node.js, Express.js, `jsonwebtoken`
* **Database:** MongoDB, Mongoose ORM

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (running locally on port `27017`)

### 2. Configure Environment variables
Navigate to the `backend/` directory and create a `.env` file based on `.env.example`:
```bash
cd backend
cp .env.example .env
```
Make sure `MONGO_URI` is pointing to your local MongoDB instance. (Default: `mongodb://localhost:27017/attendance_db`)

### 3. Install Dependencies
Install packages for both the server and the client:
```bash
# In the backend directory
npm install

# In the frontend directory 
cd ../frontend
npm install
```

### 4. Running the Servers
You will need to start both servers concurrently.

**Start the Backend Server:**
```bash
cd backend
npm run dev
```
*Note: The system automatically seeds a master admin on its first run.*

**Start the Frontend Vite Server:**
```bash
cd frontend
npm run dev
```

### 5. Default Credentials
Once the system starts, you can log in using the pre-seeded admin account:
* **Email:** `admin@gmail.com`
* **Password:** `123456`

*(It is highly recommended to change or add new secure admins immediately after logging in).*

---

## 🏗️ Project Structure
* `backend/`: Express.js application, Mongoose Models, JWT Auth Middleware, custom Report Aggregations.
* `frontend/`: React components, layout templates, specific routing endpoints, and context providers.
