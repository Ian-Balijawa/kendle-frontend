Frontend Process Requirements Document
Project Overview
You're building a social media application with real-time features, content sharing, and user interactions. The frontend uses TypeScript, React, Vite.
Technical Stack

Framework: React 18+ with TypeScript
Build Tool: Vite
State Management: TBD (React Query + Zustand recommended)
Real-time: WebSocket client
Routing: React Router v6

Core Features & Requirements
1. Authentication Flow
Initial Landing

Public homepage showing trending content
Login/Register buttons in header
Guest users can view public posts and profiles

Phone OTP Authentication

Phone number input with country code selector
OTP verification screen (6-digit code)
60-second resend timer
Error handling for invalid/expired codes

Profile Completion

Multi-step form after OTP verification
Required: Name, username
Optional: Email, WhatsApp number, bio, profile picture
Social links (Twitter, TikTok, Instagram)
Skip option with reminder to complete later

Session Management

JWT token storage
Auto-refresh token mechanism
Session timeout handling
Remember device option

2. Posts System
Post Types

Text posts with character limit
Poll posts with multiple choice options
Event posts with date/time/location
View-once posts (disappear after viewing)

Post Creation Interface

Rich text editor for text posts
Media upload (images: max 10, videos: max 3)
Image compression before upload
Video preview with thumbnail selection
Location tagging (current or map selection)
User mentions with autocomplete
Hashtag support
Privacy selector (public/followers/private)
Draft saving functionality

Post Display

Card-based layout
User avatar and name
Post timestamp (relative time)
Media carousel for multiple files
Like/dislike counters
Upvote/downvote counters
Comment count
Share button
Bookmark/save option
Three-dot menu (report, hide, delete if owner)

Optimistic Updates

Instant UI feedback for likes/dislikes
Instant feedback for upvotes/downvotes
Rollback on API failure
Loading states for post creation

3. Comments System
Comment Thread Structure

Nested replies (max 3 levels deep)
Parent-child relationship visualization
Collapse/expand threads
Sort options (newest, oldest, most liked)

Comment Interactions

Like/dislike buttons
Reply button with auto-mention
Edit comment (owner only, 5-minute window)
Delete comment (owner only)
Report comment

Comment Composition

Inline reply input
Mention autocomplete
Character limit indicator
Preview before posting
Cancel/discard option

Notifications

Real-time notification when mentioned
Notification when someone replies
Notification badge on comment icon

4. Real-time Chat
Chat List View

Search conversations
Filter (all, unread, groups)
Last message preview
Unread count badge
Timestamp of last message
Online status indicator
Pin important chats

Chat Window

Message bubbles (sent/received styling)
Message timestamps
Read receipts (single/double tick)
Typing indicator
Scroll to bottom button
Load more messages on scroll up

Message Types

Text messages
Image attachments (preview thumbnails)
Video attachments (preview with play button)
File attachments (name, size, download)
Voice messages (waveform player)
View-once media (blur until tapped)
Reply to message (quoted message preview)
Forwarded messages (indicator)

Message Actions

Long press/right-click menu
Copy text
Reply
Forward
Delete for me/everyone
Star message
Message info (read by, delivered to)

Chat Features

Voice recording interface
Camera capture
File picker
GIF selector
Link preview generation
Emoji reactions to messages

5. User Profiles
Profile View (Own)

Edit profile button
Profile picture with upload option
Cover photo
Bio section
Post count, followers, following counts
Tabs: Posts, Media, Saved, Liked
Social media links (clickable icons)
QR code for profile sharing

Profile View (Others)

Follow/unfollow button
Message button
Three-dot menu (block, report, share)
Follower/following counts (clickable to view lists)
Posts grid view
Media gallery

Profile Editing

Profile picture crop tool
Cover photo upload
Bio editor (character limit)
Name and username fields
Contact information
Social links manager
Privacy settings quick access

6. Stories/Reels/Statuses
Status Creation

Camera interface (photo/video)
Text-only status with backgrounds
Drawing tools
Stickers and GIFs
Music attachment
Privacy selector (all followers/close friends)
Expiry timer (24 hours default)

Status Display

SwiperJS horizontal carousel
Status rings on user avatars (viewed/unviewed)
Auto-advance to next story
Tap left/right to navigate
Hold to pause
Swipe up for replies
View count and viewer list (own stories)
Quick reaction buttons

Status Interactions

Reply with text
React with emoji
Forward to chat
Mute user's stories
Report story

7. Media Streaming
Image Streaming

Progressive loading
Lazy loading with intersection observer
Thumbnail to full-size transition
Pinch to zoom
Swipe to dismiss
Download option

Video Streaming

Custom video player controls
Play/pause button
Progress bar with seek
Volume control
Playback speed options
Full-screen mode
Picture-in-picture support
Adaptive quality based on connection

Chunked Upload

File chunking for large media
Progress indicator with percentage
Pause/resume upload
Cancel upload
Retry failed chunks

8. Notifications System
Notification Types

