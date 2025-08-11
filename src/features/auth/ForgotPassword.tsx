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
    Box,
    Center,
} from '@mantine/core'
import { IconMail, IconCheck, IconBrandTwitter, IconArrowLeft } from '@tabler/icons-react'
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
      <Box className="auth-container">
        <Container size="xs" style={{ width: '100%', maxWidth: '400px' }}>
          <Paper className="auth-paper" p="xl" withBorder>
            {/* Decorative background elements */}
            <Box
              className="auth-decoration"
              style={{
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, var(--mantine-color-primary-2), var(--mantine-color-primary-3))',
              }}
            />
            <Box
              className="auth-decoration"
              style={{
                bottom: '-30px',
                left: '-30px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--mantine-color-secondary-2), var(--mantine-color-secondary-3))',
              }}
            />

            <Stack gap="xl" align="center" style={{ position: 'relative', zIndex: 1 }} className="auth-form">
              <Center>
                <Box
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, var(--mantine-color-green-6), var(--mantine-color-green-7))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--mantine-spacing-md)',
                  }}
                >
                  <IconCheck size={40} color="white" />
                </Box>
              </Center>

              <div style={{ textAlign: 'center' }}>
                <Title order={1} size="h2" style={{ 
                  marginBottom: 'var(--mantine-spacing-xs)',
                  color: 'var(--mantine-color-green-7)',
                }}>
                  Check Your Email
                </Title>
                <Text c="dimmed" size="sm">
                  We've sent password reset instructions to your email address.
                </Text>
              </div>

              <Alert
                title="What's next?"
                color="blue"
                variant="light"
                radius="md"
                style={{ width: '100%' }}
              >
                <Text size="sm">
                  1. Check your email inbox (and spam folder)<br />
                  2. Click the reset link in the email<br />
                  3. Create a new password
                </Text>
              </Alert>

              <Group justify="center">
                <Anchor 
                  component={Link} 
                  to="/login" 
                  size="sm"
                  className="auth-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--mantine-spacing-xs)',
                  }}
                >
                  <IconArrowLeft size={16} />
                  Back to login
                </Anchor>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box className="auth-container">
      <Container size="xs" style={{ width: '100%', maxWidth: '400px' }}>
        <Paper className="auth-paper" p="xl" withBorder>
          <LoadingOverlay visible={isSubmitting} />

          {/* Decorative background elements */}
          <Box
            className="auth-decoration"
            style={{
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, var(--mantine-color-primary-2), var(--mantine-color-primary-3))',
            }}
          />
          <Box
            className="auth-decoration"
            style={{
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, var(--mantine-color-secondary-2), var(--mantine-color-secondary-3))',
            }}
          />

          <Stack gap="xl" style={{ position: 'relative', zIndex: 1 }} className="auth-form">
            <Center>
              <Box className="auth-logo">
                <IconBrandTwitter size={32} color="white" />
              </Box>
            </Center>

            <div style={{ textAlign: 'center' }}>
              <Title order={1} size="h2" className="text-gradient" style={{ marginBottom: 'var(--mantine-spacing-xs)' }}>
                Forgot Password?
              </Title>
              <Text c="dimmed" size="sm">
                Enter your email to receive reset instructions
              </Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Email Address"
                  placeholder="your@email.com"
                  leftSection={<IconMail size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: 'auth-input',
                    label: 'auth-label',
                  }}
                  {...form.getInputProps('email')}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  className="auth-button"
                >
                  Send Reset Link
                </Button>
              </Stack>
            </form>

            <Divider 
              label="or" 
              labelPosition="center" 
              style={{ 
                borderColor: 'var(--mantine-color-gray-3)',
                '--divider-color': 'var(--mantine-color-gray-3)',
              }}
            />

            <Group justify="center" gap="xs">
              <Text size="sm" c="dimmed">
                Remember your password?
              </Text>
              <Anchor 
                component={Link} 
                to="/login" 
                size="sm"
                className="auth-link"
              >
                Sign in
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
