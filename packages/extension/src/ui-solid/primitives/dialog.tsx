/** @jsxImportSource solid-js */
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { X } from "lucide-solid";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../util/cn";
import styles from "./Dialog.module.css";

export const Dialog = DialogPrimitive;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.CloseButton;

export interface DialogOverlayProps extends ComponentProps<typeof DialogPrimitive.Overlay> {}

export const DialogOverlay = (props: DialogOverlayProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Overlay
      class={cn(styles.overlay, local.class)}
      {...others}
    />
  );
};

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  overlayClass?: string;
}

export const DialogContent = (props: DialogContentProps) => {
  const [local, others] = splitProps(props, ["class", "children", "overlayClass"]);
  
  return (
    <DialogPortal>
      <DialogOverlay class={local.overlayClass} />
      <DialogPrimitive.Content
        class={cn(styles.content, local.class)}
        {...others}
      >
        {local.children}
        <DialogPrimitive.CloseButton class={styles.closeButton}>
          <X class={styles.closeIcon} />
          <span class={styles.srOnly}>Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export interface DialogHeaderProps extends ComponentProps<"div"> {}

export const DialogHeader = (props: DialogHeaderProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.header, local.class)}
      {...others}
    />
  );
};

export interface DialogFooterProps extends ComponentProps<"div"> {}

export const DialogFooter = (props: DialogFooterProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <div
      class={cn(styles.footer, local.class)}
      {...others}
    />
  );
};

export interface DialogTitleProps extends ComponentProps<typeof DialogPrimitive.Title> {}

export const DialogTitle = (props: DialogTitleProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Title
      class={cn(styles.title, local.class)}
      {...others}
    />
  );
};

export interface DialogDescriptionProps extends ComponentProps<typeof DialogPrimitive.Description> {}

export const DialogDescription = (props: DialogDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <DialogPrimitive.Description
      class={cn(styles.description, local.class)}
      {...others}
    />
  );
};
