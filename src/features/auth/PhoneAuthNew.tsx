import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  LoadingOverlay,
  Paper,
  PinInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { FormValidateInput, useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandTwitter,
  IconPhone,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useAuthStore } from "../../stores/authStore";
import { useSendOTP, useVerifyOTP, useResendOTP } from "../../hooks/useAuth";
import { SendOTPRequest, VerifyOTPRequest } from "../../services/api";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
});



export function PhoneAuthNew() {
  const navigate = useNavigate();
  const { phoneNumber, error, clearError } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // React Query mutations
  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Phone number form
  const phoneForm = useForm<SendOTPRequest>({
    initialValues: { phoneNumber: "" },
    validate: zodResolver(phoneSchema) as unknown as FormValidateInput<SendOTPRequest>,
  });

  // OTP form
  const [otpValue, setOtpValue] = useState("");

  const handleSendOTP = async (values: SendOTPRequest) => {
    clearError();

    sendOTPMutation.mutate(values, {
      onSuccess: () => {
        setStep('otp');
      },
    });
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) return;

    clearError();

    const verifyData: VerifyOTPRequest = {
      identifier: phoneNumber || phoneForm.values.phoneNumber,
      otp: otpValue,
    };

    verifyOTPMutation.mutate(verifyData, {
      onSuccess: (response) => {
        if (response.user.isProfileComplete) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/complete-profile", { replace: true });
        }
      },
    });
  };

  const handleResendOTP = () => {
    if (!phoneNumber && !phoneForm.values.phoneNumber) return;

    resendOTPMutation.mutate({
      identifier: phoneNumber || phoneForm.values.phoneNumber,
    });
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpValue("");
    clearError();
  };

  return (
    <Box className="auth-container">
      <Container size="sm" style={{ width: "100%", maxWidth: "500px" }}>
        <Paper className="auth-paper" p="xl" withBorder>
          <LoadingOverlay visible={sendOTPMutation.isPending || verifyOTPMutation.isPending} />

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
                {step === 'phone' ? 'Welcome to Kendle' : 'Verify Your Phone'}
              </Title>
              <Text c="dimmed" size="sm">
                {step === 'phone'
                  ? 'Enter your phone number to get started'
                  : `We've sent a 6-digit code to ${phoneNumber || phoneForm.values.phoneNumber}`
                }
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Authentication Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            {step === 'phone' ? (
              <form onSubmit={phoneForm.onSubmit((values) => handleSendOTP(values as unknown as SendOTPRequest))}>
                <Stack gap="lg">
                  <TextInput
                    placeholder="Enter your phone number"
                    leftSection={<IconPhone size={18} />}
                    size="md"
                    radius="md"
                    classNames={{
                      input: "auth-input",
                      label: "auth-label",
                    }}
                    {...phoneForm.getInputProps("phoneNumber")}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="sm"
                    loading={sendOTPMutation.isPending}
                    className="auth-button"
                  >
                    Send OTP
                  </Button>
                </Stack>
              </form>
            ) : (
              <Stack gap="lg">
                <Center>
                  <PinInput
                    length={6}
                    size="lg"
                    value={otpValue}
                    onChange={setOtpValue}
                    onComplete={handleVerifyOTP}
                    placeholder=""
                    type="number"
                  />
                </Center>

                <Button
                  fullWidth
                  size="sm"
                  loading={verifyOTPMutation.isPending}
                  disabled={otpValue.length !== 6}
                  onClick={handleVerifyOTP}
                  className="auth-button"
                >
                  Verify OTP
                </Button>

                <Stack gap="sm">
                  <Text size="xs" c="dimmed" ta="center">
                    Didn't receive the code?
                  </Text>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={handleResendOTP}
                    loading={resendOTPMutation.isPending}
                  >
                    Resend OTP
                  </Button>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={handleBackToPhone}
                  >
                    Change Phone Number
                  </Button>
                </Stack>
              </Stack>
            )}

            <Text size="xs" c="dimmed" ta="center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
