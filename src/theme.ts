import { createTheme, MantineColorsTuple } from "@mantine/core";

// Modern color palette with better contrast and accessibility
const primaryColor: MantineColorsTuple = [
  "#f0f9ff", // sky-50
  "#e0f2fe", // sky-100
  "#bae6fd", // sky-200
  "#7dd3fc", // sky-300
  "#38bdf8", // sky-400
  "#0ea5e9", // sky-500 - main
  "#0284c7", // sky-600
  "#0369a1", // sky-700
  "#075985", // sky-800
  "#0c4a6e", // sky-900
];

const secondaryColor: MantineColorsTuple = [
  "#fefce8", // yellow-50
  "#fef3c7", // yellow-100
  "#fde68a", // yellow-200
  "#fcd34d", // yellow-300
  "#fbbf24", // yellow-400
  "#f59e0b", // yellow-500 - main
  "#d97706", // yellow-600
  "#b45309", // yellow-700
  "#92400e", // yellow-800
  "#78350f", // yellow-900
];

const grayColor: MantineColorsTuple = [
  "#fafafa", // neutral-50
  "#f5f5f5", // neutral-100
  "#e5e5e5", // neutral-200
  "#d4d4d4", // neutral-300
  "#a3a3a3", // neutral-400
  "#737373", // neutral-500
  "#525252", // neutral-600
  "#404040", // neutral-700
  "#262626", // neutral-800
  "#171717", // neutral-900
];

const successColor: MantineColorsTuple = [
  "#f0fdf4", // green-50
  "#dcfce7", // green-100
  "#bbf7d0", // green-200
  "#86efac", // green-300
  "#4ade80", // green-400
  "#22c55e", // green-500
  "#16a34a", // green-600
  "#15803d", // green-700
  "#166534", // green-800
  "#14532d", // green-900
];

const errorColor: MantineColorsTuple = [
  "#fef2f2", // red-50
  "#fee2e2", // red-100
  "#fecaca", // red-200
  "#fca5a5", // red-300
  "#f87171", // red-400
  "#ef4444", // red-500
  "#dc2626", // red-600
  "#b91c1c", // red-700
  "#991b1b", // red-800
  "#7f1d1d", // red-900
];

const warningColor: MantineColorsTuple = [
  "#fffbeb", // amber-50
  "#fef3c7", // amber-100
  "#fde68a", // amber-200
  "#fcd34d", // amber-300
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
  "#d97706", // amber-600
  "#b45309", // amber-700
  "#92400e", // amber-800
  "#78350f", // amber-900
];

export const theme = createTheme({
  primaryColor: "primary",
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    gray: grayColor,
    success: successColor,
    error: errorColor,
    warning: warningColor,
  },
  
  // Modern font stack
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', Monaco, Consolas, 'Courier New', monospace",
  
  // Typography scale
  fontSizes: {
    xs: "0.75rem",   // 12px
    sm: "0.875rem",  // 14px
    md: "1rem",      // 16px
    lg: "1.125rem",  // 18px
    xl: "1.25rem",   // 20px
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.55",
    lg: "1.6",
    xl: "1.65",
  },

  headings: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "2.5rem" }, // 36px
      h2: { fontSize: "1.875rem", lineHeight: "2.25rem" }, // 30px
      h3: { fontSize: "1.5rem", lineHeight: "2rem" }, // 24px
      h4: { fontSize: "1.25rem", lineHeight: "1.75rem" }, // 20px
      h5: { fontSize: "1.125rem", lineHeight: "1.5rem" }, // 18px
      h6: { fontSize: "1rem", lineHeight: "1.5rem" }, // 16px
    },
  },

  // Spacing system (8px base)
  spacing: {
    xs: "0.5rem",   // 8px
    sm: "0.75rem",  // 12px
    md: "1rem",     // 16px
    lg: "1.5rem",   // 24px
    xl: "2rem",     // 32px
  },

  // Border radius scale
  radius: {
    xs: "0.25rem",  // 4px
    sm: "0.375rem", // 6px
    md: "0.5rem",   // 8px
    lg: "0.75rem",  // 12px
    xl: "1rem",     // 16px
  },

  // Shadow system
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },

  // Component styles
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 150ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
      },
    },

    Input: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        input: {
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:focus": {
            borderColor: "var(--mantine-color-primary-5)",
            boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
          },
        },
      },
    },

    TextInput: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
    },

    Textarea: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
    },

    Select: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
    },

    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        padding: "lg",
      },
      styles: {
        root: {
          transition: "box-shadow 150ms ease, transform 150ms ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
          },
        },
      },
    },

    Modal: {
      defaultProps: {
        radius: "lg",
        shadow: "xl",
      },
      styles: {
        content: {
          backgroundColor: "var(--mantine-color-white)",
          backdropFilter: "blur(10px)",
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "xs",
      },
    },

    Badge: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          textTransform: "none",
        },
      },
    },

    Notification: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
        },
      },
    },

    Tabs: {
      styles: {
        tab: {
          fontWeight: 500,
          padding: "12px 16px",
          "&:hover": {
            backgroundColor: "var(--mantine-color-gray-0)",
          },
          "&[data-active]": {
            borderColor: "var(--mantine-color-primary-5)",
            color: "var(--mantine-color-primary-7)",
          },
        },
      },
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: "30em",   // 480px
    sm: "48em",   // 768px
    md: "64em",   // 1024px
    lg: "74em",   // 1184px
    xl: "90em",   // 1440px
  },

  // Custom properties
  other: {
    // Animation durations
    transitions: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
    },
    
    // Z-index scale
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      backdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      toast: 1080,
    },
  },
});