New follower
Post like/dislike
Comment on post
Reply to comment
Mention in post/comment
New message
Post share
Story view/reply

Notification Interface

Notification bell icon with badge
Dropdown notification list
Mark as read/unread
Mark all as read
Group similar notifications
Clear all option
Navigate to related content on click

Notification Preferences

Toggle by notification type
Push notification settings
Email notification settings
SMS notification settings
Quiet hours configuration

9. Privacy & Settings
Privacy Controls

Profile visibility (public/followers/private)
Post default visibility
Story visibility settings
Who can message you
Who can comment on posts
Who can tag you
Who can see your followers
Block list management

Account Settings

Change password
Email verification
Phone number verification
Two-factor authentication setup
Connected devices list
Active sessions management
Account deletion request
Data download request

App Preferences

Theme selection (light/dark/auto)
Language selection
Font size adjustment
Auto-play videos toggle
Data saver mode
Clear cache option

10. Explore & Discovery
Explore Feed

Trending posts grid
Trending hashtags list
Suggested users carousel
Category filters (art, music, sports, etc.)
Refresh to load new content

Search Interface

Unified search bar
Tabs: People, Posts, Hashtags
Recent searches
Clear search history
Advanced filters (date, location, media type)

Recommendation Algorithm Display

"You might like" sections
"Similar to posts you liked"
"Based on who you follow"
Dismiss recommendations
"Not interested" feedback

11. Content Moderation Interface
User Reporting

Report post/comment/user modal
Reason selection (spam, harassment, etc.)
Additional details textarea
Submit and block option

Moderator Dashboard (if user has moderator role)

Flagged content queue
Review interface with context
Approve/remove actions
Ban user option
Audit log of actions

AI Moderation Indicators

Warning message on flagged content
"Content under review" status
Appeal process for false positives

UI/UX Requirements
Responsive Design

Mobile-first approach
Breakpoints: 375px, 768px, 1024px, 1440px
Touch-friendly tap targets (min 44x44px)
Bottom navigation on mobile
Side navigation on desktop

Loading States

Skeleton loaders for feeds
Spinner for actions
Progress bars for uploads
Shimmer effect for images

Error Handling

Toast notifications for errors
Retry buttons
Offline mode indicators
Error boundaries for crash recovery

Accessibility

ARIA labels on interactive elements
Keyboard navigation support
Focus indicators
Screen reader friendly
Alt text for images
Captions for videos

Performance Targets

Initial load: < 3 seconds
Time to interactive: < 5 seconds
Smooth 60fps scrolling
Lazy load below-the-fold content
Code splitting by route
Image optimization (WebP with fallback)

State Management Strategy
Global State (Zustand)

User authentication data
User preferences
Theme settings
Notification count

Server State (React Query)

Posts feed
User profiles
Comments
Chat messages
Search results
Cache invalidation strategies

Local State (useState/useReducer)

Form inputs
Modal visibility
Dropdown menus
Temporary UI states

Real-time Features via WebSocket
Connection Management

Auto-connect on login
Reconnection logic with exponential backoff
Connection status indicator
Handle connection drops gracefully

Real-time Events

New message received
User online/offline status
Typing indicators
New notification
Post likes (live counter updates)
Comment additions

File Structure
src/
├── components/
│   ├── common/ (buttons, inputs, modals)
│   ├── posts/ (post card, post creator)
│   ├── comments/ (comment thread, comment item)
│   ├── chat/ (chat list, chat window)
│   ├── profile/ (profile header, profile tabs)
│   ├── stories/ (story viewer, story creator)
│   └── modals/
├── pages/
│   ├── auth/
│   ├── home/
│   ├── profile/
│   ├── explore/
│   ├── chat/
│   └── settings/
├── hooks/ (custom hooks)
├── utils/ (helpers, formatters)
├── services/ (API calls, websocket)
├── stores/ (Zustand stores)
├── types/ (TypeScript interfaces)
└── constants/
Third-party Integrations
Required Libraries

React Query (data fetching)
Zustand (state management)
React Router (routing)
Socket.io-client (WebSocket)
SwiperJS (carousels)
React Hook Form (forms)
Zod (validation)
date-fns (date formatting)
React Intersection Observer (lazy loading)

Map Integration

Google Maps API for location tagging
Geocoding for address display

Media Processing

Browser-image-compression for images
Video thumbnail generation

Testing Requirements
Unit Tests

Component rendering
Hook logic
Utility functions
Form validation

Integration Tests

User flows (login, post creation)
API integration
WebSocket events

E2E Tests

Critical user journeys
Cross-browser testing
Mobile device testing

Security Considerations
Frontend Security

XSS prevention (sanitize user input)
CSRF token handling
Secure token storage
Content Security Policy headers
Rate limiting on actions

Input Validation

Client-side validation before API calls
File type and size validation
Image dimension validation
Character limits enforcement

Deployment & Build
Build Process

Environment-specific configs
Bundle size optimization
Asset compression
Source map generation (dev only)

Environment Variables

API base URL
WebSocket URL
Google Maps API key
File upload size limits
