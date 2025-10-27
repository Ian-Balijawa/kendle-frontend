import {
  Box,
  Container,
  AppShell as MantineAppShell,
  ScrollArea,
  Transition,
  Paper,
} from "@mantine/core";
import { Outlet } from "react-router-dom";
import { FooterContent } from "./Footer";
import { HeaderContent } from "./Header";
import { useState, useEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Transition
      mounted={mounted}
      transition="fade"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <MantineAppShell
          header={{ height: 60 }}
          footer={{ height: 60 }}
          padding={0}
          style={{
            ...styles,
            backgroundColor:
              colorScheme === "dark"
                ? "var(--mantine-color-dark-8)"
                : "var(--mantine-color-gray-0)",
          }}
          styles={{
            main: {
              minHeight: "calc(100vh - 60px)",
              paddingBottom: "60px",
              position: "relative",
              overflow: "hidden",
            },
          }}
        >
          <MantineAppShell.Header
            withBorder={false}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              backdropFilter: "blur(10px)",
            }}
          >
            <Container
              size="sm"
              p={0}
              style={{
                position: "relative",
                minHeight: "60px",
              }}
            >
              <HeaderContent />
            </Container>
          </MantineAppShell.Header>

          <MantineAppShell.Main>
            <Box
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                opacity: colorScheme === "dark" ? 0.03 : 0.02,
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(34, 139, 230, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  linear-gradient(45deg, transparent 30%, rgba(34, 139, 230, 0.05) 50%, transparent 70%)
                `,
              }}
            />

            <Container
              size="sm"
              p={0}
              style={{
                position: "relative",
                minHeight: "calc(100vh - 120px)",
              }}
            >

              <ScrollArea
                style={{ height: "100%" }}
                scrollbarSize={6}
                styles={{
                  scrollbar: {
                    '&[data-orientation="vertical"]': {
                      backgroundColor: "transparent",
                    },
                    '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                      borderRadius: "12px",
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(0, 0, 0, 0.2)",
                      transition: "all 0.2s ease",
                    },
                    '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover':
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.3)"
                          : "rgba(0, 0, 0, 0.3)",
                    },
                  },
                }}
              >
                <Paper
                  radius="0"
                  pb="sm"
                >
                  <Outlet />
                </Paper>
              </ScrollArea>
            </Container>

          </MantineAppShell.Main>

          <MantineAppShell.Footer
            hiddenFrom="sm"
            style={{
              border: "none",
              backgroundColor: "transparent",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              padding: 0,
            }}
          >
            <FooterContent />
          </MantineAppShell.Footer>
        </MantineAppShell>
      )}
    </Transition>
  );
}
