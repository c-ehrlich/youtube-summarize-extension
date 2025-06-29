/** @jsxImportSource solid-js */
import { Checkbox as CheckboxPrimitive } from "@kobalte/core/checkbox";
import { Check } from "lucide-solid";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends ComponentProps<typeof CheckboxPrimitive> {
  class?: string;
}

export const Checkbox = (props: CheckboxProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <CheckboxPrimitive
      class={cn(styles.checkbox, local.class)}
      {...others}
    >
      <CheckboxPrimitive.Indicator class={styles.indicator}>
        <Check class={styles.icon} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive>
  );
};
