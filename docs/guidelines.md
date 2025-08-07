KENDLE FRONTEND DEVELOPMENT GUIDELINES
AI-Powered Production-Grade Social Media Platform
TECHNICAL FOUNDATION
Core Stack

Framework: Reactjs 19 with TypeScript
UI Library: Mantine v7 + Tabler Icons
State Management: Zustand v4 with persistence
API Layer: TanStack Query v5 + Axios
Forms: React Hook Form v7 + Zod validation
Styling: Mantine CSS-in-JS + CSS Modules
Testing: Vitest + Testing Library + Playwright
Build: Next.js optimized bundling

Project Architecture
src/
├── components/                 # Reusable UI components
│   ├── ui/                    # Base Mantine component wrappers
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── forms/                 # Form-specific components
│   │   ├── AuthForm.tsx
│   │   ├── PostForm.tsx
│   │   └── ProfileForm.tsx
│   ├── layout/                # Layout components
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── media/                 # Media handling components
│   │   ├── ImageUploader.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── MediaGallery.tsx
│   │   └── FileUploader.tsx
│   └── common/                # Common reusable components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── InfiniteScroll.tsx
│       └── VirtualList.tsx
├── features/                  # Feature-based organization
│   ├── auth/                  # Authentication features
│   ├── posts/                 # Post management
│   ├── profile/               # User profiles
│   ├── chat/                  # Real-time messaging
│   ├── notifications/         # Notification system
│   ├── search/                # Search functionality
│   ├── admin/                 # Admin dashboard
│   ├── payments/              # Payment processing
│   ├── live/                  # Live streaming
│   └── stories/               # Status/Stories feature
├── stores/                    # Zustand stores
│   ├── authStore.ts
│   ├── postStore.ts
│   ├── chatStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── services/                  # API services
│   ├── api.ts
│   ├── websocket.ts
│   ├── upload.ts
│   └── auth.ts
├── hooks/                     # Custom hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useInfiniteScroll.ts
│   └── useLocalStorage.ts
├── utils/                     # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/                     # TypeScript definitions
│   ├── auth.ts
│   ├── post.ts
│   ├── user.ts
│   └── api.ts
├── assets/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
└── styles/                    # Global styles
    ├── globals.css
    ├── variables.css
    └── themes.ts

PHASE 1: CORE PLATFORM (WEEKS 1-2)
Essential Components to Build
1. Layout System
typescript// components/layout/AppShell.tsx
- Responsive navigation shell
- Mobile drawer navigation
- Header with search and notifications
- Sidebar with main navigation (Like left side bar navigation with icons on mobile apps)
- Footer component (Like bottom tab bar navigation with icons on mobile apps)
2. Authentication Flow
typescript// features/auth/
├── LoginForm.tsx       # Login with email/username (Like phone number and password login)
├── RegisterForm.tsx    # Multi-step registration (Like phone number and password registration)
├── ForgotPassword.tsx  # Password reset (Like phone number and password reset)
└── AuthGuard.tsx      # Route protection (Like route protection)
3. Post System
typescript// features/posts/
├── PostCreator.tsx     # Rich text editor + media (Like text editor with image upload and video upload)
├── PostCard.tsx        # Individual post display (Like post card with image and video)
├── PostFeed.tsx        # Infinite scroll feed (Like post feed with infinite scroll)
├── PostActions.tsx     # Like, share, comment buttons (Like like, share, comment buttons)
└── MediaUploader.tsx   # Image/video upload (Like image and video upload)
4. User Interface
typescript// features/profile/
├── UserProfile.tsx     # Profile display
├── ProfileEditor.tsx   # Edit profile form
├── UserCard.tsx        # Compact user display
└── FollowButton.tsx    # Follow/unfollow action
State Management Setup
Authentication Store
typescript// stores/authStore.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  updateProfile: (data: ProfileData) => void
}
Post Store
typescript// stores/postStore.ts
interface PostStore {
  posts: Post[]
  selectedPost: Post | null
  addPost: (post: CreatePostData) => void
  updatePost: (id: string, data: UpdatePostData) => void
  deletePost: (id: string) => void
  likePost: (id: string) => void
}
UI Store
typescript// stores/uiStore.ts
interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Notification) => void
}
API Integration Patterns
React Query Setup
typescript// lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})
API Service Layer
typescript// services/api.ts
class ApiService {
  // Posts
  getPosts: (page: number) => Promise<PostsResponse>
  createPost: (data: CreatePostData) => Promise<Post>

  // Users
  getUser: (id: string) => Promise<User>
  updateUser: (id: string, data: UpdateUserData) => Promise<User>

