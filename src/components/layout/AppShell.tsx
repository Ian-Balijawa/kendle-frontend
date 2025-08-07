import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  AppShell as MantineAppShell,
  useMantineTheme,
  Box,
} from '@mantine/core'
import { HeaderContent } from './Header'
import { NavbarContent } from './Navbar'
import { FooterContent } from './Footer'
import { useUIStore } from '../../stores/uiStore'

export function AppShell() {
  const theme = useMantineTheme()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const [opened, setOpened] = useState(false)

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 60 }}
      padding="md"
    >
      <MantineAppShell.Header>
        <HeaderContent
          opened={opened}
          setOpened={setOpened}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <NavbarContent />
      </MantineAppShell.Navbar>

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
