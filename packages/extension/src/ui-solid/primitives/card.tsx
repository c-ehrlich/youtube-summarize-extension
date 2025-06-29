/** @jsxImportSource solid-js */
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import styles from "./Card.module.css";

export interface CardProps extends ComponentProps<"div"> {}

export const Card = (props: CardProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.card, local.class)}
      {...others}
    />
  );
};

export interface CardHeaderProps extends ComponentProps<"div"> {}

export const CardHeader = (props: CardHeaderProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.header, local.class)}
      {...others}
    />
  );
};

export interface CardTitleProps extends ComponentProps<"h3"> {}

export const CardTitle = (props: CardTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <h3
      class={cn(styles.title, local.class)}
      {...others}
    />
  );
};

export interface CardDescriptionProps extends ComponentProps<"p"> {}

export const CardDescription = (props: CardDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <p
      class={cn(styles.description, local.class)}
      {...others}
    />
  );
};

export interface CardContentProps extends ComponentProps<"div"> {}

export const CardContent = (props: CardContentProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div class={cn(styles.content, local.class)} {...others} />
  );
};

export interface CardFooterProps extends ComponentProps<"div"> {}

export const CardFooter = (props: CardFooterProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.footer, local.class)}
      {...others}
    />
  );
};
