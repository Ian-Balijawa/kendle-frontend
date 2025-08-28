# Chat Feature - Enhanced Real-time Messaging

## Overview

The chat feature has been completely redesigned and enhanced to provide a modern, real-time messaging experience that integrates seamlessly with the NestJS WebSocket backend. The system now supports real-time messaging, typing indicators, message reactions, and improved UI/UX.

## Features

### 🚀 Core Chat Functionality
- **Real-time messaging** with WebSocket integration
- **Message status tracking** (sending, delivered, read, failed)
- **Typing indicators** for real-time user feedback
- **Message reactions** with emoji support
- **Reply to messages** functionality
- **Message editing and deletion**
- **Conversation management** (pin, mute, archive)

### 💬 Conversation Management
- **Smart conversation filtering** (All, Unread, Pinned)
- **Search conversations** by name, content, or participant
- **Conversation actions** (pin, mute, archive, delete)
- **Online status indicators** for participants
- **Unread message counts** with visual badges
- **Last seen timestamps** for offline users

### 🎨 Enhanced UI/UX
- **Modern, responsive design** with Mantine UI components
- **Message grouping** for better readability
- **Smooth animations** and transitions
- **Tooltips** for better user guidance
- **Mobile-responsive** layout
- **Dark/light theme** support
- **Accessibility features** (ARIA labels, keyboard navigation)

### 🔌 WebSocket Integration
- **Real-time message delivery** via NestJS WebSocket
- **Automatic reconnection** with exponential backoff
- **Connection status indicators** (connected, connecting, disconnected)
- **Event-driven architecture** for real-time updates
- **Typing indicators** synchronization
- **Online status** broadcasting

## Architecture

### Components Structure
```
src/features/chat/
├── ChatPage.tsx              # Main chat page with conversation list
├── ChatWindow.tsx            # Individual chat conversation window
├── ConversationCard.tsx      # Conversation list item
├── MessageCard.tsx           # Individual message display
├── FloatingChatWidget.tsx    # Floating chat widget
├── FloatingChatWindow.tsx    # Floating chat window
├── ChatHeads.tsx             # Chat head avatars
├── FloatingChatList.tsx      # Floating conversation list
├── MobileChatDrawer.tsx      # Mobile chat drawer
└── chat-animations.css       # CSS animations
```

### State Management
- **Zustand stores** for chat state management
- **React Query** for server state and caching
- **WebSocket service** for real-time communication
- **Optimistic updates** for better UX

### Data Flow
1. **User interaction** triggers API calls
2. **Optimistic updates** immediately update UI
3. **WebSocket events** provide real-time updates
4. **Cache invalidation** ensures data consistency
5. **Error handling** with rollback capabilities

## API Integration

### Chat Endpoints
- `POST /api/v1/chat/conversations` - Create conversation
- `GET /api/v1/chat/conversations` - Get all conversations
- `GET /api/v1/chat/conversations/{id}` - Get specific conversation
- `PUT /api/v1/chat/conversations/{id}` - Update conversation
- `POST /api/v1/chat/conversations/{id}/messages` - Send message
- `GET /api/v1/chat/conversations/{id}/messages` - Get messages
- `PUT /api/v1/chat/messages/{id}` - Update message
- `DELETE /api/v1/chat/messages/{id}` - Delete message
- `PUT /api/v1/chat/messages/{id}/read` - Mark as read
- `PUT /api/v1/chat/conversations/{id}/read` - Mark conversation as read
- `POST /api/v1/chat/messages/{id}/reactions` - Add reaction
- `GET /api/v1/chat/unread-count` - Get unread count
- `POST /api/v1/chat/conversations/direct` - Find/create direct conversation

### WebSocket Events
- `message_sent` - Message sent by user
- `message_received` - New message received
- `message_read` - Message marked as read
- `message_delivered` - Message delivered
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline
- `conversation_created` - New conversation created
- `message_reaction_added` - Reaction added to message
- `message_reaction_removed` - Reaction removed from message

## Usage Examples

### Starting a New Chat
```typescript
import { useCreateConversation } from '../../hooks/useChat';

const createConversation = useCreateConversation();

const handleNewChat = () => {
  createConversation.mutate({
    participantIds: ['user-id'],
    name: 'Chat Name',
    description: 'Chat description'
  });
};
```

### Sending a Message
```typescript
import { useSendMessage } from '../../hooks/useChat';

const sendMessage = useSendMessage();

const handleSend = () => {
  sendMessage.mutate({
    conversationId: 'conv-id',
    data: {
      content: 'Hello!',
      receiverId: 'user-id',
      conversationId: 'conv-id',
      messageType: 'text'
    }
  });
};
```

### Adding Message Reactions
```typescript
import { useAddMessageReaction } from '../../hooks/useChat';

const addReaction = useAddMessageReaction();

const handleReaction = (emoji: string) => {
  addReaction.mutate({
    id: 'message-id',
    data: { emoji, messageId: 'message-id' }
  });
};
```

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_URL_WS=ws://localhost:3000
```

### WebSocket Configuration
- **Connection URL**: `${VITE_API_URL_WS}/chat/ws`
- **Authentication**: Query parameters with `userId` and `token`
- **Heartbeat**: 30-second ping interval
- **Reconnection**: Exponential backoff with max 5 attempts

## Performance Features

### Optimizations
- **Message pagination** with infinite scroll
- **Optimistic updates** for immediate feedback
- **Smart caching** with React Query
- **Message grouping** to reduce DOM nodes
- **Lazy loading** for media content
- **Debounced typing indicators**

### Memory Management
- **Message cleanup** for old conversations
- **WebSocket connection pooling**
- **Event listener cleanup** on unmount
- **Cache size limits** to prevent memory leaks

## Accessibility

### Features
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus management** for modals
- **ARIA labels** and descriptions
- **Semantic HTML** structure

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### WebSocket Support
- **Native WebSocket** API support required
- **Fallback** to polling for older browsers
- **Progressive enhancement** approach

## Development

### Setup
1. Install dependencies: `npm install`
2. Set environment variables
3. Start development server: `npm run dev`

### Testing
- **Unit tests** for hooks and utilities
- **Integration tests** for WebSocket
- **E2E tests** for chat flow
- **Mock WebSocket** for development

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Husky** for pre-commit hooks

## Future Enhancements

### Planned Features
- **Voice and video calls** integration
- **File sharing** with drag & drop
- **Message encryption** for security
- **Group chat** management
- **Chat bots** and automation
- **Message scheduling** and reminders
- **Advanced search** and filters
- **Chat analytics** and insights

### Technical Improvements
- **Service Worker** for offline support
- **WebRTC** for peer-to-peer communication
- **Message compression** for large conversations
- **Real-time translation** support
- **Advanced caching** strategies
- **Performance monitoring** and metrics

## Troubleshooting

### Common Issues
1. **WebSocket connection failed**
   - Check server status and URL
   - Verify authentication token
   - Check network connectivity

2. **Messages not updating**
   - Verify WebSocket connection
   - Check React Query cache
   - Review error logs

3. **Performance issues**
   - Monitor message count
   - Check memory usage
   - Review WebSocket event handling

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('chat-debug', 'true');
```

## Contributing

### Guidelines
1. Follow TypeScript best practices
2. Use Mantine UI components
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation
6. Follow accessibility guidelines

### Code Style
- **Functional components** with hooks
- **Custom hooks** for business logic
- **TypeScript interfaces** for all data
- **Consistent naming** conventions
- **Proper error boundaries**

## License

This chat feature is part of the Miingo application and follows the project's licensing terms.
