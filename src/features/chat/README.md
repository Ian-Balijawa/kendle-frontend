# Chat Feature

A LinkedIn-style floating chat widget that integrates with the existing backend chat system.

## Features

### Desktop Experience
- **Floating Chat Button**: Fixed position in bottom-right corner
- **Chat Heads**: Minimized conversations as circular avatars with unread badges
- **Floating Windows**: Draggable and resizable chat windows
- **Real-time Updates**: WebSocket integration for live message updates

### Mobile Experience
- **Responsive Design**: Adapts to mobile screens with full-screen overlay
- **Touch-friendly**: Optimized for touch interactions
- **Compact UI**: Efficient use of screen space

## Components

### FloatingChatWidget
Main component that renders the entire chat interface. Automatically detects screen size and renders appropriate version.

### ChatHeads
Displays minimized conversations as small circular avatars with:
- Online status indicators
- Unread message badges
- Hover effects with close buttons
- Click to maximize

### ChatWindows
Manages multiple floating chat windows with:
- Drag and drop functionality
- Resize handles
- Minimize/maximize/close controls
- Z-index management

### ChatWindow
Individual floating chat window with:
- Draggable header
- Message display area
- Input field
- Window controls

### ChatMessages
Displays conversation messages with:
- Message bubbles (sent vs received)
- Timestamps
- Read receipts
- Infinite scroll for message history
- Auto-scroll to latest messages

### ChatInput
Message input component with:
- Text input field
- Send button
- Attachment and emoji placeholders
- Enter key support

### ChatWidget
Main chat interface that opens when the chat button is clicked:
- Conversation list
- Active chat view
- Responsive layout

## State Management

Uses Zustand store (`useFloatingChatStore`) for managing:
- Chat window positions and sizes
- Chat heads state
- Active conversations
- Z-index management

## Integration

### Backend Integration
- Uses existing API service (`apiService`)
- WebSocket integration via `useWebSocketIntegration`
- React Query for data fetching and caching

### Authentication
- Automatically hides when user is not authenticated
- Uses `useAuthStore` for user context

## Usage

The chat widget is automatically included in the main AppShell component and will appear for authenticated users.

### Opening a Chat
1. Click the chat button (bottom-right)
2. Select a conversation from the list
3. Or double-click a conversation to open in a floating window

### Managing Windows
- **Minimize**: Click the minus button to create a chat head
- **Maximize**: Click a chat head to restore the window
- **Close**: Click the X button to close the window
- **Drag**: Click and drag the header to move windows
- **Resize**: Drag the bottom-right corner to resize

## Styling

Uses Mantine theme and components for consistent styling:
- Primary color for sent messages
- Gray for received messages
- Responsive breakpoints
- Consistent spacing and typography

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- Focus management
- ARIA labels and roles

## Recent Enhancements

### ✅ Implemented Features
- **Message Reactions**: Quick reaction buttons with emoji support
- **Typing Indicators**: Real-time typing status with animated dots
- **Message Context Menu**: Right-click or hover menu for message actions
- **Enhanced Search**: Search conversations by name, participant, or message content
- **Improved UI**: Better message grouping, online status indicators, conversation status badges
- **Emoji Picker**: Quick emoji selection in message input
- **Auto-resize Input**: Textarea that grows with content
- **Better Message Status**: Enhanced read receipts and delivery status

### 🔄 In Progress
- Message editing and deletion
- File attachments
- Voice messages

### 📋 Future Enhancements
- Video calls
- Message search within conversations
- Conversation archiving
- Message forwarding
- Rich text formatting
- Message scheduling
