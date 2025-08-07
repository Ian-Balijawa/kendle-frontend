import { useState } from 'react'
import {
    Container,
    Stack,
    Title,
    Button,
    Group,
    Text,
    Card,
    Avatar,
    ActionIcon,
    Badge,
    Box
} from '@mantine/core'
import {
    IconHeart,
    IconMessageCircle,
    IconShare,
    IconBookmark,
    IconPlus,
    IconTrendingUp,
} from '@tabler/icons-react'
import { usePostStore } from '../../stores/postStore'
import { useAuthStore } from '../../stores/authStore'

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    content: 'Just launched our new social media platform! 🚀 Excited to see how it helps people connect and share their stories. #Kendle #SocialMedia #Innovation',
    author: {
      id: '1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    },
    createdAt: '2024-01-15T10:30:00Z',
    _count: {
      likes: 42,
      comments: 12,
      shares: 5,
    },
    isLiked: false,
    isShared: false,
    isBookmarked: false,
  },
  {
    id: '2',
    content: 'Beautiful sunset today! Nature never fails to amaze me. 🌅',
    author: {
      id: '2',
      username: 'janedoe',
      firstName: 'Jane',
      lastName: 'Doe',
      avatar: null,
    },
    createdAt: '2024-01-15T09:15:00Z',
    _count: {
      likes: 28,
      comments: 8,
      shares: 3,
    },
    isLiked: true,
    isShared: false,
    isBookmarked: true,
  },
]

export function HomePage() {
  const { user } = useAuthStore()
  const { likePost, unlikePost } = usePostStore()
  const [posts] = useState(mockPosts)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleLike = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId)
    } else {
      likePost(postId)
    }
  }

  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Title order={1} size="h2">
              Home
            </Title>
            <Text c="dimmed" size="sm">
              Welcome back, {user?.firstName}! 👋
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {/* TODO: Open create post modal */}}
          >
            Create Post
          </Button>
        </Group>

        {/* Trending Section */}
        <Card withBorder p="md">
          <Group gap="xs" mb="sm">
            <IconTrendingUp size={20} color="var(--mantine-color-orange-6)" />
            <Text fw={600}>Trending Today</Text>
          </Group>
          <Group gap="xs">
            <Badge variant="light" color="blue">#Kendle</Badge>
            <Badge variant="light" color="green">#SocialMedia</Badge>
            <Badge variant="light" color="purple">#Innovation</Badge>
            <Badge variant="light" color="orange">#Tech</Badge>
          </Group>
        </Card>

        {/* Posts Feed */}
        <Stack gap="md">
          {posts.map((post) => (
            <Card key={post.id} withBorder p="md">
              <Stack gap="md">
                {/* Post Header */}
                <Group justify="space-between">
                  <Group>
                    <Avatar
                      src={post.author.avatar}
                      alt={post.author.firstName}
                      size="md"
                    >
                      {post.author.firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Text fw={500} size="sm">
                        {post.author.firstName} {post.author.lastName}
                      </Text>
                      <Text c="dimmed" size="xs">
                        @{post.author.username} • {formatDate(post.createdAt)}
                      </Text>
                    </Box>
                  </Group>
                </Group>

                {/* Post Content */}
                <Text size="sm" style={{ lineHeight: 1.6 }}>
                  {post.content}
                </Text>

                {/* Post Actions */}
                <Group justify="space-between">
                  <Group gap="xs">
                    <ActionIcon
                      variant={post.isLiked ? 'filled' : 'subtle'}
                      color={post.isLiked ? 'red' : 'gray'}
                      onClick={() => handleLike(post.id, post.isLiked)}
                    >
                      <IconHeart size={16} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">
                      {post._count.likes}
                    </Text>

                    <ActionIcon variant="subtle" color="gray">
                      <IconMessageCircle size={16} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">
                      {post._count.comments}
                    </Text>

                    <ActionIcon variant="subtle" color="gray">
                      <IconShare size={16} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">
                      {post._count.shares}
                    </Text>
                  </Group>

                  <ActionIcon
                    variant={post.isBookmarked ? 'filled' : 'subtle'}
                    color={post.isBookmarked ? 'yellow' : 'gray'}
                  >
                    <IconBookmark size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* Load More */}
        <Box ta="center" py="lg">
          <Button variant="light" size="sm">
            Load More Posts
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
