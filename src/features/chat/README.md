# Floating Chat Widget Feature

A LinkedIn-style floating chat interface that provides real-time messaging capabilities with a modern, responsive design.

## Features

### 🚀 Core Functionality
- **Floating Chat Widget**: Positioned at bottom-right of screen with unread message count
- **Chat Heads**: Small circular avatars for quick access to active conversations
- **Multiple Chat Windows**: Support for multiple simultaneous conversations
- **Real-time Updates**: WebSocket integration for live message updates
- **Responsive Design**: Optimized for both desktop and mobile devices

### 💬 Chat Features
- **Message History**: Infinite scroll with pagination
- **Message Status**: Sending, delivered, read status indicators
- **File Sharing**: Support for images, videos, audio, and documents
- **Typing Indicators**: Real-time typing status
- **Message Reactions**: Add reactions to messages
- **Reply to Messages**: Reply functionality with context

### 🎨 User Experience
- **Smooth Animations**: CSS transitions and animations for all interactions
- **Drag & Drop**: Draggable chat windows on desktop
- **Minimize/Maximize**: Window state management
- **Keyboard Navigation**: Full accessibility support
- **Connection Status**: Real-time connection indicator

## Architecture

### Components

#### `FloatingChatWidget.tsx`
Main container component that orchestrates the entire chat system.

#### `ChatHeads.tsx`
Displays small circular avatars for conversations with unread messages.

#### `FloatingChatWindow.tsx`
Individual draggable chat windows with full messaging functionality.

#### `FloatingChatList.tsx`
Compact conversation list for the floating widget.

#### `MobileChatDrawer.tsx`
Mobile-optimized drawer interface for smaller screens.

### State Management

#### `chatStore.ts`
Zustand store managing:
- Chat window states (position, size, minimized/maximized)
- Active conversations
- Chat heads visibility
- Mobile vs desktop modes

### Backend Integration

The chat feature integrates with existing backend APIs:
- `useConversations()` - Fetch user conversations
- `useMessages()` - Fetch messages with infinite scroll
- `useSendMessage()` - Send new messages
- `useWebSocketIntegration()` - Real-time updates

## Usage

### Basic Implementation

```tsx
import { FloatingChatWidget } from './features/chat';

function App() {
  return (
    <div>
      {/* Your app content */}
      <FloatingChatWidget />
    </div>
  );
}
```

### Store Integration

```tsx
import { useFloatingChatStore } from './stores/chatStore';

// Open a chat window programmatically
const { openChatWindow } = useFloatingChatStore();
openChatWindow('conversation-id');
```

## Responsive Behavior

### Desktop (> 768px)
- Floating chat button in bottom-right corner
- Draggable, resizable chat windows
- Multiple simultaneous conversations
- Chat heads for minimized conversations

### Mobile (≤ 768px)
- Full-screen drawer interface
- Single conversation view
- Optimized touch interactions
- No drag & drop functionality

## Styling & Theming

### CSS Classes
- `.floating-chat-window` - Individual chat windows
- `.chat-head` - Chat head avatars
- `.conversation-item` - Conversation list items
- `.mobile-chat-drawer` - Mobile drawer container

### Animations
- Smooth window transitions
- Chat head hover effects
- Notification badges
- Connection status indicators

## API Integration

### WebSocket Events
- `message_sent` - New message sent
- `message_received` - New message received
- `message_read` - Message read status
- `user_online`/`user_offline` - User presence
- `typing_start`/`typing_stop` - Typing indicators

### REST API Endpoints
- `GET /conversations` - Fetch conversations
- `GET /conversations/:id/messages` - Fetch messages
- `POST /conversations/:id/messages` - Send message
- `PUT /conversations/:id/messages/:id` - Update message

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Proper focus handling
- **Reduced Motion**: Respects user preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lazy Loading**: Components load on demand
- **Optimistic Updates**: Immediate UI feedback
- **Infinite Scroll**: Efficient message loading
- **Memory Management**: Proper cleanup of subscriptions

## Development

### File Structure
```
src/features/chat/
├── FloatingChatWidget.tsx     # Main widget component
├── ChatHeads.tsx             # Chat heads component
├── FloatingChatWindow.tsx    # Individual chat window
├── FloatingChatList.tsx      # Conversation list
├── MobileChatDrawer.tsx      # Mobile interface
├── chat-animations.css       # Animations and styles
├── index.ts                  # Export file
└── README.md                 # This file
```

### Testing
- Unit tests for individual components
- Integration tests for chat functionality
- E2E tests for complete user flows

## Future Enhancements

- [ ] Voice messages
- [ ] Video calling integration
- [ ] Group chat creation
- [ ] Message search
- [ ] Message encryption
- [ ] Push notifications
- [ ] Offline message queue
