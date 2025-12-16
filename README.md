# Smart Attendance System
> **Capstone Project**: NCDMB Digitalization Training Program (AI Track)

The **Smart Attendance System** is a cutting-edge, fraud-resistant attendance management solution designed to streamline the attendance process for educational training programs. Built as part of the **NCDMB Digitalization Training** curriculum, this application leverages Artificial Intelligence and modern web technologies to ensure authenticity, efficiency, and real-time tracking.

## 🚀 Key Features

*   **🤖 AI-Powered Verification**: Integrates `face-api.js` for real-time facial recognition to prevent proxy attendance.
*   **📍 Geofencing & Location Tracking**: Ensures students are physically present at the designated training center during check-in.
*   **📱 QR Code Scanning**: Seamless, contactless check-in experience using dynamic QR codes.
*   **⚡ Real-Time Dashboard**: Live attendance monitoring for administrators and instructors.
*   **📊 Comprehensive Reporting**: Detailed insights into attendance trends and student punctuality.
*   **🔒 Secure Authentication**: Robust user authentication and role-based access control (Admin/Student).
*   **📱 Progressive Web App (PWA)**: Optimized for mobile devices with offline capabilities.

## 🛠️ Technology Stack

This project is built using the **MERN Stack** and modern development tools:

*   **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **AI/ML**: face-api.js (Browser-based Face Recognition)
*   **Tools**: Concurrently, Nodemon

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   MongoDB (running locally on default port `27017`)

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd smart-attendance
    ```

2.  **Install Dependencies**
    Execute the automated install script to set up both client and server:
    ```bash
    npm run install-all
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `server` directory (optional defaults provided):
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/smart-attendance
    JWT_SECRET=your_super_secret_key
    ```

4.  **Setup AI Models**
    Ensure the face recognition models are present in `client/public/models`. If missing:
    *   Download weights from [face-api.js Model Weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).
    *   Place them in `client/public/models`.

### 🚀 Running the Application

Start the development server (runs both client and backend concurrently):

```bash
npm run dev
```

*   **Client**: [http://localhost:5173](http://localhost:5173)
*   **Server**: [http://localhost:5000](http://localhost:5000)

## 🤝 Contribution

Developed by the **NCDMB AI Cohort**. This project demonstrates the practical application of Artificial Intelligence in solving real-world administrative challenges.
