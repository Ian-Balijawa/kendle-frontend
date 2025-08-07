import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Container,
    Paper,
    Title,
    TextInput,
    Button,
    Text,
    Anchor,
    Stack,
    Divider,
    Group,
    Alert,
    LoadingOverlay,
} from '@mantine/core'
import { IconMail, IconCheck } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../lib/schemas'

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgotPasswordSchema),
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      notifications.show({
        title: 'Reset link sent!',
        message: 'Check your email for password reset instructions.',
        color: 'green',
        icon: <IconCheck size={16} />,
      })
      setIsSubmitted(true)
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send reset email. Please try again.',
        color: 'red',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
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
          <Stack gap="lg" align="center">
            <div style={{ textAlign: 'center' }}>
              <IconCheck size={48} color="var(--mantine-color-green-6)" />
              <Title order={1} size="h2" mt="md">
                Check Your Email
              </Title>
              <Text c="dimmed" size="sm" mt="xs">
                We've sent password reset instructions to your email address.
              </Text>
            </div>

            <Alert
              title="What's next?"
              color="blue"
              variant="light"
            >
              <Text size="sm">
                1. Check your email inbox (and spam folder)<br />
                2. Click the reset link in the email<br />
                3. Create a new password
              </Text>
            </Alert>

            <Group justify="center">
              <Anchor component={Link} to="/login" size="sm">
                Back to login
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Container>
    )
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
              Forgot Password?
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Enter your email to receive reset instructions
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </Stack>
          </form>

          <Divider label="or" labelPosition="center" />

          <Group justify="center" gap="xs">
            <Text size="sm" c="dimmed">
              Remember your password?
            </Text>
            <Anchor component={Link} to="/login" size="sm">
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
