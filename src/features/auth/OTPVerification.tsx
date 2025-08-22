import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Container,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBrandTwitter,
  IconKey,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../../stores/authStore";
import { useVerifyOTP, useResendOTP } from "../../hooks/useAuth";
import { VerifyOTPRequest } from "../../services/api";

interface OTPVerificationFormData {
  otp: string;
}

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^\d{6}$/, "Please enter a valid 6-digit OTP"),
});

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, clearError } = useAuthStore();

  // React Query mutations
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  const isSubmitting = verifyOTPMutation.isPending;
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const form = useForm<OTPVerificationFormData>({
    mode: "uncontrolled",
    initialValues: {
      otp: "",
    },
    validate: zodResolver(otpSchema) as any,
  });

  const handleSubmit = async (values: OTPVerificationFormData) => {
    if (!phoneNumber) return;

    clearError();

    const verifyData: VerifyOTPRequest = {
      identifier: phoneNumber,
      otp: values.otp,
    };

    verifyOTPMutation.mutate(verifyData, {
      onSuccess: (response) => {
        if (response.user.isProfileComplete) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/complete-profile", { replace: true });
        }
      },
      onError: (err) => {
        console.error("OTP verification failed:", err);
      },
    });
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) return;

    resendOTPMutation.mutate(
      { identifier: phoneNumber },
      {
        onSuccess: () => {
          setCountdown(300);
          setCanResend(false);
        },
        onError: (err) => {
          console.error("Failed to resend OTP:", err);
        },
      }
    );
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <Box className="auth-container">
      <Container size="xs" style={{ width: "100%", maxWidth: "400px" }}>
        <Paper className="auth-paper" p="xl" withBorder>
          <LoadingOverlay visible={isSubmitting} />

          {/* Decorative background elements */}
          <Box
            className="auth-decoration"
            style={{
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background:
                "linear-gradient(135deg, var(--mantine-color-primary-2), var(--mantine-color-primary-3))",
            }}
          />
          <Box
            className="auth-decoration"
            style={{
              bottom: "-30px",
              left: "-30px",
              width: "60px",
              height: "60px",
              background:
                "linear-gradient(135deg, var(--mantine-color-secondary-2), var(--mantine-color-secondary-3))",
            }}
          />

          <Stack
            gap="xl"
            style={{ position: "relative", zIndex: 1 }}
            className="auth-form"
          >
            <Center>
              <Box className="auth-logo">
                <IconBrandTwitter size={32} color="white" />
              </Box>
            </Center>

            <div style={{ textAlign: "center" }}>
              <Title
                order={1}
                size="h2"
                className="text-gradient"
                style={{ marginBottom: "var(--mantine-spacing-xs)" }}
              >
                Enter Verification Code
              </Title>
              <Text c="dimmed" size="sm">
                We've sent a 6-digit code to {phoneNumber}
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Verification Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Verification Code"
                  placeholder="123456"
                  leftSection={<IconKey size={18} />}
                  required
                  size="md"
                  radius="md"
                  maxLength={6}
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("otp")}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="auth-button"
                >
                  Verify Code
                </Button>
              </Stack>
            </form>

            <Stack gap="md" align="center">
              <Text size="sm" c="dimmed" ta="center">
                Didn't receive the code?
              </Text>

              {canResend ? (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleResendOTP}
                  className="auth-link"
                >
                  Resend Code
                </Button>
              ) : (
                <Text size="sm" c="dimmed">
                  Resend available in {formatTime(countdown)}
                </Text>
              )}

              <Anchor
                component={Link}
                to="/"
                size="sm"
                className="auth-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mantine-spacing-xs)",
                }}
              >
                <IconArrowLeft size={16} />
                Back to phone input
              </Anchor>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
