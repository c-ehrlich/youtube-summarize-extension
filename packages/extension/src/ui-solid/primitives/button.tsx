/** @jsxImportSource solid-js */
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import { type VariantProps } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import { buttonVariants } from "./button-variants";

export interface ButtonProps
  extends ComponentProps<typeof ButtonPrimitive>,
    VariantProps<typeof buttonVariants> {}

export const Button = (props: ButtonProps) => {
  const [local, others] = splitProps(props, ["variant", "size", "class"]);
  
  return (
    <ButtonPrimitive
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
        }),
        local.class
      )}
      {...others}
    />
  );
};
