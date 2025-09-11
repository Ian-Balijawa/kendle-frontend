import {
  Box,
  Container,
  AppShell as MantineAppShell,
  ScrollArea,
} from "@mantine/core";
import { Outlet } from "react-router-dom";
import { FooterContent } from "./Footer";
import { HeaderContent } from "./Header";
import { FloatingChatWidget } from "../../features/chat/FloatingChatWidget";

export function AppShell() {
  return (
    <MantineAppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding={0}
      styles={{
        main: {
          minHeight: "calc(100vh - 60px)",
          paddingBottom: "60px",
        },
      }}
    >
      <MantineAppShell.Header withBorder={false}>
        <HeaderContent />
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <ScrollArea
          style={{ height: "100%" }}
          scrollbarSize={4}
          styles={{
            scrollbar: {
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                borderRadius: "8px",
              },
            },
          }}
        >
          <Container size="sm" p={0}>
            <Box
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Outlet />
            </Box>
          </Container>

          <FloatingChatWidget />

          <Box
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
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
