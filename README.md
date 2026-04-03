# 🏠 Baseraa – Room & Mess Finder Web Application

Baseraa is a full-stack web application that helps students find rooms and mess facilities easily.  
Property owners can list rooms or mess services, and students can search, filter, and reserve based on their needs.

🔗 **Live Website:** https://baseraa.vercel.app  
📂 **GitHub Repository:** https://github.com/Yashwantsahu9907/Baseraa  

---

# 📌 Features

## 👨‍🎓 Student Features
- 🔍 Search Rooms & Mess Listings
- 📍 Filter by:
  - Room Type
  - Price
  - Facilities
  - Veg / Non-Veg (Mess)
- ❤️ Add Listings to Favorites
- 🏠 View Detailed Property Pages
- ⭐ Add Ratings & Reviews
- 📅 Reserve Rooms
- 📊 View Favorite Listings in Dashboard

## 🧑‍💼 Owner Features
- 🏠 Add New Room or Mess Listing
- ✏️ Update Property Details
- ❌ Delete Listings
- 📊 Manage Availability
- 📥 Receive Reservation Requests

## 🛠️ Admin Features
- 🧑 Manage Users
- 🏠 Manage Listings
- 🗑️ Delete Properties
- 📊 Monitor Platform Activity

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Token)

## Image Storage
- Cloudinary

## Deployment
- Frontend: Vercel
- Backend: Render

---

---


## Project Structure

# 📂 Project Structure

Baseraa/
│
├── backend/                        # Node.js + Express Backend
│   │
│   ├── config/                    # Database configuration
│   │
│   ├── controllers/               # Route controllers
│   │
│   ├── middleware/                # Authentication & custom middleware
│   │
│   ├── models/                    # MongoDB models
│   │
│   ├── routes/                    # API routes
│   │
│   ├── utils/                     # Utility functions
│   │
│   ├── .env                       # Environment variables
│   ├── createAdmin.js             # Admin creation script
│   ├── package.json               # Backend dependencies
│   ├── package-lock.json
│   └── server.js                  # Main backend entry point
│
├── frontend/                      # React + Vite Frontend
│   │
│   ├── public/                    # Static assets
│   │
│   ├── src/                       # React source files
│   │
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                # Vercel deployment config
│   └── vite.config.js
│
├── tmp/                           # Temporary files folder
│
└── README.md                      # Main project README





# ⚙️ Installation Guide

Follow these steps to run the project locally.

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Yashwantsahu9907/Baseraa.git
cd Baseraa
cd frontend
npm install
cd backend
npm install



## Setup Environment variables
   Create .env file inside backend folder

PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173


## Run Backend
cd backend
npm run dev

## Run Frontend
cd frontend
npm run dev


