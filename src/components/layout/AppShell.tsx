import {
  Box,
  Container,
  AppShell as MantineAppShell,
  ScrollArea,
  Transition,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FooterContent } from "./Footer";
import { HeaderContent } from "./Header";

export function AppShell() {
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(true);

  useEffect(() => {
    setPageTransition(false);
    const timer = setTimeout(() => setPageTransition(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <MantineAppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding={0}
      styles={{
        main: {
          minHeight: "calc(100vh - 60px)",
          paddingBottom: "60px",
          background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
        },
      }}
    >
      <MantineAppShell.Header
        style={{
          border: "none",
          backgroundColor: "transparent",
          position: "sticky",
          top: 0,
        }}
      >
        <Container size="lg">
          <HeaderContent />
        </Container>
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <ScrollArea
          style={{ height: "100%" }}
          scrollbarSize={4}
          styles={{
            scrollbar: {
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                backgroundColor: "var(--mantine-color-blue-4)",
                borderRadius: "8px",
              },
            },
          }}
        >
          <Transition
            mounted={pageTransition}
            transition="fade"
            duration={200}
            timingFunction="ease"
          >
            {(styles) => (
              <Box style={styles}>
                <Container
                  size="lg"
                  style={{
                    paddingTop: "var(--mantine-spacing-md)",
                    paddingBottom: "var(--mantine-spacing-xl)",
                    paddingLeft: "var(--mantine-spacing-md)",
                    paddingRight: "var(--mantine-spacing-md)",
                  }}
                >
                  <Box
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Outlet />
                  </Box>
                </Container>

                <Box
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                    background: `
                      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 40% 90%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                    `,
                  }}
                />
              </Box>
            )}
          </Transition>
        </ScrollArea>
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
        }}
      >
        <FooterContent />
      </MantineAppShell.Footer>
    </MantineAppShell>
  );
}
