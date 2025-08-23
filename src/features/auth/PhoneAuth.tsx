import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  LoadingOverlay, Stack,
  Text,
  TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBrandTwitter,
  IconPhone,
} from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../../stores/authStore";
import { SendOTPRequest } from "../../services/api";
import { useSendOTP } from "../../hooks/useAuth";
interface PhoneAuthFormData {
  phoneNumber: string;
}

const phoneSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export function PhoneAuth() {
  const navigate = useNavigate();
  const { error, clearError } = useAuthStore();
  const sendOTPMutation = useSendOTP();
  const form = useForm<PhoneAuthFormData>({
    mode: "uncontrolled",
    initialValues: {
      phoneNumber: "",
    },
    validate: zodResolver(phoneSchema) as any,
  });

  const handleSubmit = (values: PhoneAuthFormData) => {
    clearError();

    sendOTPMutation.mutate(values as unknown as SendOTPRequest, {
      onSuccess: () => {
        navigate("/verify-otp", {
          state: { phoneNumber: values.phoneNumber },
          replace: true,
        });
      },
    });
  };

  return (
    <Box className="auth-container">
      <Container size="xs" style={{ width: "100%", maxWidth: "400px" }}>
        <Stack className="auth-paper" p="xl">
          <LoadingOverlay visible={sendOTPMutation.isPending} />

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

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  placeholder="Sign in with your phone"
                  leftSection={<IconPhone size={18} />}
                  required
                  size="md"
                  radius="md"
                  classNames={{
                    input: "auth-input",
                    label: "auth-label",
                  }}
                  {...form.getInputProps("phoneNumber")}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="sm"
                  loading={sendOTPMutation.isPending}
                  disabled={sendOTPMutation.isPending}
                  className="auth-button"
                >
                  Send Verification Code
                </Button>
              </Stack>
            </form>

            <Text size="xs" c="dimmed" ta="center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
