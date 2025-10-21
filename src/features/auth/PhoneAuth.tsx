import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconPhone, IconSparkles } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useSendOTP } from "../../hooks/useAuth";
import { SendOTPRequest } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

interface PhoneAuthFormData {
  phoneNumber: string;
}

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
});

export function PhoneAuth() {
  const navigate = useNavigate();
  const { error, clearError } = useAuthStore();
  const sendOTPMutation = useSendOTP();
  const [mounted, setMounted] = useState(false);

  const form = useForm<PhoneAuthFormData>({
    mode: "uncontrolled",
    initialValues: {
      phoneNumber: "",
    },
    validate: zodResolver(phoneSchema) as any,
  });

  // Trigger animation on mount
  useState(() => {
    setTimeout(() => setMounted(true), 100);
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
          top: "10%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))",
          filter: "blur(40px)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "20%",
          left: "15%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.04))",
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
                borderRadius: "var(--mantine-radius-xl)",
                padding: "var(--mantine-spacing-xl)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header Section */}
              <Stack gap="xl" align="center" mb="xl">
                <Group gap="sm" align="center">
                  <Box
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-primary-8))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconSparkles size={28} color="white" />
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
                    <Text size="sm" fw={500}>
                      Connect & Share
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="xs" align="center">
                  <Title order={2} size="h3" ta="center" fw={700}>
                    Welcome back
                  </Title>
                  <Text size="md" ta="center" maw={300}>
                    Enter your phone number to continue to your account
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
                      title="Authentication Error"
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

              {/* Form Section */}
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                  <TextInput
                    placeholder="Enter your phone number"
                    leftSection={<IconPhone size={20} stroke={1.5} />}
                    required
                    size="lg"
                    radius="md"
                    styles={{
                      input: {
                        fontSize: "16px",
                        fontWeight: 500,
                        border: "2px solid var(--mantine-color-gray-2)",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          borderColor: "var(--mantine-color-primary-5)",  
                          transform: "translateY(-1px)",
                        },
                        "&:hover": {
                          borderColor: "var(--mantine-color-gray-3)",
                        },
                      },
                      section: {
                        color: "var(--mantine-color-gray-6)",
                      },
                    }}
                    {...form.getInputProps("phoneNumber")}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="md"
                    loading={sendOTPMutation.isPending}
                    disabled={sendOTPMutation.isPending}
                    styles={{
                      root: {
                        background:
                          "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-primary-7))",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "16px",
                        height: "52px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, var(--mantine-color-primary-7), var(--mantine-color-primary-8))",
                          transform: "translateY(-2px)",
                        },
                        "&:active": {
                          transform: "translateY(0)",
                        },
                        "&[data-loading]": {
                          background: "var(--mantine-color-primary-5)",
                        },
                      },
                    }}
                  >
                    {sendOTPMutation.isPending
                      ? "Sending code..."
                      : "Continue with phone"}
                  </Button>
                </Stack>
              </form>

              {/* Footer */}
              <Text size="xs" ta="center" mt="xl" lh={1.5}>
                By continuing, you agree to our{" "}
                <Text
                  component="span"
                  fw={500}
                  style={{ cursor: "pointer" }}
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  component="span"
                  fw={500}
                  style={{ cursor: "pointer" }}
                >
                  Privacy Policy
                </Text>
              </Text>

              {/* Subtle gradient overlay */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.3), transparent)",
                }}
              />
            </Paper>
          )}
        </Transition>
      </Container>
    </Box>
  );
}
