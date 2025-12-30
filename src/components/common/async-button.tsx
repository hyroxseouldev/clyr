import * as React from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { type VariantProps } from "class-variance-authority";

type AsyncButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
  };

function AsyncButton({
  isLoading = false,
  disabled,
  children,
  ...props
}: AsyncButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </Button>
  );
}

export { AsyncButton };
