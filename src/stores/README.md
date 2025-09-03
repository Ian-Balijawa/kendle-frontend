# Zustand Stores with Redux DevTools Integration

All stores in this application have been configured with Redux DevTools for better debugging and state visualization.

## Available Stores

### 1. Auth Store (`authStore.ts`)
- **Store Name**: "Auth Store"
- **Persisted Data**: User, token, refreshToken, isAuthenticated
- **Actions**: 
  - `auth/logout`
  - `auth/updateProfile`
  - `auth/updateUser`
  - `auth/setLoading`
  - `auth/setError`
  - `auth/clearError`
  - `auth/setOTPSent`
  - `auth/setPhoneNumber`
  - `auth/setAuthData`

### 2. Chat Store (`chatStore.ts`)
- **Store Name**: "Chat Store"
- **Persisted Data**: Chat heads
- **Actions**:
  - `chat/openWidget`
  - `chat/closeWidget`
  - `chat/toggleWidget`
  - `chat/openNewWindow`
  - `chat/closeWindow`
  - `chat/minimizeWindow`
  - `chat/maximizeWindow`
  - `chat/focusWindow`
  - `chat/updateWindowPosition`
  - `chat/updateWindowSize`
  - `chat/addChatHead`
  - `chat/removeChatHead`

### 3. Inbox Store (`inboxStore.ts`)
- **Store Name**: "Inbox Store"
- **Persisted Data**: Chat settings
- **Actions**:
  - `inbox/setSelectedConversationId`
  - `inbox/setTypingIndicator`
  - `inbox/removeTypingIndicator`
  - `inbox/setOnlineStatus`
  - `inbox/setConnected`
  - `inbox/setChatSettings`

### 4. Status Store (`statusStore.ts`)
- **Store Name**: "Status Store"
- **Persisted Data**: Status collections
- **Actions**:
  - `status/setStatuses`
  - `status/setStatusCollections`
  - `status/addStatus`
  - `status/deleteStatus`
  - `status/viewStatus`
  - `status/setSelectedStatus`
  - `status/setLoading`
  - `status/setError`
  - `status/clearError`
  - `status/cleanupExpiredStatuses`

### 5. UI Store (`uiStore.ts`)
- **Store Name**: "UI Store"
- **Persisted Data**: Theme
- **Actions**:
  - `ui/setTheme`
  - `ui/addNotification`
  - `ui/markNotificationAsRead`
  - `ui/markAllNotificationsAsRead`
  - `ui/removeNotification`
  - `ui/clearNotifications`

## How to Use Redux DevTools

### 1. Install Redux DevTools Extension
- **Chrome**: [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- **Firefox**: [Redux DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### 2. Open DevTools
- Press `F12` to open browser DevTools
- Go to the "Redux" tab
- You'll see all your Zustand stores listed

### 3. Debug Features Available
- **State Inspector**: View current state of each store
- **Action History**: See all dispatched actions with timestamps
- **Time Travel**: Jump to any previous state
- **State Diff**: See what changed between actions
- **Export/Import**: Save and restore state snapshots

### 4. Store Selection
- Use the dropdown to switch between different stores
- Each store is named for easy identification
- Actions are prefixed with store name (e.g., `auth/`, `chat/`, etc.)

## Middleware Stack

Each store uses the following middleware stack:
```typescript
devtools(
  persist(
    subscribeWithSelector(
      // Store implementation
    ),
    // Persist configuration
  ),
  // DevTools configuration
)
```

### Benefits
- **devtools**: Enables Redux DevTools integration
- **persist**: Automatically saves state to localStorage
- **subscribeWithSelector**: Enables selective subscriptions for better performance

## Development vs Production

- **Development**: DevTools are enabled (`enabled: true`)
- **Production**: DevTools are automatically disabled for performance

## Troubleshooting

### DevTools Not Showing
1. Make sure the Redux DevTools extension is installed
2. Check that you're in development mode
3. Refresh the page and check the "Redux" tab

### State Not Persisting
1. Check localStorage in DevTools → Application → Storage
2. Verify the store name in the persist configuration
3. Check the partialize function to ensure data is being saved

### Performance Issues
1. Use the `partialize` function to only persist necessary data
2. Consider using `subscribeWithSelector` for selective subscriptions
3. Monitor action frequency in DevTools
