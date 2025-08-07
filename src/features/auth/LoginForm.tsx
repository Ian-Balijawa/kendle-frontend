import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
    Container,
    Paper,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Anchor,
    Stack,
    Divider,
    Group,
    Alert,
    LoadingOverlay,
} from '@mantine/core'
import { IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { useAuthStore } from '../../stores/authStore'
import { loginSchema, LoginFormData } from '../../lib/schemas'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  })

  const handleSubmit = async (values: LoginFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      await login(values)
      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully logged in.',
        color: 'green',
      })

      // Redirect to the page they were trying to access or home
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      notifications.show({
        title: 'Login failed',
        message: 'Please check your credentials and try again.',
        color: 'red',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container size="xs" py="xl">
      <Paper
        radius="lg"
        p="xl"
        withBorder
        style={{
          background: 'var(--mantine-color-white)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        <LoadingOverlay visible={isSubmitting} />

        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={1} size="h2" className="text-gradient">
              Welcome to Kendle
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Sign in to your account to continue
            </Text>
          </div>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Authentication Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps('password')}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isSubmitting}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Divider label="or" labelPosition="center" />

          <Group justify="center" gap="xs">
            <Text size="sm" c="dimmed">
              Don't have an account?
            </Text>
            <Anchor component={Link} to="/register" size="sm">
              Create account
            </Anchor>
          </Group>

          <Group justify="center">
            <Anchor component={Link} to="/forgot-password" size="sm">
              Forgot your password?
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
