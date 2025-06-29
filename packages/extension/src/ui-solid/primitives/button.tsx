/** @jsxImportSource solid-js */
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import styles from "./Button.module.css";

export interface ButtonProps extends ComponentProps<typeof ButtonPrimitive> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = (props: ButtonProps) => {
  const [local, others] = splitProps(props, ["variant", "size", "class"]);
  
  const variant = local.variant || "default";
  const size = local.size || "default";
  
  return (
    <ButtonPrimitive
      class={cn(
        styles.button,
        styles[variant],
        styles[size === "default" ? "default_size" : size],
        local.class
      )}
      {...others}
    />
  );
};
