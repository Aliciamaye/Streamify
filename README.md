# Streamify

A modern music streaming web application built with React and Node.js. Stream music from YouTube with a beautiful, responsive interface.

## Features

- **Music Streaming** - Search and play music from YouTube
- **User Authentication** - Secure login and registration system
- **Modern Interface** - Clean, responsive design with multiple themes
- **Queue Management** - Add tracks to queue and manage playback
- **Social Features** - Connect with Spotify, Apple Music, and Last.fm
- **Real-time Updates** - Live playback controls and progress tracking

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Aliciamaye/Streamify.git
cd Streamify
```

2. Install backend dependencies:
```bash
cd src/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend  
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd src/backend
npm run dev
```
The API server will run on http://localhost:3001

2. Start the frontend development server:
```bash
cd src/frontend
npm run dev
```
The web application will be available at http://localhost:5173

## Project Structure

```
streamify/
├── src/
│   ├── backend/          # Node.js API server
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Authentication & validation
│   └── frontend/         # React application
│       ├── components/   # UI components
│       ├── contexts/     # React context providers
│       ├── utils/        # Helper functions
│       └── public/       # Static assets
└── docs/                 # Documentation
```

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **React 18** - User interface library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Music
- `GET /api/music/search` - Search for tracks
- `GET /api/music/trending` - Get popular tracks
- `GET /api/music/:id/stream` - Get playback URL

### Social
- `PUT /api/social/profile` - Update user profile
- `GET /api/spotify/status` - Check Spotify connection
- `GET /api/lastfm/status` - Check Last.fm connection

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# External API Keys (optional)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
LASTFM_API_KEY=your-lastfm-api-key
LASTFM_API_SECRET=your-lastfm-api-secret
```

## Development

### Code Quality
- ESLint and Prettier for code formatting
- TypeScript for type safety
- Modular component architecture

### State Management
- React Context for global state
- Custom hooks for reusable logic
- Local storage for persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add new feature'`)
5. Push to the branch (`git push origin feature/new-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.
