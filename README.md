# Chatty

## Description
Chatty is a modern chat application that allows users to communicate in real-time. It features messaging, story sharing, and video calling capabilities.

## Features
- Real-time messaging
- Story sharing
- Video calls
- User authentication
- Responsive design

## Installation
To install and set up the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chatty.git
   cd chatty
   ```

2. Install backend dependencies:
   ```bash
   npm install --prefix backend
   ```

3. Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```

## Usage
To run the application, use the following commands:

1. Start the backend server:
   ```bash
   npm run dev --prefix backend
   ```

2. Start the frontend development server:
   ```bash
   npm run dev --prefix frontend
   ```

Visit `http://localhost:3000` in your browser to access the application.

## API Documentation
The backend API provides the following endpoints:
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `GET /api/messages`: Retrieve messages
- `POST /api/messages`: Send a message

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.

## Acknowledgments
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
