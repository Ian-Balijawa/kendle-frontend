# Post Engagement Features

This document describes the new post engagement features that have been integrated into the posts system. These features allow you to track and display detailed engagement data for posts, including who liked, disliked, bookmarked, and viewed posts.

## New API Endpoints

The following new endpoints have been integrated:

- `GET /api/v1/posts/{id}/likers` - Get users who liked a specific post
- `GET /api/v1/posts/{id}/dislikers` - Get users who disliked a specific post  
- `GET /api/v1/posts/{id}/bookmarkers` - Get users who bookmarked a specific post
- `GET /api/v1/posts/{id}/viewers` - Get users who viewed a specific post
- `GET /api/v1/posts/{id}/engagement` - Get current user's engagement status with a post

## New Types

### PostEngagement

```typescript
interface PostEngagement {
  hasLiked: boolean;
  hasDisliked: boolean;
  hasBookmarked: boolean;
  hasViewed: boolean;
  reactionType?: "like" | "dislike" | null;
  bookmarkNote?: string | null;
  lastViewedAt?: string | null;
}
```

## New React Query Hooks

### usePostEngagement(postId: string)

Fetches the current user's engagement status with a specific post.

```typescript
const { data: engagement, isLoading, error } = usePostEngagement(postId);
```

### usePostLikers(postId: string, params?: { page?: number; limit?: number })

Fetches users who liked a specific post with infinite scroll support.

```typescript
const { 
  data: likersData, 
  fetchNextPage, 
  hasNextPage 
} = usePostLikers(postId, { page: 1, limit: 20 });
```

### usePostDislikers(postId: string, params?: { page?: number; limit?: number })

Fetches users who disliked a specific post with infinite scroll support.

```typescript
const { 
  data: dislikersData, 
  fetchNextPage, 
  hasNextPage 
} = usePostDislikers(postId, { page: 1, limit: 20 });
```

### usePostBookmarkers(postId: string, params?: { page?: number; limit?: number })

Fetches users who bookmarked a specific post with infinite scroll support.

```typescript
const { 
  data: bookmarkersData, 
  fetchNextPage, 
  hasNextPage 
} = usePostBookmarkers(postId, { page: 1, limit: 20 });
```

### usePostViewers(postId: string, params?: { page?: number; limit?: number })

Fetches users who viewed a specific post with infinite scroll support.

```typescript
const { 
  data: viewersData, 
  fetchNextPage, 
  hasNextPage 
} = usePostViewers(postId, { page: 1, limit: 20 });
```

## New UI Components

### PostEngagementModal

A modal component that displays detailed engagement information for a post.

```typescript
import { PostEngagementModal } from "../../components/ui";

<PostEngagementModal
  postId={postId}
  opened={modalOpened}
  onClose={() => setModalOpened(false)}
/>
```

**Features:**
- Tabbed interface showing likers, dislikers, bookmarkers, and viewers
- Infinite scroll for each engagement type
- User avatars and verification badges
- Engagement summary showing current user's status
- **Theme Compatibility**: Fully compatible with both dark and light theme modes

### PostEngagementButton

A button component that opens the engagement modal.

```typescript
import { PostEngagementButton } from "../../components/ui";

<PostEngagementButton
  postId={postId}
  likesCount={post.likesCount}
  dislikesCount={post.dislikesCount}
  bookmarksCount={post.bookmarksCount}
  viewsCount={post.viewsCount}
/>
```

## Integration Status

✅ **Successfully Integrated!** The post engagement features have been fully integrated into the main post components:

- **PostCard Component**: The `PostEngagementButton` has been added to replace the simple statistics display
- **PostDetail Component**: The `PostEngagementButton` has been added to provide engagement details on the detailed post view

Users can now:
- Click on the engagement button to see who liked, disliked, bookmarked, or viewed their posts
- View their own engagement status with the post
- See detailed engagement statistics in an interactive modal

## Integration Examples

### Adding Engagement Button to PostCard

```typescript
import { PostEngagementButton } from "../../components/ui";

// In your PostCard component's action buttons section:
<Group gap="xs" align="center">
  {/* Existing like, comment, share buttons */}
  
  <PostEngagementButton
    postId={post.id}
    likesCount={post.likesCount}
    dislikesCount={post.dislikesCount}
    bookmarksCount={post.bookmarksCount}
    viewsCount={post.viewsCount}
  />
</Group>
```

### Using Engagement Data in Custom Components

```typescript
import { usePostEngagement, usePostLikers } from "../../hooks/usePosts";

function CustomEngagementDisplay({ postId }: { postId: string }) {
  const { data: engagement } = usePostEngagement(postId);
  const { data: likersData } = usePostLikers(postId);
  
  const likers = likersData?.pages.flatMap(page => page.users) || [];
  
  return (
    <div>
      <h3>Your Status:</h3>
      <p>Liked: {engagement?.hasLiked ? "Yes" : "No"}</p>
      <p>Bookmarked: {engagement?.hasBookmarked ? "Yes" : "No"}</p>
      
      <h3>Recent Likers:</h3>
      {likers.slice(0, 5).map(user => (
        <div key={user.id}>
          {user.firstName} {user.lastName}
        </div>
      ))}
    </div>
  );
}
```

## API Service Methods

The following methods have been added to the `apiService`:

```typescript
// Get post likers
await apiService.getPostLikers(postId, { page: 1, limit: 20 });

// Get post dislikers  
await apiService.getPostDislikers(postId, { page: 1, limit: 20 });

// Get post bookmarkers
await apiService.getPostBookmarkers(postId, { page: 1, limit: 20 });

// Get post viewers
await apiService.getPostViewers(postId, { page: 1, limit: 20 });

// Get current user's engagement status
await apiService.getPostEngagement(postId);
```

## Error Handling

All hooks include proper error handling and loading states:

```typescript
const { 
  data, 
  isLoading, 
  error, 
  refetch 
} = usePostEngagement(postId);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
```

## Performance Considerations

- All engagement hooks use React Query for caching and background updates
- Infinite scroll is implemented for user lists to handle large datasets
- Engagement data is cached for 2 minutes to reduce API calls
- Hooks are only enabled when a valid postId is provided

## Future Enhancements

Potential future enhancements could include:

- Real-time updates using WebSocket connections
- Engagement analytics and insights
- Bulk engagement operations
- Engagement notifications
- Custom engagement types beyond like/dislike/bookmark/view

## Testing

To test the new features:

1. Use the `PostEngagementExample` component in your development environment
2. Create posts and interact with them (like, dislike, bookmark, view)
3. Open the engagement modal to see the data
4. Test infinite scroll by having many users interact with a post

## Migration Guide

If you're updating existing post components:

1. Import the new hooks and components
2. Add the `PostEngagementButton` to your action buttons section
3. Optionally use `usePostEngagement` to show current user's status
4. Test thoroughly to ensure no breaking changes

The new features are backward compatible and won't affect existing functionality.
