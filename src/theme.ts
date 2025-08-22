import { createTheme, MantineColorsTuple } from "@mantine/core";

const primaryColor: MantineColorsTuple = [
  "#e3f2fd",
  "#bbdefb",
  "#90caf9",
  "#64b5f6",
  "#42a5f5",
  "#2196f3",
  "#1e88e5",
  "#1976d2",
  "#1565c0",
  "#0d47a1",
];

const secondaryColor: MantineColorsTuple = [
  "#fce4ec",
  "#f8bbd9",
  "#f48fb1",
  "#f06292",
  "#ec407a",
  "#e91e63",
  "#d81b60",
  "#c2185b",
  "#ad1457",
  "#880e4f",
];

export const theme = createTheme({
  primaryColor: "primary",
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fontWeight: "600",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    MultiSelect: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
      },
    },
    Drawer: {
      defaultProps: {
        radius: "lg",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    Badge: {
      defaultProps: {
        radius: "md",
      },
    },
    Chip: {
      defaultProps: {
        radius: "md",
      },
    },
  },
  other: {
    // Custom spacing and sizing
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    // Custom breakpoints
    breakpoints: {
      xs: "36em",
      sm: "48em",
      md: "62em",
      lg: "75em",
      xl: "88em",
    },
  },
});