  // Auth
  login: (credentials: LoginData) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
}
Form Handling Standards
Base Form Hook
typescript// hooks/useFormValidation.ts
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })
}
Validation Schemas
typescript// lib/schemas.ts
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
  media: z.array(z.instanceof(File)).optional(),
})
PHASE 2: ADVANCED FEATURES (WEEKS 3-4)
Real-time Features
Chat System
typescript// features/chat/
├── ChatWindow.tsx      # Main chat interface
├── MessageList.tsx     # Message display
├── MessageInput.tsx    # Message composer
├── ChatSidebar.tsx     # Active conversations
└── useWebSocket.tsx    # WebSocket hook
Live Features
typescript// features/live/
├── StatusCreator.tsx   # Create temporary status
├── StatusViewer.tsx    # View user status
├── LiveStream.tsx      # Stream component
└── ReelsPlayer.tsx     # Video reels player
Content Management
Media Handling
typescript// components/media/
├── ImageUploader.tsx   # Drag & drop image upload
├── VideoUploader.tsx   # Video upload with preview
├── MediaGallery.tsx    # Image/video gallery
└── MediaOptimizer.tsx  # Client-side compression
Rich Content Editor
typescript// components/editor/
├── RichTextEditor.tsx  # WYSIWYG editor
├── EmojiPicker.tsx     # Emoji selection
├── MentionInput.tsx    # @user mentions
└── HashtagInput.tsx    # #hashtag support
Advanced UI Components
Infinite Scroll Feed
typescript// hooks/useInfiniteScroll.ts
export function useInfiniteScroll<T>(
  queryKey: string[],
  queryFn: InfiniteQueryFunction<T>,
  options?: UseInfiniteQueryOptions<T>
) {
  return useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    ...options,
  })
}
Virtual Scrolling
typescript// components/VirtualList.tsx
// For performance with large lists
import { FixedSizeList as List } from 'react-window'
PHASE 3: PREMIUM & ADMIN (WEEKS 5-6)
Admin Dashboard Components
Analytics Dashboard
typescript// features/admin/
├── DashboardOverview.tsx  # Key metrics
├── UserManagement.tsx     # User admin tools
├── ContentModeration.tsx  # Content review
├── AnalyticsCharts.tsx    # Data visualization
└── SystemSettings.tsx     # Platform configuration
Data Tables
typescript// components/tables/
├── DataTable.tsx       # Reusable data table
├── UserTable.tsx       # User management table
├── PostTable.tsx       # Content moderation table
└── TransactionTable.tsx # Payment history
Payment Integration
Mobile Money Components
typescript// features/payments/
├── PaymentForm.tsx     # Payment method selection
├── MobileMoneyForm.tsx # MTN/Airtel integration
├── PremiumUpgrade.tsx  # Subscription upgrade
└── TransactionHistory.tsx # Payment records
DEVELOPMENT WORKFLOW
AI-Assisted Development Process
1. Component Generation
Use AI to generate complete components with:

TypeScript interfaces
Mantine UI integration
Responsive design
Accessibility features
Error handling

2. Store Creation
Generate Zustand stores with:

Type safety
Persistence configuration
Optimistic updates
Error states

3. API Integration
Create React Query hooks with:

Caching strategies
Error handling
Loading states
Optimistic updates

4. Form Generation
Build forms with:

Zod validation schemas
React Hook Form integration
Error display
Submission handling

Code Quality Standards
ESLint Configuration
json{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
Prettier Configuration
json{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
Testing Strategy
Component Testing
typescript// __tests__/PostCard.test.tsx
describe('PostCard', () => {
  it('displays post content correctly', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.content)).toBeInTheDocument()
  })
})
Store Testing
typescript// __tests__/stores/authStore.test.ts
describe('AuthStore', () => {
  it('updates user state on login', async () => {
    const store = useAuthStore.getState()
    await store.login(mockCredentials)
    expect(store.user).toEqual(mockUser)
  })
})
Performance Optimization
Code Splitting
typescript// Dynamic imports for route components
const Profile = dynamic(() => import('../features/profile/Profile'))
const Chat = dynamic(() => import('../features/chat/Chat'))
Image Optimization
typescript// Next.js Image component usage
import Image from 'next/image'

<Image
  src={post.image}
  alt={post.title}
  width={500}
  height={300}
  priority={isAboveFold}
/>
Bundle Analysis
bashnpm run build
npm run analyze # Bundle analyzer
DEPLOYMENT & CI/CD
Build Configuration
typescript// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-api-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}
GitHub Actions Workflow
yaml# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
Environment Configuration
bash# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002
JWT_SECRET=your-secret-key
MONITORING & ANALYTICS
Error Tracking

Sentry integration for error monitoring
Performance monitoring with Web Vitals
User analytics with privacy-first tools

Performance Monitoring
typescript// lib/analytics.ts
export function trackEvent(name: string, properties: object) {
  // Analytics implementation
}

export function trackPageView(url: string) {
  // Page view tracking
}
