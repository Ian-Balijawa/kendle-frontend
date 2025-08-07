# Kendle - Social Media Platform

A modern, feature-rich social media platform built with React 19, TypeScript, and Mantine UI.

## 🚀 Features

### Core Features
- **User Authentication** - Secure login/registration with JWT tokens
- **Post Creation** - Rich text posts with media upload support
- **Real-time Feed** - Infinite scroll post feed with engagement features
- **User Profiles** - Complete user profiles with bio, stats, and post history
- **Real-time Chat** - Direct messaging with online status indicators
- **Notifications** - Real-time notifications for likes, comments, follows, etc.
- **Search & Explore** - Advanced search functionality for users and content
- **Responsive Design** - Mobile-first design with desktop optimization

### Social Features
- **Like & Comment System** - Full engagement features
- **Follow/Unfollow** - User connection management
- **Share & Bookmark** - Content sharing and saving
- **Hashtags & Mentions** - Content discovery and user tagging
- **Trending Content** - Discover trending posts and hashtags

### Technical Features
- **TypeScript** - Full type safety throughout the application
- **State Management** - Zustand for efficient state management
- **API Integration** - TanStack Query for data fetching and caching
- **Form Validation** - Zod schema validation with React Hook Form
- **Modern UI** - Mantine v7 with custom theme and components
- **Responsive Layout** - Mobile drawer and desktop sidebar navigation

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **UI Library**: Mantine v7
- **State Management**: Zustand v4
- **Data Fetching**: TanStack Query v5
- **Form Handling**: React Hook Form v7 + Zod
- **Routing**: React Router DOM v6
- **Icons**: Tabler Icons
- **Build Tool**: Vite
- **Styling**: Mantine CSS-in-JS + CSS Modules

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kendle-frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your configuration:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_WS_URL=ws://localhost:3002
   ```

4. **Start the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base Mantine component wrappers
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Header, Navbar, Footer)
│   ├── media/          # Media handling components
│   └── common/         # Common reusable components
├── features/           # Feature-based organization
│   ├── auth/           # Authentication features
│   ├── posts/          # Post management
│   ├── profile/        # User profiles
│   ├── chat/           # Real-time messaging
│   ├── notifications/  # Notification system
│   └── search/         # Search functionality
├── stores/             # Zustand stores
├── services/           # API services
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── lib/                # Library configurations
└── styles/             # Global styles
```

## 🎨 Design System

The application uses a custom design system built on Mantine v7 with:

- **Color Palette**: Custom primary and secondary colors
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Standardized spacing scale
- **Components**: Customized Mantine components with consistent styling
- **Responsive**: Mobile-first approach with breakpoint system

## 🔧 Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Run TypeScript type checking

### Code Quality

- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for code quality

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile**: Bottom tab navigation with drawer menu
- **Tablet**: Sidebar navigation with collapsible menu
- **Desktop**: Full sidebar navigation with header search

## 🔐 Authentication

The authentication system includes:

- JWT token-based authentication
- Persistent login state
- Protected routes
- Automatic token refresh
- Secure logout functionality

## 🌐 API Integration

The application is designed to work with a RESTful API and includes:

- Axios for HTTP requests
- Request/response interceptors
- Error handling
- Loading states
- Optimistic updates

## 🚀 Deployment

### Build for Production

```bash
yarn build
```

### Environment Variables

Make sure to set the following environment variables for production:

- `VITE_API_URL` - Your API endpoint
- `VITE_WS_URL` - WebSocket endpoint for real-time features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@kendle.com or join our Slack channel.

---

Built with ❤️ by the Kendle Team
