import { Button, ButtonProps } from "@mantine/core";
import { forwardRef } from "react";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        loading={loading}
        disabled={loading || disabled}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";
