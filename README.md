# Chat App

Chat App is a modern messaging platform designed to provide seamless, secure, and intuitive communication. Built using the MERN stack (MongoDB, Express, React, Node.js), it offers real-time messaging, user authentication, and a responsive design for both web and mobile devices.

## Features

- **Real-time Messaging**: Instant message delivery with typing indicators.
- **User Authentication**: Secure login and registration system.
- **End-to-End Encryption**: Ensures privacy and security of messages.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Theming**: Light and dark mode support with customizable themes.
- **User Profiles**: Manage account information and privacy settings.
- **Friend Management**: Add friends and start conversations easily.
- **Support Pages**: Includes FAQ, Terms of Service, Privacy Policy, and Help Center.

## Technology Stack

### Frontend
- **React**: For building the user interface.
- **Vite**: For fast development and build processes.
- **Tailwind CSS**: For styling and responsive design.
- **DaisyUI**: For pre-styled components.

### Backend
- **Node.js**: For server-side logic.
- **Express**: For building RESTful APIs.
- **MongoDB**: For database management.
- **Socket.IO**: For real-time communication.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chat-app.git
   cd chat-app
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend
   cd ../frontend
   npm run dev
   ```

5. Open the app in your browser:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Folder Structure

### Backend
- **controllers/**: Contains logic for handling API requests.
- **models/**: Defines MongoDB schemas for users, chats, and messages.
- **routes/**: Defines API endpoints for users and chats.
- **middleware/**: Includes authentication middleware.
- **config/**: Database connection setup.

### Frontend
- **src/components/**: Reusable UI components (e.g., Navbar, Footer, ChatList).
- **src/pages/**: Page-level components (e.g., HomePage, ProfilePage, AboutPage).
- **src/contexts/**: Context providers for theme and socket management.
- **src/styles/**: Global and theme-specific CSS files.
- **src/lib/**: Utility functions.

## Scripts

### Backend
- `npm start`: Start the backend server.
- `npm run dev`: Start the backend server in development mode.

### Frontend
- `npm run dev`: Start the frontend development server.
- `npm run build`: Build the frontend for production.
- `npm run preview`: Preview the production build.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

