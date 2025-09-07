# BrewHub Coffee Shop

A modern full-stack MERN application for a coffee shop with comprehensive features including menu browsing, online ordering, order tracking, loyalty program, staff order management, inventory tracking, admin dashboard for analytics and menu management, and secure authentication with email/password and OAuth (Google, Auth0).

## 🌟 Features

**Authentication & Security**
- Email/Password Registration with verification
- Google OAuth Login
- Auth0 OIDC Integration
- JWT-based authentication
- Password reset functionality
- Remember Me sessions
- HTTPS/SSL support

**Customer Features**
- Menu browsing and online ordering
- Shopping cart functionality
- Order tracking and history
- User profile management
- Loyalty program

**Staff Features**
- Order management system
- Inventory tracking
- Real-time order updates

**Admin Features**
- Comprehensive dashboard with analytics
- Menu management
- Staff management
- Promotions management
- Store management
- System settings

## 🏗️ Project Structure

```
brewhub/
├── front-end/                    # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── common/           # Shared components
│   │   │   ├── customer/         # Customer-specific components
│   │   │   ├── staff/            # Staff-specific components
│   │   │   └── admin/            # Admin-specific components
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API services
│   │   ├── utils/                # Utility functions
│   │   └── pages/                # Page components
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env
│
├── back-end/                     # Express backend
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Custom middleware
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   ├── server.js                 # Main server file
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── certs/                        # SSL certificates (you'll create these)
│   ├── localhost.key             # Private key
│   ├── localhost.crt             # Certificate
│   ├── localhost.conf            # OpenSSL configuration
│   └── README.md                 # Certificate generation instructions
│
├── docker-compose.yml            # Docker compose configuration
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)
- OpenSSL (for certificate generation)
- Git

### 1. Clone & Setup

```bash
git clone <your-repository-url>
cd brewhub
```

### 2. Generate SSL Certificates

The application uses HTTPS for development. Generate self-signed certificates. Make sure you have OpenSSL installed on your OS to execute the following commands. 

```bash
# Create certs directory if it doesn't exist
mkdir -p certs
cd certs

# Generate private key
openssl genrsa -out localhost.key 2048

# Generate certificate using localhost.conf (Change the paarameters of the given localhost.conf file)
# Or use this command for a simple self-signed certificate:
openssl req -new -x509 -key localhost.key -out localhost.crt -days 365 -config localhost.conf

cd ..
```

**Note**: After generating localhost.crt add it to the trusted root certificate store of you OS to make sure web browsers accept the generated certificate.

### 3. Backend Setup

```bash
cd back-end

# Install dependencies
npm install
```

**Backend Environment Variables (`back-end/.env`):**

Create a environment variables file in the backend directory and add the following variables. 

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=https://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/brewhub
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brewhub

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d
SESSION_SECRET=your_session_secret_key_here

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Auth0 Configuration (replaces Facebook)
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_DOMAIN=your_auth0_domain

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Frontend Setup

```bash
cd ../front-end

# Install dependencies
npm install
```

**Frontend Environment Variables (`front-end/.env`):**

Create a environment variables file in the frontend directory and add the following variables. 

```env
# API Configuration
VITE_API_URL=https://localhost:3001/api

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id

VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id

# App Configuration
VITE_APP_NAME=BrewHub
VITE_APP_URL=https://localhost:5173
```

### 5. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod --dbpath /path/to/your/data/directory
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in backend `.env`

### 6. OAuth Setup

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `https://localhost:5173`
6. Add authorized redirect URIs: `https://localhost:3001/api/auth/google/callback`

**Auth0 Setup:**
1. Create account at [Auth0](https://auth0.com/)
2. Create a new application (Regular Web Application)
3. Configure callback URLs: `https://localhost:3001/api/auth/auth0/callback`
4. Configure logout URLs: `https://localhost:5173`
5. Copy Domain, Client ID, and Client Secret

## 🏃‍♂️ Running the Application

### Development Mode

**Option 1: Run separately**
```bash
# Terminal 1 - Backend
cd back-end
npm run dev

# Terminal 2 - Frontend  
cd front-end
npm run dev
```

**Option 2: Using Docker Compose**
```bash
# Create .env file in root directory with all variables
# Run with Docker
docker-compose up --build
```

### Production Mode

```bash
# Build and run with Docker
docker-compose up -d --build

# Or deploy to your preferred hosting service
```

## 🌐 Application URLs

- **Frontend**: https://localhost:5173
- **Backend API**: https://localhost:3001

## 🗄️ Database Schema

The application uses MongoDB with the following main collections:

- **users** - User accounts and profiles
- **menuitems** - Coffee shop menu items
- **orders** - Customer orders

## 📦 Key Dependencies

**Backend:**
- Express.js - Web framework
- Mongoose - MongoDB ODM
- Passport.js - Authentication middleware
- JWT - Token-based authentication
- Bcrypt - Password hashing
- Nodemailer - Email sending
- Stripe - Payment processing
- Cloudinary - Image upload and management

**Frontend:**
- React 19 - UI framework
- Vite - Build tool and dev server
- Tailwind CSS - Utility-first CSS framework
- React Router - Client-side routing
- Axios - HTTP client
- React Hook Form - Form management
- React Hot Toast - Notifications
- Lucide React - Icons

## 🐳 Docker Support

The project includes full Docker support with:

- Multi-stage builds for optimized production images
- Development and production configurations
- Docker Compose for easy orchestration
- Environment variable support
- Volume mounting for development

## 🔧 Available Scripts

**Backend:**
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔐 Security Features

- HTTPS encryption for all communication
- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Security headers (Helmet.js)
- Environment variable protection

## 🚨 Troubleshooting

**Certificate Issues:**
- Make sure certificates are generated correctly in `/certs` folder
- Trust the self-signed certificate in your browser
- Check certificate paths in vite.config.js and server.js

**CORS Issues:**
- Verify CLIENT_URL matches frontend URL exactly
- Check CORS configuration in backend server.js

**Database Connection:**
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check network access in MongoDB Atlas

**OAuth Issues:**
- Verify callback URLs match exactly in OAuth provider settings
- Check client IDs and secrets are correct
- Ensure proper scopes are requested

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console logs for specific error messages
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are installed and running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Author**: K. Ishara Dhanushan  
**Version**: 1.0.0  
**Last Updated**: September 2025