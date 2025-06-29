/** @jsxImportSource solid-js */
import { type VariantProps } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import { alertVariants } from "./alert-variants";

export interface AlertProps
  extends ComponentProps<"div">,
    VariantProps<typeof alertVariants> {}

export const Alert = (props: AlertProps) => {
  const [local, others] = splitProps(props, ["variant", "class"]);
  
  return (
    <div
      role="alert"
      class={cn(alertVariants({ variant: local.variant }), local.class)}
      {...others}
    />
  );
};

export interface AlertTitleProps extends ComponentProps<"h5"> {}

export const AlertTitle = (props: AlertTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <h5
      class={cn("mb-1 font-medium leading-none tracking-tight", local.class)}
      {...others}
    />
  );
};

export interface AlertDescriptionProps extends ComponentProps<"div"> {}

export const AlertDescription = (props: AlertDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn("text-sm [&_p]:leading-relaxed", local.class)}
      {...others}
    />
  );
};
