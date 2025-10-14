import {
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  PinInput,
  Progress,
  Stack,
  Text,
  Title,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconShield,
  IconClock,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useResendOTP, useVerifyOTP } from "../../hooks/useAuth";
import { VerifyOTPRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

interface OTPVerificationFormData {
  otp: string;
}

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^\d{5}$/, "Please enter a valid 5-digit OTP"),
});

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, clearError } = useAuthStore();

  // React Query mutations
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();
  const isSubmitting =
    verifyOTPMutation.isPending || resendOTPMutation.isPending;

  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [mounted, setMounted] = useState(false);

  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/", { replace: true });
      return;
    }

    // Trigger animation
    setTimeout(() => setMounted(true), 100);

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

  const getProgressValue = () => {
    return ((300 - countdown) / 300) * 100;
  };

  const form = useForm<OTPVerificationFormData>({
    mode: "uncontrolled",
    initialValues: {
      otp: "",
    },
    validate: zodResolver(otpSchema) as any,
  });

  const handleSubmit = useCallback(
    async (values: OTPVerificationFormData) => {
      if (!phoneNumber || isSubmitting) return;

      clearError();
      const verifyData: VerifyOTPRequest = {
        phoneNumber: phoneNumber,
        otp: values.otp,
      };

      verifyOTPMutation.mutate(verifyData, {
        onSuccess: (response) => {
          if (response.user.isProfileComplete) {
            navigate("/", { replace: true });
          } else {
            navigate("/complete-profile", { replace: true });
          }
        },
        onError: (err) => {
          console.error("OTP verification failed:", err);
        },
      });
    },
    [phoneNumber, clearError, verifyOTPMutation, navigate, isSubmitting],
  );

  const handleResendOTP = async () => {
    if (!phoneNumber) return;
    resendOTPMutation.mutate(
      { phoneNumber: phoneNumber },
      {
        onSuccess: () => {
          setCountdown(300);
          setCanResend(false);
        },
        onError: (err) => {
          console.error("Failed to resend OTP:", err);
        },
      },
    );
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--mantine-spacing-md)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        style={{
          position: "absolute",
          top: "15%",
          right: "15%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))",
          filter: "blur(40px)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "25%",
          left: "10%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(14, 165, 233, 0.04))",
          filter: "blur(30px)",
          animation: "pulse 3s ease-in-out infinite reverse",
        }}
      />

      <Container
        size="xs"
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Transition
          mounted={mounted}
          transition="fade-up"
          duration={600}
          timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
        >
          {(styles) => (
            <Paper
              style={{
                ...styles,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "var(--mantine-radius-xl)",
                padding: "var(--mantine-spacing-xl)",
                boxShadow:
                  "0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <LoadingOverlay
                visible={isSubmitting}
                overlayProps={{
                  radius: "xl",
                  backgroundOpacity: 0.15,
                  blur: 2,
                }}
              />

              {/* Header Section */}
              <Stack gap="xl" align="center" mb="xl">
                <Group gap="sm" align="center">
                  <Box
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, var(--mantine-color-success-6), var(--mantine-color-success-8))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <IconShield size={28} color="white" />
                  </Box>
                  <Stack gap={0}>
                    <Title
                      order={1}
                      size="h2"
                      className="text-gradient"
                      style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                    >
                      Kendle
                    </Title>
                    <Text size="sm" c="dimmed" fw={500}>
                      Secure Verification
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="xs" align="center">
                  <Title order={2} size="h3" ta="center" fw={700} c="dark.8">
                    Enter verification code
                  </Title>
                  <Text size="md" c="dimmed" ta="center" maw={320}>
                    We've sent a 5-digit code to{" "}
                    <Text component="span" fw={600} c="dark.6">
                      {phoneNumber}
                    </Text>
                  </Text>
                </Stack>
              </Stack>

              {/* Error Alert */}
              {error && (
                <Transition
                  mounted={!!error}
                  transition="fade-down"
                  duration={300}
                >
                  {(styles) => (
                    <Alert
                      style={styles}
                      icon={<IconAlertCircle size={18} />}
                      title="Verification Error"
                      color="red"
                      variant="light"
                      radius="md"
                      mb="lg"
                      styles={{
                        root: {
                          border: "1px solid var(--mantine-color-red-2)",
                          backgroundColor: "var(--mantine-color-red-0)",
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Transition>
              )}

              {/* OTP Input */}
              <Stack gap="xl" align="center">
                <PinInput
                  length={5}
                  size="xl"
                  radius="md"
                  styles={{
                    input: {
                      fontSize: "24px",
                      fontWeight: 700,
                      border: "2px solid var(--mantine-color-gray-2)",
                      backgroundColor: "var(--mantine-color-gray-0)",
                      transition: "all 0.2s ease",
                      "&:focus": {
                        borderColor: "var(--mantine-color-success-5)",
                        backgroundColor: "white",
                        boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)",
                        transform: "scale(1.05)",
                      },
                      "&:hover": {
                        borderColor: "var(--mantine-color-gray-3)",
                        backgroundColor: "white",
                      },
                    },
                  }}
                  {...form.getInputProps("otp")}
                  onComplete={(value) => {
                    handleSubmit({ otp: value });
                  }}
                />

                {/* Timer Progress */}
                <Box style={{ width: "100%" }}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconClock
                        size={16}
                        color="var(--mantine-color-gray-6)"
                      />
                      <Text size="sm" c="dimmed" fw={500}>
                        Code expires in
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={600}
                      c={countdown < 60 ? "red.6" : "gray.7"}
                    >
                      {formatTime(countdown)}
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressValue()}
                    size="sm"
                    radius="xl"
                    color={countdown < 60 ? "red" : "success"}
                    styles={{
                      root: {
                        backgroundColor: "var(--mantine-color-gray-1)",
                      },
                    }}
                  />
                </Box>

                {/* Resend Section */}
                <Stack gap="sm" align="center">
                  <Text size="sm" c="dimmed" ta="center">
                    Didn't receive the code?
                  </Text>
                  {canResend ? (
                    <Button
                      variant="light"
                      color="success"
                      size="sm"
                      radius="md"
                      onClick={handleResendOTP}
                      loading={resendOTPMutation.isPending}
                      styles={{
                        root: {
                          fontWeight: 600,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                          },
                        },
                      }}
                    >
                      Resend Code
                    </Button>
                  ) : (
                    <Text size="sm" c="dimmed" fw={500}>
                      Resend available in {formatTime(countdown)}
                    </Text>
                  )}
                </Stack>

                {/* Back Link */}
                <Anchor
                  component={Link}
                  to="/"
                  size="sm"
                  c="primary.6"
                  fw={500}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--mantine-spacing-xs)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <IconArrowLeft size={16} />
                  Back to phone input
                </Anchor>
              </Stack>

              {/* Subtle gradient overlay */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.3), transparent)",
                }}
              />
            </Paper>
          )}
        </Transition>
      </Container>
    </Box>
  );
}
