/** @jsxImportSource solid-js */
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "./util/cn";
import styles from "./loading-spinner.module.css";

export interface LoadingSpinnerProps extends ComponentProps<"svg"> {
  size?: number;
}

export const LoadingSpinner = (props: LoadingSpinnerProps) => {
  const [local, others] = splitProps(props, ["size", "class"]);
  const size = () => local.size ?? 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size()}
      height={size()}
      {...others}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn(styles.animateSpin, local.class)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
