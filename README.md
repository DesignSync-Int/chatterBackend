# Chatter Backend

A robust Node.js backend server for the Chatter real-time messaging application. Built with Express.js, Socket.IO, and MongoDB for scalable real-time communication.

## 🚀 Features

- **Real-time Communication**: Socket.IO integration for instant messaging
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Email Services**: Nodemailer integration for email verification and password reset
- **File Upload**: Cloudinary integration for profile pictures and media
- **Friend System**: Complete friend request management system
- **Message System**: Real-time messaging with profanity filtering
- **CAPTCHA Security**: Custom SVG CAPTCHA generation and validation
- **Database**: MongoDB with Mongoose ODM
- **Security**: CORS, cookie parsing, and input validation
- **Content Moderation**: Built-in profanity filtering with bad-words and leo-profanity

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js 4.21.1** - Web framework
- **Socket.IO 4.8.1** - Real-time communication
- **MongoDB** - Database
- **Mongoose 8.16.3** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image and file storage
- **Canvas** - CAPTCHA generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
src/
├── controllers/         # Route controllers
│   ├── auth.controller.js      # Authentication logic
│   ├── friendRequest.controller.js  # Friend request handling
│   └── message.controller.js   # Message handling
├── middleware/          # Custom middleware
│   ├── auth.middleware.js      # JWT authentication
│   └── captcha.middleware.js   # CAPTCHA validation
├── models/             # Database models
│   ├── user.model.js          # User schema
│   ├── friendRequest.model.js # Friend request schema
│   └── message.model.js       # Message schema
├── routes/             # API routes
│   ├── auth.route.js          # Authentication routes
│   ├── friendRequest.route.js # Friend request routes
│   └── message.route.js       # Message routes
├── lib/                # Utility libraries
│   ├── db.js                  # Database connection
│   ├── socket.js              # Socket.IO configuration
│   ├── cloudinary.js          # Cloudinary setup
│   └── utils.js               # Utility functions
├── utils/              # Helper utilities
│   └── messageCensorship.js   # Content moderation
├── validation/         # Input validation
├── config.js           # Configuration settings
└── index.js            # Application entry point
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account (for file uploads)
- Email service (Gmail/SMTP)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kumasachin/chatter-backend.git
cd chatter-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatter

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CAPTCHA (optional - uses defaults if not set)
CAPTCHA_SECRET=your-captcha-secret
```

5. Start the development server:
```bash
npm run dev
```

The server will be available at `http://localhost:4000`

## 📜 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Install production dependencies
- `npm run serve` - Start production server with NODE_ENV=production

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/captcha` - Generate CAPTCHA
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### Friend Requests
- `GET /api/friends/requests` - Get friend requests
- `POST /api/friends/send` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `GET /api/friends` - Get friends list
- `GET /api/friends/search` - Search users

### Messages
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages/send/:userId` - Send message to user

## 🔌 Socket.IO Events

### Client to Server
- `join` - Join user to their room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server to Client
- `message` - Receive new message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline
- `friend_request` - New friend request received

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,        // Username
  email: String,       // Email address
  password: String,    // Hashed password
  fullName: String,    // Display name
  profilePic: String,  // Cloudinary URL
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  friends: [ObjectId], // Array of friend user IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Friend Request Model
```javascript
{
  sender: ObjectId,    // User who sent request
  receiver: ObjectId,  // User who received request
  status: String,      // 'pending', 'accepted', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  sender: ObjectId,    // Message sender
  receiver: ObjectId,  // Message receiver
  content: String,     // Message content
  image: String,       // Optional image URL
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcryptjs
- Secure cookie handling
- Authentication middleware protection

### Input Validation
- Request body validation
- Email format validation
- Password strength requirements
- CAPTCHA verification

### Content Moderation
- Automatic profanity filtering
- Message content sanitization
- Image upload restrictions

### CORS Configuration
- Configured for frontend domain
- Credentials support for cookies
- Environment-based URL configuration

## 🛡️ CAPTCHA System

The backend includes a custom CAPTCHA system:

- **Generation**: SVG-based CAPTCHA images with random text
- **Storage**: In-memory storage with expiration (5 minutes)
- **Validation**: Middleware validation on sensitive routes
- **Security**: Session-based validation prevents reuse

## 📧 Email Services

Integrated email functionality:

- **Email Verification**: Automatic verification emails on signup
- **Password Reset**: Secure password reset with time-limited tokens
- **Nodemailer Integration**: Support for Gmail and custom SMTP

## ☁️ File Upload

Cloudinary integration for file management:

- **Profile Pictures**: Automatic image optimization
- **Message Attachments**: Support for image sharing
- **Storage Management**: Automatic cleanup and organization

## 🚀 Deployment

### Environment Setup

1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure Cloudinary account
3. Set up email service (Gmail App Password recommended)
4. Update environment variables for production

### Deploy to Railway/Heroku

1. Create new project
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Deploy to VPS

1. Install Node.js and MongoDB
2. Clone repository
3. Install dependencies
4. Set up PM2 for process management
5. Configure nginx as reverse proxy

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatter
FRONTEND_URL=https://your-frontend-domain.com
PORT=4000
```

## 📊 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: MongoDB connection optimization
- **Memory Management**: Efficient CAPTCHA storage cleanup
- **Socket.IO Scaling**: Ready for horizontal scaling with Redis adapter

## 🧪 Testing

The backend is designed to work with the frontend's Cypress test suite. Key testing endpoints:

- Authentication flow testing
- CAPTCHA generation and validation
- Friend request system
- Real-time messaging

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with Mongoose. Configure your connection string in the environment variables.

### Socket.IO Configuration
CORS is configured to allow the frontend domain. Update in `src/lib/socket.js` for production.

### Email Configuration
Supports Gmail and custom SMTP servers. Use Gmail App Passwords for better security.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Sachin Kumar**
- GitHub: [@kumasachin](https://github.com/kumasachin)

## 🙏 Acknowledgments

- Express.js team for the robust web framework
- Socket.IO team for real-time capabilities
- MongoDB team for the excellent database
- All open-source contributors

---

© 2025 DesignSync. All rights reserved.
