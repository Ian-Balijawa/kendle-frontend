import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    Stepper,
    Grid,
} from '@mantine/core'
import {
    IconMail,
    IconLock,
    IconUser,
    IconPhone,
    IconAlertCircle,
    IconCheck,
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { notifications } from '@mantine/notifications'
import { useAuthStore } from '../../stores/authStore'
import { registerSchema, RegisterFormData } from '../../lib/schemas'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const form = useForm<RegisterFormData>({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    validate: zodResolver(registerSchema),
  })

  const handleSubmit = async (values: RegisterFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      await register(values)
      notifications.show({
        title: 'Account created!',
        message: 'Welcome to Kendle! Your account has been created successfully.',
        color: 'green',
        icon: <IconCheck size={16} />,
      })
      navigate('/', { replace: true })
    } catch (err) {
      notifications.show({
        title: 'Registration failed',
        message: 'Please check your information and try again.',
        color: 'red',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    const validation = form.validate()

    if (!validation.hasErrors) {
      setActiveStep((current) => (current < 2 ? current + 1 : current))
    }
  }

  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current))
  }

  return (
    <Container size="sm" py="xl">
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
              Join Kendle
            </Title>
            <Text c="dimmed" size="sm" mt="xs">
              Create your account to get started
            </Text>
          </div>

          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
            size="sm"
          >
            <Stepper.Step label="Personal Info" description="Basic information">
              <Stack gap="md" mt="lg">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      leftSection={<IconUser size={16} />}
                      required
                      {...form.getInputProps('firstName')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      leftSection={<IconUser size={16} />}
                      required
                      {...form.getInputProps('lastName')}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Account Details" description="Username & contact">
              <Stack gap="md" mt="lg">
                <TextInput
                  label="Username"
                  placeholder="johndoe"
                  leftSection={<IconUser size={16} />}
                  required
                  {...form.getInputProps('username')}
                />
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  leftSection={<IconMail size={16} />}
                  required
                  {...form.getInputProps('email')}
                />
                <TextInput
                  label="Phone Number"
                  placeholder="+1234567890"
                  leftSection={<IconPhone size={16} />}
                  required
                  {...form.getInputProps('phoneNumber')}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Security" description="Password setup">
              <Stack gap="md" mt="lg">
                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  leftSection={<IconLock size={16} />}
                  required
                  {...form.getInputProps('password')}
                />
                <Text size="xs" c="dimmed">
                  Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.
                </Text>
              </Stack>
            </Stepper.Step>
          </Stepper>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Registration Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Group justify="space-between" mt="xl">
            <Button
              variant="default"
              onClick={prevStep}
              disabled={activeStep === 0}
            >
              Back
            </Button>

            {activeStep === 2 ? (
              <Button
                onClick={() => form.onSubmit(handleSubmit)()}
                loading={isSubmitting}
                disabled={isLoading}
              >
                Create Account
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
              </Button>
            )}
          </Group>

          <Divider label="or" labelPosition="center" />

          <Group justify="center" gap="xs">
            <Text size="sm" c="dimmed">
              Already have an account?
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
