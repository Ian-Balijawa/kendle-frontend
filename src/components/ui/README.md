# UI Components - Loading Skeletons

This directory contains modern loading skeleton components that provide a better user experience than traditional loading spinners and text.

## Components

### PostSkeleton

A skeleton component that mimics the structure of a post card.

**Props:**

- None

**Usage:**

```tsx
import { PostSkeleton } from "../../components/ui";

<PostSkeleton />;
```

### PostSkeletonList

Renders multiple post skeletons for list loading states.

**Props:**

- `count` (optional): Number of skeletons to render (default: 3)

**Usage:**

```tsx
import { PostSkeletonList } from "../../components/ui";

<PostSkeletonList count={5} />;
```

### CommentSkeleton

A skeleton component that mimics the structure of a comment.

**Props:**

- None

**Usage:**

```tsx
import { CommentSkeleton } from "../../components/ui";

<CommentSkeleton />;
```

### CommentSkeletonList

Renders multiple comment skeletons for list loading states.

**Props:**

- `count` (optional): Number of skeletons to render (default: 3)

**Usage:**

```tsx
import { CommentSkeletonList } from "../../components/ui";

<CommentSkeletonList count={3} />;
```

### PostDetailSkeleton

A comprehensive skeleton for the post detail page, including post content and comments.

**Props:**

- None

**Usage:**

```tsx
import { PostDetailSkeleton } from "../../components/ui";

<PostDetailSkeleton />;
```

### InfiniteScrollLoader

A subtle loading indicator for infinite scroll operations.

**Props:**

- `count` (optional): Number of skeleton items to render (default: 2)
- `variant` (optional): Type of content - "posts" or "comments" (default: "posts")

**Usage:**

```tsx
import { InfiniteScrollLoader } from "../../components/ui";

<InfiniteScrollLoader count={2} variant="posts" />
<InfiniteScrollLoader count={2} variant="comments" />
```

### LoadingButton

A button component with consistent loading states.

**Props:**

- Extends Mantine Button props
- `loading`: Boolean to show loading state
- Automatically disables button when loading

**Usage:**

```tsx
import { LoadingButton } from "../../components/ui";

<LoadingButton loading={isSubmitting} onClick={handleSubmit}>
  Submit
</LoadingButton>;
```

## Benefits

1. **Better UX**: Skeletons provide visual feedback about content structure
2. **Reduced Perceived Loading Time**: Users see content layout immediately
3. **Modern Design**: Follows current design trends used by major platforms
4. **Consistent Loading States**: Unified approach across the application
5. **Accessibility**: Better than flashing spinners for users with visual sensitivities

## Migration from Old Loading States

Replace:

- `<Loader />` components
- "Loading..." text
- `<LoadingOverlay />` components

With appropriate skeleton components based on the content being loaded.
