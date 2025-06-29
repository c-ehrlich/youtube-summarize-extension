/** @jsxImportSource solid-js */
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import styles from "./Alert.module.css";

export interface AlertProps extends ComponentProps<"div"> {
  variant?: "default" | "destructive";
}

export const Alert = (props: AlertProps) => {
  const [local, others] = splitProps(props, ["variant", "class"]);
  
  const variant = local.variant || "default";
  
  return (
    <div
      role="alert"
      class={cn(styles.alert, styles[variant], local.class)}
      {...others}
    />
  );
};

export interface AlertTitleProps extends ComponentProps<"h5"> {}

export const AlertTitle = (props: AlertTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <h5
      class={cn(styles.title, local.class)}
      {...others}
    />
  );
};

export interface AlertDescriptionProps extends ComponentProps<"div"> {}

export const AlertDescription = (props: AlertDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.description, local.class)}
      {...others}
    />
  );
};
