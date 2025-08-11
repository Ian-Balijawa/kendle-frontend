import { Outlet } from 'react-router-dom'
import {
  AppShell as MantineAppShell,
  useMantineTheme,
  Box,
} from '@mantine/core'
import { HeaderContent } from './Header'
import { FooterContent } from './Footer'

export function AppShell() {
  const theme = useMantineTheme()

  return (
    <MantineAppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <MantineAppShell.Header>
        <HeaderContent />
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <Box
          style={{
            minHeight: 'calc(100vh - 120px)',
            padding: theme.spacing.md,
          }}
        >
          <Outlet />
        </Box>
      </MantineAppShell.Main>

      <MantineAppShell.Footer hiddenFrom="sm">
        <FooterContent />
      </MantineAppShell.Footer>
    </MantineAppShell>
  )
}
